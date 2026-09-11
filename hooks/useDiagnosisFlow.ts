"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type {
  Answer,
  Choice,
  DiagnosisResult,
  DiagnosisText,
  DiagnosisTextSource,
  KidsChoiceId,
} from "@/types";
import { interludes, questions } from "@/data/questions";
import { diagnose } from "@/lib/diagnosis";
import { recommend } from "@/lib/recommendation";
import { buildFallbackText } from "@/lib/fallback";
import { parseDiagnosisText } from "@/lib/ai-schema";
import { track } from "@/lib/analytics";

export type FlowStage = "intro" | "quiz" | "interlude" | "brewing" | "result";

const MIN_BREWING_MS = 1_700;
const REQUEST_TIMEOUT_MS = 9_000;
const INTERLUDE_MS = 1_300;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function requestText(
  answers: Answer[],
  kidsChoiceId: KidsChoiceId | null,
): Promise<{ text: DiagnosisText; source: DiagnosisTextSource } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch("/api/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, kidsChoiceId }),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (!data || typeof data !== "object") return null;
    const record = data as Record<string, unknown>;
    const text = parseDiagnosisText(record.result);
    if (!text) return null;
    const source: DiagnosisTextSource = record.source === "ai" ? "ai" : "fallback";
    return { text, source };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function useDiagnosisFlow() {
  const [stage, setStage] = useState<FlowStage>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [text, setText] = useState<DiagnosisText | null>(null);
  const [textSource, setTextSource] = useState<DiagnosisTextSource | null>(null);

  const [kidsActive, setKidsActive] = useState(false);
  const [kidsDeclined, setKidsDeclined] = useState(false);
  const [kidsChoiceId, setKidsChoiceId] = useState<KidsChoiceId | null>(null);

  const interludeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pendingNextIndex, setPendingNextIndex] = useState(0);

  const currentQuestion = questions[questionIndex];
  const progress = useMemo(
    () => answers.length / questions.length,
    [answers.length],
  );

  const reset = useCallback(() => {
    if (interludeTimer.current) clearTimeout(interludeTimer.current);
    setQuestionIndex(0);
    setAnswers([]);
    setResult(null);
    setText(null);
    setTextSource(null);
    setKidsActive(false);
    setKidsDeclined(false);
    setKidsChoiceId(null);
  }, []);

  const start = useCallback(() => {
    reset();
    setStage("quiz");
    track("diagnosis_start");
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [reset]);

  const finish = useCallback(async (finalAnswers: Answer[]) => {
    setStage("brewing");
    const diagnosisResult = diagnose(finalAnswers);
    setResult(diagnosisResult);

    const localRecommendation = recommend(
      diagnosisResult.main,
      finalAnswers,
      null,
    );
    const localFallback = buildFallbackText(
      diagnosisResult.main,
      diagnosisResult.hidden,
      finalAnswers,
      localRecommendation.reason,
    );

    const [remote] = await Promise.all([
      requestText(finalAnswers, null),
      delay(MIN_BREWING_MS),
    ]);

    setText(remote?.text ?? localFallback);
    setTextSource(remote?.source ?? "fallback");
    setStage("result");

    track("diagnosis_complete", {
      teaType: diagnosisResult.main,
      meta: {
        hidden: diagnosisResult.hidden,
        mainTiebreak: diagnosisResult.mainTiebreak ?? "no-tie",
        textSource: remote?.source ?? "fallback",
      },
    });
    track("recommendation_view", {
      teaType: diagnosisResult.main,
      meta: { setId: localRecommendation.setId },
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  const advanceTo = useCallback((nextIndex: number) => {
    if (interludeTimer.current) clearTimeout(interludeTimer.current);
    setQuestionIndex(nextIndex);
    setStage("quiz");
  }, []);

  const choose = useCallback(
    (choice: Choice) => {
      if (stage !== "quiz") return;
      const answer: Answer = {
        questionId: currentQuestion.id,
        choiceId: choice.id,
      };
      const nextAnswers = [...answers, answer];
      setAnswers(nextAnswers);
      track("question_answered", {
        meta: {
          questionId: currentQuestion.id,
          choiceId: choice.id,
          index: questionIndex + 1,
        },
      });

      if (questionIndex === questions.length - 1) {
        void finish(nextAnswers);
        return;
      }

      const nextIndex = questionIndex + 1;
      if (interludes[questionIndex]) {
        setPendingNextIndex(nextIndex);
        setStage("interlude");
        interludeTimer.current = setTimeout(() => advanceTo(nextIndex), INTERLUDE_MS);
        return;
      }
      advanceTo(nextIndex);
    },
    [stage, currentQuestion, answers, questionIndex, finish, advanceTo],
  );

  const skipInterlude = useCallback(() => {
    if (stage === "interlude") advanceTo(pendingNextIndex);
  }, [stage, advanceTo, pendingNextIndex]);

  const chooseKids = useCallback(
    (id: KidsChoiceId) => {
      setKidsChoiceId(id);
      track("kids_mode_used", { meta: { choiceId: id } });
    },
    [],
  );

  const openKids = useCallback(() => setKidsActive(true), []);
  const declineKids = useCallback(() => setKidsDeclined(true), []);
  /** 「選びなおす」用。質問自体は表示したまま、選んだ回答だけ消す。 */
  const resetKidsChoice = useCallback(() => setKidsChoiceId(null), []);

  const restart = useCallback(() => {
    reset();
    setStage("intro");
  }, [reset]);

  return {
    stage,
    questionIndex,
    currentQuestion,
    answers,
    progress,
    interludeMessage: interludes[pendingNextIndex - 1] ?? null,
    result,
    text,
    textSource,
    kids: { active: kidsActive, declined: kidsDeclined, choiceId: kidsChoiceId },
    actions: {
      start,
      choose,
      skipInterlude,
      openKids,
      declineKids,
      resetKidsChoice,
      chooseKids,
      restart,
    },
  };
}
