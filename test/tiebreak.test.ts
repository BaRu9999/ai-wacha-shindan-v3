import { describe, expect, it } from "vitest";
import type { Answer, TeaKey } from "@/types";
import { TEA_KEYS } from "@/types";
import { choiceById } from "@/data/questions";
import {
  TIEBREAK_PRIORITY,
  breakTie,
  diagnose,
  scoreAnswers,
} from "@/lib/diagnosis";
import { allAnswerPatterns } from "@/lib/simulate";

/**
 * 仕様5・27-2: 同点時のタイブレークテスト。
 * 「オブジェクト順・配列順で勝手に決めない」ことと、明示ルールの順序を検証する。
 */

function topTiedKeys(answers: Answer[]): TeaKey[] {
  const scores = scoreAnswers(answers);
  const max = Math.max(...TEA_KEYS.map((key) => scores[key]));
  return TEA_KEYS.filter((key) => scores[key] === max);
}

describe("TIEBREAK_PRIORITY（明示的サブルール）", () => {
  it("固定の順序である（出にくい側を前に置く）", () => {
    expect([...TIEBREAK_PRIORITY]).toEqual([
      "rooibos",
      "biwa",
      "kuwacha",
      "wakoucha",
      "hojicha",
      "matcha",
    ]);
  });
});

describe("breakTie の単体挙動", () => {
  const answers: Answer[] = [
    { questionId: "q1", choiceId: "q1a" }, // main: matcha / sub: biwa
    { questionId: "q2", choiceId: "q2a" },
    { questionId: "q3", choiceId: "q3a" },
    { questionId: "q4", choiceId: "q4a" },
    { questionId: "q5", choiceId: "q5a" },
    { questionId: "q6", choiceId: "q6b" }, // main: kuwacha / sub: matcha
  ];

  it("候補が1つなら no-tie で即決", () => {
    expect(breakTie(["wakoucha"], answers)).toEqual({
      key: "wakoucha",
      reason: "no-tie",
    });
  });

  it("Q1 の main が候補にあれば最優先で採用", () => {
    expect(breakTie(["matcha", "kuwacha", "biwa"], answers)).toEqual({
      key: "matcha",
      reason: "q1-main",
    });
  });

  it("Q1 が効かなければ Q6 の main を採用", () => {
    expect(breakTie(["kuwacha", "wakoucha"], answers)).toEqual({
      key: "kuwacha",
      reason: "q6-main",
    });
  });

  it("Q1/Q6 の main が効かなければ Q1 の sub を採用", () => {
    // Q1a の sub は biwa
    expect(breakTie(["biwa", "wakoucha"], answers)).toEqual({
      key: "biwa",
      reason: "q1-sub",
    });
  });

  it("どのヒントも効かなければ TIEBREAK_PRIORITY 順", () => {
    // 候補 wakoucha / hojicha は Q1・Q6 の main/sub いずれでもない → priority 順で wakoucha
    expect(breakTie(["hojicha", "wakoucha"], answers)).toEqual({
      key: "wakoucha",
      reason: "priority-order",
    });
  });
});

describe("総当たりでの整合性", () => {
  it("main と hidden は必ず異なる", () => {
    for (const answers of allAnswerPatterns()) {
      const result = diagnose(answers);
      expect(result.main).not.toBe(result.hidden);
    }
  });

  it("同じ回答なら常に同じ結果（決定論）", () => {
    let checked = 0;
    for (const answers of allAnswerPatterns()) {
      const a = diagnose(answers);
      const b = diagnose(answers);
      expect(b).toEqual(a);
      checked += 1;
      if (checked >= 200) break;
    }
    expect(checked).toBe(200);
  });

  it("q1-main で決まったケースは、Q1回答の main が同点集合に含まれ、それが採用されている", () => {
    let seen = 0;
    for (const answers of allAnswerPatterns()) {
      const result = diagnose(answers);
      if (result.mainTiebreak !== "q1-main") continue;
      const tied = topTiedKeys(answers);
      const q1Main = choiceById[answers[0].choiceId].main;
      expect(tied).toContain(q1Main);
      expect(result.main).toBe(q1Main);
      seen += 1;
    }
    expect(seen).toBeGreaterThan(0);
  });

  it("priority-order で決まったケースは、同点集合の TIEBREAK_PRIORITY 先頭が採用されている", () => {
    let seen = 0;
    for (const answers of allAnswerPatterns()) {
      const result = diagnose(answers);
      if (result.mainTiebreak !== "priority-order") continue;
      const tied = topTiedKeys(answers);
      const expected = TIEBREAK_PRIORITY.find((key) => tied.includes(key));
      expect(result.main).toBe(expected);
      // このケースでは Q1/Q6 の main/sub は同点集合に入っていないはず
      const q1 = choiceById[answers[0].choiceId];
      const q6 = choiceById[answers[5].choiceId];
      expect(tied).not.toContain(q1.main);
      expect(tied).not.toContain(q6.main);
      seen += 1;
    }
    expect(seen).toBeGreaterThan(0);
  });
});
