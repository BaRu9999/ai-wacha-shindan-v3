import { describe, expect, it } from "vitest";
import type { Answer } from "@/types";
import { choiceById } from "@/data/questions";
import { pickHighlights } from "@/lib/highlights";

/**
 * 仕様7: 「今回のあなたをつくった3つの選択」抽出ロジックのテスト。
 * AIには選ばせない、決定論的なルールベース抽出であることを確認する。
 */

function ans(questionId: string, choiceId: string): Answer {
  return { questionId, choiceId };
}

describe("pickHighlights", () => {
  it("メインタイプに加点した回答から、テーマが重ならないよう3つ選ぶ", () => {
    const answers: Answer[] = [
      ans("q1", "q1a"), // matcha main / mood
      ans("q2", "q2a"), // biwa main（matchaには無関係）/ personality
      ans("q3", "q3a"), // matcha main / personality
      ans("q4", "q4a"), // matcha main / taste
      ans("q5", "q5a"), // matcha main / spend
      ans("q6", "q6b"), // kuwacha main・matcha sub / mood
    ];

    const highlights = pickHighlights("matcha", answers, 3);
    expect(highlights).toHaveLength(3);
    expect(highlights.map((item) => item.label)).toEqual([
      choiceById.q1a.label,
      choiceById.q3a.label,
      choiceById.q4a.label,
    ]);
    expect(new Set(highlights.map((item) => item.theme)).size).toBe(3);
  });

  it("同じ回答なら常に同じ結果（決定論）", () => {
    const answers: Answer[] = [
      ans("q1", "q1b"),
      ans("q2", "q2b"),
      ans("q3", "q3b"),
      ans("q4", "q4b"),
      ans("q5", "q5b"),
      ans("q6", "q6a"),
    ];
    expect(pickHighlights("hojicha", answers)).toEqual(pickHighlights("hojicha", answers));
  });

  it("関連する回答が少ないときも、重複を許して必ず3つ返す", () => {
    const answers: Answer[] = [
      ans("q1", "q1a"), // matcha main
      ans("q2", "q2a"), // biwa main
      ans("q3", "q3a"), // matcha main
      ans("q4", "q4d"), // rooibos main（唯一の関連回答）
      ans("q5", "q5a"), // matcha main
      ans("q6", "q6a"), // hojicha main
    ];
    const highlights = pickHighlights("rooibos", answers, 3);
    expect(highlights).toHaveLength(3);
    expect(highlights.some((item) => item.questionId === "q4")).toBe(true);
  });

  it("回答が空でも例外を投げず、空配列を返す", () => {
    expect(pickHighlights("matcha", [])).toEqual([]);
  });

  it("存在しない questionId / choiceId は無視する", () => {
    const highlights = pickHighlights("matcha", [
      { questionId: "q1", choiceId: "q1a" },
      { questionId: "does-not-exist", choiceId: "nope" },
    ]);
    expect(highlights).toHaveLength(1);
    expect(highlights[0].label).toBe(choiceById.q1a.label);
  });
});
