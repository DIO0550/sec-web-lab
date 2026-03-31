// 採点ロジック（純粋関数）

import type {
  Question,
  Answer,
  GradingResult,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  OrderingQuestion,
  FillInBlankQuestion,
} from "./types";

/** FillInBlank 用の正規化: NFKC正規化 + trim + 小文字化 + 連続空白の圧縮 */
function normalizeText(text: string): string {
  return text.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
}

function gradeMultipleChoice(
  question: MultipleChoiceQuestion,
  answer: Answer | undefined,
): boolean {
  if (!answer || answer.type !== "multiple-choice") return false;
  return answer.selectedIndex === question.correctIndex;
}

function gradeTrueFalse(
  question: TrueFalseQuestion,
  answer: Answer | undefined,
): boolean {
  if (!answer || answer.type !== "true-false") return false;
  return answer.selectedValue === question.correctAnswer;
}

function gradeOrdering(
  question: OrderingQuestion,
  answer: Answer | undefined,
): boolean {
  if (!answer || answer.type !== "ordering") return false;
  const { currentOrder } = answer;
  const { correctOrder } = question;
  if (currentOrder.length !== correctOrder.length) return false;
  return currentOrder.every((val, idx) => val === correctOrder[idx]);
}

function gradeFillInBlank(
  question: FillInBlankQuestion,
  answer: Answer | undefined,
): boolean {
  if (!answer || answer.type !== "fill-in-blank") return false;
  const normalized = normalizeText(answer.inputValue);
  if (normalized === "") return false;
  return question.correctAnswers.some(
    (correct) => normalizeText(correct) === normalized,
  );
}

/** 正解の表示用文字列を生成 */
function getCorrectAnswerText(question: Question): string {
  switch (question.type) {
    case "multiple-choice":
      return question.options[question.correctIndex];
    case "true-false":
      return question.correctAnswer ? "True" : "False";
    case "ordering":
      return question.correctOrder
        .map((idx) => question.items[idx])
        .join(" → ");
    case "fill-in-blank":
      return question.correctAnswers.join(" / ");
  }
}

/** 1問を採点 */
export function gradeQuestion(
  question: Question,
  answer: Answer | undefined,
): GradingResult {
  let isCorrect: boolean;
  switch (question.type) {
    case "multiple-choice":
      isCorrect = gradeMultipleChoice(question, answer);
      break;
    case "true-false":
      isCorrect = gradeTrueFalse(question, answer);
      break;
    case "ordering":
      isCorrect = gradeOrdering(question, answer);
      break;
    case "fill-in-blank":
      isCorrect = gradeFillInBlank(question, answer);
      break;
  }
  return {
    questionId: question.id,
    isCorrect,
    isUnanswered: answer === undefined,
    correctAnswer: getCorrectAnswerText(question),
  };
}

/** 全問一括採点 */
export function gradeAll(
  questions: Question[],
  answers: Map<string, Answer>,
): GradingResult[] {
  return questions.map((q) => gradeQuestion(q, answers.get(q.id)));
}
