"use client";

import { TeaCupIcon } from "./icons";
import styles from "./InterludeScreen.module.css";

type Props = {
  message: string | null;
  onSkip: () => void;
};

/**
 * 質問の合間に挟む短いリアクション。
 * 自動で次へ進むが、タップでも進める（待たされている感を作らない）。
 */
export function InterludeScreen({ message, onSkip }: Props) {
  return (
    <button
      type="button"
      className={styles.screen}
      onClick={onSkip}
      aria-live="polite"
      data-testid="interlude-screen"
    >
      <span className={styles.cup} aria-hidden="true">
        <span className={styles.steam} />
        <span className={styles.steam} />
        <span className={styles.steam} />
        <TeaCupIcon className={styles.cupIcon} />
      </span>
      <span className={styles.message}>{message ?? "少し、味がまとまってきました。"}</span>
      <span className={styles.tapHint}>タップで次へ</span>
    </button>
  );
}
