import type { GradingResult } from "./types";
import styles from "./QuizResult.module.css";

type Props = {
  results: GradingResult[];
  totalQuestions: number;
  onReset: () => void;
};

/** 採点結果サマリーコンポーネント */
export default function QuizResult({ results, totalQuestions, onReset }: Props) {
  const correctCount = results.filter((r) => r.isCorrect).length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const isPerfect = correctCount === totalQuestions;

  return (
    <div className={styles.container}>
      <div className={`${styles.scoreCard} ${isPerfect ? styles.perfect : ""}`}>
        <p className={styles.scoreLabel}>スコア</p>
        <p className={styles.scoreValue}>
          {correctCount} / {totalQuestions}
        </p>
        <p className={styles.percentage}>{percentage}%</p>
        {isPerfect && (
          <p className={styles.perfectMessage}>全問正解！すばらしい！</p>
        )}
      </div>
      <button className={styles.resetButton} onClick={onReset} type="button">
        もう一度チャレンジする
      </button>
    </div>
  );
}
