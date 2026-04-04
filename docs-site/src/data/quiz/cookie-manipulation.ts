import type { QuizData } from "../../components/quiz/types";

/**
 * Cookie操作の理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "Cookie操作 - 理解度テスト",
  description:
    "Cookie属性（HttpOnly、Secure、SameSite）の役割と、属性不備による攻撃経路についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "CookieにHttpOnly属性を設定する主な目的はどれか？",
      options: [
        "Cookieの有効期限を自動的に短縮する",
        "JavaScriptのdocument.cookieからCookieを読み取れなくする",
        "HTTPS通信時のみCookieを送信する",
        "クロスサイトリクエストでのCookie送信を防止する",
      ],
      correctIndex: 1,
      explanation:
        "HttpOnly属性はJavaScriptのdocument.cookie APIからのアクセスを遮断します。これにより、XSS脆弱性が存在してもスクリプトからCookieを読み取ることができなくなり、セッションIDの窃取を防止できます。",
      referenceLink: "/step04-session/cookie-manipulation",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "SameSite属性の値としてStrictを設定した場合の動作はどれか？",
      options: [
        "すべてのリクエストでCookieが送信される",
        "GETリクエストのみCookieが送信される",
        "クロスサイトリクエストではCookieが一切送信されない",
        "HTTPS通信時のみCookieが送信される",
      ],
      correctIndex: 2,
      explanation:
        "SameSite=Strictを設定すると、外部サイトからの遷移やリクエストではCookieが一切送信されません。これにより、CSRF攻撃で外部サイトからのリクエストにCookieが自動付与されることを防げます。ただし、外部リンクからの正規の遷移でもCookieが送られないため、UXへの影響があります。",
      referenceLink: "/step04-session/cookie-manipulation",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "Secure属性を設定したCookieは、HTTP（非暗号化）通信でもブラウザから送信される。",
      correctAnswer: false,
      explanation:
        "Secure属性を設定すると、CookieはHTTPS通信時のみ送信されます。HTTP（非暗号化）通信ではブラウザがCookieを付与しないため、公衆Wi-Fiなどでのネットワーク傍受によるCookie漏洩を防止できます。",
      referenceLink: "/step04-session/cookie-manipulation",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "Cookieのセキュリティ属性（HttpOnly、Secure、SameSite）はサーバー側の処理に影響を与えるものである。",
      correctAnswer: false,
      explanation:
        "Cookieのセキュリティ属性はブラウザの動作を制御するものであり、サーバー側の処理には直接影響しません。HttpOnlyはJavaScriptからのアクセスを制限し、SecureはHTTPS以外での送信を止め、SameSiteはクロスサイトリクエストでの送信を制御します。いずれもブラウザ側で適用されるルールです。",
      referenceLink: "/step04-session/cookie-manipulation",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "HttpOnly属性がないCookieに対するXSSを利用したセッション窃取の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がXSS脆弱性を利用してスクリプトを注入する",
        "被害者がスクリプトが注入されたページを閲覧する",
        "スクリプトがdocument.cookieからセッションIDを読み取る",
        "セッションIDが攻撃者のサーバーに送信される",
        "攻撃者が窃取したセッションIDで被害者になりすます",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [4, 2, 0, 3, 1],
      explanation:
        "XSSによるCookie窃取は、スクリプト注入→被害者の閲覧→document.cookieの読み取り→外部送信→なりすましという流れで行われます。HttpOnly属性があればステップ3でdocument.cookieからCookieが除外されるため、この攻撃チェーンが途中で断たれます。",
      referenceLink: "/step04-session/cookie-manipulation",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "CookieをHTTPS通信時のみ送信するための属性は ______ である。",
      correctAnswers: ["Secure", "secure", "SECURE"],
      explanation:
        "Secure属性を設定すると、ブラウザはHTTPS通信時のみCookieを送信します。HTTP（非暗号化）通信ではCookieが付与されないため、ネットワーク傍受によるCookie漏洩を防止できます。",
      referenceLink: "/step04-session/cookie-manipulation",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "Cookieプレフィックスのうち、Secure属性・Path=/・ドメイン指定なしを強制するプレフィックスは ______ である。",
      correctAnswers: ["__Host-", "__host-", "__HOST-"],
      explanation:
        "__Host-プレフィックスを付けたCookieは、Secure属性が必須かつPath=/でドメイン指定なしであることが強制されます。これにより、サブドメインからのCookie上書き攻撃を防ぐことができます。",
      referenceLink: "/step04-session/cookie-manipulation",
    },
  ],
} satisfies QuizData;
