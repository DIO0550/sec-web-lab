import type { QuizData } from "../../components/quiz/types";

/**
 * URLエンコーディングとRefererの理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "URLエンコーディングとReferer - 理解度テスト",
  description:
    "パーセントエンコーディングの仕組みとRefererヘッダによるセキュリティリスクについての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "攻撃者がXSSフィルタを回避するために `<script>` を `%3Cscript%3E` とエンコードして送信した場合、安全な対策はどれか？",
      options: [
        "エンコードされた文字列をそのまま拒否する",
        "デコード後の値に対してバリデーションとエスケープを行う",
        "パーセントエンコーディングを完全に禁止する",
        "URLの長さを制限する",
      ],
      correctIndex: 1,
      explanation:
        "攻撃者はエンコーディングを使ってフィルタを迂回するため、デコード後の値に対してバリデーションやエスケープを行う必要があります。エンコード前の段階でチェックすると、エンコードされた攻撃文字列を見逃してしまいます。",
      referenceLink: "/foundations/protocol/url-encoding/url-encoding",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "パスワードリセットページ（`https://example.com/reset?token=secret`）から外部画像を読み込んだ場合、どのような情報漏洩が起きるか？",
      options: [
        "外部サーバーにクッキーが送信される",
        "外部サーバーにRefererヘッダ経由でトークンが漏洩する",
        "外部サーバーにリクエストボディが送信される",
        "外部サーバーにローカルストレージの内容が送信される",
      ],
      correctIndex: 1,
      explanation:
        "RefererヘッダにはURLのクエリ文字列も含まれるため、外部リソースの読み込み時にトークンなどのセンシティブな情報が漏洩します。URLにセンシティブな情報を含めないことが重要です。",
      referenceLink: "/foundations/protocol/url-encoding/url-encoding",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "パーセントエンコーディングでは、日本語1文字が複数の `%XX` の連続で表現されることがある。",
      correctAnswer: true,
      explanation:
        "日本語文字はUTF-8で複数バイトにエンコードされます。例えば「あ」は `%E3%81%82` のように3つの `%XX` で表現されます。",
      referenceLink: "/foundations/protocol/url-encoding/url-encoding",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "Referrer-Policyヘッダを `no-referrer` に設定すると、同一オリジン内のページ遷移でもRefererヘッダが送信されなくなる。",
      correctAnswer: true,
      explanation:
        "`no-referrer` はRefererヘッダを一切送信しない設定です。同一オリジンかどうかに関わらず、すべてのリクエストでRefererが除去されます。同一オリジンにのみ送信したい場合は `same-origin` を使用します。",
      referenceLink: "/foundations/protocol/url-encoding/url-encoding",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "パーセントエンコーディングの変換手順を正しい順序に並べ替えてください。",
      items: [
        "文字をUTF-8のバイト列に変換する",
        "各バイトを16進数に変換する",
        "各16進数の前に % を付ける",
        "すべての %XX を連結してURLに埋め込む",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 3, 0, 1],
      explanation:
        "パーセントエンコーディングは、まず文字をUTF-8バイト列に変換し、各バイトを16進数にして `%` を付け、最終的に連結してURLに使用します。",
      referenceLink: "/foundations/protocol/url-encoding/url-encoding",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "スペース文字をパーセントエンコーディングすると ______ になる。",
      correctAnswers: ["%20"],
      explanation:
        "スペース（0x20）をパーセントエンコーディングすると `%20` になります。フォームデータでは `+` で表現されることもありますが、URL内では `%20` が標準です。",
      referenceLink: "/foundations/protocol/url-encoding/url-encoding",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "Refererヘッダの送信を制御するためのHTTPレスポンスヘッダは ______ である。",
      correctAnswers: ["Referrer-Policy", "referrer-policy"],
      explanation:
        "Referrer-Policyヘッダを使うことで、Refererヘッダの送信範囲を制御できます。`no-referrer`、`same-origin`、`strict-origin` などの値を設定できます。",
      referenceLink: "/foundations/protocol/url-encoding/url-encoding",
    },
  ],
} satisfies QuizData;
