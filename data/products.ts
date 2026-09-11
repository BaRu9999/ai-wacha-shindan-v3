import type { TeaKey } from "@/types";

/**
 * 商品マスタ。名前・価格・画像・カテゴリ・販売状態をここだけで変更できる。
 *
 * ■ price は「整数円（税込）」。
 *   現行版はセット価格しか持っていなかったため、単品価格は暫定値。
 *   実際のメニュー価格に置き換えてから本番公開すること（README「商品変更方法」参照）。
 * ■ status: "active" のものだけ提案・表示される。停止中は "inactive" にする。
 * ■ image はタイプ共通のイメージ写真（public/menu/*.jpg）。商品ごとの写真があれば差し替え可。
 */

export type ProductCategory = "drink" | "sweet" | "plate";
export type ProductStatus = "active" | "inactive";

export type Product = {
  id: string;
  name: string;
  /** 税込・整数円。暫定値は末尾コメント参照。 */
  price: number;
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
  // --- 抹茶 ---
  "matcha-latte": {
    id: "matcha-latte",
    name: "抹茶ラテ",
    price: 660, // 暫定
    category: "drink",
    image: IMG.matcha,
    reason: "濃い抹茶の香りとやさしい甘さで、気持ちをゆっくり整えられます。",
    status: "active",
  },
  "uji-matcha-parfait": {
    id: "uji-matcha-parfait",
    name: "宇治抹茶パフェ",
    price: 990, // 暫定
    category: "sweet",
    image: IMG.matcha,
    reason: "深い抹茶の余韻を、ひと口ずつ味わえる一品です。",
    status: "active",
  },
  "matcha-tiramisu": {
    id: "matcha-tiramisu",
    name: "抹茶ティラミス",
    price: 640, // 暫定
    category: "sweet",
    image: IMG.rooibos,
    reason: "ほろ苦さとコクのある甘さで、満足感をゆっくり楽しめます。",
    status: "active",
  },

  // --- ほうじ茶 ---
  "hojicha-caramel-milk-tea": {
    id: "hojicha-caramel-milk-tea",
    name: "ほうじ茶キャラメルミルクティー",
    price: 680, // 暫定
    category: "drink",
    image: IMG.hojicha,
    reason: "香ばしさとキャラメルのまろやかさで、肩の力がふっと抜けます。",
    status: "active",
  },
  "hojicha-kuromame-parfait": {
    id: "hojicha-kuromame-parfait",
    name: "ほうじ茶アイスと黒豆きな粉アイスパフェ",
    price: 990, // 暫定
    category: "sweet",
    image: IMG.hojicha,
    reason: "香ばしいアイスときな粉の甘さが重なる、ごほうび感のあるパフェです。",
    status: "active",
  },
  "hojicha-latte": {
    id: "hojicha-latte",
    name: "ほうじ茶ラテ",
    price: 620, // 暫定
    category: "drink",
    image: IMG.hojicha,
    reason: "やさしい焙煎の香りで、ほっとひと息つける定番の一杯です。",
    status: "active",
  },

  // --- 和紅茶 ---
  wakoucha: {
    id: "wakoucha",
    name: "和紅茶",
    price: 590, // 暫定
    category: "drink",
    image: IMG.wakoucha,
    reason: "渋みのやわらかい国産紅茶。上品な香りで気持ちに余白ができます。",
    status: "active",
  },
  "nishoku-warabimochi": {
    id: "nishoku-warabimochi",
    name: "二色わらび餅",
    price: 650, // 暫定
    category: "sweet",
    image: IMG.wakoucha,
    reason: "きな粉と抹茶、二つの味を軽やかに楽しめる和スイーツです。",
    status: "active",
  },

  // --- 桑茶 ---
  "relax-herb-tea": {
    id: "relax-herb-tea",
    name: "リラックスハーブティー",
    price: 680, // 暫定
    category: "drink",
    image: IMG.kuwacha,
    reason: "ノンカフェインで香りおだやか。整えたい日に選びやすい一杯です。",
    status: "active",
  },
  "tanita-plate-sawara": {
    id: "tanita-plate-sawara",
    name: "タニタコラボプレート 鰆の西京焼き",
    price: 1738, // 暫定
    category: "plate",
    image: IMG.kuwacha,
    reason: "栄養バランスを整えた献立。満足感もきちんとある食事メニューです。",
    status: "active",
  },

  // --- 枇杷の葉茶 ---
  "refresh-herb-tea": {
    id: "refresh-herb-tea",
    name: "リフレッシュハーブティー",
    price: 680, // 暫定
    category: "drink",
    image: IMG.biwa,
    reason: "すっきりした後味で、気分を軽く切り替えたい日に合います。",
    status: "active",
  },
  "mizu-warabimochi": {
    id: "mizu-warabimochi",
    name: "水わらび餅",
    price: 600, // 暫定
    category: "sweet",
    image: IMG.biwa,
    reason: "みずみずしく涼やかな口あたり。重すぎない甘さです。",
    status: "active",
  },

  // --- ルイボスティー ---
  "beauty-herb-tea": {
    id: "beauty-herb-tea",
    name: "ビューティーハーブティー",
    price: 680, // 暫定
    category: "drink",
    image: IMG.rooibos,
    reason: "ノンカフェインでやさしい味わい。ゆっくり過ごす時間に向きます。",
    status: "active",
  },
};

/**
 * おすすめの「組み合わせ」。id で参照する。
 * items は products のキー配列（通常はドリンク＋甘味の2点、桑茶のみプレートあり）。
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
    items: ["hojicha-latte", "nishoku-warabimochi"],
    reason: "香りのよいラテに、軽やかなわらび餅を。ほっと一息つきたい日に。",
  },
  "hojicha-drink": {
    id: "hojicha-drink",
    items: ["hojicha-caramel-milk-tea", "mizu-warabimochi"],
    reason: "香ばしい一杯を中心に、後味すっきりの甘味を添えて。",
  },

  // 和紅茶
  "wakoucha-signature": {
    id: "wakoucha-signature",
    items: ["wakoucha", "nishoku-warabimochi"],
    reason: "上品な香りとやさしい甘さで、気持ちに余白をつくる組み合わせ。",
  },
  "wakoucha-sweet": {
    id: "wakoucha-sweet",
    items: ["wakoucha", "matcha-tiramisu"],
    reason: "香り高い紅茶に、コクのある甘さを合わせた華やかな組み合わせ。",
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

  // 枇杷の葉茶
  "biwa-signature": {
    id: "biwa-signature",
    items: ["refresh-herb-tea", "mizu-warabimochi"],
    reason: "すっきりした後味と涼やかな甘味で、気分を軽くする組み合わせ。",
  },
  "biwa-drink": {
    id: "biwa-drink",
    items: ["refresh-herb-tea", "nishoku-warabimochi"],
    reason: "軽やかな一杯に、ほどよい甘味を添えて。身軽に過ごしたい日に。",
  },

  // ルイボスティー
  "rooibos-signature": {
    id: "rooibos-signature",
    items: ["beauty-herb-tea", "matcha-tiramisu"],
    reason: "やさしい味わいのお茶と、コクのある甘さで満足感をゆっくり味わう組み合わせ。",
  },
  "rooibos-sweet": {
    id: "rooibos-sweet",
    items: ["beauty-herb-tea", "hojicha-kuromame-parfait"],
    reason: "ノンカフェインの一杯に、食べごたえのあるパフェを合わせたごほうびの組み合わせ。",
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
