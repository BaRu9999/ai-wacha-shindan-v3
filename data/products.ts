import type { TeaKey } from "@/types";

/**
 * 商品マスタ。名前・価格・画像・カテゴリ・販売状態をここだけで変更できる。
 *
 * ■ price は「整数円（税込）」。店舗で価格表示をしない商品（例: コラボプレート）は
 *   null にする（UI は「価格は店舗にてご確認ください」と表示し、合計金額の計算からも除外する）。
 * ■ status: "active" のものだけ提案・表示される。停止中は "inactive" にする。
 * ■ image はタイプ共通のイメージ写真（public/menu/*.jpg）。商品ごとの写真があれば差し替え可。
 *
 * ■ 出典（2026-09 撮影の実店舗メニュー）:
 *   - 祇園茶寮側（抹茶・ほうじ茶・和紅茶）: 「祇園茶寮オリジナルメニュー」「京都・宇治抹茶」「ドリンク」
 *   - タニタカフェ側（桑茶・枇杷の葉茶・ルイボスティー）: 「タニタカフェ フード・ドリンク」
 *     「タニタカフェオリジナルハーブティー」「タニタカフェオリジナルケーキ」
 *   価格は写真から読み取った税込価格（店舗確認済み）。
 */

export type ProductCategory = "drink" | "sweet" | "plate";
export type ProductStatus = "active" | "inactive";

export type Product = {
  id: string;
  name: string;
  /** 税込・整数円。店舗で価格を表示しない商品は null（例: コラボプレート）。 */
  price: number | null;
  category: ProductCategory;
  image: string;
  /** この商品そのもののおすすめ理由（短文・フォールバック用。AI が上書きすることがある）。 */
  reason: string;
  status: ProductStatus;
};

/** タイプ共通のイメージ写真。商品ごとの写真がないときのフォールバックにも使う。 */
export const teaImage: Record<TeaKey, string> = {
  matcha: "/menu/matcha.jpg",
  hojicha: "/menu/hojicha.jpg",
  wakoucha: "/menu/wakoucha.jpg",
  kuwacha: "/menu/kuwacha.jpg",
  biwa: "/menu/biwa.jpg",
  rooibos: "/menu/rooibos.jpg",
};

const IMG = teaImage;

