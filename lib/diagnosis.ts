import type { Answer, DiagnosisResult, Scores, TeaKey, TiebreakReason } from "@/types";
import { TEA_KEYS } from "@/types";
import { choiceById, questions } from "@/data/questions";

/**
 * 診断ロジックの単一入口。
 * - 配点: main = +2 / sub = +1
 * - 出現率の均等化は data/questions.ts の設計 ＋ test/distribution.test.ts で担保
 * - 同点は「勝手に配列順で決めない」。下記の明示的タイブレークで決定する。
 */

export const MAIN_POINTS = 2;
export const SUB_POINTS = 1;

/** タイブレークに使う「今日の気分」の問い。 */
export const TIEBREAK_PRIMARY_Q = "q1";
/** タイブレークに使う「どうなりたいか」の問い。 */
export const TIEBREAK_SECONDARY_Q = "q6";

/**
 * 同点時の最終フォールバック優先順位（明示的なサブルール）。
 *
 * 設計意図:
 *   配点は完全均等だが、設問ごとの共起（同じ問いに並ぶタイプの組み合わせ）と
 *   6問という短さから、集計上わずかな出やすさ／出にくさが残り得る。
 *   その残差を埋めるため、総当たり(distribution)で相対的に出にくかった側を前に置く。
 *   この順序は固定値として tiebreak.test.ts で検証する。
 */
export const TIEBREAK_PRIORITY: readonly TeaKey[] = [
  "rooibos",
  "biwa",
  "kuwacha",
  "wakoucha",
  "hojicha",
  "matcha",
];

export function emptyScores(): Scores {
  return { matcha: 0, hojicha: 0, wakoucha: 0, kuwacha: 0, biwa: 0, rooibos: 0 };
}

export function scoreAnswers(answers: Answer[]): Scores {
  const scores = emptyScores();
  for (const answer of answers) {
    const choice = choiceById[answer.choiceId];
    if (!choice) continue;
    scores[choice.main] += MAIN_POINTS;
    scores[choice.sub] += SUB_POINTS;
  }
  return scores;
}

function choiceForQuestion(answers: Answer[], questionId: string) {
  const answer = answers.find((item) => item.questionId === questionId);
  return answer ? choiceById[answer.choiceId] : undefined;
}

/**
 * 候補（同点タイプの集合）から1つを決める。
 * 手順:
 *   1. Q1（今日の気分）の main が候補にあればそれ
 *   2. Q6（どうなりたいか）の main が候補にあればそれ
 *   3. Q1 の sub → 4. Q6 の sub
 *   5. どれも当てはまらなければ TIEBREAK_PRIORITY の順
 */
export function breakTie(
  candidates: TeaKey[],
  answers: Answer[],
): { key: TeaKey; reason: TiebreakReason } {
  if (candidates.length === 1) return { key: candidates[0], reason: "no-tie" };

  const primary = choiceForQuestion(answers, TIEBREAK_PRIMARY_Q);
  const secondary = choiceForQuestion(answers, TIEBREAK_SECONDARY_Q);
  const steps: Array<[TeaKey | undefined, TiebreakReason]> = [
    [primary?.main, "q1-main"],
    [secondary?.main, "q6-main"],
    [primary?.sub, "q1-sub"],
    [secondary?.sub, "q6-sub"],
  ];
  for (const [key, reason] of steps) {
    if (key && candidates.includes(key)) return { key, reason };
  }
  for (const key of TIEBREAK_PRIORITY) {
    if (candidates.includes(key)) return { key, reason: "priority-order" };
  }
  // candidates は必ず TEA_KEYS の部分集合なので到達しない。
  return { key: candidates[0], reason: "priority-order" };
}

export function diagnose(answers: Answer[]): DiagnosisResult {
  const scores = scoreAnswers(answers);

  const maxScore = Math.max(...TEA_KEYS.map((key) => scores[key]));
  const topCandidates = TEA_KEYS.filter((key) => scores[key] === maxScore);
  const mainPick = breakTie([...topCandidates], answers);
  const main = mainPick.key;

  const rest = TEA_KEYS.filter((key) => key !== main);
  const secondScore = Math.max(...rest.map((key) => scores[key]));
  const hiddenCandidates = rest.filter((key) => scores[key] === secondScore);
  const hiddenPick = breakTie([...hiddenCandidates], answers);

  const ranking = [...TEA_KEYS].sort((a, b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a];
    return TIEBREAK_PRIORITY.indexOf(a) - TIEBREAK_PRIORITY.indexOf(b);
  });

  return {
    main,
    hidden: hiddenPick.key,
    scores,
    ranking,
    mainTiebreak: mainPick.reason,
    hiddenTiebreak: hiddenPick.reason,
  };
}

/** 回答セットが「6問ぶん・順番どおり・存在する選択肢」かを検証する。 */
export function isCompleteAnswerSet(value: unknown): value is Answer[] {
  if (!Array.isArray(value) || value.length !== questions.length) return false;
  return questions.every((question, index) => {
    const answer = value[index] as Partial<Answer> | undefined;
    if (!answer || typeof answer !== "object") return false;
    if (answer.questionId !== question.id) return false;
    return question.choices.some((choice) => choice.id === answer.choiceId);
  });
}
