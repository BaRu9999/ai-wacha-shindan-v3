import type { TeaKey } from "@/types";
import { isTeaKey, teaTypes } from "@/data/tea-types";
import { store } from "@/data/store";

/**
 * 共有まわりのユーティリティ。
 * - 共有 URL には個人情報を含めない（?from=<タイプ> と ?h=<隠れタイプ> のみ）。
 * - LINE 共有 / Web Share API / 非対応端末での URL コピー を切り替える。
 */

export function buildShareUrl(main: TeaKey, hidden: TeaKey): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("from", main);
  url.searchParams.set("h", hidden);
  return url.toString();
}

export function buildShareText(main: TeaKey): string {
  return `私は「${teaTypes[main].name}タイプ」でした。\nあなたは何茶タイプ？`;
}

export function parseInviter(search: string): {
  from: TeaKey | null;
  hidden: TeaKey | null;
} {
  const params = new URLSearchParams(search);
  const from = params.get("from");
  const hidden = params.get("h");
  return {
    from: isTeaKey(from) ? from : null,
    hidden: isTeaKey(hidden) ? hidden : null,
  };
}

export function lineShareHref(text: string, url: string): string {
  return `https://line.me/R/msg/text/?${encodeURIComponent(`${text}\n${url}`)}`;
}

export type ShareOutcome = "shared" | "copied" | "failed" | "cancelled";

/** Web Share API があれば使い、無ければクリップボードへコピー。 */
export async function shareOrCopy(text: string, url: string): Promise<ShareOutcome> {
  const payload = `${text}\n${url}`;
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title: `${store.shortLine}｜和茶タイプ診断`, text, url });
      return "shared";
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(payload);
      return "copied";
    }
    return "failed";
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return "cancelled";
    // 共有に失敗したらコピーを試す
    try {
      await navigator.clipboard.writeText(payload);
      return "copied";
    } catch {
      return "failed";
    }
  }
}
