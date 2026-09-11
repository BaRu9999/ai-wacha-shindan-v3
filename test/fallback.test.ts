import { describe, expect, it, vi } from "vitest";
import type { Answer } from "@/types";
import { TEA_KEYS } from "@/types";
import { isDiagnosisText } from "@/lib/ai-schema";
import { buildFallbackText } from "@/lib/fallback";
import { generateDiagnosisText } from "@/lib/ai";

/**
 * 仕様15・27-5: OpenAI 失敗時のフォールバック確認。
 * どんな失敗の仕方でも診断が止まらず、妥当な結果文が返ることを確認する。
 */

const answers: Answer[] = [
  { questionId: "q1", choiceId: "q1a" },
  { questionId: "q2", choiceId: "q2a" },
  { questionId: "q3", choiceId: "q3a" },
  { questionId: "q4", choiceId: "q4a" },
  { questionId: "q5", choiceId: "q5a" },
  { questionId: "q6", choiceId: "q6b" },
];

const aiText = {
  summary: "回答から見えた、今日のあなた。",
  hiddenInsight: "ふとした時に、別の一面が出ます。",
  today: "今日の時間を、そっと味わって。",
  recommendationReason: "この組み合わせが、今日の気分に寄り添います。",
  word: "日々是好日",
  wordMeaning: "その日だけのよさが、必ずあります。",
};

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
  } as unknown as Response;
}

describe("buildFallbackText（決定論フォールバック）", () => {
  it("6タイプ すべてで妥当な結果文を生成する", () => {
    for (const main of TEA_KEYS) {
      for (const hidden of TEA_KEYS) {
        if (main === hidden) continue;
        const text = buildFallbackText(main, hidden, answers, "香ばしい甘さが今日に合います。");
        expect(isDiagnosisText(text), `${main}/${hidden}`).toBe(true);
        expect(text.word.length).toBeGreaterThan(0);
        expect(text.today).toContain("」");
      }
    }
  });

  it("おすすめ理由が空でも、キャッチコピーで埋めて成立する", () => {
    const text = buildFallbackText("matcha", "biwa", answers, "");
    expect(text.recommendationReason.length).toBeGreaterThan(0);
  });

  it("回答が欠けていても落ちない", () => {
    const text = buildFallbackText("rooibos", "hojicha", [], "");
    expect(isDiagnosisText(text)).toBe(true);
  });
});

describe("generateDiagnosisText", () => {
  it("APIキー未設定なら即フォールバック（fetch を呼ばない）", async () => {
    const fetchImpl = vi.fn();
    const out = await generateDiagnosisText(
      { answers, kidsChoiceId: null },
      { apiKey: null, fetchImpl: fetchImpl as unknown as typeof fetch },
    );
    expect(out.source).toBe("fallback");
    expect(isDiagnosisText(out.result)).toBe(true);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("fetch が例外を投げてもフォールバックで 200 相当を返す", async () => {
    const out = await generateDiagnosisText(
      { answers, kidsChoiceId: null },
      {
        apiKey: "test-key",
        fetchImpl: (() => {
          throw new Error("network down");
        }) as unknown as typeof fetch,
      },
    );
    expect(out.source).toBe("fallback");
    expect(isDiagnosisText(out.result)).toBe(true);
  });

  it("HTTP エラー応答ならフォールバック", async () => {
    const out = await generateDiagnosisText(
      { answers, kidsChoiceId: null },
      {
        apiKey: "test-key",
        fetchImpl: (async () => jsonResponse({ error: "boom" }, false)) as unknown as typeof fetch,
      },
    );
    expect(out.source).toBe("fallback");
  });

  it("応答本文が不正な形ならフォールバック", async () => {
    const out = await generateDiagnosisText(
      { answers, kidsChoiceId: null },
      {
        apiKey: "test-key",
        fetchImpl: (async () =>
          jsonResponse({
            choices: [{ message: { content: JSON.stringify({ summary: "x" }) } }],
          })) as unknown as typeof fetch,
      },
    );
    expect(out.source).toBe("fallback");
  });

  it("応答本文が JSON でない文字列でもフォールバック", async () => {
    const out = await generateDiagnosisText(
      { answers, kidsChoiceId: null },
      {
        apiKey: "test-key",
        fetchImpl: (async () =>
          jsonResponse({ choices: [{ message: { content: "```これは JSON ではない```" } }] })) as unknown as typeof fetch,
      },
    );
    expect(out.source).toBe("fallback");
  });

  it("タイムアウト（abort）でもフォールバック", async () => {
    const hangingFetch = ((_url: string, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("aborted", "AbortError")),
        );
      })) as unknown as typeof fetch;

    const out = await generateDiagnosisText(
      { answers, kidsChoiceId: null },
      { apiKey: "test-key", fetchImpl: hangingFetch, timeoutMs: 20 },
    );
    expect(out.source).toBe("fallback");
    expect(isDiagnosisText(out.result)).toBe(true);
  });

  it("正しい AI 応答なら source=ai でその内容を返す", async () => {
    const out = await generateDiagnosisText(
      { answers, kidsChoiceId: null },
      {
        apiKey: "test-key",
        fetchImpl: (async () =>
          jsonResponse({ choices: [{ message: { content: JSON.stringify(aiText) } }] })) as unknown as typeof fetch,
      },
    );
    expect(out.source).toBe("ai");
    expect(out.result).toEqual(aiText);
    expect(TEA_KEYS).toContain(out.main);
    expect(out.main).not.toBe(out.hidden);
  });
});
