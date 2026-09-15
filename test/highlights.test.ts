import { describe, expect, it } from "vitest";
import type { Answer } from "@/types";
import { choiceById } from "@/data/questions";
import { pickHighlights } from "@/lib/highlights";

/**
 * 「この結果につながった選択」抽出ロジックのテスト。
 * メインタイプに実際に加点した回答だけを返し、無関係な回答で件数を埋めないことを確認する。
 */

function ans(questionId: string, choiceId: string): Answer {
  return { questionId, choiceId };
}

describe("pickHighlights", () => {
  it("関連回答が3件あれば3件返し、テーマが重ならないよう選ぶ", () => {
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

  it("関連回答が2件しかなければ2件だけ返す（埋め合わせない）", () => {
    const answers: Answer[] = [
      ans("q1", "q1a"), // matcha main, biwa sub（wakoucha には無関係）
      ans("q2", "q2c"), // wakoucha main / personality
      ans("q3", "q3a"), // matcha main, kuwacha sub（wakoucha には無関係）
      ans("q4", "q4a"), // matcha main, hojicha sub（wakoucha には無関係）
      ans("q5", "q5a"), // matcha main, hojicha sub（wakoucha には無関係）
      ans("q6", "q6a"), // hojicha main, wakoucha sub / mood
    ];
    const highlights = pickHighlights("wakoucha", answers, 3);
    expect(highlights).toHaveLength(2);
    expect(highlights.map((item) => item.questionId).sort()).toEqual(["q2", "q6"]);
  });

  it("関連回答が1件しかなければ1件だけ返す", () => {
    const answers: Answer[] = [
      ans("q1", "q1a"), // matcha main
      ans("q2", "q2a"), // biwa main
      ans("q3", "q3a"), // matcha main
      ans("q4", "q4d"), // rooibos main（rooibos に関連する唯一の回答）
      ans("q5", "q5a"), // matcha main
      ans("q6", "q6a"), // hojicha main
    ];
    const highlights = pickHighlights("rooibos", answers, 3);
    expect(highlights).toHaveLength(1);
    expect(highlights[0].questionId).toBe("q4");
  });

  it("関連回答が0件なら空配列を返す（無関係な回答を補充しない）", () => {
    const answers: Answer[] = [
      ans("q1", "q1a"), // matcha main, biwa sub
      ans("q2", "q2a"), // biwa main, hojicha sub
      ans("q3", "q3a"), // matcha main, kuwacha sub
      ans("q4", "q4a"), // matcha main, hojicha sub
      ans("q5", "q5a"), // matcha main, hojicha sub
      ans("q6", "q6b"), // kuwacha main, matcha sub
    ];
    // これらの回答には wakoucha が main/sub のどちらにも一切登場しない。
    expect(pickHighlights("wakoucha", answers, 3)).toEqual([]);
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
