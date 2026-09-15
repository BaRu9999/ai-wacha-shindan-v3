"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/data/products";
import { track } from "@/lib/analytics";
import { buildPriceDisplay } from "@/lib/price-display";
import { OrderScreen } from "./OrderScreen";
import styles from "./RecommendationCard.module.css";

type Props = {
  heroImage: string;
  items: Product[];
  totalPrice: number;
  hasUnpricedItem: boolean;
  reason: string;
  kidsRewardLabel: string | null;
};

const yen = new Intl.NumberFormat("ja-JP");

/**
 * 「今日のおすすめ」カード（仕様4・5）。
 *
 * 商品名・おすすめ理由・価格・写真を最初から表示し、CTA は
 * 「このおすすめを詳しく見る」と「スタッフに注文画面を見せる」の2つを直接並べる
 * （注文画面の表示までを1タップにする）。販促色を出しすぎないため、CTA は
 * 「見る」「見せる」に留める（仕様12）。
 */
export function RecommendationCard({
  heroImage,
  items,
  totalPrice,
  hasUnpricedItem,
  reason,
  kidsRewardLabel,
}: Props) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);

  const title = items.map((item) => item.name).join(" ＋ ");
  const unpricedNames = items.filter((item) => item.price === null).map((item) => item.name);
  const price = buildPriceDisplay(hasUnpricedItem, totalPrice, unpricedNames);

  const toggleDetail = () => {
    const next = !detailOpen;
    setDetailOpen(next);
    if (next) {
      track("product_detail_tap", {
        meta: { productIds: items.map((item) => item.id).join(",") },
      });
    }
  };

  const openOrderScreen = () => {
    track("order_cta_tap", {
      meta: { productIds: items.map((item) => item.id).join(",") },
    });
    setOrderOpen(true);
  };

  return (
    <section className={styles.card} aria-label="今日のおすすめ">
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

        <p className={styles.price}>
          {price.label}
          <strong>¥{yen.format(price.amount)}</strong>
          <span>税込</span>
        </p>
        {price.note && <p className={styles.priceNote}>{price.note}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.detailButton} onClick={toggleDetail}>
            このおすすめを詳しく見る
            <span aria-hidden="true">{detailOpen ? "︿" : "﹀"}</span>
          </button>
          <button type="button" className={styles.staffButton} onClick={openOrderScreen}>
            スタッフに注文画面を見せる
          </button>
        </div>

        {detailOpen && (
          <ul className={styles.menuList}>
            {items.map((item) => (
              <li key={item.id}>
                <div className={styles.menuHead}>
                  <span>{item.name}</span>
                  <span>
                    {item.price === null ? "店舗にてご確認ください" : `¥${yen.format(item.price)}`}
                  </span>
                </div>
                <p className={styles.menuReason}>{item.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {orderOpen && (
        <OrderScreen
          items={items}
          totalPrice={totalPrice}
          hasUnpricedItem={hasUnpricedItem}
          onClose={() => setOrderOpen(false)}
        />
      )}
    </section>
  );
}
