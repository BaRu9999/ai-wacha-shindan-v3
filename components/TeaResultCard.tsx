"use client";

import { useState } from "react";
import type { TeaKey } from "@/types";
import { teaTypes } from "@/data/tea-types";
import { store } from "@/data/store";
import { track } from "@/lib/analytics";
import styles from "./TeaResultCard.module.css";

type Props = {
  main: TeaKey;
  hidden: TeaKey;
  word: string;
  productTitle: string;
};

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

/** JST の「今日」を 2026.09.15 の形式で返す（仕様13。個人情報ではないため保存可）。 */
function formatCardDate(date: Date): string {
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return iso.replaceAll("-", ".");
}

/** 見出し語をひと文字ずつ空けて、記念プレートのような字間を作る（canvasに letter-spacing は無いため）。 */
function spacedCaps(text: string): string {
  return text.split("").join(" ");
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const chars = Array.from(text);
  const lines: string[] = [];
  let current = "";
  for (const char of chars) {
    const next = current + char;
    if (ctx.measureText(next).width > maxWidth && current.length > 0) {
      lines.push(current);
      current = char;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * 結果カード（仕様12・13）。
 * 「診断結果のスクリーンショット」ではなく「祇園茶寮で体験した記念カード」に寄せる。
 * 隠れタイプや詳しい分析は載せず、タイプ名・キャッチコピー・和ことば・店名・日付に絞る。
 * 商品名は小さく添えるだけ。1080×1350はそのまま維持。
 */
async function drawCard(props: Props): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const main = teaTypes[props.main];
  const cx = CARD_WIDTH / 2;

  // 背景（和紙のグラデーション）
  const bg = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  bg.addColorStop(0, "#f8f3e8");
  bg.addColorStop(1, "#e9e2d0");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // 外枠（一枚のカードらしい余白と縁）
  ctx.strokeStyle = "rgba(60,54,44,0.16)";
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, CARD_WIDTH - 96, CARD_HEIGHT - 96);

  ctx.textAlign = "center";

  // TODAY'S TEA MOMENT
  ctx.fillStyle = "#a07d46";
  ctx.font = "600 22px serif";
  ctx.fillText(spacedCaps("TODAY'S TEA MOMENT"), cx, 220);

  // タイプ名
  ctx.fillStyle = "#2c2a26";
  ctx.font = "700 118px serif";
  ctx.fillText(main.name, cx, 400);

  // キャッチコピー
  ctx.font = "500 38px serif";
  ctx.fillStyle = "#57524a";
  ctx.fillText(`「${main.catchphrase}」`, cx, 470);

  // 区切り線
  ctx.strokeStyle = "rgba(60,54,44,0.2)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(280, 560);
  ctx.lineTo(CARD_WIDTH - 280, 560);
  ctx.stroke();

  // 和ことば
  ctx.font = "28px serif";
  ctx.fillStyle = "#7c5a3c";
  ctx.fillText("今日の和ことば", cx, 660);
  ctx.font = "700 92px serif";
  ctx.fillStyle = "#38503b";
  ctx.fillText(props.word, cx, 790);

  // 商品名（小さく添える程度）
  ctx.font = "26px serif";
  ctx.fillStyle = "#8a8578";
  const productLines = wrapLines(ctx, `今日のおすすめ｜${props.productTitle}`, 780);
  productLines.slice(0, 2).forEach((line, index) => {
    ctx.fillText(line, cx, 880 + index * 38);
  });

  // 区切り線
  ctx.beginPath();
  ctx.moveTo(280, CARD_HEIGHT - 220);
  ctx.lineTo(CARD_WIDTH - 280, CARD_HEIGHT - 220);
  ctx.strokeStyle = "rgba(60,54,44,0.16)";
  ctx.stroke();

  // ブランド・日付
  ctx.font = "600 32px serif";
  ctx.fillStyle = "#47624a";
  ctx.fillText(store.brandLine, cx, CARD_HEIGHT - 160);
  ctx.font = "26px serif";
  ctx.fillStyle = "#7c5a3c";
  ctx.fillText(store.branchName, cx, CARD_HEIGHT - 118);
  ctx.font = "24px serif";
  ctx.fillStyle = "#9a9284";
  ctx.fillText(formatCardDate(new Date()), cx, CARD_HEIGHT - 72);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export function TeaResultCard(props: Props) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const handleSave = async () => {
    setBusy(true);
    setStatus("");
    try {
      const blob = await drawCard(props);
      if (!blob) {
        setStatus("画像を作成できませんでした。");
        return;
      }
      const file = new File([blob], "今日の和茶タイプ診断.png", { type: "image/png" });

      if (
        typeof navigator !== "undefined" &&
        navigator.share &&
        navigator.canShare?.({ files: [file] })
      ) {
        try {
          await navigator.share({ title: "今日の和茶タイプ診断", files: [file] });
          track("result_save", { teaType: props.main, meta: { method: "share" } });
          return;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return;
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "今日の和茶タイプ診断.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setStatus("画像を保存しました。");
      track("result_save", { teaType: props.main, meta: { method: "download" } });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.button} onClick={handleSave} disabled={busy}>
        {busy ? "作成しています…" : "結果カードを保存・共有する"}
      </button>
      {status && (
        <p className={styles.status} aria-live="polite">
          {status}
        </p>
      )}
    </div>
  );
}
