import type { QuizData } from "../../components/quiz/types";

/**
 * CORSの仕組みの理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "CORSの仕組み - 理解度テスト",
  description:
    "CORSの基本概念、プリフライトリクエスト、認証付きクロスオリジンリクエストについての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "`Access-Control-Allow-Credentials: true` と組み合わせて使えないAccess-Control-Allow-Originの値はどれか？",
      options: [
        "https://app.example.com",
        "http://localhost:5173",
        "* （ワイルドカード）",
        "null",
      ],
      correctIndex: 2,
      explanation:
        "Access-Control-Allow-Credentials: trueを返す場合、Access-Control-Allow-Originにワイルドカード（*）は使用できません。この制約がないと、任意のオリジンから認証付きリクエストが可能になり、攻撃者のサイトから被害者のCookieを使ってAPIを呼び出せてしまいます。",
      referenceLink: "/foundations/browser/cors/cors",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "リクエストのOriginヘッダの値をそのままAccess-Control-Allow-Originにエコーバックする実装の問題点はどれか？",
      options: [
        "パフォーマンスが低下する",
        "ブラウザのキャッシュが効かなくなる",
        "任意のオリジンから認証付きリクエストが可能になるCORS misconfiguration",
        "プリフライトリクエストが毎回発生する",
      ],
      correctIndex: 2,
      explanation:
        "Originヘッダの値をそのままエコーバックすると、攻撃者のオリジン（https://evil.com等）からも認証付きアクセスが許可されてしまいます。安全な実装では、許可リスト（ホワイトリスト）でオリジンを検証する必要があります。",
      referenceLink: "/foundations/browser/cors/cors",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "Content-Typeがapplication/jsonのPOSTリクエストは単純リクエストの条件を満たすため、プリフライトリクエストは発生しない。",
      correctAnswer: false,
      explanation:
        "単純リクエストの条件では、Content-Typeはapplication/x-www-form-urlencoded、multipart/form-data、text/plainのいずれかである必要があります。application/jsonは条件外のため、プリフライトリクエスト（OPTIONSメソッド）が発生します。",
      referenceLink: "/foundations/browser/cors/cors",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "クロスオリジンのfetchリクエストでは、デフォルトでCookieが送信される。",
      correctAnswer: false,
      explanation:
        "デフォルトでは、クロスオリジンのfetchリクエストにCookieは含まれません。Cookieを送信するにはクライアント側でcredentials: 'include'を指定し、サーバー側でもAccess-Control-Allow-Credentials: trueを返す必要があります。",
      referenceLink: "/foundations/browser/cors/cors",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "CORSプリフライトリクエストのフローを正しい順序に並べ替えてください。",
      items: [
        "ブラウザがOPTIONSメソッドでプリフライトリクエストを自動送信する",
        "サーバーがAccess-Control-Allow-*ヘッダで許可条件を応答する",
        "ブラウザがプリフライト結果を確認し、許可されていれば実際のリクエストを送信する",
        "サーバーが実際のレスポンスを返す",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 0, 3, 1],
      explanation:
        "プリフライトでは、まずブラウザがOPTIONSリクエストで事前確認を行い、サーバーが許可条件を応答します。許可されていれば実際のリクエストが送信され、サーバーがレスポンスを返します。",
      referenceLink: "/foundations/browser/cors/cors",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "CORSプリフライトリクエストで使用されるHTTPメソッドは ______ である。（アルファベット大文字で回答）",
      correctAnswers: ["OPTIONS"],
      explanation:
        "プリフライトリクエストはOPTIONSメソッドを使った「事前確認」です。ブラウザが自動的に送信し、サーバーがAccess-Control-Allow-*ヘッダで許可条件を応答します。",
      referenceLink: "/foundations/browser/cors/cors",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "サーバーがクロスオリジンリクエストを許可するオリジンを指定するレスポンスヘッダは ______ である。",
      correctAnswers: [
        "Access-Control-Allow-Origin",
        "access-control-allow-origin",
      ],
      explanation:
        "Access-Control-Allow-Originヘッダは、CORSの最も基本的なヘッダです。サーバーがこのヘッダに許可するオリジンを指定することで、ブラウザがレスポンスをJavaScriptに渡すかどうかを判断します。",
      referenceLink: "/foundations/browser/cors/cors",
    },
  ],
} satisfies QuizData;
