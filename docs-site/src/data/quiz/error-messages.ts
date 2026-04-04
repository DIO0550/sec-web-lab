import type { QuizData } from "../../components/quiz/types";

/**
 * 詳細エラーメッセージ露出の理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "詳細エラーメッセージ露出 - 理解度テスト",
  description:
    "詳細エラーメッセージの露出がもたらすリスク、攻撃者が得られる情報、安全なエラーハンドリングについての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "エラーレスポンスにスタックトレースやDB構造が含まれている場合、攻撃者が最も直接的に得られる情報はどれか？",
      options: [
        "ユーザーのパスワード一覧",
        "テーブル名・カラム名・ファイルパスなどの内部構造",
        "管理者のセッションCookie",
        "サーバーのroot権限",
      ],
      correctIndex: 1,
      explanation:
        "詳細エラーメッセージにはテーブル名、カラム名、ファイルパス、使用ライブラリのバージョンなどの内部構造情報が含まれることがあります。攻撃者はこれらの情報をもとにSQLインジェクションなどの二次攻撃を組み立てます。",
      referenceLink: "/step09-defense/error-messages",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "安全なエラーハンドリングとして最も適切なのはどれか？",
      options: [
        "エラーメッセージを一切返さず、空のレスポンスを返す",
        "error.messageとerror.stackをそのままJSONレスポンスに含める",
        "汎用的なエラーメッセージをクライアントに返し、詳細はサーバーログに記録する",
        "エラーが発生しないよう、すべての例外をcatchして無視する",
      ],
      correctIndex: 2,
      explanation:
        "安全なエラーハンドリングでは、クライアントには「サーバーエラーが発生しました」のような汎用メッセージのみを返し、エラーの詳細（スタックトレース、SQLクエリ等）はサーバーサイドのログにのみ記録します。",
      referenceLink: "/step09-defense/error-messages",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "NODE_ENV=production に設定していれば、すべてのフレームワークで自動的に詳細エラーメッセージが抑制される。",
      correctAnswer: false,
      explanation:
        "NODE_ENVによる自動抑制はフレームワークの実装に依存し、すべてのフレームワークが対応しているわけではありません。明示的にグローバルエラーハンドラーを設定し、エラーレスポンスの内容を制御することが必要です。",
      referenceLink: "/step09-defense/error-messages",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "個別のtry-catchだけでなく、グローバルエラーハンドラーも設定すべき理由は、catchし忘れた未処理の例外がクライアントに漏洩するのを防ぐためである。",
      correctAnswer: true,
      explanation:
        "個別のtry-catchだけでは、開発者がcatchを書き忘れたルートで未処理の例外がクライアントに到達してしまいます。グローバルエラーハンドラーはそのような漏れを防ぐ安全網として機能します。",
      referenceLink: "/step09-defense/error-messages",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "詳細エラーメッセージ露出を悪用した攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が不正なリクエスト（不正な型の値等）を送信してエラーを誘発する",
        "サーバーがスタックトレースやテーブル構造を含むエラーレスポンスを返す",
        "攻撃者がレスポンスからテーブル名・カラム名・ファイルパス等を収集する",
        "収集した情報を基にSQLインジェクションなどの二次攻撃を実行する",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [3, 0, 2, 1],
      explanation:
        "攻撃者はまず不正な入力でエラーを誘発し、レスポンスに含まれる内部情報（テーブル名、ファイルパス等）を収集します。その情報を足がかりにして、SQLインジェクションなどのより深刻な攻撃を組み立てます。",
      referenceLink: "/step09-defense/error-messages",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "エラーの詳細はサーバーサイドの ______ にのみ記録し、クライアントには汎用メッセージのみを返すべきである。",
      correctAnswers: ["ログ", "log", "Log", "LOG"],
      explanation:
        "エラーの詳細情報（スタックトレース、SQLクエリ等）はサーバーサイドのログにのみ記録します。これにより開発者はデバッグ可能な状態を維持しつつ、攻撃者に内部情報を提供しないようにできます。",
      referenceLink: "/step09-defense/error-messages",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "CWE-209 は「______ 情報を含むエラーメッセージの生成」として、この脆弱性を分類している。（漢字2文字で回答）",
      correctAnswers: ["機密", "秘密"],
      explanation:
        "CWE-209は「Generation of Error Message Containing Sensitive Information（機密情報を含むエラーメッセージの生成）」として分類されています。エラーメッセージに機密情報が含まれることで攻撃者の偵察活動を支援してしまいます。",
      referenceLink: "/step09-defense/error-messages",
    },
  ],
} satisfies QuizData;
