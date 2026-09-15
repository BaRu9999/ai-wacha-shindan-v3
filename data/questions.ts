import type { Choice, Question, TeaKey } from "@/types";

/**
 * 診断の設問（6問 × 4択）。
 *
 * ■ 配点設計（現行版の偏り＝ルイボスが出にくい問題への対策）
 *  - main = +2点 / sub = +1点
 *  - 6問 × 4択 = 24 の main 枠を、6タイプ × 4回 で完全に均等化
 *  - sub 枠 24 も、6タイプ × 4回 で完全に均等化
 *  - → どのタイプも「取り得る最大点」が等しい（main 4回 ×2 ＋ sub 4回 ×1 = 12点）
 *  - 均等化の検証は test/distribution.test.ts（全 4^6 = 4096 パターン総当たり）で担保する。
 *
 * ■ 4要素（性格 / 今日の気分 / 味覚 / 過ごし方）が自然に混ざるよう theme を割り当て。
 * ■ Q1 のみ「行動シナリオ型」（予定が空いたらどうする、という具体的な分岐）。
 *   main/sub は変更していないため、配点分布・タイブレークへの影響はない。
 * ■ 「疲れている」「家事」「育児」などを前提にした設問は入れない（家庭環境を決めつけない）。
 * ■ 全問タップ式・自由入力なし。1問3〜5秒で選べる長さに調整。
 */

// 均等配分の設計メモ（main の登場質問）:
//   matcha : Q1 Q3 Q4 Q5
//   hojicha: Q1 Q2 Q4 Q6
//   wakoucha:Q1 Q2 Q4 Q5
//   kuwacha: Q2 Q3 Q5 Q6
//   biwa   : Q1 Q2 Q3 Q6
//   rooibos: Q3 Q4 Q5 Q6

const q = (
  id: string,
  label: string,
  main: TeaKey,
  sub: TeaKey,
  hint?: string,
): Choice => ({ id, label, main, sub, hint });

export const questions: Question[] = [
  {
    id: "q1",
    theme: "mood",
    // 仕様8: 6問中1問だけ「行動シナリオ型」に変更。main/sub の配点は変更しない
    // （均等配分を保つため、文言だけを具体的な行動の分岐に書き換えている）。
    title: "予定が急に空いたら、あなたならどうする？",
    choices: [
      q("q1a", "家で静かに、好きなことをして過ごす", "matcha", "biwa"),
      q("q1b", "気の合う誰かを誘って、ゆっくり話す", "hojicha", "wakoucha"),
      q("q1c", "気になっていた場所へ、ふらっと出かける", "wakoucha", "rooibos"),
      q("q1d", "そのときの気分で、決める", "biwa", "kuwacha"),
    ],
  },
  {
    id: "q2",
    theme: "personality",
    title: "友達と一緒のとき、自然としている立ち位置は？",
    choices: [
      q("q2a", "うなずきながら、じっくり話を聞いている", "biwa", "hojicha"),
      q("q2b", "その場の空気を、やわらかくしている", "hojicha", "rooibos"),
      q("q2c", "話を広げて、場を明るくしている", "wakoucha", "matcha"),
      q("q2d", "まわりを見て、さりげなく整えている", "kuwacha", "biwa"),
    ],
  },
  {
    id: "q3",
    theme: "personality",
    title: "最近の自分に、いちばんしっくりくるのは？",
    choices: [
      q("q3a", "ひとつのことに、じっくり向き合っている", "matcha", "kuwacha"),
      q("q3b", "身のまわりを、少し整えたい気分", "kuwacha", "biwa"),
      q("q3c", "新しい楽しみを、さがしている", "rooibos", "wakoucha"),
      q("q3d", "力を抜いて、流れに身をまかせている", "biwa", "matcha"),
    ],
  },
  {
    id: "q4",
    theme: "taste",
    title: "甘いものを選ぶとき、どんな味に心が動く？",
    choices: [
      q("q4a", "濃くて深い、余韻の残る味", "matcha", "hojicha"),
      q("q4b", "香ばしくて、ほっとする味", "hojicha", "rooibos"),
      q("q4c", "香り高くて、上品な味", "wakoucha", "matcha"),
      q("q4d", "まるみのある、やさしい甘さ", "rooibos", "kuwacha"),
    ],
  },
  {
    id: "q5",
    theme: "spend",
    title: "今日の自分に、小さなごほうびをひとつ選ぶなら？",
    choices: [
      q("q5a", "ていねいに淹れた一杯で、気持ちを整える", "matcha", "hojicha"),
      q("q5b", "からだにやさしいものを、ゆっくりいただく", "kuwacha", "biwa"),
      q("q5c", "見た目も華やかなものを、選んでみる", "wakoucha", "rooibos"),
      q("q5d", "好きな甘いものを、遠慮なく楽しむ", "rooibos", "wakoucha"),
    ],
  },
  {
    id: "q6",
    theme: "mood",
    title: "お店を出るとき、どんな気持ちになっていたい？",
    choices: [
      q("q6a", "あたたかい気持ちで、人とゆるくつながっていたい", "hojicha", "wakoucha"),
      q("q6b", "頭がすっきり整って、明日を迎えたい", "kuwacha", "matcha"),
      q("q6c", "軽やかで、身軽な気持ちになりたい", "biwa", "kuwacha"),
      q("q6d", "満たされて、ほっこりした気持ちで終わりたい", "rooibos", "hojicha"),
    ],
  },
];

/** 質問途中に挟む短いリアクション（key = 直前に回答した質問の 0-indexed）。 */
export const interludes: Record<number, string> = {
  1: "少しずつ、あなたの色が見えてきました。",
  3: "おだやかさの奥に、意外な芯がありそうです。",
};

/** 質問 ID → Question の索引。 */
export const questionById: Record<string, Question> = Object.fromEntries(
  questions.map((question) => [question.id, question]),
);

/** choiceId → Choice の索引（推薦ロジック等で使用）。 */
export const choiceById: Record<string, Choice> = Object.fromEntries(
  questions.flatMap((question) => question.choices.map((choice) => [choice.id, choice])),
);
