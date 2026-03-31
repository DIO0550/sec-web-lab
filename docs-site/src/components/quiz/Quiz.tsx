import { useState, useCallback } from "react";
import type { QuizData, Answer, GradingResult } from "./types";
import { gradeAll } from "./grading";
import MultipleChoice from "./MultipleChoice";
import TrueFalse from "./TrueFalse";
import Ordering from "./Ordering";
import FillInBlank from "./FillInBlank";
import QuizResult from "./QuizResult";
import styles from "./Quiz.module.css";

type Props = {
  data: QuizData;
};

/** クイズコンテナコンポーネント。回答状態の管理と採点制御を行う */
export default function Quiz({ data }: Props) {
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [results, setResults] = useState<GradingResult[] | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const graded = results !== null;

  /** 回答を更新する */
  const updateAnswer = useCallback((questionId: string, answer: Answer) => {
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionId, answer);
      return next;
    });
  }, []);

  /** 選択式の回答ハンドラ */
  const handleMultipleChoiceSelect = useCallback(
    (questionId: string, optionIndex: number) => {
      updateAnswer(questionId, {
        type: "multiple-choice",
        selectedIndex: optionIndex,
      });
    },
    [updateAnswer],
  );

  /** 正誤判定の回答ハンドラ */
  const handleTrueFalseSelect = useCallback(
    (questionId: string, value: boolean) => {
      updateAnswer(questionId, { type: "true-false", selectedValue: value });
    },
    [updateAnswer],
  );

  /** 並べ替えの回答ハンドラ */
  const handleReorder = useCallback(
    (questionId: string, newOrder: number[]) => {
      updateAnswer(questionId, { type: "ordering", currentOrder: newOrder });
    },
    [updateAnswer],
  );

  /** 穴埋めの回答ハンドラ。空文字の場合は未回答扱いにする */
  const handleInput = useCallback(
    (questionId: string, text: string) => {
      if (text.trim() === "") {
        setAnswers((prev) => {
          const next = new Map(prev);
          next.delete(questionId);
          return next;
        });
      } else {
        updateAnswer(questionId, { type: "fill-in-blank", inputValue: text });
      }
    },
    [updateAnswer],
  );

  /** 採点を実行する */
  const doGrade = useCallback(() => {
    setResults(gradeAll(data.questions, answers));
    setShowWarning(false);
  }, [data.questions, answers]);

  /** 採点ボタンのハンドラ。未回答チェックを行う */
  const handleGrade = useCallback(() => {
    const unansweredCount = data.questions.filter(
      (q) => !answers.has(q.id),
    ).length;
    if (unansweredCount > 0) {
      setShowWarning(true);
    } else {
      doGrade();
    }
  }, [data.questions, answers, doGrade]);

  /** 全回答をリセットする */
  const handleReset = useCallback(() => {
    setAnswers(new Map());
    setResults(null);
    setShowWarning(false);
  }, []);

  /** 問題の採点結果を取得する */
  const getResult = (questionId: string): GradingResult | undefined =>
    results?.find((r) => r.questionId === questionId);

  return (
    <div className={styles.container}>
      <div className={styles.questions}>
        {data.questions.map((question, index) => {
          const questionNumber = index + 1;
          switch (question.type) {
            case "multiple-choice": {
              const answer = answers.get(question.id);
              return (
                <MultipleChoice
                  key={question.id}
                  question={question}
                  questionNumber={questionNumber}
                  selectedOption={
                    answer?.type === "multiple-choice"
                      ? answer.selectedIndex
                      : undefined
                  }
                  result={getResult(question.id)}
                  onSelect={handleMultipleChoiceSelect}
                />
              );
            }
            case "true-false": {
              const answer = answers.get(question.id);
              return (
                <TrueFalse
                  key={question.id}
                  question={question}
                  questionNumber={questionNumber}
                  selectedValue={
                    answer?.type === "true-false"
                      ? answer.selectedValue
                      : undefined
                  }
                  result={getResult(question.id)}
                  onSelect={handleTrueFalseSelect}
                />
              );
            }
            case "ordering": {
              const answer = answers.get(question.id);
              return (
                <Ordering
                  key={question.id}
                  question={question}
                  questionNumber={questionNumber}
                  currentOrder={
                    answer?.type === "ordering"
                      ? answer.currentOrder
                      : undefined
                  }
                  result={getResult(question.id)}
                  onReorder={handleReorder}
                />
              );
            }
            case "fill-in-blank": {
              const answer = answers.get(question.id);
              return (
                <FillInBlank
                  key={question.id}
                  question={question}
                  questionNumber={questionNumber}
                  inputValue={
                    answer?.type === "fill-in-blank" ? answer.inputValue : ""
                  }
                  result={getResult(question.id)}
                  onInput={handleInput}
                />
              );
            }
          }
        })}
      </div>

      {!graded && (
        <div className={styles.actions}>
          {showWarning && (
            <div className={styles.warning}>
              <p className={styles.warningText}>
                未回答の問題があります。そのまま採点しますか？
              </p>
              <div className={styles.warningButtons}>
                <button
                  className={styles.warningButtonGrade}
                  onClick={doGrade}
                  type="button"
                >
                  そのまま採点する
                </button>
                <button
                  className={styles.warningButtonBack}
                  onClick={() => setShowWarning(false)}
                  type="button"
                >
                  戻って回答する
                </button>
              </div>
            </div>
          )}
          {!showWarning && (
            <button
              className={styles.gradeButton}
              onClick={handleGrade}
              type="button"
            >
              採点する
            </button>
          )}
        </div>
      )}

      {graded && results && (
        <QuizResult
          results={results}
          totalQuestions={data.questions.length}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
