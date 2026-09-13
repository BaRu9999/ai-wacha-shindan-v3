import { afterEach, describe, expect, it } from "vitest";
import type { Answer, KidsChoiceId } from "@/types";
import { TEA_KEYS } from "@/types";
import { products, productSets } from "@/data/products";
import { chooseSetId, deriveSignals, recommend } from "@/lib/recommendation";

/**
 * 仕様13・27-3: 商品推薦ロジックテスト。
 * 「同じタイプでも回答で結果が変わる」ことと、停止中商品を出さないことを検証する。
 */

function answersFrom(pick: Partial<Record<"q1" | "q4" | "q5" | "q6", string>>): Answer[] {
  return [
    { questionId: "q1", choiceId: pick.q1 ?? "q1b" },
    { questionId: "q2", choiceId: "q2a" },
    { questionId: "q3", choiceId: "q3a" },
    { questionId: "q4", choiceId: pick.q4 ?? "q4c" },
    { questionId: "q5", choiceId: pick.q5 ?? "q5c" },
    { questionId: "q6", choiceId: pick.q6 ?? "q6a" },
  ];
}

const scenarios: Array<{
  name: string;
  answers: Answer[];
  kids: KidsChoiceId | null;
}> = [
  {
    name: "甘味に大きく寄せる",
    answers: answersFrom({ q1: "q1a", q4: "q4d", q5: "q5d", q6: "q6d" }),
    kids: "sweet",
  },
  {
    name: "軽さ・整えに寄せる",
    answers: answersFrom({ q1: "q1d", q4: "q4c", q5: "q5b", q6: "q6c" }),
    kids: "calm",
  },
  {
    name: "ドリンク中心に寄せる",
    answers: answersFrom({ q1: "q1a", q4: "q4b", q5: "q5a", q6: "q6b" }),
    kids: null,
  },
  {
    name: "甘味のみ弱く寄せる",
    answers: answersFrom({ q1: "q1b", q4: "q4d", q5: "q5d", q6: "q6d" }),
    kids: null,
  },
  {
    name: "軽さのみ弱く寄せる",
    answers: answersFrom({ q1: "q1d", q4: "q4c", q5: "q5b", q6: "q6c" }),
    kids: null,
  },
];

afterEach(() => {
  // status を書き換えるテストがあるため元に戻す
  for (const id of Object.keys(products)) {
    products[id].status = "active";
  }
});

describe("推薦の基本性質", () => {
  it("どのタイプ・どのシナリオでも 1点以上を返し、停止中商品は含まない", () => {
    for (const key of TEA_KEYS) {
      for (const scenario of scenarios) {
        const rec = recommend(key, scenario.answers, scenario.kids);
        expect(rec.items.length, `${key} / ${scenario.name}`).toBeGreaterThanOrEqual(1);
        for (const item of rec.items) {
          expect(item.status).toBe("active");
        }
        expect(rec.totalPrice).toBe(
          rec.items.reduce((sum, item) => sum + (item.price ?? 0), 0),
        );
        expect(rec.hasUnpricedItem).toBe(rec.items.some((item) => item.price === null));
        expect(Number.isInteger(rec.totalPrice)).toBe(true);
        expect(rec.heroImage).toMatch(/^\/menu\/.+\.jpg$/);
      }
    }
  });

  it("同じ入力なら常に同じ結果（決定論）", () => {
    const answers = answersFrom({ q1: "q1a", q4: "q4d", q5: "q5d", q6: "q6d" });
    expect(recommend("hojicha", answers, "sweet")).toEqual(
      recommend("hojicha", answers, "sweet"),
    );
  });
});

describe("同じタイプでも回答で提案が変わる", () => {
  it("各タイプで、シナリオ間に2種類以上の組み合わせが現れる", () => {
    for (const key of TEA_KEYS) {
      const setIds = new Set(
        scenarios.map((scenario) => recommend(key, scenario.answers, scenario.kids).setId),
      );
      expect(setIds.size, `${key}: ${[...setIds].join(", ")}`).toBeGreaterThanOrEqual(2);
    }
  });

  it("具体例: ほうじ茶タイプは甘味寄せ→パフェ、軽さ寄せ→わらび餅、ドリンク寄せ→ドリンク主役", () => {
    const sweet = recommend("hojicha", scenarios[0].answers, scenarios[0].kids);
    const light = recommend("hojicha", scenarios[1].answers, scenarios[1].kids);
    const drink = recommend("hojicha", scenarios[2].answers, scenarios[2].kids);

    expect(light.setId).toBe("hojicha-light");
    expect(drink.setId).toBe("hojicha-drink");
    // 甘味寄せは（ほうじ茶にはsweetセットが無いので）drink セットに解決される
    expect(sweet.items.some((item) => item.category === "sweet")).toBe(true);
  });

  it("子どもが「甘いごほうび」を選ぶと甘味方向に寄る", () => {
    // 素の回答は軽さがやや優勢（light=2, sweet=1）
    const base = answersFrom({ q1: "q1d", q4: "q4c", q5: "q5c", q6: "q6a" });
    const withoutKids = chooseSetId("rooibos", deriveSignals(base, null));
    const withKids = chooseSetId("rooibos", deriveSignals(base, "sweet"));
    expect(withoutKids).toBe("rooibos-light");
    expect(withKids).toBe("rooibos-sweet");
  });
});

describe("価格非掲載の商品（タニタコラボプレート）", () => {
  it("price が null の商品を含むときは hasUnpricedItem が true になり、合計には含めない", () => {
    const plateAnswer = answersFrom({ q1: "q1d", q4: "q4c", q5: "q5b", q6: "q6c" });
    const rec = recommend("kuwacha", plateAnswer, null);
    expect(rec.setId).toBe("kuwacha-plate");

    const plateItem = rec.items.find((item) => item.id === "tanita-plate-sawara");
    expect(plateItem?.price).toBeNull();
    expect(rec.hasUnpricedItem).toBe(true);

    const drinkOnlyTotal = rec.items
      .filter((item) => item.price !== null)
      .reduce((sum, item) => sum + (item.price ?? 0), 0);
    expect(rec.totalPrice).toBe(drinkOnlyTotal);
  });
});

describe("停止中商品のフォールバック", () => {
  it("組み合わせの商品が停止中なら signature 側へ退避し、停止中は出さない", () => {
    const answers = answersFrom({ q1: "q1a", q4: "q4d", q5: "q5d", q6: "q6d" });
    const before = recommend("matcha", answers, "sweet");
    expect(before.setId).toBe("matcha-sweet");

    for (const id of productSets["matcha-sweet"].items) {
      products[id].status = "inactive";
    }
    const after = recommend("matcha", answers, "sweet");
    expect(after.setId).toBe("matcha-signature");
    expect(after.items.every((item) => item.status === "active")).toBe(true);
    expect(after.items.length).toBeGreaterThanOrEqual(1);
  });
});
