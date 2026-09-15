import type { Answer, KidsChoiceId, TeaKey } from "@/types";
import {
  productSets,
  products,
  teaImage,
  type Product,
} from "@/data/products";

/**
 * 商品提案（ルールベース）。
 *
 * 方針（仕様13）:
 *  - メインタイプを土台にしつつ、味覚(Q4)・今日の気分(Q1)・ごほうび(Q5)・
 *    どうなりたいか(Q6)・子ども向けの回答 で、同じタイプでも結果が変わる余地を作る。
 *  - 機械学習は使わない。すべて説明可能なルール。
 *  - 停止中(status:"inactive")の商品は出さない。全滅時は signature に退避する。
 *
 * 方針（仕様6・mode）:
 *  - このサービスは卓上利用（注文後・食事中）が中心のため、既定の "table" モードでは
 *    食事系（category: "plate"）の商品を提案しない。「追加注文として自然か」を基準に、
 *    甘味・ドリンクを優先する。
 *  - 注文前の利用など、食事提案も出したい場面のために "before-order" モードを用意する。
 *    既定は必ず "table"（URL の ?mode=before-order 等、呼び出し側が明示したときだけ切り替える）。
 *  - 実装は単純なフィルタ（plate を含む組み合わせを候補から外す）のみ。大規模な条件分岐は増やさない。
 */

export type RecommendationMode = "table" | "before-order";

export function isRecommendationMode(value: unknown): value is RecommendationMode {
  return value === "table" || value === "before-order";
}

export type RecommendationSignals = {
  /** Q4 味覚 */
  taste: "rich" | "comfort" | "elegant" | "gentle" | null;
  /**
   * Q1 今日の気分。
   * "flexible" は q1d「そのときの気分で、決める」を表す。これは「頭をすっきりさせたい」
   * という意味ではなく「決めない・その場に委ねる」という意味なので、商品の傾向を
   * 勝手に決めつけないよう、leanScores では加点しない（下記参照）。
   */
  moodStart: "settle" | "talk" | "outing" | "flexible" | null;
  /** Q5 ごほうび */
  spend: "drink" | "healthy" | "showy" | "sweet" | null;
  /** Q6 どうなりたいか */
  endWish: "connect" | "clear" | "light" | "cozy" | null;
  /** 子ども向けの最後の一問 */
  kids: KidsChoiceId | null;
};

type Lean = "sweet" | "light" | "drink";

function pickChoiceId(answers: Answer[], questionId: string): string | null {
  return answers.find((answer) => answer.questionId === questionId)?.choiceId ?? null;
}

function mapValue<T extends string>(
  id: string | null,
  table: Record<string, T>,
): T | null {
  return id && table[id] ? table[id] : null;
}

export function deriveSignals(
  answers: Answer[],
  kids: KidsChoiceId | null,
): RecommendationSignals {
  return {
    taste: mapValue(pickChoiceId(answers, "q4"), {
      q4a: "rich",
      q4b: "comfort",
      q4c: "elegant",
      q4d: "gentle",
    }),
    moodStart: mapValue(pickChoiceId(answers, "q1"), {
      q1a: "settle",
      q1b: "talk",
      q1c: "outing",
      q1d: "flexible",
    }),
    spend: mapValue(pickChoiceId(answers, "q5"), {
      q5a: "drink",
      q5b: "healthy",
      q5c: "showy",
      q5d: "sweet",
    }),
    endWish: mapValue(pickChoiceId(answers, "q6"), {
      q6a: "connect",
      q6b: "clear",
      q6c: "light",
      q6d: "cozy",
    }),
    kids,
  };
}

/** 各 lean のスコア。数値と加点根拠はここに集約（マジックナンバーはコメントで説明）。 */
export function leanScores(signals: RecommendationSignals): Record<Lean, number> {
  let sweet = 0;
  let light = 0;
  let drink = 0;

  // 味覚
  if (signals.taste === "rich") sweet += 1; // 濃い・余韻 → パフェ系
  if (signals.taste === "gentle") sweet += 1; // まるい甘さ → パフェ系
  if (signals.taste === "elegant") light += 1; // 上品 → 軽い和スイーツ
  if (signals.taste === "comfort") drink += 1; // 香ばしくほっと → 一杯中心

  // ごほうび(Q5)
  if (signals.spend === "sweet") sweet += 2;
  if (signals.spend === "showy") sweet += 1;
  if (signals.spend === "healthy") light += 2;
  if (signals.spend === "drink") drink += 2;

  // 今日の気分(Q1)
  if (signals.moodStart === "settle") drink += 2; // 静かに整える → 一杯中心
  // "flexible"（そのときの気分で決める）は、意図的にどの lean にも加点しない。
  // 「決めない」という回答から商品の傾向を決めつけないため。

  // どうなりたいか(Q6)
  if (signals.endWish === "cozy") sweet += 1;
  if (signals.endWish === "light") light += 2;
  if (signals.endWish === "clear") drink += 2;

  // 子ども向けの回答
  if (signals.kids === "sweet") sweet += 2;
  if (signals.kids === "special") sweet += 1;
  if (signals.kids === "calm") {
    drink += 1;
    light += 1;
  }

  return { sweet, light, drink };
}

