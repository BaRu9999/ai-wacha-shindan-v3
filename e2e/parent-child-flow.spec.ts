import { expect, test } from "@playwright/test";
import { answerAllQuestions } from "./helpers";

/**
 * 親子フロー（仕様17）:
 * TOP → 親子モード → 6問回答 → 子ども向け質問 → 子ども回答 → 結果表示
 * → 子どもの回答が結果に反映 → おすすめ表示
 */
test("親子フロー: 親子で楽しむから開始すると、子どもの回答が結果に反映される", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "親子で楽しむ" }).click();
  await answerAllQuestions(page);

  // 親子モードは「はい/いいえ」を挟まず、直接子ども向けの質問へ進む（仕様1・3）。
  await expect(page.getByTestId("kids-gate-screen")).toHaveCount(0);
  await expect(page.getByTestId("kids-question-screen")).toBeVisible();
  await expect(page.getByText("最後の一問は、お子さまに。")).toBeVisible();

  await page.getByRole("button", { name: "あまいごほうび" }).click();

  // 選んだ直後に短い演出が出る（タップで先に進められる）。
  const reveal = page.getByTestId("kids-reveal-screen");
  await expect(reveal).toBeVisible();
  await expect(reveal.getByText("甘いごほうび")).toBeVisible();
  await reveal.click();

  await expect(page.getByTestId("result-screen")).toBeVisible({ timeout: 15_000 });

  // 子どもの回答が結果画面に反映されている。
  await expect(page.getByText("お子さまが選んだ今日のごほうび")).toBeVisible();
  await expect(page.getByText("甘いごほうび").first()).toBeVisible();

  // おすすめ自体も表示されている。
  await expect(page.getByText("今日のおすすめ").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "スタッフに注文画面を見せる" })).toBeVisible();
});
