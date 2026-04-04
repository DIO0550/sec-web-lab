import type { QuizData } from "../../components/quiz/types";

/**
 * 入力処理の基礎の理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "入力処理の基礎 - 理解度テスト",
  description:
    "バリデーション・サニタイズ・エスケープの違いと使い分けについての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "入力値の検証方式として、ホワイトリスト（許可リスト）方式がブラックリスト（拒否リスト）方式よりも推奨される理由はどれか？",
      options: [
        "ホワイトリスト方式の方が処理速度が速いから",
        "ブラックリスト方式では危険な値の列挙に漏れが生じやすく、大文字小文字の混合やエンコーディングで迂回されるリスクがあるから",
        "ブラックリスト方式はプログラミング言語のサポートがないから",
        "ホワイトリスト方式ではバリデーションが不要になるから",
      ],
      correctIndex: 1,
      explanation:
        "ブラックリスト方式では、危険な値をすべて列挙する必要がありますが、大文字小文字の混合（DRoP）、エンコーディング（%44ROP）などの方法で迂回される可能性があります。ホワイトリストでは許可する値のみを定義するため、未知の攻撃パターンにも対応できます。",
      referenceLink: "/foundations/input-handling/input-basics",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "SQLインジェクション対策として最も確実な方法はどれか？",
      options: [
        "ユーザー入力からシングルクォートを除去する",
        "ユーザー入力の長さを制限する",
        "プレースホルダ（パラメータ化クエリ）を使用する",
        "ユーザー入力をBase64エンコードしてからSQLに渡す",
      ],
      correctIndex: 2,
      explanation:
        "プレースホルダ（パラメータ化クエリ）を使用すると、ユーザー入力がどんな値でもSQL構文として解釈されません。文字列連結でSQLを組み立てることがSQLインジェクションの根本原因であり、プレースホルダはこれを構造的に防止します。",
      referenceLink: "/foundations/input-handling/input-basics",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "エスケープ処理は入力時に一度行えば、どの出力先（HTML、SQL、URL等）でも安全である。",
      correctAnswer: false,
      explanation:
        "同じデータでも出力先の文脈によって必要なエスケープは異なります。HTML、SQL、URL、JavaScriptなど、それぞれの文脈に応じたエスケープが必要です。例えば、HTMLエスケープ済みのデータをそのままSQL文に使用するとSQLインジェクションが起きる可能性があります。",
      referenceLink: "/foundations/input-handling/input-basics",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "サニタイズはバリデーションとは異なり、不正な入力を拒否するのではなく危険な部分を除去・無害化する処理である。",
      correctAnswer: true,
      explanation:
        "バリデーションは入力が期待する形式かをチェックし不正なら拒否する処理、サニタイズは危険な部分を除去または無害化する処理です。バリデーションが「拒否」であるのに対し、サニタイズは「浄化」です。",
      referenceLink: "/foundations/input-handling/input-basics",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "防御の多層戦略として、入力から出力までの処理順序を正しく並べ替えてください。",
      items: [
        "バリデーション（形式チェック、不正な入力を拒否）",
        "サニタイズ（危険な部分を除去、必要な場合のみ）",
        "ビジネスロジック処理",
        "エスケープ（出力先の文脈に応じて特殊文字を変換）",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [3, 1, 0, 2],
      explanation:
        "入力処理は「バリデーション→サニタイズ→ビジネスロジック→エスケープ」の順で行います。入力時にバリデーションとサニタイズを行い、出力時にエスケープを行うことで、多層的な防御を実現します。",
      referenceLink: "/foundations/input-handling/input-basics",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "HTMLで `<` を安全に表示するためのHTMLエンティティは ______ である。",
      correctAnswers: ["&lt;", "&LT;"],
      explanation:
        "HTMLエスケープでは、< を &lt; に変換します。これにより、ブラウザがタグの開始として解釈することを防ぎ、テキストとして表示されます。XSS対策の基本的なエスケープの一つです。",
      referenceLink: "/foundations/input-handling/input-basics",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "リッチテキストのサニタイズに推奨される検証済みライブラリの名前は ______ である。",
      correctAnswers: ["DOMPurify", "dompurify", "domPurify"],
      explanation:
        "DOMPurifyは、HTMLの一部を許可しつつ危険なコードを除去する検証済みのサニタイズライブラリです。自前でサニタイズ処理を実装すると、迂回される可能性が高いため、信頼性の高いライブラリを使用すべきです。",
      referenceLink: "/foundations/input-handling/input-basics",
    },
  ],
} satisfies QuizData;
