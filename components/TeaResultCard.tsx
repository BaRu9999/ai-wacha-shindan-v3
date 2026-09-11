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
  wordMeaning: string;
  productTitle: string;
};

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

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

async function drawCard(props: Props): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const main = teaTypes[props.main];
  const hidden = teaTypes[props.hidden];
  const cx = CARD_WIDTH / 2;

  // 背景（和紙のグラデーション）
  const bg = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  bg.addColorStop(0, "#f8f3e8");
  bg.addColorStop(1, "#e9e2d0");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  ctx.textAlign = "center";

  // ブランド
  ctx.fillStyle = "#47624a";
  ctx.font = "600 30px serif";
  ctx.fillText(store.brandLine, cx, 118);
  ctx.font = "26px serif";
  ctx.fillStyle = "#7c5a3c";
  ctx.fillText(store.branchName, cx, 160);

  // タイプ名
  ctx.fillStyle = "#2c2a26";
  ctx.font = "700 46px serif";
  ctx.fillText("今日の和茶タイプ", cx, 300);
  ctx.font = "700 100px serif";
  ctx.fillStyle = "#38503b";
  ctx.fillText(main.name, cx, 430);
  ctx.font = "500 40px serif";
  ctx.fillStyle = "#57524a";
  ctx.fillText(main.catchphrase, cx, 495);

  // 区切り線
  ctx.strokeStyle = "rgba(60,54,44,0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(160, 560);
  ctx.lineTo(CARD_WIDTH - 160, 560);
  ctx.stroke();

  // 和ことば
  ctx.font = "30px serif";
  ctx.fillStyle = "#7c5a3c";
  ctx.fillText("今日の和ことば", cx, 650);
  ctx.font = "700 78px serif";
  ctx.fillStyle = "#38503b";
  ctx.fillText(props.word, cx, 760);
  ctx.font = "28px serif";
  ctx.fillStyle = "#57524a";
  const meaningLines = wrapLines(ctx, props.wordMeaning, 760);
  meaningLines.slice(0, 2).forEach((line, index) => {
    ctx.fillText(line, cx, 810 + index * 42);
  });

  // おすすめ
  const recoY = 950;
  ctx.font = "28px serif";
  ctx.fillStyle = "#a07d46";
  ctx.fillText("今日のおすすめ", cx, recoY);
  ctx.font = "700 40px serif";
  ctx.fillStyle = "#2c2a26";
  const productLines = wrapLines(ctx, props.productTitle, 820);
  productLines.slice(0, 2).forEach((line, index) => {
    ctx.fillText(line, cx, recoY + 60 + index * 52);
  });

  // 隠れタイプ
  ctx.font = "26px serif";
  ctx.fillStyle = "#867f73";
  ctx.fillText(`隠れタイプ：${hidden.name}`, cx, CARD_HEIGHT - 190);

  // フッター
  ctx.font = "24px serif";
  ctx.fillStyle = "#867f73";
  ctx.fillText("今日の気分で、結果は少しずつ変わります。", cx, CARD_HEIGHT - 110);
  ctx.fillText("また別の日にも試してみてください。", cx, CARD_HEIGHT - 70);

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
