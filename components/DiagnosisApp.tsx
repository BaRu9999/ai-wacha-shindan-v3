"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { store } from "@/data/store";
import { parseInviter } from "@/lib/share";
import { useDiagnosisFlow } from "@/hooks/useDiagnosisFlow";
import { BrandHeader } from "./BrandHeader";
import { TeaLeaves } from "./TeaLeaves";
import { IntroScreen } from "./IntroScreen";
import { QuizScreen } from "./QuizScreen";
import { InterludeScreen } from "./InterludeScreen";
import { BrewingScreen } from "./BrewingScreen";
import { ResultScreen } from "./ResultScreen";
import styles from "./DiagnosisApp.module.css";

export function DiagnosisApp() {
  const searchParams = useSearchParams();
  const inviter = useMemo(
    () => parseInviter(searchParams.toString()),
    [searchParams],
  );

  const flow = useDiagnosisFlow();
  const { stage, actions } = flow;

  return (
    <main className={styles.shell}>
      <TeaLeaves />
      <section className={styles.column} aria-live="polite">
        <BrandHeader />

        <div className={styles.stageArea}>
          {stage === "intro" && (
            <IntroScreen inviter={inviter} onStart={actions.start} />
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

          {stage === "brewing" && <BrewingScreen />}

          {stage === "result" && flow.result && flow.text && (
            <ResultScreen
              result={flow.result}
              text={flow.text}
              textSource={flow.textSource}
              answers={flow.answers}
              inviter={inviter}
              kids={flow.kids}
              onOpenKids={actions.openKids}
              onDeclineKids={actions.declineKids}
              onResetKidsChoice={actions.resetKidsChoice}
              onChooseKids={actions.chooseKids}
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
