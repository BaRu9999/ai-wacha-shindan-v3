/**
 * 匿名イベントログの受け口。
 *
 * - 受け取った最小限のフィールドだけを Supabase の diagnosis_events テーブルに INSERT。
 * - 依存を増やさないため @supabase/supabase-js は使わず PostgREST に直接 POST。
 * - env（SUPABASE URL / KEY）が無ければ何もせず 204（開発をオフラインで回せる）。
 * - IP・UA など識別につながる情報は保存しない。
 * - 失敗は握りつぶす。ログ取得の失敗で利用体験を止めない。
 */

const KNOWN_EVENTS = new Set([
  "diagnosis_start",
  "question_answered",
  "diagnosis_complete",
  "recommendation_view",
  "product_detail_tap",
  "menu_view_tap",
  "staff_show_tap",
  "result_detail_expand",
  "result_save",
  "line_share",
  "share_other",
  "compatibility_start",
  "kids_mode_used",
]);

const INSERT_TIMEOUT_MS = 3_000;

function str(value: unknown, max: number): string | null {
  return typeof value === "string" && value.length > 0 && value.length <= max
    ? value
    : null;
}

function sanitizeMeta(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(
      ([key, val]) =>
        key.length <= 40 &&
        (typeof val === "string" ? val.length <= 200 : true) &&
        ["string", "number", "boolean"].includes(typeof val),
    )
    .slice(0, 12);
  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

export async function POST(request: Request): Promise<Response> {
  const noContent = new Response(null, { status: 204 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noContent;
  }
  if (!body || typeof body !== "object") return noContent;
  const record = body as Record<string, unknown>;

  const event = str(record.event, 40);
  const sessionId = str(record.sessionId, 64);
  if (!event || !sessionId || !KNOWN_EVENTS.has(event)) return noContent;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return noContent;

  const row = {
    session_id: sessionId,
    event,
    tea_type: str(record.teaType, 20),
    product_id: str(record.productId, 60),
    meta: sanitizeMeta(record.meta),
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), INSERT_TIMEOUT_MS);
  try {
    await fetch(`${supabaseUrl}/rest/v1/diagnosis_events`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
      signal: controller.signal,
    });
  } catch {
    /* ベストエフォート */
  } finally {
    clearTimeout(timer);
  }

  return noContent;
}
