import type { Answer, TeaKey } from "@/types";
import { teaTypes } from "@/data/tea-types";
import { choiceById, questionById } from "@/data/questions";

/**
 * AI（OpenAI）へのプロンプト規約。
 *
 * 方針（仕様15・16）:
 *  - タイプ判定は AI にさせない。渡すのは「決まった結果」への肉付けだけ。
 *  - トーン: 上品・自然・少し温かい・気取らない・説教くさくない・占いのように断定しない。
 *  - 家庭環境／結婚／育児／疲労／健康状態を推測しない。
 *  - 「AIがあなたを完全分析」等の表現は禁止。「回答から見つかった今日の和茶タイプ」という枠組み。
 *  - 文章は短く。指定 JSON 以外は出力させない。
 */

export const SYSTEM_PROMPT = [
  "あなたは、和カフェ「祇園茶寮 × タニタカフェ」の、落ち着いた案内役です。",
  "利用者の回答から【すでに決まっている】和茶タイプに、短い言葉で肉付けをします。タイプそのものを判定し直さないでください。",
  "文体: ていねいで上品、少し温かい、気取らない。占いのように決めつけず、やさしく差し出す語り口。",
  "禁止: 「AIが分析」「完全に見抜く」等の表現。家庭環境・結婚・育児・仕事・疲れ・健康状態の推測。医療や効能の断定。誇張した販促表現（「絶対」「今すぐ」等）。",
  "各項目は1〜2文、全角60〜90字程度。回答内容の具体語を1つ以上さりげなく織り込む。",
  "出力は指定された JSON オブジェクトのみ。前後に説明文を付けない。",
].join("\n");

export type UserPromptParams = {
  main: TeaKey;
  hidden: TeaKey;
  answers: Answer[];
  productNames: string[];
  kidsRewardLabel: string | null;
};

export function buildUserPrompt(params: UserPromptParams): string {
  const main = teaTypes[params.main];
  const hidden = teaTypes[params.hidden];

  const answerLines = params.answers
    .map((answer, index) => {
      const question = questionById[answer.questionId];
      const choice = choiceById[answer.choiceId];
      if (!question || !choice) return null;
      return `${index + 1}. ${question.title}\n   → ${choice.label}`;
    })
    .filter((line): line is string => line !== null)
    .join("\n");

  const productLine =
    params.productNames.length > 0
      ? params.productNames.join(" ＋ ")
      : "（おすすめ商品なし）";

  const kidsLine = params.kidsRewardLabel
    ? `\n\nお子さまが選んだ「今日のごほうび」: ${params.kidsRewardLabel}（recommendationReason に、押し付けにならない範囲でひとことだけ触れてよい）`
    : "";

  return [
    "次の内容で、結果文の各項目を作成してください。",
    "",
    `今日の和茶タイプ（確定済み・変更しない）: ${main.name}（${main.core}）`,
    `隠れタイプ（確定済み・変更しない）: ${hidden.name}（${hidden.hiddenTrait}）`,
    `今日のおすすめ: ${productLine}`,
    "",
    "回答内容:",
    answerLines,
    kidsLine,
    "",
    "作成する項目:",
    "- summary: 今日のこのタイプらしさを、回答の具体語を交えて短く。",
    "- hiddenInsight: 隠れタイプがどんな時に表れるか。",
    "- today: 今日のひとこと。回答をふまえた、そっと寄り添う一文。指示や助言の口調にしない。",
    "- recommendationReason: おすすめの組み合わせが今日の気分に合う理由。誇張しない。",
    "- word: 和ことば（四字熟語など、既存の言葉から1つ）。",
    "- wordMeaning: その和ことばを、今日のこの人に向けてやさしく言い換える。",
  ].join("\n");
}

/** OpenAI Chat Completions の response_format（strict JSON schema）。 */
export const RESPONSE_FORMAT = {
  type: "json_schema" as const,
  json_schema: {
    name: "wacha_diagnosis_text",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        summary: { type: "string" },
        hiddenInsight: { type: "string" },
        today: { type: "string" },
        recommendationReason: { type: "string" },
        word: { type: "string" },
        wordMeaning: { type: "string" },
      },
      required: [
        "summary",
        "hiddenInsight",
        "today",
        "recommendationReason",
        "word",
        "wordMeaning",
      ],
    },
  },
};
