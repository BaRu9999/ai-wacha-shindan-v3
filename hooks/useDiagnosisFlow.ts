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
import {
  recommend,
  type Recommendation,
  type RecommendationMode,
} from "@/lib/recommendation";
import { buildFallbackText } from "@/lib/fallback";
import { parseDiagnosisText } from "@/lib/ai-schema";
import { track } from "@/lib/analytics";

/**
 * 診断フローの状態機械（仕様1・2）。
 *
 * 子ども連れの分岐は、必ず「結果を作る前」に確定させる。
 * 6問診断が終わった直後は、結果もおすすめ商品もまだ生成しない。
 *
 *   quiz(6問目) ──┬─ 親子モードで開始 ───────────────┐
 *                 └─ 通常モード → kids-gate            │
 *                       ├─ いいえ ──────────────┐     │
 *                       └─ はい ─────────────────┼─ kids-question
 *                                                  │        │
 *                                                  │   kids-reveal（短い演出）
 *                                                  │        │
 *                                                  └────────┴─→ brewing → result
 *
 * result 画面に着く時点で、メインタイプ・おすすめ商品・結果文はすべて確定済み。
 * 「結果表示後に商品が静かに変わる」ことはしない。
 */
export type FlowStage =
  | "intro"
  | "quiz"
  | "interlude"
  | "kids-gate"
  | "kids-question"
  | "kids-reveal"
  | "brewing"
  | "result";

/** TOP画面の入口（仕様3）。"parent-child" は kids-gate を飛ばして直接 kids-question へ。 */
export type KidsEntryMode = "auto" | "parent-child";

const MIN_BREWING_MS = 1_200; // 仕様11: 1〜1.5秒程度で十分。待たされている感を作らない。
const REQUEST_TIMEOUT_MS = 9_000;
const INTERLUDE_MS = 1_300;
const KIDS_REVEAL_MS = 1_200;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function requestText(
  answers: Answer[],
  kidsChoiceId: KidsChoiceId | null,
  mode: RecommendationMode,
): Promise<{ text: DiagnosisText; source: DiagnosisTextSource } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch("/api/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, kidsChoiceId, mode }),
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

export function useDiagnosisFlow(mode: RecommendationMode = "table") {
  const [stage, setStage] = useState<FlowStage>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [kidsEntry, setKidsEntry] = useState<KidsEntryMode>("auto");
  const [kidsChoiceId, setKidsChoiceId] = useState<KidsChoiceId | null>(null);

  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [text, setText] = useState<DiagnosisText | null>(null);
  const [textSource, setTextSource] = useState<DiagnosisTextSource | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  const interludeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pendingNextIndex, setPendingNextIndex] = useState(0);

  const currentQuestion = questions[questionIndex];
  const progress = useMemo(
    () => answers.length / questions.length,
    [answers.length],
  );

  const clearTimers = useCallback(() => {
    if (interludeTimer.current) clearTimeout(interludeTimer.current);
    if (revealTimer.current) clearTimeout(revealTimer.current);
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setQuestionIndex(0);
    setAnswers([]);
    setKidsEntry("auto");
    setKidsChoiceId(null);
    setResult(null);
    setText(null);
    setTextSource(null);
    setRecommendation(null);
  }, [clearTimers]);

  const start = useCallback(
    (entry: KidsEntryMode = "auto") => {
      reset();
      setKidsEntry(entry);
      setStage("quiz");
      track("diagnosis_start", { meta: { entry } });
      if (entry === "parent-child") track("kids_mode_selected");
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    },
    [reset],
  );

  /** 結果を作る本体。この時点で kidsChoiceId は必ず確定している（仕様1）。 */
  const finish = useCallback(
    async (finalAnswers: Answer[], finalKidsChoiceId: KidsChoiceId | null) => {
      setStage("brewing");
      const diagnosisResult = diagnose(finalAnswers);
      setResult(diagnosisResult);

      const finalRecommendation = recommend(
        diagnosisResult.main,
        finalAnswers,
        finalKidsChoiceId,
        mode,
      );
      const localFallback = buildFallbackText(
        diagnosisResult.main,
        diagnosisResult.hidden,
        finalAnswers,
        finalRecommendation.reason,
      );

      const [remote] = await Promise.all([
        requestText(finalAnswers, finalKidsChoiceId, mode),
        delay(MIN_BREWING_MS),
      ]);

      setText(remote?.text ?? localFallback);
      setTextSource(remote?.source ?? "fallback");
      setRecommendation(finalRecommendation);
      setStage("result");

      track("diagnosis_complete", {
        teaType: diagnosisResult.main,
        meta: {
          hidden: diagnosisResult.hidden,
          mainTiebreak: diagnosisResult.mainTiebreak ?? "no-tie",
          textSource: remote?.source ?? "fallback",
          kids: finalKidsChoiceId ?? "none",
        },
      });
      track("recommendation_view", {
        teaType: diagnosisResult.main,
        meta: { setId: finalRecommendation.setId, mode },
      });

      if (finalKidsChoiceId) {
        const baseRecommendation = recommend(diagnosisResult.main, finalAnswers, null, mode);
        if (baseRecommendation.setId !== finalRecommendation.setId) {
          track("recommendation_changed_by_kids", {
            teaType: diagnosisResult.main,
            meta: { from: baseRecommendation.setId, to: finalRecommendation.setId },
          });
        }
      }

      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    },
    [mode],
  );

  const advanceTo = useCallback((nextIndex: number) => {
    clearTimers();
    setQuestionIndex(nextIndex);
    setStage("quiz");
  }, [clearTimers]);

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
        // 6問完了。結果はまだ作らない（仕様1）。
        if (kidsEntry === "parent-child") {
          setStage("kids-question");
        } else {
          setStage("kids-gate");
        }
        if (typeof window !== "undefined") window.scrollTo({ top: 0 });
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
    [stage, currentQuestion, answers, questionIndex, kidsEntry, advanceTo],
  );

  const skipInterlude = useCallback(() => {
    if (stage === "interlude") advanceTo(pendingNextIndex);
  }, [stage, advanceTo, pendingNextIndex]);

  const acceptKidsGate = useCallback(() => {
    if (stage === "kids-gate") setStage("kids-question");
  }, [stage]);

  const declineKidsGate = useCallback(() => {
    if (stage !== "kids-gate") return;
    void finish(answers, null);
  }, [stage, answers, finish]);

  const chooseKids = useCallback(
    (id: KidsChoiceId) => {
      if (stage !== "kids-question") return;
      setKidsChoiceId(id);
      track("kids_question_answered", { meta: { choiceId: id } });
      setStage("kids-reveal");
      revealTimer.current = setTimeout(() => {
        void finish(answers, id);
      }, KIDS_REVEAL_MS);
    },
    [stage, answers, finish],
  );

  const skipKidsReveal = useCallback(() => {
    if (stage !== "kids-reveal" || !kidsChoiceId) return;
    if (revealTimer.current) clearTimeout(revealTimer.current);
    void finish(answers, kidsChoiceId);
  }, [stage, kidsChoiceId, answers, finish]);

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
    recommendation,
    kidsChoiceId,
    actions: {
      start,
      choose,
      skipInterlude,
      acceptKidsGate,
      declineKidsGate,
      chooseKids,
      skipKidsReveal,
      restart,
    },
  };
}
