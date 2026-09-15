"use client";

import { TeaCupIcon } from "./icons";
import styles from "./BrewingScreen.module.css";

/**
 * 結果を待つ間の「お茶を抽出している」演出（仕様11）。
 * 「待たされている」ではなく「結果ができあがる瞬間」に見せるため、
 * 湯呑みに少しずつお茶が満ちる演出（TeaCupIcon の filling）を使う。
 * AI 応答を待つ時間をここで吸収する（最低表示時間つき・短め）。
 */
export function BrewingScreen() {
  return (
    <div className={styles.screen} role="status" aria-live="polite" data-testid="brewing-screen">
      <div className={styles.visual} aria-hidden="true">
        <span className={styles.steam} />
        <span className={styles.steam} />
        <span className={styles.steam} />
        <TeaCupIcon className={styles.cup} filling />
        <span className={styles.ring} />
        <span className={styles.ring} />
      </div>
      <p className={styles.eyebrow}>まもなくです</p>
      <h2 className={styles.title}>
        あなたの回答を、
        <br />
        一杯のお茶に抽出しています
      </h2>
      <p className={styles.sub}>今日の気分に合う和茶を選んでいます</p>
    </div>
  );
}
