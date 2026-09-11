"use client";

import { useEffect } from "react";
import type { TeaKey } from "@/types";
import { teaTypes } from "@/data/tea-types";
import { getCompatibility } from "@/data/compatibility";
import { track } from "@/lib/analytics";
import styles from "./CompatibilityPanel.module.css";

type Props = {
  friendMain: TeaKey;
  friendHidden: TeaKey | null;
  myMain: TeaKey;
};

/**
 * 友達との相性診断（仕様17）。
 * 結果画面のメイン導線ではなく「もっと楽しむ」の中に置く。
 * URL には個人情報を含めない（?from=<タイプ> だけを使う）。
 */
export function CompatibilityPanel({ friendMain, friendHidden, myMain }: Props) {
  const compatibility = getCompatibility(friendMain, myMain);
  const friend = teaTypes[friendMain];
  const mine = teaTypes[myMain];

  useEffect(() => {
    track("compatibility_start", { meta: { friendMain, myMain } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={styles.panel} aria-label="友達との和茶相性">
      <p className={styles.label}>お友達との和茶相性</p>
      <div className={styles.pair}>
        <div>
          <small>お友達</small>
          <strong>{friend.name}</strong>
        </div>
        <div className={styles.score}>
          <b>{compatibility.score}</b>
          <span>%</span>
        </div>
        <div>
          <small>あなた</small>
          <strong>{mine.name}</strong>
        </div>
      </div>
      <h4 className={styles.title}>{compatibility.title}</h4>
      <p className={styles.text}>{compatibility.description}</p>
      <div className={styles.advice}>
        <strong>もっと仲良くなる一言</strong>
        <p>{compatibility.advice}</p>
      </div>
      {friendHidden && (
        <p className={styles.hiddenNote}>
          お友達の隠れタイプは{teaTypes[friendHidden].name}のようです。
        </p>
      )}
    </section>
  );
}
