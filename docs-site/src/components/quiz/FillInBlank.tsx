import type { FillInBlankQuestion, GradingResult } from "./types";
import styles from "./FillInBlank.module.css";

type Props = {
  question: FillInBlankQuestion;
  questionNumber: number;
  inputValue: string;
  result: GradingResult | undefined;
  onInput: (questionId: string, text: string) => void;
};

/** 穴埋め問題コンポーネント */
export default function FillInBlank({
  question,
  questionNumber,
  inputValue,
  result,
  onInput,
}: Props) {
  const graded = result !== undefined;

  return (
    <div className={styles.container}>
      <p className={styles.questionText}>
        <span className={styles.questionNumber}>Q{questionNumber}.</span>
        {question.text}
      </p>
      <input
        className={`${styles.input} ${graded ? (result.isCorrect ? styles.inputCorrect : styles.inputWrong) : inputValue.trim() ? styles.inputFilled : ""}`}
        type="text"
        value={inputValue}
        onChange={(e) => onInput(question.id, e.target.value)}
        placeholder="回答を入力..."
        disabled={graded}
      />
      {graded && (
        <div
          className={`${styles.feedback} ${result.isCorrect ? styles.feedbackCorrect : result.isUnanswered ? styles.feedbackUnanswered : styles.feedbackWrong}`}
        >
          <p className={styles.feedbackStatus}>
            {result.isCorrect
              ? "✔ 正解"
              : result.isUnanswered
                ? `⚠ 未回答（正解: ${result.correctAnswer}）`
                : `✘ 不正解（正解: ${result.correctAnswer}）`}
          </p>
          <p className={styles.explanation}>{question.explanation}</p>
          {question.referenceLink && (
            <a href={question.referenceLink} className={styles.referenceLink}>
              関連ページを見る →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
