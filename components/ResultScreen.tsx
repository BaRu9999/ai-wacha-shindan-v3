"use client";

import type {
  Answer,
  DiagnosisResult,
  DiagnosisText,
  DiagnosisTextSource,
  KidsChoiceId,
  TeaKey,
} from "@/types";
import { teaTypes } from "@/data/tea-types";
import { kidsChoiceById } from "@/data/kids-question";
import type { Recommendation } from "@/lib/recommendation";
import { RecommendationCard } from "./RecommendationCard";
import { HighlightAnswers } from "./HighlightAnswers";
import { ResultDetails } from "./ResultDetails";
import { TeaResultCard } from "./TeaResultCard";
import { SharePanel } from "./SharePanel";
import { CompatibilityPanel } from "./CompatibilityPanel";
import styles from "./ResultScreen.module.css";

type Props = {
  result: DiagnosisResult;
  text: DiagnosisText;
  textSource: DiagnosisTextSource | null;
  answers: Answer[];
  recommendation: Recommendation;
  kidsChoiceId: KidsChoiceId | null;
  inviter: { from: TeaKey | null; hidden: TeaKey | null };
  onRestart: () => void;
};

/**
 * 結果画面（仕様9）。ファーストビューは、
 * タイプ → キャッチコピー → 短い説明 → 3つの選択 → おすすめ（商品・価格・注文導線）。
 * その下に「もっと詳しく見る」、さらに下に「もっと楽しむ」（保存・共有・相性）を置く。
 *
 * 子ども連れの分岐は、この画面に来る時点ですでに確定済み（結果表示後に商品を変えない）。
 */
export function ResultScreen({
  result,
  text,
  answers,
  recommendation,
  kidsChoiceId,
  inviter,
  onRestart,
}: Props) {
  const main = teaTypes[result.main];
  const hidden = teaTypes[result.hidden];
  const kidsRewardLabel = kidsChoiceId ? kidsChoiceById[kidsChoiceId].resultLabel : null;
  const productTitle = recommendation.items.map((item) => item.name).join(" ＋ ");

  return (
    <div className={styles.screen} data-testid="result-screen">
      <div className={styles.hero}>
        <p className={styles.eyebrow}>回答から見つかった、今日の和茶タイプ</p>
        <h1 className={styles.typeName}>
          {main.name}
          <small>タイプ</small>
        </h1>
        <p className={styles.catch}>「{main.catchphrase}」</p>
        <p className={styles.summary}>{text.summary}</p>
      </div>

      <HighlightAnswers main={result.main} answers={answers} />

      <RecommendationCard
        heroImage={recommendation.heroImage}
        items={recommendation.items}
        totalPrice={recommendation.totalPrice}
        hasUnpricedItem={recommendation.hasUnpricedItem}
        reason={text.recommendationReason}
        kidsRewardLabel={kidsRewardLabel}
      />

      <ResultDetails
        hidden={hidden}
        hiddenInsight={text.hiddenInsight}
        description={main.description}
        today={text.today}
        word={text.word}
        wordMeaning={text.wordMeaning}
        todayHint={main.todayHint}
      />

      <section className={styles.more} aria-label="もっと楽しむ">
        <h3 className={styles.moreTitle}>もっと楽しむ</h3>

        <TeaResultCard
          main={result.main}
          hidden={result.hidden}
          word={text.word}
          productTitle={productTitle}
        />

        <SharePanel main={result.main} hidden={result.hidden} hasInviter={Boolean(inviter.from)} />

        {inviter.from && (
          <CompatibilityPanel
            friendMain={inviter.from}
            friendHidden={inviter.hidden}
            myMain={result.main}
          />
        )}
      </section>

      <p className={styles.retryNote}>
        今日の気分で結果は変わります。別の日にもお試しください。
      </p>
      <button type="button" className={styles.restart} onClick={onRestart}>
        もう一度診断する
      </button>
    </div>
  );
}
