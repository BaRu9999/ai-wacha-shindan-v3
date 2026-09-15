import { expect, test } from "@playwright/test";
import { answerAllQuestions } from "./helpers";

/**
 * 通常フロー（仕様17）:
 * TOP表示 → 診断開始 → 6問回答 → 待機演出 → 子どもなし → 結果表示 → おすすめ表示
 * → 注文画面を開く → 閉じる
 */
test("通常フロー: 診断して結果を見て、注文画面を開いて閉じる", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("intro-screen")).toBeVisible();
  await page.getByRole("button", { name: "診断をはじめる" }).click();

  await answerAllQuestions(page);

  // 6問完了後、必ず一度「お子さまとご一緒ですか」を聞く（仕様1）。
  await expect(page.getByTestId("kids-gate-screen")).toBeVisible();
  await page.getByRole("button", { name: "いいえ" }).click();

  // 待機演出 → 結果画面（フォールバック文で完結するため、体感的に長く待たない）。
  await expect(page.getByTestId("result-screen")).toBeVisible({ timeout: 15_000 });

  // ファーストビュー: タイプ名・3つの選択・おすすめが表示されている。
  await expect(page.getByTestId("highlight-answers")).toBeVisible();
  await expect(page.getByRole("heading", { name: /タイプ/ })).toBeVisible();
  await expect(page.getByText("今日のおすすめ").first()).toBeVisible();

  // 子どもの回答は無いので、その表示は出ない。
  await expect(page.getByText("お子さまが選んだ今日のごほうび")).toHaveCount(0);

  // おすすめは最初から価格・CTAまで見えている（仕様4）。
  await expect(page.getByText("合計", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "このおすすめを詳しく見る" })).toBeVisible();

  // 注文画面を開く → 閉じる（1タップで到達すること・仕様5）。
  await page.getByRole("button", { name: "スタッフに注文画面を見せる" }).click();
  const orderScreen = page.getByTestId("order-screen");
  await expect(orderScreen).toBeVisible();
  await expect(orderScreen.getByText("ご注文の際は、この画面をスタッフにお見せください。")).toBeVisible();
  await orderScreen.getByRole("button", { name: "閉じる" }).click();
  await expect(orderScreen).toHaveCount(0);
});

test("TOPに親子で楽しむ導線がある", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "親子で楽しむ" })).toBeVisible();
});
