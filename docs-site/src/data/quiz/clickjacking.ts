import type { QuizData } from "../../components/quiz/types";

/**
 * Clickjacking - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "クリックジャッキング - 理解度テスト",
  description:
    "透明iframeによるUI偽装攻撃の仕組みと対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "クリックジャッキング攻撃が成立するための条件として最も重要なものはどれか？",
      options: [
        "正規サイトにXSS脆弱性が存在すること",
        "正規サイトがiframeへの埋め込みを許可していること",
        "被害者のブラウザにJavaScriptが無効化されていること",
        "正規サイトがHTTPで通信していること",
      ],
      correctIndex: 1,
      explanation:
        "クリックジャッキングは、正規サイトを透明なiframeとして攻撃者の罠ページに埋め込むことで成立します。X-Frame-OptionsやCSP frame-ancestorsが設定されていなければ、正規サイトはデフォルトでiframeへの埋め込みを許可しています。XSSは不要であり、JavaScriptも有効である必要があります。",
      referenceLink: "/step07-design/clickjacking",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "X-Frame-Optionsの後継として、より柔軟な制御が可能なCSPディレクティブはどれか？",
      options: [
        "script-src",
        "default-src",
        "frame-ancestors",
        "frame-src",
      ],
      correctIndex: 2,
      explanation:
        "CSP frame-ancestorsはX-Frame-Optionsの後継であり、オリジン単位で細かくiframe埋め込みを制御できます。frame-srcはiframe内に読み込むリソースの制御であり、frame-ancestorsとは逆方向の制御です。",
      referenceLink: "/step07-design/clickjacking",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "Frame-busting JavaScript（`if (top !== self) top.location = self.location`）だけで、クリックジャッキングを完全に防ぐことができる。",
      correctAnswer: false,
      explanation:
        "Frame-busting JavaScriptはiframe内に読み込まれたことを検知してリダイレクトする手法ですが、攻撃者がiframeにsandbox属性を設定することでJavaScriptの実行を無効化し、Frame-bustingを回避できます。そのためX-Frame-OptionsやCSP frame-ancestorsによるヘッダーベースの対策が必要です。",
      referenceLink: "/step07-design/clickjacking",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "クリックジャッキングでは、攻撃者の罠ページ上で被害者がクリックすると、ブラウザが自動的にCookieを送信するため正規サイト上の操作が実行される。",
      correctAnswer: true,
      explanation:
        "被害者は正規サイトにログイン済みのため、iframe内の正規サイトへのリクエストにブラウザが自動的にCookieを付与します。正規サイトは正当なリクエストと区別できず、アカウント削除や送金などの操作を実行してしまいます。",
      referenceLink: "/step07-design/clickjacking",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "クリックジャッキング攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が透明iframe付きの罠ページを作成する",
        "被害者が罠ページにアクセスし、偽のボタンをクリックする",
        "クリックが透明iframe内の正規サイトのボタンに伝達される",
        "正規サイトが被害者の認証Cookieを使って操作を実行する",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 0, 3, 1],
      explanation:
        "攻撃者はまず罠ページを作成し、正規サイトを透明iframeで重ねます。被害者が偽のボタンをクリックすると、その操作はiframe内の正規サイトのボタンに伝達されます。正規サイトはCookieによる認証で正当なリクエストとして処理してしまいます。",
      referenceLink: "/step07-design/clickjacking",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "CSSの ______ プロパティを0に近い値に設定することで、iframeを透明にして被害者に見えなくすることができる。（英語で回答）",
      correctAnswers: ["opacity"],
      explanation:
        "CSSのopacityプロパティを0.0001などの極めて小さい値に設定すると、iframe要素はほぼ完全に透明になります。これとz-indexを組み合わせて、偽のボタンの上に透明なiframeを重ねることで、クリックジャッキング攻撃が成立します。",
      referenceLink: "/step07-design/clickjacking",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "iframeへの埋め込みを完全に禁止するX-Frame-Optionsヘッダーの値は ______ である。（大文字で回答）",
      correctAnswers: ["DENY"],
      explanation:
        "X-Frame-Options: DENYは一切のiframe埋め込みを禁止します。SAMEORIGIN は同一オリジンからの埋め込みのみを許可します。iframe埋め込みが不要なサイトではDENYを設定するのが最も安全です。",
      referenceLink: "/step07-design/clickjacking",
    },
  ],
} satisfies QuizData;
