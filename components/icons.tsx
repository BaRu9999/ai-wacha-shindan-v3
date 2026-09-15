"use client";

import { useId, type CSSProperties } from "react";
import styles from "./icons.module.css";

/**
 * OS 依存の絵文字（🍵 🍃 ✨ など）に代わる、独自の線画 SVG アイコン集（仕様10）。
 * - 1〜2色（currentColor 基調）・線画中心・派手な演出にしない。
 * - 外部素材は使わず、すべてコードで作成。
 */

type IconProps = {
  className?: string;
  style?: CSSProperties;
  /** 湯呑みにお茶が満ちていく演出を付けるか（結果待機演出用）。 */
  filling?: boolean;
};

/** 湯呑みの線画。TeaProgress と同じ器の形を再利用し、演出の一貫性を保つ。 */
export function TeaCupIcon({ className, style, filling = false }: IconProps) {
  const clipId = useId();
  return (
    <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <path d="M10 12 H30 L28.5 33 Q28 35 26 35 H14 Q12 35 11.5 33 Z" />
        </clipPath>
      </defs>
      {filling && (
        <rect
          x="9"
          y="12"
          width="22"
          height="26"
          fill="currentColor"
          opacity="0.85"
          clipPath={`url(#${clipId})`}
          className={styles.fill}
        />
      )}
      <path
        d="M10 12 H30 L28.5 33 Q28 35 26 35 H14 Q12 35 11.5 33 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M30 16 Q35 16 35 20 Q35 24 30 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <line x1="8" y1="12" x2="32" y2="12" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/** 茶葉の線画（背景で漂う装飾・TeaLeaves 用）。 */
export function TeaLeafIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 20 20" className={className} style={style} aria-hidden="true">
      <path
        d="M4 16 C4 8 10 3 17 3 C16 11 11 16 4 16 Z"
        fill="currentColor"
        opacity="0.16"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M5 15 C9 11 12 8 16 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.9"
        opacity="0.5"
      />
    </svg>
  );
}

/** きらめき（「ちょっと特別」用）。派手にならない、細身の四方星。 */
export function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2 L13.6 9.2 L21 12 L13.6 14.8 L12 22 L10.4 14.8 L3 12 L10.4 9.2 Z"
        fill="currentColor"
        opacity="0.85"
      />
      <circle cx="19" cy="5.5" r="1.3" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/** 和菓子（「甘いごほうび」用）。丸い生地に、葉を一枚のせた程度の簡略化。 */
export function WagashiIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="14.5" r="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M9 8.2 C9.5 5.7 11 4.2 12 3.4 C13 4.2 14.5 5.7 15 8.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.75"
      />
    </svg>
  );
}
