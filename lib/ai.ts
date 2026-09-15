import type {
  Answer,
  DiagnosisText,
  DiagnosisTextSource,
  KidsChoiceId,
  TeaKey,
} from "@/types";
import { diagnose } from "./diagnosis";
import {
  recommend,
  recommendationProductNames,
  type RecommendationMode,
} from "./recommendation";
import { buildFallbackText } from "./fallback";
import { extractOpenAIContent, parseDiagnosisText } from "./ai-schema";
import {
  RESPONSE_FORMAT,
  SYSTEM_PROMPT,
  buildUserPrompt,
} from "./ai-prompts";
import { kidsChoiceById } from "@/data/kids-question";

/**
 * 結果文の生成。OpenAI を使い、失敗時は必ず決定論フォールバックに切り替える。
 * - env は「使用時」に読む（env なしでビルド／テストを通すため）。
 * - fetch は差し替え可能（テストで失敗・不正応答を注入する）。
 */

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-5-mini";
const DEFAULT_TIMEOUT_MS = 8_000;
// 仕様14: 文章はさらに短く（summary最大2文/today1文/他1〜2文）。トークン枠も合わせて絞る。
const MAX_COMPLETION_TOKENS = 320;

export type GenerateOptions = {
  fetchImpl?: typeof fetch;
  apiKey?: string | null;
  model?: string;
  timeoutMs?: number;
};

export type GenerateInput = {
  answers: Answer[];
  kidsChoiceId: KidsChoiceId | null;
  /** 表示側と同じ商品提案になるよう、仕様6の mode を必ず揃えて渡す（既定 "table"）。 */
  mode?: RecommendationMode;
};

export type GenerateOutput = {
  result: DiagnosisText;
  source: DiagnosisTextSource;
  main: TeaKey;
  hidden: TeaKey;
};

export async function generateDiagnosisText(
  input: GenerateInput,
  options: GenerateOptions = {},
): Promise<GenerateOutput> {
  const { answers, kidsChoiceId, mode = "table" } = input;
  const { main, hidden } = diagnose(answers);
  const recommendation = recommend(main, answers, kidsChoiceId, mode);
  const productNames = recommendationProductNames(recommendation);
  const fallback = buildFallbackText(main, hidden, answers, recommendation.reason);
  const base: GenerateOutput = {
    result: fallback,
    source: "fallback",
    main,
    hidden,
  };

  const apiKey =
    options.apiKey !== undefined ? options.apiKey : process.env.OPENAI_API_KEY ?? null;
  if (!apiKey) return base;

  const doFetch = options.fetchImpl ?? fetch;
  const model = options.model ?? process.env.OPENAI_MODEL ?? DEFAULT_MODEL;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await doFetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        max_completion_tokens: MAX_COMPLETION_TOKENS,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: buildUserPrompt({
              main,
              hidden,
              answers,
              productNames,
              kidsRewardLabel: kidsChoiceId
                ? kidsChoiceById[kidsChoiceId].resultLabel
                : null,
            }),
          },
        ],
        response_format: RESPONSE_FORMAT,
      }),
    });

    if (!response.ok) return base;

    const payload: unknown = await response.json();
    const parsed = parseDiagnosisText(extractOpenAIContent(payload));
    if (!parsed) return base;

    return { result: parsed, source: "ai", main, hidden };
  } catch {
    return base;
  } finally {
    clearTimeout(timer);
  }
}
