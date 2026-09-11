"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./TeaLeaves.module.css";

/**
 * 背景でゆっくり漂う茶葉（装飾）。
 * - CSS アニメーションのみ。数は控えめ、動きはゆっくり。
 * - prefers-reduced-motion では描画しない。
 */
export function TeaLeaves() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div className={styles.field} aria-hidden="true">
      {LEAVES.map((leaf, index) => (
        <span
          key={index}
          className={styles.leaf}
          style={{
            left: leaf.left,
            animationDuration: leaf.duration,
            animationDelay: leaf.delay,
            fontSize: leaf.size,
          }}
        >
          🍃
        </span>
      ))}
    </div>
  );
}

const LEAVES = [
  { left: "8%", duration: "26s", delay: "0s", size: "14px" },
  { left: "34%", duration: "32s", delay: "-8s", size: "11px" },
  { left: "62%", duration: "29s", delay: "-16s", size: "13px" },
  { left: "84%", duration: "35s", delay: "-4s", size: "10px" },
];
