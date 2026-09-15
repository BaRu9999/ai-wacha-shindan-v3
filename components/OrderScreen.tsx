"use client";

import { useEffect } from "react";
import type { Product } from "@/data/products";
import { track } from "@/lib/analytics";
import styles from "./OrderScreen.module.css";

type Props = {
  items: Product[];
  totalPrice: number;
  hasUnpricedItem: boolean;
  onClose: () => void;
};

const yen = new Intl.NumberFormat("ja-JP");

/**
 * スタッフ提示用の「注文画面」（仕様5）。
 *
 * 一目で商品名が分かることを優先し、診断の文章は出さない。大きな文字・大きなタップ領域。
 * 表示した時点で `staff_show_tap` と `order_screen_view` を記録する。
 * 注意（仕様16）: この画面を開いたことは「注文意向に近い行動」であって、購入・注文の確定ではない。
 */
export function OrderScreen({ items, totalPrice, hasUnpricedItem, onClose }: Props) {
  useEffect(() => {
    track("staff_show_tap");
    track("order_screen_view", {
      meta: { productIds: items.map((item) => item.id).join(",") },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unpricedNames = items.filter((item) => item.price === null).map((item) => item.name);

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="注文画面"
      data-testid="order-screen"
    >
      <div className={styles.sheet}>
        <p className={styles.label}>今日のおすすめ</p>

        <ul className={styles.items}>
          {items.map((item, index) => (
            <li key={item.id}>
              {index > 0 && <span className={styles.plus}>＋</span>}
              {item.name}
            </li>
          ))}
        </ul>

        <p className={styles.total}>
          {hasUnpricedItem ? "合計（一部を除く）" : "合計"}
          <strong>¥{yen.format(totalPrice)}</strong>
          <span className={styles.tax}>税込</span>
        </p>

        {unpricedNames.length > 0 && (
          <p className={styles.note}>
            ※ {unpricedNames.join("・")}は、価格を店舗にてご確認ください。
          </p>
        )}

        <p className={styles.instruction}>
          ご注文の際は、この画面をスタッフにお見せください。
        </p>

        <button type="button" className={styles.close} onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
}
