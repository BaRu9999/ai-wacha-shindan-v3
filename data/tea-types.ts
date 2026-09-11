import type { TeaKey } from "@/types";

/**
 * 和茶タイプの定義。文章・色・モチーフはここだけ直せば全画面に反映される。
 * - description: 詳細画面で見せる「詳しい性格分析」（静的）
 * - todayHint:   詳細画面の「今日のヒント（注意点）」。説教くさくならないやわらかい一言。
 * - motif:       演出やカードで使う和のモチーフ語
 */
export type TeaType = {
  key: TeaKey;
  /** 表示名（「〜タイプ」は UI 側で付ける）。 */
  name: string;
  /** タイプを表す短い色（見出しのアクセント等）。 */
  color: string;
  /** キャッチコピー（1行）。 */
  catchphrase: string;
  /** メインタイプの核となる資質（体言止め・短く）。 */
  core: string;
  /** 隠れタイプとして表れる資質。 */
  hiddenTrait: string;
  /** 詳しい性格分析（静的・2〜3文）。 */
  description: string;
  /** 今日のヒント（注意点をやわらかく）。 */
  todayHint: string;
  /** 和のモチーフ語（演出・カード用）。 */
  motif: string;
};

export const teaTypes: Record<TeaKey, TeaType> = {
  matcha: {
    key: "matcha",
    name: "抹茶",
    color: "#4b6746",
    catchphrase: "静かな芯を持つ、凛とした人",
    core: "落ち着いた集中力",
    hiddenTrait: "ここぞという時の行動力",
    description:
      "物事をよく見て、自分のリズムを大切にできる人です。声を張らなくても、そこにいるだけで場が少し整います。決めたことを最後まで運ぶ粘りもあります。",
    todayHint:
      "きちんとしようとするほど、肩に力が入りがち。今日はひと呼吸おいて、余白のある時間を選んでみてください。",
    motif: "深緑",
  },
  hojicha: {
    key: "hojicha",
    name: "ほうじ茶",
    color: "#7a5a3a",
    catchphrase: "そばにいるだけで、ほっとさせる人",
    core: "自然体のあたたかさ",
    hiddenTrait: "場をほどくユーモア",
    description:
      "気取らず、相手の緊張をゆるめるのが上手な人です。話しやすい空気をつくるので、まわりから自然と本音が集まってきます。",
    todayHint:
      "人に合わせるのが上手なぶん、自分の「こうしたい」は後回しになりがち。今日は先に、自分の希望をひとつ選んでみて。",
    motif: "焙煎の香り",
  },
  wakoucha: {
    key: "wakoucha",
    name: "和紅茶",
    color: "#9a5240",
    catchphrase: "やわらかく華やぐ、気配りの人",
    core: "しなやかな社交性",
    hiddenTrait: "自分の美意識を貫く強さ",
    description:
      "その場の空気を読みながら、相手を心地よくできる人です。やわらかい印象の奥に、これは譲れないという感覚をきちんと持っています。",
    todayHint:
      "気を配る日ほど、ひとりに戻る時間が効きます。好きな香りや甘いもので、気分をゆるめてあげてください。",
    motif: "花あかり",
  },
  kuwacha: {
    key: "kuwacha",
    name: "桑茶",
    color: "#5f7b46",
    catchphrase: "自分を整える、堅実なバランサー",
    core: "日々を整える丁寧さ",
    hiddenTrait: "新しいものを試す好奇心",
    description:
      "無理なく続けられる心地よさを知っている人です。小さな変化にもよく気づき、全体のバランスを取るのが得意です。",
    todayHint:
      "きちんとを目指すほど、予定外のことが重く感じられることも。今日は完璧より、心地よさのほうを選んで。",
    motif: "青葉",
  },
  biwa: {
    key: "biwa",
    name: "枇杷の葉茶",
    color: "#5b7a5e",
    catchphrase: "風通しのよい、自然体の聞き上手",
    core: "力を抜いて受けとめる余裕",
    hiddenTrait: "迷いを断ち切る決断力",
    description:
      "肩の力が抜けていて、相手の話をそのまま受けとめられる人です。穏やかですが、必要なときにはすっと前に進めます。",
    todayHint:
      "合わせるのが得意なぶん、自分の希望は最後になりがち。今日は「私はどうしたい？」を先に聞いてあげて。",
    motif: "水面",
  },
  rooibos: {
    key: "rooibos",
    name: "ルイボスティー",
    color: "#a2603f",
    catchphrase: "おおらかで、満足上手な人",
    core: "気持ちをゆるめるおおらかさ",
    hiddenTrait: "大切なものを守る粘り強さ",
    description:
      "細かいことにとらわれず、その場を明るくできる人です。自分もまわりも楽しめる選び方を、自然と見つけられます。",
    todayHint:
      "元気に見られるぶん、ひとりで抱えることも。今日は好きな甘いものと一杯で、自分もきちんと満たして。",
    motif: "陽だまり",
  },
};

export const teaTypeList: TeaType[] = [
  teaTypes.matcha,
  teaTypes.hojicha,
  teaTypes.wakoucha,
  teaTypes.kuwacha,
  teaTypes.biwa,
  teaTypes.rooibos,
];

export function isTeaKey(value: unknown): value is TeaKey {
  return typeof value === "string" && value in teaTypes;
}
