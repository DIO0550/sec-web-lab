import { useState, useRef } from "react";
import type { OrderingQuestion, GradingResult } from "./types";
import styles from "./Ordering.module.css";

type Props = {
  question: OrderingQuestion;
  questionNumber: number;
  currentOrder: number[] | undefined;
  result: GradingResult | undefined;
  onReorder: (questionId: string, newOrder: number[]) => void;
};

/** 並べ替え問題コンポーネント。ドラッグ＆ドロップと上下ボタンで項目を移動する */
export default function Ordering({
  question,
  questionNumber,
  currentOrder,
  result,
  onReorder,
}: Props) {
  const graded = result !== undefined;
  const displayOrder = currentOrder ?? question.initialOrder;

  // ドラッグ中の状態管理
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragNode = useRef<HTMLLIElement | null>(null);

  /** 項目を上下に移動する */
  const moveItem = (fromIndex: number, direction: -1 | 1) => {
    const toIndex = fromIndex + direction;
    const newOrder = [...displayOrder];
    [newOrder[fromIndex], newOrder[toIndex]] = [
      newOrder[toIndex],
      newOrder[fromIndex],
    ];
    onReorder(question.id, newOrder);
  };

  /** ドラッグ開始 */
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, position: number) => {
    dragNode.current = e.currentTarget;
    setDragIndex(position);
    // ドラッグ中のゴースト画像を半透明にする
    e.dataTransfer.effectAllowed = "move";
    // 次のフレームでスタイル適用（ゴースト画像に反映させないため）
    requestAnimationFrame(() => {
      setDragIndex(position);
    });
  };

  /** ドラッグ中に別の項目に重なった時 */
  const handleDragEnter = (position: number) => {
    if (dragIndex === null || dragIndex === position) return;
    setDragOverIndex(position);

    const newOrder = [...displayOrder];
    const [movedItem] = newOrder.splice(dragIndex, 1);
    newOrder.splice(position, 0, movedItem);
    setDragIndex(position);
    onReorder(question.id, newOrder);
  };

  /** ドラッグ終了 */
  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragNode.current = null;
  };

  /** dragover のデフォルト挙動を防止（ドロップを許可するため） */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className={styles.container}>
      <p className={styles.questionText}>
        <span className={styles.questionNumber}>Q{questionNumber}.</span>
        {question.text}
      </p>
      <ol className={styles.itemList}>
        {displayOrder.map((itemIndex, position) => {
          const isDragging = dragIndex === position;
          const isDragOver = dragOverIndex === position;

          let itemClass = styles.item;
          if (!graded) itemClass += ` ${styles.draggable}`;
          if (isDragging) itemClass += ` ${styles.dragging}`;
          if (isDragOver) itemClass += ` ${styles.dragOver}`;

          return (
            <li
              key={itemIndex}
              className={itemClass}
              draggable={!graded}
              onDragStart={(e) => handleDragStart(e, position)}
              onDragEnter={() => handleDragEnter(position)}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <span className={styles.dragHandle}>
                {!graded && "⠿"}
              </span>
              <span className={styles.itemText}>
                {question.items[itemIndex]}
              </span>
              {!graded && (
                <span className={styles.moveButtons}>
                  <button
                    className={styles.moveButton}
                    onClick={() => moveItem(position, -1)}
                    disabled={position === 0}
                    type="button"
                    aria-label="上に移動"
                  >
                    ▲
                  </button>
                  <button
                    className={styles.moveButton}
                    onClick={() => moveItem(position, 1)}
                    disabled={position === displayOrder.length - 1}
                    type="button"
                    aria-label="下に移動"
                  >
                    ▼
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
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
