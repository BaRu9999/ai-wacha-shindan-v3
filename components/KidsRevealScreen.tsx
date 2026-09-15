"use client";

import type { KidsChoiceId } from "@/types";
import { kidsChoiceById, kidsQuestion } from "@/data/kids-question";
import { SparkleIcon, TeaCupIcon, WagashiIcon } from "./icons";
import styles from "./KidsRevealScreen.module.css";

type Props = {
  choiceId: KidsChoiceId | null;
  onSkip: () => void;
};

const ICONS = { sweet: WagashiIcon, calm: TeaCupIcon, special: SparkleIcon } as const;

/**
 * 子どもの回答直後に一瞬だけ見せる演出（仕様2）。
 * InterludeScreen と同様、タップで先に進める（待たされている感を作らない）。
 */
export function KidsRevealScreen({ choiceId, onSkip }: Props) {
  const choice = choiceId ? kidsChoiceById[choiceId] : null;
  const Icon = choiceId ? ICONS[choiceId] : null;
  const message = choice
    ? kidsQuestion.revealTemplate.replace("${label}", choice.resultLabel)
    : "";

  return (
    <button
      type="button"
      className={styles.screen}
      onClick={onSkip}
      aria-live="polite"
      data-testid="kids-reveal-screen"
    >
      {Icon && <Icon className={styles.icon} />}
      <span className={styles.message}>{message}</span>
      <span className={styles.tapHint}>タップで次へ</span>
    </button>
  );
}
