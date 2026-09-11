import type { Answer, KidsChoiceId } from "@/types";
import { isCompleteAnswerSet } from "./diagnosis";
import { isKidsChoiceId } from "@/data/kids-question";

/**
 * /api/diagnose のリクエストボディ検証。
 *
 * 設計:
 *  - サーバは answers（＋任意の kidsChoiceId）だけを信頼する。
 *  - main / hidden / おすすめ商品はサーバ側で answers から再計算する
 *    （タイプ判定を AI にもクライアント入力にも依存させない）。
 */
export type DiagnoseRequest = {
  answers: Answer[];
  kidsChoiceId: KidsChoiceId | null;
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

  return { ok: true, data: { answers: record.answers, kidsChoiceId } };
}
