import Image from "next/image";
import { store } from "@/data/store";
import styles from "./BrandHeader.module.css";

/**
 * 画面上部のブランド表記。
 * ロゴ画像（store.logoSrc）が設定されていれば画像、無ければテキスト表記。
 * 実在ロゴを勝手に用意しないため、既定はテキスト。
 */
export function BrandHeader() {
  return (
    <header className={styles.header}>
      {store.logoSrc ? (
        <Image
          src={store.logoSrc}
          alt={`${store.brandLine} ${store.branchName}`}
          width={132}
          height={28}
          className={styles.logo}
          priority
        />
      ) : (
        <>
          <span className={styles.mark} aria-hidden="true">
            {store.mark}
          </span>
          <span className={styles.text}>
            <span className={styles.brand}>{store.brandLine}</span>
            <span className={styles.branch}>{store.branchName}</span>
          </span>
        </>
      )}
    </header>
  );
}
