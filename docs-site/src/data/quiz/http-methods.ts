import type { QuizData } from "../../components/quiz/types";

/**
 * Unnecessary HTTP Methods - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "不要なHTTPメソッド - 理解度テスト",
  description:
    "不要なHTTPメソッドの許可によるリソースの不正操作の仕組みと対策についての理解度をチェックしましょう。",
  questions: [
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "TRACEメソッドが本番環境で無効化すべき理由として最も適切なものはどれか？",
      options: [
        "TRACEメソッドはサーバーのCPU使用率を著しく増加させるため",
        "TRACEメソッドはリクエストをエコーバックするため、XSSと組み合わせてHttpOnly Cookieを窃取可能になる",
        "TRACEメソッドはデータベースへの書き込み操作を行うため",
        "TRACEメソッドはファイルシステムへのアクセスを許可するため",
      ],
      correctIndex: 1,
      explanation:
        "TRACEメソッドはリクエストをそのままエコーバックするため、リクエストに含まれるCookieやカスタムヘッダーがレスポンスに露出します。XSSと組み合わせるとHttpOnly属性付きのCookieもスクリプト経由で取得可能になる（Cross-Site Tracing: XST攻撃）ため、本番環境では必ず無効化すべきです。",
      referenceLink: "/step07-design/http-methods",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "Honoなどのフレームワークで `app.all()` を使用することが危険な理由はどれか？",
      options: [
        "app.all()はGETメソッドしか処理できないため",
        "app.all()はCORS設定を無効化してしまうため",
        "app.all()は全HTTPメソッドを一括で受け付け、意図しないメソッドによるリソース操作が可能になるため",
        "app.all()はSSL/TLS暗号化を無効にするため",
      ],
      correctIndex: 2,
      explanation:
        "app.all()はGET、POST、PUT、DELETE、TRACE等すべてのHTTPメソッドを単一のハンドラで処理します。本来想定していないDELETEやTRACEなどのメソッドも受け付けてしまい、リソースの不正削除や情報漏洩の原因になります。app.get()やapp.post()でメソッドを限定すべきです。",
      referenceLink: "/step07-design/http-methods",
    },
    {
      id: "tf-1",
      type: "true-false",
      text: "OPTIONSリクエストのレスポンスに含まれるAllowヘッダーは、攻撃者がそのエンドポイントで利用可能なメソッドを特定する偵察手段になりうる。",
      correctAnswer: true,
      explanation:
        "OPTIONSレスポンスのAllowヘッダーには、そのエンドポイントが受け付けるメソッドの一覧が含まれます。攻撃者はこの情報をもとに、DELETEでリソースを削除したりTRACEでCookie情報を窃取するなど、効果的な攻撃手法を選択できます。",
      referenceLink: "/step07-design/http-methods",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "HTTPメソッドを制限するだけで十分であり、認証・認可チェックは不要である。",
      correctAnswer: false,
      explanation:
        "メソッドの制限は第一歩ですが、それだけでは不十分です。たとえDELETEメソッドを許可する場合でも、リクエスト元のユーザーが操作権限を持つかの認証・認可チェックが必要です。メソッド制限はリクエストレベル、認証・認可はアプリケーションレベルの防御であり、両方が必要です。",
      referenceLink: "/step07-design/http-methods",
    },
    {
      id: "ord-1",
      type: "ordering",
      text: "不要なHTTPメソッドを悪用した攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がOPTIONSリクエストで対応メソッドを偵察する",
        "サーバーがAllowヘッダーで全メソッドを返す",
        "攻撃者がDELETEリクエストでリソースを削除する",
        "認証チェックなしで削除が実行される",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 0, 3, 1],
      explanation:
        "攻撃者はまずOPTIONSメソッドで偵察を行い、サーバーが返すAllowヘッダーから利用可能なメソッドを特定します。DELETEやPUTが含まれていることを確認し、認証なしでリソースの削除や上書きを実行します。",
      referenceLink: "/step07-design/http-methods",
    },
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "許可されていないHTTPメソッドに対してサーバーが返すべきステータスコードは ______ Method Not Allowed である。（数字3桁で回答）",
      correctAnswers: ["405"],
      explanation:
        "HTTP 405 Method Not Allowedは、リクエストされたメソッドがそのエンドポイントでは許可されていないことをクライアントに通知するステータスコードです。レスポンスのAllowヘッダーで許可メソッドのみを提示します。",
      referenceLink: "/step07-design/http-methods",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "TRACEメソッドとXSSを組み合わせてHttpOnly Cookieを窃取する攻撃は ______ と呼ばれる。（アルファベット3文字の略称で回答）",
      correctAnswers: ["XST"],
      explanation:
        "XST（Cross-Site Tracing）は、TRACEメソッドのエコーバック機能をXSSと組み合わせて、HttpOnly属性が設定されたCookieを窃取する攻撃手法です。TRACEメソッドを無効化することで防御できます。",
      referenceLink: "/step07-design/http-methods",
    },
  ],
} satisfies QuizData;
