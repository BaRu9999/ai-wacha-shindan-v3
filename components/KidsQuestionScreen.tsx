"use client";

import type { ComponentType } from "react";
import type { KidsChoiceId } from "@/types";
import { kidsQuestion } from "@/data/kids-question";
import { SparkleIcon, TeaCupIcon, WagashiIcon } from "./icons";
import styles from "./KidsQuestionScreen.module.css";

type Props = {
  onChoose: (id: KidsChoiceId) => void;
};

const ICONS: Record<KidsChoiceId, ComponentType<{ className?: string }>> = {
  sweet: WagashiIcon,
  calm: TeaCupIcon,
  special: SparkleIcon,
};

/**
 * 子ども連れのときだけ進む「最後の一問」（仕様1・2）。
 * 子どもでも直感的に選べる3択・大きめのタップ領域・絵文字ではなく独自SVG。
 */
export function KidsQuestionScreen({ onChoose }: Props) {
  return (
    <div className={styles.screen} data-testid="kids-question-screen">
      <p className={styles.leadIn}>{kidsQuestion.leadIn}</p>
      <p className={styles.title}>{kidsQuestion.title}</p>

      <div className={styles.choices}>
        {kidsQuestion.choices.map((choice) => {
          const Icon = ICONS[choice.id];
          return (
            <button
              key={choice.id}
              type="button"
              className={styles.choice}
              onClick={() => onChoose(choice.id)}
            >
              <Icon className={styles.icon} />
              <span>{choice.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