export const products: Record<string, Product> = {
  // --- 抹茶（祇園茶寮オリジナルメニュー／京都・宇治抹茶） ---
  "matcha-latte": {
    id: "matcha-latte",
    name: "抹茶ラテ",
    price: 605,
    category: "drink",
    image: IMG.matcha,
    reason: "濃い抹茶の香りとやさしい甘さで、気持ちをゆっくり整えられます。",
    status: "active",
  },
  "uji-matcha-parfait": {
    id: "uji-matcha-parfait",
    name: "特選宇治抹茶アイスパフェ",
    price: 924,
    category: "sweet",
    image: IMG.matcha,
    reason: "深い抹茶の余韻を、ひと口ずつ味わえる一品です。",
    status: "active",
  },
  "matcha-tiramisu": {
    id: "matcha-tiramisu",
    name: "抹茶ティラミス",
    price: 748,
    category: "sweet",
    image: IMG.matcha,
    reason: "ほろ苦さとコクのある甘さで、満足感をゆっくり楽しめます。",
    status: "active",
  },
  "nishoku-warabimochi": {
    id: "nishoku-warabimochi",
    name: "きな粉と抹茶の２色わらび餅",
    price: 748,
    category: "sweet",
    image: IMG.matcha,
    reason: "きな粉と抹茶、二つの味を軽やかに楽しめる和スイーツです。",
    status: "active",
  },

  // --- ほうじ茶（祇園茶寮オリジナルメニュー／ドリンク） ---
  "hojicha-caramel-milk-tea": {
    id: "hojicha-caramel-milk-tea",
    name: "ほうじ茶キャラメルミルクティー",
    price: 627,
    category: "drink",
    image: IMG.hojicha,
    reason: "香ばしさとキャラメルのまろやかさで、肩の力がふっと抜けます。",
    status: "active",
  },
  "hojicha-kuromame-parfait": {
    id: "hojicha-kuromame-parfait",
    name: "ほうじ茶アイスと黒豆きな粉アイスパフェ",
    price: 924,
    category: "sweet",
    image: IMG.hojicha,
    reason: "香ばしいアイスときな粉の甘さが重なる、ごほうび感のあるパフェです。",
    status: "active",
  },
  "hojicha-latte": {
    id: "hojicha-latte",
    name: "タピオカ黒蜜ほうじ茶ラテ",
    price: 737,
    category: "drink",
    image: IMG.hojicha,
    reason: "やさしい焙煎の香りに、黒蜜とタピオカのコクを添えた一杯です。",
    status: "active",
  },

  // --- 和紅茶（ドリンク） ---
  wakoucha: {
    id: "wakoucha",
    name: "和紅茶",
    price: 495,
    category: "drink",
    image: IMG.wakoucha,
    reason: "渋みのやわらかい国産紅茶。上品な香りで気持ちに余白ができます。",
    status: "active",
  },

  // --- 共通の和菓子（祇園茶寮オリジナルメニュー・甘味／どのタイプにも合わせやすい） ---
  "mizu-warabimochi": {
    id: "mizu-warabimochi",
    name: "水わらび餅（黒蜜きな粉）",
    price: 627,
    category: "sweet",
    image: IMG.biwa,
    reason: "みずみずしく涼やかな口あたり。重すぎない甘さです。",
    status: "active",
  },

  // --- 桑茶（タニタカフェオリジナルハーブティー／ケーキ／フード） ---
  "relax-herb-tea": {
    id: "relax-herb-tea",
    name: "リラックスハーブティー（オリーブ茶・カモミール）",
    price: 649,
    category: "drink",
    image: IMG.kuwacha,
    reason: "ノンカフェインで香りおだやか。整えたい日に選びやすい一杯です。",
    status: "active",
  },
  "tanita-plate-sawara": {
    id: "tanita-plate-sawara",
    name: "タニタコラボプレート",
    price: null, // 店舗判断で価格非掲載（内容は日替わり等のため店頭でご確認ください）
    category: "plate",
    image: IMG.kuwacha,
    reason: "野菜と栄養バランスを考えた、タニタカフェとのコラボプレートです。",
    status: "active",
  },

  // --- 枇杷の葉茶（タニタカフェオリジナルハーブティー） ---
  "refresh-herb-tea": {
    id: "refresh-herb-tea",
    name: "リフレッシュハーブティー（レモングラス・レモンバーム・びわの葉茶）",
    price: 649,
    category: "drink",
    image: IMG.biwa,
    reason: "すっきりした後味で、気分を軽く切り替えたい日に合います。",
    status: "active",
  },

  // --- ルイボスティー（タニタカフェオリジナルハーブティー） ---
  "beauty-herb-tea": {
    id: "beauty-herb-tea",
    name: "ビューティーハーブティー（ルイボスティー・ハイビスカス・ローズヒップ）",
    price: 649,
    category: "drink",
    image: IMG.rooibos,
    reason: "ノンカフェインでやさしい味わい。ゆっくり過ごす時間に向きます。",
    status: "active",
  },

  // --- タニタカフェオリジナルケーキ（桑茶・枇杷の葉茶・ルイボスの「甘め」提案で使用） ---
  "baked-cheesecake": {
    id: "baked-cheesecake",
    name: "ベイクドチーズケーキ",
    price: 1045,
    category: "sweet",
    image: IMG.kuwacha,
    reason: "小麦粉より糖質を抑えた生地の、なめらかなチーズケーキです。",
    status: "active",
  },
  "gateau-chocolat": {
    id: "gateau-chocolat",
    name: "ガトーショコラ",
    price: 1045,
    category: "sweet",
    image: IMG.rooibos,
    reason: "カカオ本来のコクを生かした、奥深い風味のガトーショコラです。",
    status: "active",
  },
};

/**
 * おすすめの「組み合わせ」。id で参照する。
 * items は products のキー配列（通常はドリンク＋甘味の2点。単品のみの組み合わせもある）。
 */
export type ProductSet = {
  id: string;
  items: string[];
  /** この組み合わせを選んだときの一言（フォールバック用。AI が上書きすることがある）。 */
  reason: string;
};

