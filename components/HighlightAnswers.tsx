"use client";

import { useEffect } from "react";
import type { Answer, TeaKey } from "@/types";
import { pickHighlights } from "@/lib/highlights";
import { track } from "@/lib/analytics";
import styles from "./HighlightAnswers.module.css";

type Props = {
  main: TeaKey;
  answers: Answer[];
};

/**
 * 「今回のあなたをつくった3つの選択」（仕様7）。
 * タイプ判定に実際に加点した回答から、ルールベースで3つを抽出して見せる（AIには選ばせない）。
 */
export function HighlightAnswers({ main, answers }: Props) {
  const highlights = pickHighlights(main, answers, 3);

  useEffect(() => {
    track("diagnosis_reason_view", { teaType: main });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (highlights.length === 0) return null;

  return (
    <section className={styles.block} aria-label="今回のあなたをつくった3つの選択" data-testid="highlight-answers">
      <p className={styles.label}>今回のあなたをつくった3つの選択</p>
      <ul className={styles.list}>
        {highlights.map((item) => (
          <li key={item.questionId}>{item.label}</li>
        ))}
      </ul>
    </section>
  );
}
