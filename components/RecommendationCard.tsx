"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/data/products";
import { track } from "@/lib/analytics";
import styles from "./RecommendationCard.module.css";

type Props = {
  heroImage: string;
  items: Product[];
  totalPrice: number;
  reason: string;
  kidsRewardLabel: string | null;
};

const yen = new Intl.NumberFormat("ja-JP");

/**
 * 「今日のおすすめ」カード。
 * 販促色を出しすぎないため、CTA は「見る」「見せる」に留める（仕様12）。
 */
export function RecommendationCard({
  heroImage,
  items,
  totalPrice,
  reason,
  kidsRewardLabel,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [staffMode, setStaffMode] = useState(false);

  const title = items.map((item) => item.name).join(" ＋ ");

  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    if (next) {
      track("product_detail_tap", {
        meta: { productIds: items.map((item) => item.id).join(",") },
      });
    } else {
      setStaffMode(false);
    }
  };

  const toggleStaff = () => {
    const next = !staffMode;
    setStaffMode(next);
    if (next) track("staff_show_tap");
  };

  return (
    <section
      className={`${styles.card} ${staffMode ? styles.staffMode : ""}`}
      aria-label="今日のおすすめ"
    >
      <div className={styles.image}>
        <Image src={heroImage} alt={title} fill sizes="(max-width: 520px) 100vw, 480px" />
      </div>

      <div className={styles.body}>
        <p className={styles.label}>今日のおすすめ</p>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.reason}>{reason}</p>

        {kidsRewardLabel && (
          <p className={styles.kidsNote}>
            お子さまが選んだ今日のごほうび：<strong>{kidsRewardLabel}</strong>
          </p>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.menuButton} onClick={toggleMenu}>
            この組み合わせを見る
            <span aria-hidden="true">{menuOpen ? "︿" : "﹀"}</span>
          </button>
        </div>

        {menuOpen && (
          <div className={styles.menuDetail}>
            <ul className={styles.menuList}>
              {items.map((item) => (
                <li key={item.id}>
                  <span>{item.name}</span>
                  <span>¥{yen.format(item.price)}</span>
                </li>
              ))}
            </ul>
            <p className={styles.total}>
              <span>合計目安</span>
              <strong>¥{yen.format(totalPrice)}</strong>
            </p>
            <button type="button" className={styles.staffButton} onClick={toggleStaff}>
              {staffMode ? "スタッフへの表示を終える" : "スタッフに見せる"}
            </button>
            {staffMode && (
              <p className={styles.staffHint}>
                ご注文の際は、この画面をスタッフにお見せください。
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
