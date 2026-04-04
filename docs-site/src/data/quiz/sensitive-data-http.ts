import type { QuizData } from "../../components/quiz/types";

/**
 * Sensitive Data Exposure over HTTP - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "HTTPでの機密データ送信 - 理解度テスト",
  description:
    "暗号化されていないHTTP通信による機密データ漏洩の仕組みと対策についての理解度をチェックしましょう。",
  questions: [
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "HTMLフォームの `type=\"password\"` 属性の役割として正しいものはどれか？",
      options: [
        "入力されたパスワードを暗号化してサーバーに送信する",
        "ブラウザの画面上で入力文字をマスク表示するだけであり、ネットワーク通信には影響しない",
        "HTTPS通信を自動的に有効にしてパスワードを保護する",
        "パスワードをハッシュ化してからサーバーに送信する",
      ],
      correctIndex: 1,
      explanation:
        "type=\"password\"はブラウザの画面上で入力を「●●●」などのマスク表示にするだけであり、ネットワーク通信には一切影響しません。HTTPで送信されれば、パスワードは平文でそのままネットワークを流れます。通信の暗号化にはHTTPS（TLS）が必要です。",
      referenceLink: "/step07-design/sensitive-data-http",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "HSTSヘッダーが解決する問題として最も適切なものはどれか？",
      options: [
        "XSS攻撃によるCookieの窃取を防ぐ",
        "ユーザーがhttp://でURLを入力した場合に自動的にhttps://に変換する",
        "サーバーのTLS証明書の有効期限を延長する",
        "中間者攻撃によるDNSスプーフィングを防ぐ",
      ],
      correctIndex: 1,
      explanation:
        "Strict-Transport-Security（HSTS）ヘッダーは、ブラウザに「今後このドメインにはHTTPSのみで通信する」と指示します。ユーザーがhttp://でURLを入力しても、ブラウザが自動的にhttps://に変換してからリクエストを送信します。これにより初回アクセス後のHTTPダウングレード攻撃を防ぎます。",
      referenceLink: "/step07-design/sensitive-data-http",
    },
    {
      id: "tf-1",
      type: "true-false",
      text: "CookieにSecure属性を設定すると、HTTPS通信時のみCookieが送信され、HTTP通信ではCookieが送信されなくなる。",
      correctAnswer: true,
      explanation:
        "Secure属性が設定されたCookieは、HTTPS（暗号化された通信）でのみブラウザがサーバーに送信します。HTTP通信の場合はCookieが送信されないため、たとえ通信が傍受されてもCookieの値は漏洩しません。",
      referenceLink: "/step07-design/sensitive-data-http",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "HSTSヘッダーを設定すれば、そのドメインへの最初のアクセスからHTTPS通信が保証される。",
      correctAnswer: false,
      explanation:
        "HSTSヘッダーはサーバーのレスポンスで設定されるため、最初のアクセス時にはまだHTTPで通信する可能性があります（TOFU問題: Trust On First Use）。この問題を解決するにはHSTS Preloadリストにドメインを登録し、ブラウザに事前にHTTPS必須であることを記憶させる必要があります。",
      referenceLink: "/step07-design/sensitive-data-http",
    },
    {
      id: "ord-1",
      type: "ordering",
      text: "HTTP通信でのパスワード傍受攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "被害者が公衆Wi-FiでHTTPのログインフォームにパスワードを入力する",
        "ブラウザがパスワードを平文でネットワークに送出する",
        "攻撃者がパケットキャプチャツールで通信を傍受する",
        "攻撃者がパスワードを平文で取得しログインする",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 0, 3, 1],
      explanation:
        "被害者がHTTPフォームでパスワードを送信すると、暗号化されずにネットワーク上を流れます。同じネットワーク上の攻撃者がパケットキャプチャツールで通信を傍受し、パスワードを平文のまま読み取ってログインに使用します。",
      referenceLink: "/step07-design/sensitive-data-http",
    },
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "HTTP通信をTLSプロトコルで暗号化したものが ______ であり、ブラウザのアドレスバーに鍵マークが表示される。（アルファベットで回答）",
      correctAnswers: ["HTTPS"],
      explanation:
        "HTTPS（HTTP over TLS）は、HTTP通信をTLS（Transport Layer Security）プロトコルで暗号化したものです。ブラウザとサーバー間のすべての通信が暗号化されるため、第三者がネットワーク上のパケットを傍受しても内容を読み取れません。",
      referenceLink: "/step07-design/sensitive-data-http",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "HSTSヘッダーの正式名称は ______-Transport-Security である。（英単語1語で回答）",
      correctAnswers: ["Strict"],
      explanation:
        "Strict-Transport-Securityヘッダーは、ブラウザにHTTPSの使用を強制するレスポンスヘッダーです。max-ageディレクティブで記憶期間を指定し、includeSubDomainsでサブドメインにも適用できます。",
      referenceLink: "/step07-design/sensitive-data-http",
    },
  ],
} satisfies QuizData;
