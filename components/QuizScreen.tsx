"use client";

import type { Choice, Question } from "@/types";
import { TeaProgress } from "./TeaProgress";
import styles from "./QuizScreen.module.css";

type Props = {
  question: Question;
  questionNumber: number;
  total: number;
  progress: number;
  onChoose: (choice: Choice) => void;
};

export function QuizScreen({
  question,
  questionNumber,
  total,
  progress,
  onChoose,
}: Props) {
  return (
    <div className={styles.screen} key={question.id} data-testid="quiz-screen">
      <div className={styles.head}>
        <TeaProgress ratio={progress} current={questionNumber} total={total} />
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          <span className={styles.qNumber}>Q{questionNumber}</span>
          <h2 className={styles.title}>{question.title}</h2>
          <span className={styles.hint}>いちばん近いものを、ひとつ選んでください</span>
        </legend>

        <ul className={styles.choices}>
          {question.choices.map((choice) => (
            <li key={choice.id}>
              <button
                type="button"
                className={styles.choice}
                onClick={() => onChoose(choice)}
              >
                <span className={styles.choiceLabel}>{choice.label}</span>
                <span className={styles.chevron} aria-hidden="true">
                  ›
                </span>
              </button>
            </li>
          ))}
        </ul>
      </fieldset>
    </div>
  );
}
