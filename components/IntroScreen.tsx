"use client";

import type { TeaKey } from "@/types";
import { teaTypeList, teaTypes } from "@/data/tea-types";
import styles from "./IntroScreen.module.css";

type Props = {
  inviter: { from: TeaKey | null; hidden: TeaKey | null };
  onStart: () => void;
};

export function IntroScreen({ inviter, onStart }: Props) {
  const invited = inviter.from !== null;

  return (
    <div className={styles.screen}>
      <p className={styles.eyebrow}>6つの質問でわかる</p>
      <h1 className={styles.title}>
        今日のあなたは、
        <br />
        何茶タイプ？
      </h1>

      <p className={styles.lead}>
        {invited && inviter.from ? (
          <>
            <strong>{teaTypes[inviter.from].name}タイプ</strong>のお友達から、
            <br />
            相性診断が届いています。
          </>
        ) : (
          <>
            6つの和茶から、今日のあなたに
            <br />
            ぴったりの一杯を見つけます。
          </>
        )}
      </p>

      <ul className={styles.teaList} aria-label="診断でわかる6つの和茶">
        {teaTypeList.map((tea) => (
          <li key={tea.key} className={styles.teaChip}>
            {tea.name}
          </li>
        ))}
      </ul>

      <button type="button" className={styles.start} onClick={onStart}>
        診断をはじめる
      </button>

      <dl className={styles.meta}>
        <div>
          <dt>所要</dt>
          <dd>約30秒</dd>
        </div>
        <span className={styles.metaSep} aria-hidden="true" />
        <div>
          <dt>質問</dt>
          <dd>全6問</dd>
        </div>
        <span className={styles.metaSep} aria-hidden="true" />
        <div>
          <dt>入力</dt>
          <dd>タップのみ</dd>
        </div>
      </dl>

      <p className={styles.note}>回答をもとに、AI が結果の文章を作成します。</p>
    </div>
  );
}
