"use client";

import { useMemo } from "react";
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
import { recommend } from "@/lib/recommendation";
import { RecommendationCard } from "./RecommendationCard";
import { KidsPrompt } from "./KidsPrompt";
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
  inviter: { from: TeaKey | null; hidden: TeaKey | null };
  kids: { active: boolean; declined: boolean; choiceId: KidsChoiceId | null };
  onOpenKids: () => void;
  onDeclineKids: () => void;
  onResetKidsChoice: () => void;
  onChooseKids: (id: KidsChoiceId) => void;
  onRestart: () => void;
};

export function ResultScreen({
  result,
  text,
  answers,
  inviter,
  kids,
  onOpenKids,
  onDeclineKids,
  onResetKidsChoice,
  onChooseKids,
  onRestart,
}: Props) {
  const main = teaTypes[result.main];
  const hidden = teaTypes[result.hidden];

  const baseRecommendation = useMemo(
    () => recommend(result.main, answers, null),
    [result.main, answers],
  );
  const recommendation = useMemo(
    () => recommend(result.main, answers, kids.choiceId),
    [result.main, answers, kids.choiceId],
  );
  const recommendationChangedByKids = recommendation.setId !== baseRecommendation.setId;
  const recommendationReason = recommendationChangedByKids
    ? recommendation.reason
    : text.recommendationReason;
  const kidsRewardLabel = kids.choiceId ? kidsChoiceById[kids.choiceId].resultLabel : null;
  const productTitle = recommendation.items.map((item) => item.name).join(" ＋ ");

  return (
    <div className={styles.screen}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>回答から見つかった、今日の和茶タイプ</p>
        <h1 className={styles.typeName}>
          {main.name}
          <small>タイプ</small>
        </h1>
        <p className={styles.catch}>「{main.catchphrase}」</p>
        <p className={styles.summary}>{text.summary}</p>
      </div>

      <RecommendationCard
        heroImage={recommendation.heroImage}
        items={recommendation.items}
        totalPrice={recommendation.totalPrice}
        hasUnpricedItem={recommendation.hasUnpricedItem}
        reason={recommendationReason}
        kidsRewardLabel={kidsRewardLabel}
      />

      <KidsPrompt
        active={kids.active}
        declined={kids.declined}
        choiceId={kids.choiceId}
        onOpen={onOpenKids}
        onDecline={onDeclineKids}
        onChoose={onChooseKids}
        onChangeAnswer={onResetKidsChoice}
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
          wordMeaning={text.wordMeaning}
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
