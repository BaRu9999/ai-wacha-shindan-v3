import type { Page } from "@playwright/test";

/** 質問画面で「いちばん上の選択肢」を6問ぶんタップし続ける。インタールードは出たらタップでスキップする。 */
export async function answerAllQuestions(page: Page): Promise<void> {
  for (let i = 0; i < 6; i += 1) {
    await page.getByTestId("quiz-screen").waitFor({ state: "visible" });
    await page
      .locator('[data-testid="quiz-screen"] fieldset ul li button')
      .first()
      .click();

    const interlude = page.getByTestId("interlude-screen");
    await interlude.waitFor({ state: "visible", timeout: 400 }).catch(() => {});
    if (await interlude.isVisible()) {
      await interlude.click();
    }
  }
}
