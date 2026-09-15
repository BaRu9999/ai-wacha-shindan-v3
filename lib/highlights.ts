import type { Answer, QuestionTheme, TeaKey } from "@/types";
import { choiceById, questionById } from "@/data/questions";

/**
 * 結果の納得感を上げるための「今回のあなたをつくった3つの選択」（仕様7）。
 *
 * 方針:
 *  - AI には選ばせない。メインタイプに加点した回答（main/sub）からルールベースで抽出する。
 *  - 同じ切り口に偏らないよう、質問の theme（性格/今日の気分/味覚/過ごし方）が
 *    できるだけ重ならないよう選ぶ。
 *  - 完全に決定論。同じ回答なら常に同じ3つを返す。
 */
export type Highlight = {
  questionId: string;
  theme: QuestionTheme;
  label: string;
};

type ScoredAnswer = {
  answer: Answer;
  theme: QuestionTheme;
  label: string;
  /** メインタイプへの関連度。main=2 / sub=1 / 無関係=0。 */
  relevance: 0 | 1 | 2;
};

function scoreAnswer(main: TeaKey, answer: Answer): ScoredAnswer | null {
  const question = questionById[answer.questionId];
  const choice = choiceById[answer.choiceId];
  if (!question || !choice) return null;
  const relevance: ScoredAnswer["relevance"] =
    choice.main === main ? 2 : choice.sub === main ? 1 : 0;
  return { answer, theme: question.theme, label: choice.label, relevance };
}

export function pickHighlights(
  main: TeaKey,
  answers: Answer[],
  count = 3,
): Highlight[] {
  const scored = answers
    .map((answer) => scoreAnswer(main, answer))
    .filter((item): item is ScoredAnswer => item !== null);

  // Array#sort は安定ソートなので、同じ relevance 内では回答順（Q1→Q6）が保たれる。
  const byRelevanceDesc = [...scored].sort((a, b) => b.relevance - a.relevance);

  const chosen: ScoredAnswer[] = [];
  const usedThemes = new Set<QuestionTheme>();

  // 1st pass: メインタイプに実際に加点した回答の中から、テーマが重ならないものを優先。
  for (const item of byRelevanceDesc) {
    if (chosen.length >= count) break;
    if (item.relevance === 0) continue;
    if (usedThemes.has(item.theme)) continue;
    chosen.push(item);
    usedThemes.add(item.theme);
  }
  // 2nd pass: まだ足りなければ、テーマの重複を許して関連度の高い順に埋める。
  for (const item of byRelevanceDesc) {
    if (chosen.length >= count) break;
    if (item.relevance === 0) continue;
    if (chosen.includes(item)) continue;
    chosen.push(item);
  }
  // 3rd pass（通常は到達しない）: それでも3つに満たない場合は残りを回答順で補う。
  for (const item of scored) {
    if (chosen.length >= count) break;
    if (chosen.includes(item)) continue;
    chosen.push(item);
  }

  return chosen.slice(0, count).map((item) => ({
    questionId: item.answer.questionId,
    theme: item.theme,
    label: item.label,
  }));
}
