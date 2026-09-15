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
 * 「この結果につながった選択」（仕様7、および説明可能性の修正）。
 * タイプ判定に実際に加点した回答だけを、ルールベースで抽出して見せる（AIには選ばせない）。
 * 件数は回答内容によって 0〜3件で変わる（無関係な回答で埋め合わせない）。
 */
export function HighlightAnswers({ main, answers }: Props) {
  const highlights = pickHighlights(main, answers, 3);

  useEffect(() => {
    track("diagnosis_reason_view", { teaType: main });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (highlights.length === 0) return null;

  return (
    <section className={styles.block} aria-label="この結果につながった選択" data-testid="highlight-answers">
      <p className={styles.label}>この結果につながった、あなたの選択</p>
      <ul className={styles.list}>
        {highlights.map((item) => (
          <li key={item.questionId}>{item.label}</li>
        ))}
      </ul>
    </section>
  );
}
