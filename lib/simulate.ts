import type { Answer, TeaKey } from "@/types";
import { TEA_KEYS } from "@/types";
import { questions } from "@/data/questions";
import { diagnose } from "./diagnosis";

/**
 * 全回答パターンの総当たりシミュレーション。
 * 6問 × 4択 = 4^6 = 4096 パターン。
 * distribution テストと scripts/report-distribution.ts の両方から使う。
 */

export type DistributionRow = {
  key: TeaKey;
  mainCount: number;
  mainRate: number;
  hiddenCount: number;
  hiddenRate: number;
};

export type SimulationSummary = {
  total: number;
  rows: DistributionRow[];
  /** メインタイプの最小・最大出現率（偏りの指標）。 */
  minMainRate: number;
  maxMainRate: number;
  /** タイブレークが最終的な優先順位フォールバックまで進んだ件数。 */
  priorityOrderFallbacks: number;
};

export function* allAnswerPatterns(): Generator<Answer[]> {
  const choiceIdMatrix = questions.map((question) =>
    question.choices.map((choice) => choice.id),
  );
  const lengths = choiceIdMatrix.map((ids) => ids.length);
  const indices = new Array(questions.length).fill(0);

  while (true) {
    yield questions.map((question, questionIndex) => ({
      questionId: question.id,
      choiceId: choiceIdMatrix[questionIndex][indices[questionIndex]],
    }));

    let cursor = questions.length - 1;
    while (cursor >= 0) {
      indices[cursor] += 1;
      if (indices[cursor] < lengths[cursor]) break;
      indices[cursor] = 0;
      cursor -= 1;
    }
    if (cursor < 0) break;
  }
}

export function simulateAll(): SimulationSummary {
  const mainCount: Record<TeaKey, number> = zero();
  const hiddenCount: Record<TeaKey, number> = zero();
  let total = 0;
  let priorityOrderFallbacks = 0;

  for (const answers of allAnswerPatterns()) {
    const result = diagnose(answers);
    mainCount[result.main] += 1;
    hiddenCount[result.hidden] += 1;
    total += 1;
    if (
      result.mainTiebreak === "priority-order" ||
      result.hiddenTiebreak === "priority-order"
    ) {
      priorityOrderFallbacks += 1;
    }
  }

  const rows: DistributionRow[] = TEA_KEYS.map((key) => ({
    key,
    mainCount: mainCount[key],
    mainRate: mainCount[key] / total,
    hiddenCount: hiddenCount[key],
    hiddenRate: hiddenCount[key] / total,
  }));

  const mainRates = rows.map((row) => row.mainRate);

  return {
    total,
    rows,
    minMainRate: Math.min(...mainRates),
    maxMainRate: Math.max(...mainRates),
    priorityOrderFallbacks,
  };
}

function zero(): Record<TeaKey, number> {
  return { matcha: 0, hojicha: 0, wakoucha: 0, kuwacha: 0, biwa: 0, rooibos: 0 };
}
