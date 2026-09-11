import type { KidsChoiceId } from "@/types";

/**
 * 子ども連れのときだけ表示する「最後の一問」。
 * - 子どもでも直感的に選べる3択。
 * - 家庭の呼び方を決めつけないため、問い文は「おうちの人」を基本に。
 * - この回答は商品提案に少しだけ反映し、結果に「お子さまが選んだ今日のごほうび」として表示する。
 */
export type KidsChoice = {
  id: KidsChoiceId;
  /** 選択肢の文言。 */
  label: string;
  /** 大きく見せるアイコン的な絵文字（1つだけ）。 */
  icon: string;
  /** 結果に表示する短い言い換え。 */
  resultLabel: string;
};

export const kidsQuestion = {
  intro: "今日はお子さまとご一緒ですか？",
  leadIn: "最後の一問は、お子さまに。",
  title: "今日、おうちの人にどんなごほうびをえらぶ？",
  choices: [
    { id: "sweet", label: "あまいごほうび", icon: "🍮", resultLabel: "甘いごほうび" },
    { id: "calm", label: "ほっとひといき", icon: "🍵", resultLabel: "ほっとひと息" },
    { id: "special", label: "ちょっととくべつ", icon: "✨", resultLabel: "ちょっと特別" },
  ] satisfies KidsChoice[],
} as const;

export const kidsChoiceById: Record<KidsChoiceId, KidsChoice> = Object.fromEntries(
  kidsQuestion.choices.map((choice) => [choice.id, choice]),
) as Record<KidsChoiceId, KidsChoice>;

export function isKidsChoiceId(value: unknown): value is KidsChoiceId {
  return value === "sweet" || value === "calm" || value === "special";
}
