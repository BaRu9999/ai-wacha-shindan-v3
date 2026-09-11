import { describe, expect, it } from "vitest";
import type { Answer } from "@/types";
import { parseDiagnoseRequest } from "@/lib/diagnose-request";
import {
  extractOpenAIContent,
  isDiagnosisText,
  parseDiagnosisText,
} from "@/lib/ai-schema";

/**
 * 仕様27-4: 不正 API 入力テスト。
 * リクエスト検証と AI 応答スキーマ検証が、想定外の入力を確実に弾くことを確認する。
 */

const validAnswers: Answer[] = [
  { questionId: "q1", choiceId: "q1a" },
  { questionId: "q2", choiceId: "q2b" },
  { questionId: "q3", choiceId: "q3c" },
  { questionId: "q4", choiceId: "q4d" },
  { questionId: "q5", choiceId: "q5a" },
  { questionId: "q6", choiceId: "q6b" },
];

const validText = {
  summary: "落ち着いて物事を見られる一日。",
  hiddenInsight: "余裕があるとき、決断力が顔を出します。",
  today: "静かな時間を、少しだけ自分のために。",
  recommendationReason: "香ばしい甘さが、今日の気分に合います。",
  word: "一期一会",
  wordMeaning: "この時間を、ゆっくり味わってみてください。",
};

describe("parseDiagnoseRequest", () => {
  it("正しい入力を受け付ける", () => {
    const parsed = parseDiagnoseRequest({ answers: validAnswers });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data.answers).toHaveLength(6);
      expect(parsed.data.kidsChoiceId).toBeNull();
    }
  });

  it("kidsChoiceId は既知の値だけ通し、未知の値は null 化する", () => {
    const ok = parseDiagnoseRequest({ answers: validAnswers, kidsChoiceId: "sweet" });
    expect(ok.ok && ok.data.kidsChoiceId).toBe("sweet");
    const bad = parseDiagnoseRequest({ answers: validAnswers, kidsChoiceId: "banana" });
    expect(bad.ok && bad.data.kidsChoiceId).toBeNull();
  });

  it.each([
    ["null", null],
    ["配列", [1, 2, 3]],
    ["文字列", "hello"],
    ["answers なし", {}],
    ["answers が短い", { answers: validAnswers.slice(0, 4) }],
    ["answers が長い", { answers: [...validAnswers, { questionId: "q7", choiceId: "q7a" }] }],
    [
      "質問の順序が違う",
      { answers: [...validAnswers.slice(1), { questionId: "q1", choiceId: "q1a" }] },
    ],
    [
      "存在しない choiceId",
      {
        answers: validAnswers.map((a, i) =>
          i === 2 ? { questionId: "q3", choiceId: "q3z" } : a,
        ),
      },
    ],
    [
      "questionId 不一致",
      {
        answers: validAnswers.map((a, i) =>
          i === 0 ? { questionId: "q2", choiceId: "q1a" } : a,
        ),
      },
    ],
  ])("不正入力を 400 で弾く: %s", (_label, input) => {
    const parsed = parseDiagnoseRequest(input);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.status).toBe(400);
      expect(typeof parsed.error).toBe("string");
    }
  });
});

describe("isDiagnosisText / parseDiagnosisText", () => {
  it("正しい形を受け付ける", () => {
    expect(isDiagnosisText(validText)).toBe(true);
    expect(parseDiagnosisText(validText)).not.toBeNull();
  });

  it("JSON 文字列も解釈する", () => {
    expect(parseDiagnosisText(JSON.stringify(validText))).toEqual(validText);
  });

  it("前後の空白・全角スペースを整える", () => {
    const messy = { ...validText, summary: "  余白の　ある　一日。  " };
    expect(parseDiagnosisText(messy)?.summary).toBe("余白の ある 一日。");
  });

  it.each([
    ["キー欠け", { ...structuredCloneSafe(validText), word: undefined }],
    ["空文字", { ...structuredCloneSafe(validText), today: "" }],
    ["空白のみ", { ...structuredCloneSafe(validText), today: "   " }],
    ["数値混入", { ...structuredCloneSafe(validText), summary: 123 }],
    ["長すぎ", { ...structuredCloneSafe(validText), summary: "あ".repeat(401) }],
    ["オブジェクトでない", "not-json-{"],
    ["null", null],
    ["配列", [validText]],
  ])("不正な AI 応答を弾く: %s", (_label, input) => {
    expect(isDiagnosisText(input)).toBe(false);
    expect(parseDiagnosisText(input)).toBeNull();
  });
});

describe("extractOpenAIContent", () => {
  it("choices[0].message.content を取り出す", () => {
    expect(
      extractOpenAIContent({ choices: [{ message: { content: "hello" } }] }),
    ).toBe("hello");
  });

  it.each([
    ["空", {}],
    ["null", null],
    ["choices 空配列", { choices: [] }],
    ["content が無い", { choices: [{ message: {} }] }],
    ["content が文字列でない", { choices: [{ message: { content: 42 } }] }],
  ])("取り出せないときは null: %s", (_label, input) => {
    expect(extractOpenAIContent(input)).toBeNull();
  });
});

function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
