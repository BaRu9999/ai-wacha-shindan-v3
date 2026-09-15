/**
 * おすすめ／注文画面の価格表示を、誤認しない形に統一する（価格不明商品の誤認防止）。
 *
 * 問題: 価格が null の商品（例: タニタコラボプレート）を含む提案（主に mode="before-order"）で、
 * 「合計 ¥649」のように見せると、ユーザーが「セット全部でその金額」と誤解する恐れがある。
 *
 * 方針:
 *  - 価格不明の商品が1つでもあれば、「合計」という言葉は絶対に使わない。
 *  - 代わりに「表示価格」として、価格が判明している商品だけの金額を示し、
 *    価格不明の商品名を別行の注記として添える。
 *  - RecommendationCard と OrderScreen の両方が、この関数だけを見て表示すれば
 *    自然と同じ意味になる（表示の重複実装・言い回しのズレを防ぐ）。
 */

export type PriceDisplay = {
  /** 価格が判明している商品だけの税込合計（円）。 */
  amount: number;
  /** 金額の前に付けるラベル。価格不明の商品があるときは「合計」を使わない。 */
  label: string;
  /** 価格不明の商品がある場合の注記。無ければ null。 */
  note: string | null;
};

export function buildPriceDisplay(
  hasUnpricedItem: boolean,
  totalPrice: number,
  unpricedNames: string[] = [],
): PriceDisplay {
  if (!hasUnpricedItem) {
    return { amount: totalPrice, label: "合計", note: null };
  }

  const note =
    unpricedNames.length > 0
      ? `＋ ${unpricedNames.join("・")}（価格はスタッフにご確認ください）`
      : "＋ 価格が表示されていない商品があります";

  return { amount: totalPrice, label: "表示価格", note };
}
