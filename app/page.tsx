import { Suspense } from "react";
import { DiagnosisApp } from "@/components/DiagnosisApp";

/**
 * 卓上 QR から開くトップ。中身はクライアント側の診断フロー。
 * URL の ?from=... を読むため Suspense で包む。
 */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <DiagnosisApp />
    </Suspense>
  );
}
