// クイズデータ・回答・採点の型定義

/** 選択式（4択）問題 */
export type MultipleChoiceQuestion = {
  id: string;
  type: "multiple-choice";
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  referenceLink?: string;
};

/** 正誤判定問題 */
export type TrueFalseQuestion = {
  id: string;
  type: "true-false";
  text: string;
  correctAnswer: boolean;
  explanation: string;
  referenceLink?: string;
};

/** 並べ替え問題 */
export type OrderingQuestion = {
  id: string;
  type: "ordering";
  text: string;
  items: string[];
  /** 正解の並び順（items のインデックス配列） */
  correctOrder: number[];
  /** 初期表示の並び順（correctOrder と異なる並びであること） */
  initialOrder: number[];
  explanation: string;
  referenceLink?: string;
};

/** 穴埋め問題 */
export type FillInBlankQuestion = {
  id: string;
  type: "fill-in-blank";
  text: string;
  /** 正解の候補（複数パターン対応） */
  correctAnswers: string[];
  explanation: string;
  referenceLink?: string;
};

/** 問題の判別共用体 */
export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | OrderingQuestion
  | FillInBlankQuestion;

/** クイズ全体のデータ */
export type QuizData = {
  title: string;
  description: string;
  questions: Question[];
};

/** 各問題タイプに対応する回答値 */
export type Answer =
  | { type: "multiple-choice"; selectedIndex: number }
  | { type: "true-false"; selectedValue: boolean }
  | { type: "ordering"; currentOrder: number[] }
  | { type: "fill-in-blank"; inputValue: string };

/** 採点結果 */
export type GradingResult = {
  questionId: string;
  isCorrect: boolean;
  /** 未回答だったかどうか */
  isUnanswered: boolean;
  /** 表示用の正解文字列 */
  correctAnswer: string;
};
