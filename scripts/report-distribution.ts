/**
 * 配点分布レポート。
 *   npm run distribution
 * 全 4096 パターンを総当たりし、メイン／隠れタイプの出現率を表で出力する。
 * 数値を変えた設問・配点を調整したら、これで偏りを確認する。
 */
import { simulateAll } from "../lib/simulate";

const summary = simulateAll();

const pct = (value: number) => `${(value * 100).toFixed(1)}%`;

console.log(`\n総パターン数: ${summary.total}\n`);
console.table(
  summary.rows.map((row) => ({
    タイプ: row.key,
    "メイン件数": row.mainCount,
    "メイン出現率": pct(row.mainRate),
    "隠れ件数": row.hiddenCount,
    "隠れ出現率": pct(row.hiddenRate),
  })),
);

console.log(
  `\nメイン出現率レンジ: ${pct(summary.minMainRate)} 〜 ${pct(summary.maxMainRate)}`,
);
console.log(
  `優先順位フォールバックまで進んだ件数: ${summary.priorityOrderFallbacks} / ${summary.total}\n`,
);

const min = 0.05;
const max = 0.3;
const outOfRange = summary.rows.filter(
  (row) => row.mainRate < min || row.mainRate > max,
);
if (outOfRange.length > 0) {
  console.error(
    "❌ 仕様の許容範囲(5%〜30%)を外れたタイプがあります:",
    outOfRange.map((row) => `${row.key} ${pct(row.mainRate)}`).join(", "),
  );
  process.exit(1);
}
console.log("✅ すべてのタイプが仕様の許容範囲(5%〜30%)に収まっています。\n");
