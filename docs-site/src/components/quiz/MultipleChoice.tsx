import type { MultipleChoiceQuestion, GradingResult } from "./types";
import styles from "./MultipleChoice.module.css";

type Props = {
  question: MultipleChoiceQuestion;
  questionNumber: number;
  selectedOption: number | undefined;
  result: GradingResult | undefined;
  onSelect: (questionId: string, optionIndex: number) => void;
};

export default function MultipleChoice({
  question,
  questionNumber,
  selectedOption,
  result,
  onSelect,
}: Props) {
  const graded = result !== undefined;

  return (
    <div className={styles.container}>
      <p className={styles.questionText}>
        <span className={styles.questionNumber}>Q{questionNumber}.</span>
        {question.text}
      </p>
      <div className={styles.options}>
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = graded && index === question.correctIndex;
          const isWrong = graded && isSelected && !isCorrect;

          let className = styles.option;
          if (isSelected && !graded) className += ` ${styles.selected}`;
          if (isCorrect) className += ` ${styles.correct}`;
          if (isWrong) className += ` ${styles.wrong}`;

          return (
            <button
              key={index}
              className={className}
              onClick={() => !graded && onSelect(question.id, index)}
              disabled={graded}
              type="button"
            >
              <span className={styles.optionLabel}>
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          );
        })}
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
            <a
              href={question.referenceLink}
              className={styles.referenceLink}
            >
              関連ページを見る →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
