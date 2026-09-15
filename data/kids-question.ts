import type { KidsChoiceId } from "@/types";

/**
 * 子ども連れのときだけ、6問診断の直後に進む「最後の一問」。
 * - 子どもでも直感的に選べる3択。アイコンは絵文字ではなく独自SVG（components/icons.tsx）で表示する。
 * - 家庭の呼び方を決めつけないため、問い文は「おうちの人」を基本に。
 * - この回答は商品提案に少しだけ反映し、結果に「お子さまが選んだ今日のごほうび」として表示する。
 * - 診断フロー上は、結果を作る前にこの回答まで確定させる（結果表示後に商品を静かに変えない）。
 */
export type KidsChoice = {
  id: KidsChoiceId;
  /** 選択肢の文言。 */
  label: string;
  /** 結果に表示する短い言い換え。 */
  resultLabel: string;
};

export const kidsQuestion = {
  gateTitle: "今日はお子さまとご一緒ですか？",
  leadIn: "最後の一問は、お子さまに。",
  title: "今日、おうちの人にどんなごほうびをえらぶ？",
  /** 選んだ直後に見せる短い演出の文言（${label} を選択ラベルに置換）。 */
  revealTemplate: "「${label}」を選んでくれました。",
  choices: [
    { id: "sweet", label: "あまいごほうび", resultLabel: "甘いごほうび" },
    { id: "calm", label: "ほっとひといき", resultLabel: "ほっとひと息" },
    { id: "special", label: "ちょっととくべつ", resultLabel: "ちょっと特別" },
  ] satisfies KidsChoice[],
} as const;

export const kidsChoiceById: Record<KidsChoiceId, KidsChoice> = Object.fromEntries(
  kidsQuestion.choices.map((choice) => [choice.id, choice]),
) as Record<KidsChoiceId, KidsChoice>;

export function isKidsChoiceId(value: unknown): value is KidsChoiceId {
  return value === "sweet" || value === "calm" || value === "special";
}
