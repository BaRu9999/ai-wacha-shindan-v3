import { parseDiagnoseRequest } from "@/lib/diagnose-request";
import { generateDiagnosisText } from "@/lib/ai";

/**
 * 結果文生成 API。
 * - タイプ判定は行わない（サーバ側で answers から再計算し、文章の肉付けだけ返す）。
 * - OpenAI 失敗時も 200 でフォールバック文を返す（UI を止めない）。
 * - 簡易レート制限（プロセス内メモリ・ベストエフォート）。
 */

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 10 * 60 * 1_000;
const hits = new Map<string, number[]>();

function isRateLimited(request: Request): boolean {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

export async function POST(request: Request): Promise<Response> {
  if (isRateLimited(request)) {
    return Response.json(
      { error: "しばらく時間をおいてから、もう一度お試しください。" },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "入力内容を確認できません。" }, { status: 400 });
  }

  const parsed = parseDiagnoseRequest(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  const output = await generateDiagnosisText(parsed.data);
  return Response.json({
    result: output.result,
    source: output.source,
    main: output.main,
    hidden: output.hidden,
  });
}
