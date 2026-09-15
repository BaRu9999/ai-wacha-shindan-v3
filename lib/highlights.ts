import type { Answer, QuestionTheme, TeaKey } from "@/types";
import { choiceById, questionById } from "@/data/questions";

/**
 * 結果の納得感を上げるための「この結果につながった選択」（仕様7、および説明可能性の修正）。
 *
 * 方針:
 *  - AI には選ばせない。メインタイプに実際に加点した回答（main/sub）だけをルールベースで抽出する。
 *  - メインタイプに一切加点していない回答は、件数を埋めるためであっても絶対に含めない
 *    （診断結果の説明可能性を下げるため）。そのため件数は 0〜count 件で可変になる。
 *  - 同じ切り口に偏らないよう、質問の theme（性格/今日の気分/味覚/過ごし方）が
 *    できるだけ重ならないよう選ぶ。
 *  - 完全に決定論。同じ回答なら常に同じ結果を返す。
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
  /** メインタイプへの関連度。main=2 / sub=1。 */
  relevance: 1 | 2;
};

function scoreAnswer(main: TeaKey, answer: Answer): ScoredAnswer | null {
  const question = questionById[answer.questionId];
  const choice = choiceById[answer.choiceId];
  if (!question || !choice) return null;
  if (choice.main === main) {
    return { answer, theme: question.theme, label: choice.label, relevance: 2 };
  }
  if (choice.sub === main) {
    return { answer, theme: question.theme, label: choice.label, relevance: 1 };
  }
  // メインタイプに無関係な回答は、ここで除外する（埋め合わせに使わない）。
  return null;
}

export function pickHighlights(
  main: TeaKey,
  answers: Answer[],
  count = 3,
): Highlight[] {
  const relevant = answers
    .map((answer) => scoreAnswer(main, answer))
    .filter((item): item is ScoredAnswer => item !== null);

  // Array#sort は安定ソートなので、同じ relevance 内では回答順（Q1→Q6）が保たれる。
  const byRelevanceDesc = [...relevant].sort((a, b) => b.relevance - a.relevance);

  const chosen: ScoredAnswer[] = [];
  const usedThemes = new Set<QuestionTheme>();

  // 1st pass: 関連度の高い順に、テーマが重ならないものを優先して選ぶ。
  for (const item of byRelevanceDesc) {
    if (chosen.length >= count) break;
    if (usedThemes.has(item.theme)) continue;
    chosen.push(item);
    usedThemes.add(item.theme);
  }
  // 2nd pass: まだ count に満たない場合のみ、テーマの重複を許して残りの関連回答で埋める。
  // （無関係な回答で埋めることは絶対にしない。関連回答自体が count 未満なら、その件数のまま返す。）
  for (const item of byRelevanceDesc) {
    if (chosen.length >= count) break;
    if (chosen.includes(item)) continue;
    chosen.push(item);
  }

  return chosen.map((item) => ({
    questionId: item.answer.questionId,
    theme: item.theme,
    label: item.label,
  }));
}
