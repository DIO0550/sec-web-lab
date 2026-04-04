import type { QuizData } from "../../components/quiz/types";

/**
 * エラーメッセージからの情報漏洩 - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "エラーメッセージからの情報漏洩 - 理解度テスト",
  description:
    "エラーメッセージに含まれる内部情報の漏洩リスクと安全なエラーハンドリングについての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "エラーメッセージから漏洩した情報が攻撃者にとって最も有用になるケースはどれか？",
      options: [
        "HTTPステータスコード 500 が返されたとき",
        "エラーメッセージにテーブル名やSQL構文が含まれ、SQLインジェクションの精度が向上するとき",
        "レスポンスのContent-Typeがapplication/jsonのとき",
        "エラーメッセージが日本語で表示されたとき",
      ],
      correctIndex: 1,
      explanation:
        "エラーメッセージにテーブル名やSQL構文が含まれていると、攻撃者はDB構造を把握できます。これによりSQLインジェクション攻撃の精度が大幅に向上し、試行錯誤なしにデータを抽出できるようになります。",
      referenceLink: "/step01-recon/error-message-leakage",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "安全なエラーハンドリングの実装として最も適切なものはどれか？",
      options: [
        "エラーが発生しないようにtry-catchを使わない",
        "エラーメッセージを暗号化してクライアントに返す",
        "クライアントには汎用メッセージを返し、詳細はサーバー側のログにのみ記録する",
        "エラーが発生したらリクエストをリダイレクトする",
      ],
      correctIndex: 2,
      explanation:
        "安全な実装では、クライアントには「処理中にエラーが発生しました」のような汎用メッセージだけを返し、テーブル名やスタックトレース等の詳細はサーバー側のログに記録します。これにより開発者はデバッグ可能だが、攻撃者には情報が漏れません。",
      referenceLink: "/step01-recon/error-message-leakage",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "エラーを意図的に誘発するには高度な技術スキルが必要であり、一般的な攻撃者には困難である。",
      correctAnswer: false,
      explanation:
        "エラーの誘発は非常に簡単です。数値が期待されるパラメータに文字列を送る、SQL構文を壊す特殊文字を入力するなど、ブラウザやcurlだけで実行できます。攻撃者にとってコストが非常に低い偵察手法です。",
      referenceLink: "/step01-recon/error-message-leakage",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "本番環境では NODE_ENV=production を設定し、エラー詳細をクライアントに返さない設計にするべきである。",
      correctAnswer: true,
      explanation:
        "開発環境ではデバッグのためにエラー詳細を表示するのは合理的ですが、本番環境では内部情報を一切返してはいけません。NODE_ENV=production 時はエラー詳細を一切返さない環境別エラーハンドリングが根本対策になります。",
      referenceLink: "/step01-recon/error-message-leakage",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "エラーメッセージ漏洩を利用した攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "不正な入力（型不一致や特殊文字）を送信してエラーを誘発する",
        "エラーレスポンスからテーブル名、SQL構文、ファイルパスを取得する",
        "取得した情報からDB構造やアプリ構成を分析する",
        "分析結果を基にSQLインジェクション等の高度な攻撃を実行する",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [3, 0, 2, 1],
      explanation:
        "攻撃者はまず不正な入力でエラーを誘発し、レスポンスから内部情報を収集します。収集した情報（テーブル名、SQL構文、ファイルパス等）を分析し、それを基にSQLインジェクションやパストラバーサル等の本格的な攻撃を計画・実行します。",
      referenceLink: "/step01-recon/error-message-leakage",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "エラー情報の漏洩はOWASPの分類で ______ (Security Misconfiguration) に分類される。（英数字でOWASP Top 10のIDを回答、例: A01）",
      correctAnswers: ["A05"],
      explanation:
        "エラーメッセージからの情報漏洩はOWASP Top 10のA05:2021 Security Misconfiguration（セキュリティの設定ミス）に分類されます。開発モードのエラーハンドリングを本番で使い続けることが設定ミスにあたります。",
      referenceLink: "/step01-recon/error-message-leakage",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "エラーメッセージに機密情報が含まれる脆弱性のCWE番号は CWE-______ である。（3桁の数字で回答）",
      correctAnswers: ["209"],
      explanation:
        "CWE-209: Generation of Error Message Containing Sensitive Information は、エラーメッセージにテーブル名、パス、スタックトレース等の機密情報が含まれる脆弱性を指します。",
      referenceLink: "/step01-recon/error-message-leakage",
    },
  ],
} satisfies QuizData;
