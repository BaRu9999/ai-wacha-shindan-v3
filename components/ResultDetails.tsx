"use client";

import type { TeaType } from "@/data/tea-types";
import { track } from "@/lib/analytics";
import styles from "./ResultDetails.module.css";

type Props = {
  hidden: TeaType;
  hiddenInsight: string;
  description: string;
  today: string;
  word: string;
  wordMeaning: string;
  todayHint: string;
};

/**
 * 「もっと詳しく見る」の中身（仕様11）。
 * 隠れタイプ／詳しい性格分析／今日の一言／和ことば／注意点。
 */
export function ResultDetails({
  hidden,
  hiddenInsight,
  description,
  today,
  word,
  wordMeaning,
  todayHint,
}: Props) {
  return (
    <details
      className={styles.details}
      onToggle={(event) => {
        if ((event.target as HTMLDetailsElement).open) {
          track("result_detail_expand");
        }
      }}
    >
      <summary className={styles.summary}>
        <span>もっと詳しく見る</span>
        <span className={styles.chevron} aria-hidden="true">
          ﹀
        </span>
      </summary>

      <div className={styles.body}>
        <section className={styles.block}>
          <p className={styles.label}>隠れタイプ・{hidden.name}</p>
          <p className={styles.text}>{hiddenInsight}</p>
        </section>

        <section className={styles.block}>
          <p className={styles.label}>詳しい性格分析</p>
          <p className={styles.text}>{description}</p>
        </section>

        <section className={styles.block}>
          <p className={styles.label}>今日のひとこと</p>
          <p className={styles.text}>{today}</p>
        </section>

        <section className={styles.wordBlock}>
          <p className={styles.label}>今日の和ことば</p>
          <strong className={styles.word}>{word}</strong>
          <p className={styles.text}>{wordMeaning}</p>
        </section>

        <section className={styles.caution}>
          <p className={styles.label}>今日のヒント</p>
          <p className={styles.text}>{todayHint}</p>
        </section>
      </div>
    </details>
  );
}