/** lean 同点時の決定順（固定・恣意的だが明示）。 */
const LEAN_TIEBREAK: Record<Lean, number> = { sweet: 0, drink: 1, light: 2 };

/**
 * タイプ別「lean → 使う組み合わせ ID」。
 * 対応がない lean は signature に退避する（存在しないタイプ別セットは作らない）。
 */
const setPlanByType: Record<TeaKey, Partial<Record<Lean, string>>> = {
  matcha: { sweet: "matcha-sweet", drink: "matcha-drink" },
  hojicha: { light: "hojicha-light", drink: "hojicha-drink" },
  wakoucha: { sweet: "wakoucha-sweet" },
  kuwacha: { light: "kuwacha-plate", sweet: "kuwacha-sweet" },
  biwa: { drink: "biwa-drink" },
  rooibos: { sweet: "rooibos-sweet", light: "rooibos-light" },
};

const signatureByType: Record<TeaKey, string> = {
  matcha: "matcha-signature",
  hojicha: "hojicha-signature",
  wakoucha: "wakoucha-signature",
  kuwacha: "kuwacha-signature",
  biwa: "biwa-signature",
  rooibos: "rooibos-signature",
};

/** mode="table" のとき、食事系（plate）を含む組み合わせを候補から外す。 */
function isSetAllowedInMode(setId: string, mode: RecommendationMode): boolean {
  if (mode === "before-order") return true;
  const set = productSets[setId];
  if (!set) return false;
  return set.items.every((itemId) => products[itemId]?.category !== "plate");
}

export function chooseSetId(
  teaKey: TeaKey,
  signals: RecommendationSignals,
  mode: RecommendationMode = "table",
): string {
  const scores = leanScores(signals);
  const plan = setPlanByType[teaKey];
  const ordered = (Object.keys(LEAN_TIEBREAK) as Lean[])
    .filter((lean) => scores[lean] > 0)
    .sort((a, b) => scores[b] - scores[a] || LEAN_TIEBREAK[a] - LEAN_TIEBREAK[b]);

  for (const lean of ordered) {
    const setId = plan[lean];
    if (setId && productSets[setId] && isSetAllowedInMode(setId, mode)) return setId;
  }
  return signatureByType[teaKey];
}

export type Recommendation = {
  setId: string;
  items: Product[];
  /** 価格が判明している商品だけの合計。1点でも price が null の商品があれば hasUnpricedItem が true になる。 */
  totalPrice: number;
  /** true の場合、totalPrice は全商品の金額を表さない（店舗で価格非掲載の商品を含む）。 */
  hasUnpricedItem: boolean;
  /** フォールバックのおすすめ理由（AI が上書きすることがある）。 */
  reason: string;
  heroImage: string;
};

function activeItems(setId: string): Product[] {
  const set = productSets[setId];
  if (!set) return [];
  return set.items
    .map((id) => products[id])
    .filter((product): product is Product => Boolean(product) && product.status === "active");
}

export function recommend(
  teaKey: TeaKey,
  answers: Answer[],
  kids: KidsChoiceId | null = null,
  mode: RecommendationMode = "table",
): Recommendation {
  const signals = deriveSignals(answers, kids);
  let setId = chooseSetId(teaKey, signals, mode);
  let items = activeItems(setId);

  if (items.length === 0 && setId !== signatureByType[teaKey]) {
    setId = signatureByType[teaKey];
    items = activeItems(setId);
  }

  return {
    setId,
    items,
    totalPrice: items.reduce((sum, product) => sum + (product.price ?? 0), 0),
    hasUnpricedItem: items.some((product) => product.price === null),
    reason: productSets[setId]?.reason ?? "",
    heroImage: items[0]?.image ?? teaImage[teaKey],
  };
}

/** AI に渡す用の、商品名だけの配列。 */
export function recommendationProductNames(recommendation: Recommendation): string[] {
  return recommendation.items.map((product) => product.name);
}
