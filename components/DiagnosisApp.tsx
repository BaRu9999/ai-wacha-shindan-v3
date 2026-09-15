"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { store } from "@/data/store";
import { parseInviter } from "@/lib/share";
import { isRecommendationMode } from "@/lib/recommendation";
import { useDiagnosisFlow } from "@/hooks/useDiagnosisFlow";
import { BrandHeader } from "./BrandHeader";
import { TeaLeaves } from "./TeaLeaves";
import { IntroScreen } from "./IntroScreen";
import { QuizScreen } from "./QuizScreen";
import { InterludeScreen } from "./InterludeScreen";
import { KidsGateScreen } from "./KidsGateScreen";
import { KidsQuestionScreen } from "./KidsQuestionScreen";
import { KidsRevealScreen } from "./KidsRevealScreen";
import { BrewingScreen } from "./BrewingScreen";
import { ResultScreen } from "./ResultScreen";
import styles from "./DiagnosisApp.module.css";

export function DiagnosisApp() {
  const searchParams = useSearchParams();
  const inviter = useMemo(
    () => parseInviter(searchParams.toString()),
    [searchParams],
  );
  // 仕様6: ?mode=before-order のときだけ食事提案も許可。既定は "table"（甘味・ドリンク中心）。
  const modeParam = searchParams.get("mode");
  const mode = isRecommendationMode(modeParam) ? modeParam : "table";

  const flow = useDiagnosisFlow(mode);
  const { stage, actions } = flow;

  return (
    <main className={styles.shell}>
      <TeaLeaves />
      <section className={styles.column} aria-live="polite">
        <BrandHeader />

        <div className={styles.stageArea}>
          {stage === "intro" && (
            <IntroScreen
              inviter={inviter}
              onStart={() => actions.start("auto")}
              onStartWithKids={() => actions.start("parent-child")}
            />
          )}

          {stage === "quiz" && (
            <QuizScreen
              question={flow.currentQuestion}
              questionNumber={flow.questionIndex + 1}
              total={6}
              progress={flow.progress}
              onChoose={actions.choose}
            />
          )}

          {stage === "interlude" && (
            <InterludeScreen
              message={flow.interludeMessage}
              onSkip={actions.skipInterlude}
            />
          )}

          {stage === "kids-gate" && (
            <KidsGateScreen onAccept={actions.acceptKidsGate} onDecline={actions.declineKidsGate} />
          )}

          {stage === "kids-question" && <KidsQuestionScreen onChoose={actions.chooseKids} />}

          {stage === "kids-reveal" && (
            <KidsRevealScreen choiceId={flow.kidsChoiceId} onSkip={actions.skipKidsReveal} />
          )}

          {stage === "brewing" && <BrewingScreen />}

          {stage === "result" && flow.result && flow.text && flow.recommendation && (
            <ResultScreen
              result={flow.result}
              text={flow.text}
              textSource={flow.textSource}
              answers={flow.answers}
              recommendation={flow.recommendation}
              kidsChoiceId={flow.kidsChoiceId}
              inviter={inviter}
              onRestart={actions.restart}
            />
          )}
        </div>

        <footer className={styles.footer}>
          <span>{store.brandLine}</span>
          <span>{store.branchName}</span>
        </footer>
      </section>
    </main>
  );
}
