/**
 * 匿名イベントログ（クライアント側）。
 *
 * 個人情報は一切扱わない。保存するのは「セッション単位のランダムID」＋イベント名＋
 * タイプ／商品ID／小さな meta のみ（仕様20）。
 * 送信はベストエフォート（sendBeacon or keepalive fetch）で、失敗しても UI に影響させない。
 */

export type AnalyticsEvent =
  | "diagnosis_start"
  | "question_answered"
  | "diagnosis_complete"
  | "recommendation_view"
  | "product_detail_tap"
  | "menu_view_tap"
  | "staff_show_tap"
  | "result_detail_expand"
  | "result_save"
  | "line_share"
  | "share_other"
  | "compatibility_start"
  | "kids_mode_used";

export type AnalyticsPayload = {
  teaType?: string | null;
  productId?: string | null;
  meta?: Record<string, string | number | boolean | null> | null;
};

const SESSION_KEY = "wacha_sid";
let memorySessionId: string | null = null;

function randomId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* noop */
  }
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** セッション単位のランダムID（sessionStorage、無理ならメモリ）。 */
export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = randomId();
    window.sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    if (!memorySessionId) memorySessionId = randomId();
    return memorySessionId;
  }
}

export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (typeof window === "undefined") return;

  const body = JSON.stringify({
    sessionId: getSessionId(),
    event,
    teaType: payload.teaType ?? null,
    productId: payload.productId ?? null,
    meta: payload.meta ?? null,
    ts: new Date().toISOString(),
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      const ok = navigator.sendBeacon("/api/log", blob);
      if (ok) return;
    }
  } catch {
    /* fall through to fetch */
  }

  try {
    void fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      /* ベストエフォート。失敗は無視 */
    });
  } catch {
    /* noop */
  }
}
