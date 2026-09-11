import type { TeaKey } from "@/types";

/**
 * OpenAI が使えない / 失敗したときに使う、タイプ別の結果文の素材。
 * ここは静的。回答内容を織り込んだ最終文の組み立ては lib/fallback.ts が行う。
 *
 * トーン: 上品・自然・少し温かい・断定しない。
 * 家庭環境／結婚／育児／疲労／健康状態を推測しないこと。
 */
export type FallbackSeed = {
  /** 短い性格要約（first view 用・2文程度）。 */
  summary: string;
  /** 隠れタイプの説明。`${hidden}` は隠れタイプ名に置換される。 */
  hiddenInsight: string;
  /** 和ことば（四字熟語など）。 */
  word: string;
  /** 和ことばの意味。 */
  wordMeaning: string;
};

export const fallbackSeeds: Record<TeaKey, FallbackSeed> = {
  matcha: {
    summary:
      "物事をよく見て、自分のリズムを保てる人です。派手さはなくても、いるだけで場が少し整います。",
    hiddenInsight:
      "隠れているのは「${hidden}」の一面。気持ちに余裕があるときや、親しい人の前でふと表れます。",
    word: "一期一会",
    wordMeaning: "この時間は、今日だけのもの。目の前の一杯を、ゆっくり味わってみてください。",
  },
  hojicha: {
    summary:
      "気取らず、まわりの緊張をほどくのが上手な人です。話しやすい空気を自然につくれます。",
    hiddenInsight:
      "隠れているのは「${hidden}」の一面。安心できる相手の前で、ふっと顔を出します。",
    word: "和顔愛語",
    wordMeaning: "やわらかい表情とやさしい言葉は、まわりの心まであたためます。",
  },
  wakoucha: {
    summary:
      "空気を読みながら、相手を心地よくできる人です。やわらかさの奥に、譲れない感覚を持っています。",
    hiddenInsight:
      "隠れているのは「${hidden}」の一面。ここぞという場面で、静かに芯が通ります。",
    word: "花鳥風月",
    wordMeaning: "身近な美しさに気づく心が、今日を少しだけ華やかにします。",
  },
  kuwacha: {
    summary:
      "無理なく続けられる心地よさを知っている人です。小さな変化にも気づき、全体を整えられます。",
    hiddenInsight:
      "隠れているのは「${hidden}」の一面。気になったものへ、思いのほか軽やかに手を伸ばします。",
    word: "日々是好日",
    wordMeaning: "どんな一日にも、その日だけのよさがあります。",
  },
  biwa: {
    summary:
      "肩の力が抜けていて、相手の話をそのまま受けとめられる人です。穏やかでいて、進むときは進めます。",
    hiddenInsight:
      "隠れているのは「${hidden}」の一面。迷いが続いたとき、すっと線を引けます。",
    word: "明鏡止水",
    wordMeaning: "静かな心で向き合うと、本当に大切なものが見えてきます。",
  },
  rooibos: {
    summary:
      "細かいことにとらわれず、その場を明るくできる人です。自分もまわりも楽しめる選び方が得意です。",
    hiddenInsight:
      "隠れているのは「${hidden}」の一面。大切なものの前では、静かに粘り強くなります。",
    word: "笑門来福",
    wordMeaning: "笑顔のある場所には、自然といいことが集まってきます。",
  },
};
