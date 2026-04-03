import type { QuizData } from "../../components/quiz/types";

/**
 * セッション管理の基礎の理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "セッション管理の基礎 - 理解度テスト",
  description:
    "Cookieの仕組み、セッションIDの要件、セッションIDの格納場所の比較についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "セッションIDをURLパラメータに含めて送信する方法の最大のリスクはどれか？",
      options: [
        "URLが長くなりすぎてサーバーが処理できない",
        "セッションIDがRefererヘッダ、ブラウザ履歴、サーバーログなどから漏洩する",
        "セッションIDがブラウザのキャッシュに保存されない",
        "セッションIDの有効期限が設定できない",
      ],
      correctIndex: 1,
      explanation:
        "URLにセッションIDを含めると、Refererヘッダ経由で外部サイトに漏洩したり、ブラウザ履歴やサーバーログに記録されたりするリスクがあります。URLの共有やブックマークでも漏洩する可能性があるため、セキュリティ上避けるべきです。",
      referenceLink: "/foundations/auth-session/session-management",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "セッションIDの生成に `Math.random()` を使うべきではない理由はどれか？",
      options: [
        "Math.random()は小数しか生成できないため",
        "Math.random()は暗号論的に安全ではなく、内部状態から出力を予測できる可能性があるため",
        "Math.random()はNode.jsで使えないため",
        "Math.random()は同じ値を繰り返し生成するため",
      ],
      correctIndex: 1,
      explanation:
        "Math.random()は暗号論的に安全な疑似乱数生成器（CSPRNG）ではありません。内部状態から出力が予測可能であり、攻撃者がセッションIDを推測できてしまいます。セッションIDの生成にはcrypto.randomBytes()などのCSPRNGを使用すべきです。",
      referenceLink: "/foundations/auth-session/session-management",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "HTTPはステートレスなプロトコルであり、各リクエストは完全に独立している。",
      correctAnswer: true,
      explanation:
        "HTTPプロトコルはステートレス（状態を持たない）に設計されています。各リクエストは独立しており、サーバーは前回のリクエストの情報を保持しません。この制約を補うためにセッション管理の仕組みが必要になります。",
      referenceLink: "/foundations/auth-session/session-management",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "hiddenパラメータの値はブラウザに表示されないため、ユーザーによる改ざんは不可能である。",
      correctAnswer: false,
      explanation:
        "hiddenパラメータは画面上に表示されないだけで、DevToolsのElementsタブで値を変更したり、curlで任意の値を送信したりすることで簡単に改ざんできます。hiddenパラメータの値はクライアント側のデータであり、サーバー側で必ず検証する必要があります。",
      referenceLink: "/foundations/auth-session/session-management",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "セッション管理の基本的な流れを正しい順序に並べ替えてください。",
      items: [
        "ユーザーがログインに成功する",
        "サーバーがセッションIDを生成する",
        "サーバーがSet-CookieヘッダでセッションIDをクライアントに返す",
        "以降のリクエストでブラウザがCookieを自動送信する",
        "サーバーがセッションIDからユーザーを特定する",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 0, 4, 2, 1],
      explanation:
        "セッション管理は、ログイン成功→セッションID生成→Cookie送信→以降の自動送信→ユーザー特定という流れで行われます。ブラウザがCookieを自動的に送信する仕組みを利用しています。",
      referenceLink: "/foundations/auth-session/session-management",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "CookieにJavaScriptからアクセスできなくするための属性は ______ である。",
      correctAnswers: ["HttpOnly", "httponly", "httpOnly", "HTTPONLY"],
      explanation:
        "HttpOnly属性を設定すると、JavaScriptのdocument.cookieからCookieにアクセスできなくなります。これにより、XSS攻撃によるCookie窃取（セッションハイジャック）を防止できます。",
      referenceLink: "/foundations/auth-session/session-management",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "クロスサイトリクエストでのCookie送信を制御するCookie属性は ______ である。",
      correctAnswers: ["SameSite", "samesite", "sameSite", "SAMESITE"],
      explanation:
        "SameSite属性はクロスサイトリクエストでのCookie送信を制御します。Strict、Lax、Noneの3つの値があり、CSRF攻撃の緩和に重要な役割を果たします。モダンブラウザのデフォルト値はLaxです。",
      referenceLink: "/foundations/auth-session/session-management",
    },
  ],
} satisfies QuizData;