export const productSets: Record<string, ProductSet> = {
  // 抹茶
  "matcha-signature": {
    id: "matcha-signature",
    items: ["matcha-latte", "uji-matcha-parfait"],
    reason: "濃厚な抹茶づくしで、気持ちをゆっくり整える王道の組み合わせ。",
  },
  "matcha-drink": {
    id: "matcha-drink",
    items: ["matcha-latte", "nishoku-warabimochi"],
    reason: "一杯を主役に、軽い甘味を添えて。落ち着いて過ごしたい日に。",
  },
  "matcha-sweet": {
    id: "matcha-sweet",
    items: ["matcha-latte", "matcha-tiramisu"],
    reason: "ほろ苦さとコクのある甘さで、自分のための時間をしっかり味わう組み合わせ。",
  },

  // ほうじ茶
  "hojicha-signature": {
    id: "hojicha-signature",
    items: ["hojicha-caramel-milk-tea", "hojicha-kuromame-parfait"],
    reason: "香ばしさとまろやかな甘みが重なる、ごほうび感のある組み合わせ。",
  },
  "hojicha-light": {
    id: "hojicha-light",
    items: ["hojicha-latte", "mizu-warabimochi"],
    reason: "黒蜜の香るラテに、軽やかなわらび餅を。ほっと一息つきたい日に。",
  },
  "hojicha-drink": {
    id: "hojicha-drink",
    items: ["hojicha-caramel-milk-tea", "mizu-warabimochi"],
    reason: "香ばしい一杯を中心に、後味すっきりの甘味を添えて。",
  },

  // 和紅茶
  "wakoucha-signature": {
    id: "wakoucha-signature",
    items: ["wakoucha"],
    reason: "渋みのやわらかな一杯だけで、静かに気持ちを整える組み合わせ。",
  },
  "wakoucha-sweet": {
    id: "wakoucha-sweet",
    items: ["wakoucha", "mizu-warabimochi"],
    reason: "香り高い紅茶に、涼やかな甘味を添えた組み合わせ。",
  },

  // 桑茶
  "kuwacha-signature": {
    id: "kuwacha-signature",
    items: ["relax-herb-tea", "mizu-warabimochi"],
    reason: "からだにやさしいハーブティーに、軽い甘味を添えて整える組み合わせ。",
  },
  "kuwacha-plate": {
    id: "kuwacha-plate",
    items: ["relax-herb-tea", "tanita-plate-sawara"],
    reason: "栄養バランスの整った食事とハーブティーで、満足感も大切にしたい日に。",
  },
  "kuwacha-sweet": {
    id: "kuwacha-sweet",
    items: ["relax-herb-tea", "gateau-chocolat"],
    reason: "おだやかな一杯に、コクのあるケーキを合わせたごほうびの組み合わせ。",
  },

  // 枇杷の葉茶
  "biwa-signature": {
    id: "biwa-signature",
    items: ["refresh-herb-tea", "mizu-warabimochi"],
    reason: "すっきりした後味と涼やかな甘味で、気分を軽くする組み合わせ。",
  },
  "biwa-drink": {
    id: "biwa-drink",
    items: ["refresh-herb-tea"],
    reason: "軽やかな一杯だけを主役に。身軽に過ごしたい日に。",
  },

  // ルイボスティー
  "rooibos-signature": {
    id: "rooibos-signature",
    items: ["beauty-herb-tea", "gateau-chocolat"],
    reason: "やさしい味わいのお茶と、コクのあるケーキで満足感をゆっくり味わう組み合わせ。",
  },
  "rooibos-sweet": {
    id: "rooibos-sweet",
    items: ["beauty-herb-tea", "baked-cheesecake"],
    reason: "ノンカフェインの一杯に、食べごたえのあるチーズケーキを合わせたごほうびの組み合わせ。",
  },
  "rooibos-light": {
    id: "rooibos-light",
    items: ["beauty-herb-tea", "mizu-warabimochi"],
    reason: "やさしいお茶に、軽い甘味を添えて。ほどよく楽しみたい日に。",
  },
};

export function getProduct(id: string): Product | undefined {
  return products[id];
}

export function isProductActive(id: string): boolean {
  return products[id]?.status === "active";
}
