import type { DiagnosisText } from "@/types";
import { DIAGNOSIS_TEXT_KEYS } from "@/types";

/**
 * AI 応答（結果文）の検証。zod は使わず手書き（依存を増やさない方針）。
 * - 想定外の形／空文字／極端に長い文字列は弾く。
 * - 通ったものは前後空白と連続空白を軽く整形する。
 */

const MAX_FIELD_LENGTH = 400;

export function isDiagnosisText(value: unknown): value is DiagnosisText {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return DIAGNOSIS_TEXT_KEYS.every((key) => {
    const field = record[key];
    return (
      typeof field === "string" &&
      field.trim().length > 0 &&
      field.length <= MAX_FIELD_LENGTH
    );
  });
}

/**
 * AI 応答（オブジェクト or JSON文字列）を DiagnosisText に変換。
 * 不正なら null を返す（呼び出し側はフォールバックへ）。
 */
export function parseDiagnosisText(raw: unknown): DiagnosisText | null {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!isDiagnosisText(parsed)) return null;

  const tidy = (value: string) => value.trim().replace(/[ \t　]+/g, " ");
  return {
    summary: tidy(parsed.summary),
    hiddenInsight: tidy(parsed.hiddenInsight),
    today: tidy(parsed.today),
    recommendationReason: tidy(parsed.recommendationReason),
    word: tidy(parsed.word),
    wordMeaning: tidy(parsed.wordMeaning),
  };
}

/** OpenAI Chat Completions のレスポンスから本文テキストを取り出す。 */
export function extractOpenAIContent(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  return typeof content === "string" && content.length > 0 ? content : null;
}
