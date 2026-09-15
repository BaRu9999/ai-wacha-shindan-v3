import { describe, expect, it } from "vitest";
import { buildPriceDisplay } from "@/lib/price-display";

/**
 * 仕様4: 価格不明の商品（price: null）を含むとき、「合計 ¥xxx」のような
 * 誤認を招く表示にしないことを確認する。
 */
describe("buildPriceDisplay", () => {
  it("価格不明の商品が無ければ、通常どおり「合計」を使う", () => {
    const result = buildPriceDisplay(false, 1200, []);
    expect(result).toEqual({ amount: 1200, label: "合計", note: null });
  });

  it("価格不明の商品があれば、「合計」という言葉を絶対に使わない", () => {
    const result = buildPriceDisplay(true, 649, ["タニタコラボプレート"]);
    expect(result.label).not.toBe("合計");
    expect(result.label).not.toContain("合計");
  });

  it("価格不明の商品名を注記に含め、価格が確定しているとは言わない", () => {
    const result = buildPriceDisplay(true, 649, ["タニタコラボプレート"]);
    expect(result.note).toContain("タニタコラボプレート");
    expect(result.note).not.toBeNull();
    expect(result.amount).toBe(649);
  });

  it("価格不明の商品名が渡されなくても、注記は必ず表示される（金額だけで誤認させない）", () => {
    const result = buildPriceDisplay(true, 649, []);
    expect(result.label).not.toBe("合計");
    expect(result.note).not.toBeNull();
  });
});
