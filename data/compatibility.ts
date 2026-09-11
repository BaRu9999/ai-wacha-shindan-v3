import type { TeaKey } from "@/types";
import { TEA_KEYS } from "@/types";
import { teaTypes } from "./tea-types";

/**
 * 友達との相性診断用のデータ。
 * - 結果画面のメイン導線には置かず「もっと楽しむ」から開く（仕様17）。
 * - 共有 URL には個人情報を含めない（?from=<teaKey> のみ）。
 * - ペアのスコアは対称（A×B = B×A）。ここでは上三角だけ定義し、参照時に正規化する。
 */

export type CompatibilityResult = {
  score: number;
  title: string;
  description: string;
  advice: string;
};

const pairScore: Record<string, number> = {
  "matcha:matcha": 84,
  "matcha:hojicha": 90,
  "matcha:wakoucha": 82,
  "matcha:kuwacha": 93,
  "matcha:biwa": 88,
  "matcha:rooibos": 79,
  "hojicha:hojicha": 88,
  "hojicha:wakoucha": 92,
  "hojicha:kuwacha": 83,
  "hojicha:biwa": 90,
  "hojicha:rooibos": 94,
  "wakoucha:wakoucha": 86,
  "wakoucha:kuwacha": 80,
  "wakoucha:biwa": 91,
  "wakoucha:rooibos": 90,
  "kuwacha:kuwacha": 85,
  "kuwacha:biwa": 92,
  "kuwacha:rooibos": 81,
  "biwa:biwa": 86,
  "biwa:rooibos": 89,
  "rooibos:rooibos": 87,
};

function normalizedKey(a: TeaKey, b: TeaKey): string {
  const ia = TEA_KEYS.indexOf(a);
  const ib = TEA_KEYS.indexOf(b);
  return ia <= ib ? `${a}:${b}` : `${b}:${a}`;
}

export function getCompatibility(a: TeaKey, b: TeaKey): CompatibilityResult {
  const score = pairScore[normalizedKey(a, b)] ?? 85;
  const first = teaTypes[a];
  const second = teaTypes[b];

  if (a === b) {
    return {
      score,
      title: "似たテンポで、そのままでいられる関係",
      description: `${first.name}タイプ同士。大切にしている感覚が近いので、多くを言わなくても伝わります。`,
      advice: "似ているぶん遠慮も重なりがち。どちらかが先に本音を出すと、ぐっと近づきます。",
    };
  }
  if (score >= 92) {
    return {
      score,
      title: "ひと口目から、ほどける名コンビ",
      description: `${first.name}タイプの「${first.core}」と、${second.name}タイプの「${second.core}」が、きれいに補い合います。`,
      advice: "得意なところを自然に任せ合うと、ふたりらしい心地よさが育ちます。",
    };
  }
  if (score >= 86) {
    return {
      score,
      title: "違いがちょうどいい、味わい深い関係",
      description: `${first.name}タイプと${second.name}タイプ。見ているところは少し違っても、安心して一緒にいられます。`,
      advice: "相手のやり方を直そうとせず「そういう見方もあるね」と楽しむのがコツ。",
    };
  }
  return {
    score,
    title: "ゆっくり淹れるほど、深まる関係",
    description: `${first.name}タイプと${second.name}タイプ。最初はテンポに差があっても、知るほど新しい魅力に気づけます。`,
    advice: "結論を急がず、相手が大事にしていることをひとつ聞いてみると距離が縮まります。",
  };
}
