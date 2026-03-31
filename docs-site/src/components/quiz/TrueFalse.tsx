import type { TrueFalseQuestion, GradingResult } from "./types";
import styles from "./TrueFalse.module.css";

type Props = {
  question: TrueFalseQuestion;
  questionNumber: number;
  selectedValue: boolean | undefined;
  result: GradingResult | undefined;
  onSelect: (questionId: string, value: boolean) => void;
};

export default function TrueFalse({
  question,
  questionNumber,
  selectedValue,
  result,
  onSelect,
}: Props) {
  const graded = result !== undefined;

  const getButtonClass = (value: boolean) => {
    const isSelected = selectedValue === value;
    const isCorrect = graded && value === question.correctAnswer;
    const isWrong = graded && isSelected && !isCorrect;

    let className = styles.button;
    if (isSelected && !graded) className += ` ${styles.selected}`;
    if (isCorrect) className += ` ${styles.correct}`;
    if (isWrong) className += ` ${styles.wrong}`;
    return className;
  };

  return (
    <div className={styles.container}>
      <p className={styles.questionText}>
        <span className={styles.questionNumber}>Q{questionNumber}.</span>
        {question.text}
      </p>
      <div className={styles.buttons}>
        <button
          className={getButtonClass(true)}
          onClick={() => !graded && onSelect(question.id, true)}
          disabled={graded}
          type="button"
        >
          True
        </button>
        <button
          className={getButtonClass(false)}
          onClick={() => !graded && onSelect(question.id, false)}
          disabled={graded}
          type="button"
        >
          False
        </button>
      </div>
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
