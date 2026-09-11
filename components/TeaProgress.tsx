import styles from "./TeaProgress.module.css";

type Props = {
  /** 0〜1。湯呑みに注がれたお茶の量として表現する。 */
  ratio: number;
  current: number;
  total: number;
};

/**
 * 進捗表示。湯呑みにお茶が注がれていくイメージ。
 * SVG の clip 高さで水位を出す（CSS transition でゆっくり上がる）。
 */
export function TeaProgress({ ratio, current, total }: Props) {
  const clamped = Math.max(0, Math.min(1, ratio));
  // 湯呑み内側の水位（viewBox 0..40 のうち、y=34 が底、y=12 が上限）
  const bottom = 34;
  const top = 12;
  const waterY = bottom - (bottom - top) * clamped;

  return (
    <div className={styles.wrap}>
      <svg
        className={styles.cup}
        viewBox="0 0 40 40"
        role="img"
        aria-label={`${total}問中 ${current}問目`}
      >
        <defs>
          <clipPath id="cupInside">
            <path d="M10 12 H30 L28.5 33 Q28 35 26 35 H14 Q12 35 11.5 33 Z" />
          </clipPath>
        </defs>
        <rect
          x="9"
          y={waterY}
          width="22"
          height="26"
          fill="var(--green)"
          opacity="0.85"
          clipPath="url(#cupInside)"
          className={styles.water}
        />
        <path
          d="M10 12 H30 L28.5 33 Q28 35 26 35 H14 Q12 35 11.5 33 Z"
          fill="none"
          stroke="var(--sumi-2)"
          strokeWidth="1.4"
        />
        <path
          d="M30 16 Q35 16 35 20 Q35 24 30 24"
          fill="none"
          stroke="var(--sumi-2)"
          strokeWidth="1.4"
        />
        <line
          x1="8"
          y1="12"
          x2="32"
          y2="12"
          stroke="var(--sumi-2)"
          strokeWidth="1.4"
        />
      </svg>
      <span className={styles.count}>
        <strong>{current}</strong>
        <span> / {total}</span>
      </span>
    </div>
  );
}
