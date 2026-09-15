"use client";

import { kidsQuestion } from "@/data/kids-question";
import styles from "./KidsGateScreen.module.css";

type Props = {
  onAccept: () => void;
  onDecline: () => void;
};

/**
 * 6問診断のあと、結果を作る前に必ず一度だけ聞く確認（仕様1）。
 * 「いいえ」ならそのまま結果へ、「はい」なら子ども向けの最後の一問へ進む。
 */
export function KidsGateScreen({ onAccept, onDecline }: Props) {
  return (
    <div className={styles.screen} data-testid="kids-gate-screen">
      <p className={styles.title}>{kidsQuestion.gateTitle}</p>
      <div className={styles.row}>
        <button type="button" className={styles.no} onClick={onDecline}>
          いいえ
        </button>
        <button type="button" className={styles.yes} onClick={onAccept}>
          はい
        </button>
      </div>
    </div>
  );
}
