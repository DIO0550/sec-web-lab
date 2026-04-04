import type { QuizData } from "../../components/quiz/types";

/**
 * postMessage 脆弱性 - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "postMessage 脆弱性 - 理解度テスト",
  description:
    "postMessage APIのオリジン検証不備による脆弱性の攻撃手法・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "postMessage 脆弱性の根本原因はどれか？",
      options: [
        "postMessage API 自体にセキュリティ上の欠陥があるため",
        "受信側が event.origin を検証せず、あらゆるオリジンからのメッセージを信頼してしまうため",
        "HTTPS で通信していないため、メッセージが傍受されるため",
        "iframe がブラウザのセキュリティモデルを無視するため",
      ],
      correctIndex: 1,
      explanation:
        "postMessage API は event.origin と targetOrigin という2つのセキュリティ機構を提供しています。脆弱性は、受信側が event.origin を検証しないことで、攻撃者のサイトからの偽メッセージも正規のメッセージと同様に処理してしまうことが原因です。",
      referenceLink: "/step08-advanced/postmessage",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "postMessage の送信側で targetOrigin を \"*\" に設定した場合のリスクはどれか？",
      options: [
        "メッセージの送信速度が低下する",
        "メッセージが暗号化されずに送信される",
        "攻撃者を含む任意のオリジンのウィンドウがメッセージを受信でき、機密データが漏洩する",
        "メッセージが受信側に届かなくなる",
      ],
      correctIndex: 2,
      explanation:
        "targetOrigin を \"*\" にすると、送信先オリジンの制限がなくなり、攻撃者のウィンドウにも機密データ（認証トークンやユーザー情報など）が送信されてしまいます。必ず具体的なオリジン（例: 'https://payment.example.com'）を指定すべきです。",
      referenceLink: "/step08-advanced/postmessage",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "event.origin はブラウザが保証する値であり、送信側のスクリプトで偽造することはできない。",
      correctAnswer: true,
      explanation:
        "event.origin はブラウザが自動的に設定する値であり、JavaScript から偽造することはできません。これが postMessage の安全性の根幹を成しています。受信側が event.origin を正しく検証すれば、攻撃者のオリジンからのメッセージを確実に拒否できます。",
      referenceLink: "/step08-advanced/postmessage",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "postMessage で受信したデータを innerHTML で DOM に挿入しても、同一オリジンポリシーが保護してくれるため安全である。",
      correctAnswer: false,
      explanation:
        "同一オリジンポリシーは postMessage によるクロスオリジン通信を許可するための仕組みであり、受信データの安全性は保証しません。受信データを innerHTML に挿入すると、攻撃者が <img onerror=...> のような HTML を送信して DOM-based XSS が成立します。受信データは textContent を使うか、サニタイズしてから挿入すべきです。",
      referenceLink: "/step08-advanced/postmessage",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "postMessage のオリジン検証不備を悪用したプロフィール改ざん攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が罠サイトを用意し、脆弱なページを iframe で埋め込む",
        "被害者が罠サイトにアクセスし、iframe 内に脆弱なページが読み込まれる",
        "攻撃者のスクリプトが iframe.contentWindow.postMessage() で偽のコマンドを送信する",
        "脆弱なページが event.origin を検証せずにメッセージを処理する",
        "被害者のプロフィール情報が攻撃者の指定したデータに変更される",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [2, 4, 0, 3, 1],
      explanation:
        "攻撃者は罠サイトに脆弱なページを iframe で埋め込み、被害者がアクセスすると postMessage で偽のコマンドを送信します。脆弱なページが event.origin を検証しないため、攻撃者のメッセージが正規のものとして処理され、プロフィールが改ざんされます。",
      referenceLink: "/step08-advanced/postmessage",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "postMessage の受信ハンドラーで、メッセージの送信元オリジンを確認するためにチェックすべきプロパティは event.______ である。",
      correctAnswers: ["origin"],
      explanation:
        "event.origin は postMessage の送信元オリジン（例: 'https://payment.example.com'）を示すプロパティです。ブラウザが保証する値であり、偽造できません。受信側は必ず event.origin を信頼するオリジンと比較し、一致しないメッセージは無視すべきです。",
      referenceLink: "/step08-advanced/postmessage",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "postMessage の送信時に第2引数の targetOrigin を ______ に設定すると、任意のオリジンにメッセージが送信されてしまい危険である。（1文字で回答）",
      correctAnswers: ["*"],
      explanation:
        "targetOrigin に '*' を設定すると、送信先のオリジン制限がなくなり、攻撃者のウィンドウにも機密データが送信されます。安全な実装では、具体的なオリジン（例: 'https://shop.example.com'）を指定して、意図した受信者にのみメッセージを送信します。",
      referenceLink: "/step08-advanced/postmessage",
    },
  ],
} satisfies QuizData;
