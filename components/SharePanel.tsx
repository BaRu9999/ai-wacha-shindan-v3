"use client";

import { useMemo, useState } from "react";
import type { TeaKey } from "@/types";
import { buildShareText, buildShareUrl, lineShareHref, shareOrCopy } from "@/lib/share";
import { track } from "@/lib/analytics";
import styles from "./SharePanel.module.css";

type Props = {
  main: TeaKey;
  hidden: TeaKey;
  hasInviter: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  shared: "共有画面を開きました。",
  copied: "リンクをコピーしました。",
  failed: "共有できませんでした。もう一度お試しください。",
  cancelled: "",
};

export function SharePanel({ main, hidden, hasInviter }: Props) {
  const [status, setStatus] = useState("");
  const url = useMemo(() => buildShareUrl(main, hidden), [main, hidden]);
  const text = useMemo(() => buildShareText(main), [main]);

  const handleOther = async () => {
    const outcome = await shareOrCopy(text, url);
    setStatus(STATUS_LABEL[outcome] ?? "");
    track("share_other", { teaType: main, meta: { outcome } });
  };

  const handleLine = () => {
    track("line_share", { teaType: main });
  };

  return (
    <section className={styles.panel} aria-label="結果を友達に送る">
      <h3 className={styles.title}>友達に送ってみる</h3>
      <p className={styles.copy}>
        {hasInviter
          ? "あなたも結果を送ると、また誰かとの相性がわかります。"
          : "結果を送ると、お友達が診断したあとに二人の和茶相性がわかります。"}
      </p>
      <div className={styles.buttons}>
        <a
          className={styles.line}
          href={lineShareHref(text, url)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLine}
        >
          LINEで送る
        </a>
        <button type="button" className={styles.other} onClick={handleOther}>
          その他の方法で共有
        </button>
      </div>
      {status && (
        <p className={styles.status} aria-live="polite">
          {status}
        </p>
      )}
    </section>
  );
}
