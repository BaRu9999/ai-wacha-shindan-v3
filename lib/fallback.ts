import type { Answer, DiagnosisText, TeaKey } from "@/types";
import { teaTypes } from "@/data/tea-types";
import { fallbackSeeds } from "@/data/fallback-text";
import { choiceById } from "@/data/questions";

/**
 * OpenAI が使えない / 失敗したときの結果文を、決定論的に組み立てる。
 * - タイプ別の静的素材（fallbackSeeds）＋ 回答内容（Q1・Q6）＋ おすすめ理由 を合成。
 * - すべてのタイプで必ず成立する（UI は常に描画できる）。
 */
export function buildFallbackText(
  main: TeaKey,
  hidden: TeaKey,
  answers: Answer[],
  recommendationReason: string,
): DiagnosisText {
  const seed = fallbackSeeds[main];
  const hiddenName = teaTypes[hidden].name;

  const q1Label = labelFor(answers, "q1");
  const q6Label = labelFor(answers, "q6");

  const todaySentences: string[] = [];
  if (q1Label) todaySentences.push(`いまは「${q1Label}」に、気持ちが向いているようです。`);
  if (q6Label) todaySentences.push(`「${q6Label}」——そんな時間になりますように。`);

  return {
    summary: seed.summary,
    hiddenInsight: seed.hiddenInsight.replace("${hidden}", hiddenName),
    today:
      todaySentences.join("") || "今日の一杯が、いい区切りになりますように。",
    recommendationReason: recommendationReason || teaTypes[main].catchphrase,
    word: seed.word,
    wordMeaning: seed.wordMeaning,
  };
}

function labelFor(answers: Answer[], questionId: string): string | undefined {
  const answer = answers.find((item) => item.questionId === questionId);
  return answer ? choiceById[answer.choiceId]?.label : undefined;
}
