import type { Answer, KidsChoiceId } from "@/types";
import { isCompleteAnswerSet } from "./diagnosis";
import { isKidsChoiceId } from "@/data/kids-question";
import { isRecommendationMode, type RecommendationMode } from "./recommendation";

/**
 * /api/diagnose のリクエストボディ検証。
 *
 * 設計:
 *  - サーバは answers（＋任意の kidsChoiceId・mode）だけを信頼する。
 *  - main / hidden / おすすめ商品はサーバ側で answers から再計算する
 *    （タイプ判定を AI にもクライアント入力にも依存させない）。
 *  - mode は画面に表示している商品提案と AI の文章がズレないよう、そのまま受け取って使う
 *    （仕様6）。不正・未指定なら既定の "table" にする。
 */
export type DiagnoseRequest = {
  answers: Answer[];
  kidsChoiceId: KidsChoiceId | null;
  mode: RecommendationMode;
};

export type DiagnoseRequestParse =
  | { ok: true; data: DiagnoseRequest }
  | { ok: false; status: 400; error: string };

export function parseDiagnoseRequest(body: unknown): DiagnoseRequestParse {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, status: 400, error: "入力内容を確認できません。" };
  }
  const record = body as Record<string, unknown>;

  if (!isCompleteAnswerSet(record.answers)) {
    return { ok: false, status: 400, error: "診断データが正しくありません。" };
  }

  const kidsChoiceId = isKidsChoiceId(record.kidsChoiceId)
    ? record.kidsChoiceId
    : null;
  const mode = isRecommendationMode(record.mode) ? record.mode : "table";

  return { ok: true, data: { answers: record.answers, kidsChoiceId, mode } };
}
