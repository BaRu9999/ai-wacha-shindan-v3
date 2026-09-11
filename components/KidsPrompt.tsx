"use client";

import { kidsQuestion } from "@/data/kids-question";
import type { KidsChoiceId } from "@/types";
import styles from "./KidsPrompt.module.css";

type Props = {
  active: boolean;
  declined: boolean;
  choiceId: KidsChoiceId | null;
  onOpen: () => void;
  onDecline: () => void;
  onChoose: (id: KidsChoiceId) => void;
  onChangeAnswer: () => void;
};

/**
 * 子ども連れ向けの任意プロンプト（仕様14）。
 * - 子ども連れでない利用者には結果しか見せない（declined か未回答なら静かに畳んでおく）。
 * - 「ママ」に限定せず「おうちの人」という言い回しにする。
 */
export function KidsPrompt({
  active,
  declined,
  choiceId,
  onOpen,
  onDecline,
  onChoose,
  onChangeAnswer,
}: Props) {
  if (declined) return null;

  if (!active) {
    return (
      <section className={styles.prompt} aria-label="お子さま連れの確認">
        <p>{kidsQuestion.intro}</p>
        <div className={styles.row}>
          <button type="button" className={styles.yes} onClick={onOpen}>
            はい
          </button>
          <button type="button" className={styles.no} onClick={onDecline}>
            いいえ
          </button>
        </div>
      </section>
    );
  }

  if (choiceId) {
    const chosen = kidsQuestion.choices.find((choice) => choice.id === choiceId);
    return (
      <section className={styles.answered} aria-label="お子さまの回答">
        <span>
          {chosen?.icon} お子さまが選んだ今日のごほうび：<strong>{chosen?.resultLabel}</strong>
        </span>
        <button type="button" className={styles.change} onClick={onChangeAnswer}>
          選びなおす
        </button>
      </section>
    );
  }

  return (
    <section className={styles.quiz} aria-label="お子さま向けの質問">
      <p className={styles.leadIn}>{kidsQuestion.leadIn}</p>
      <p className={styles.title}>{kidsQuestion.title}</p>
      <div className={styles.choices}>
        {kidsQuestion.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className={styles.choice}
            onClick={() => onChoose(choice.id)}
          >
            <span className={styles.icon} aria-hidden="true">
              {choice.icon}
            </span>
            <span>{choice.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
