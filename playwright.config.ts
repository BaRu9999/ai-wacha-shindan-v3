import { defineConfig, devices } from "@playwright/test";

/**
 * 最低限の E2E テスト（仕様17）。
 * OpenAI / Supabase の環境変数は与えない前提（フォールバック文・ログ無送信で完結させる）。
 * スマートフォン相当のビューポートで、通常フロー／親子フローを一気通貫で確認する。
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "iphone-390",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } },
    },
    {
      name: "iphone-se-375",
      use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 667 } },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
