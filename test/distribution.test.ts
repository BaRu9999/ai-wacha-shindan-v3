import { describe, expect, it } from "vitest";
import { TEA_KEYS } from "@/types";
import { questions } from "@/data/questions";
import { simulateAll } from "@/lib/simulate";

/**
 * 仕様5・27-1: 6タイプの配点分布テスト。
 * 全 4^6 = 4096 パターンを総当たりし、メインタイプの出現率が極端に偏らないことを確認する。
 */
describe("配点設計の均等性", () => {
  it("main / sub の登場回数が 6タイプ × 4回 でそろっている", () => {
    const mainCount: Record<string, number> = {};
    const subCount: Record<string, number> = {};
    for (const key of TEA_KEYS) {
      mainCount[key] = 0;
      subCount[key] = 0;
    }
    for (const question of questions) {
      for (const choice of question.choices) {
        mainCount[choice.main] += 1;
        subCount[choice.sub] += 1;
        expect(choice.main).not.toBe(choice.sub);
      }
    }
    for (const key of TEA_KEYS) {
      expect(mainCount[key], `main:${key}`).toBe(4);
      expect(subCount[key], `sub:${key}`).toBe(4);
    }
  });

  it("6問 × 4択で、各問の選択肢は4つ", () => {
    expect(questions).toHaveLength(6);
    for (const question of questions) {
      expect(question.choices).toHaveLength(4);
    }
  });
});

describe("総当たり分布（4096パターン）", () => {
  const summary = simulateAll();

  it("4096パターンすべてを評価している", () => {
    expect(summary.total).toBe(4096);
  });

  it("どのタイプもメイン出現率が 5% 未満にならない（仕様の下限）", () => {
    for (const row of summary.rows) {
      expect(row.mainRate, `${row.key}: ${(row.mainRate * 100).toFixed(1)}%`).toBeGreaterThanOrEqual(
        0.05,
      );
    }
  });

  it("どのタイプもメイン出現率が 30% を超えない（仕様の上限）", () => {
    for (const row of summary.rows) {
      expect(row.mainRate, `${row.key}: ${(row.mainRate * 100).toFixed(1)}%`).toBeLessThanOrEqual(
        0.3,
      );
    }
  });

  it("さらに厳しめの自主基準（各タイプ 9%〜24%）も満たす", () => {
    for (const row of summary.rows) {
      expect(row.mainRate, `${row.key}: ${(row.mainRate * 100).toFixed(1)}%`).toBeGreaterThanOrEqual(
        0.09,
      );
      expect(row.mainRate, `${row.key}: ${(row.mainRate * 100).toFixed(1)}%`).toBeLessThanOrEqual(
        0.24,
      );
    }
  });

  it("隠れタイプもすべてのタイプが 5% 以上で出現する", () => {
    for (const row of summary.rows) {
      expect(
        row.hiddenRate,
        `hidden ${row.key}: ${(row.hiddenRate * 100).toFixed(1)}%`,
      ).toBeGreaterThanOrEqual(0.05);
    }
  });
});
