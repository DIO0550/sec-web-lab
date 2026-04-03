import type { QuizData } from "../../components/quiz/types";

/**
 * セッションハイジャックの理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "セッションハイジャック - 理解度テスト",
  description:
    "XSSによるセッションID窃取の仕組み、Cookie属性による防御、セッション固定との違いについての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "XSSを利用したセッションハイジャックが成功するために必要な条件の組み合わせとして正しいものはどれか？",
      options: [
        "XSS脆弱性 + セッションIDがURLに含まれている",
        "XSS脆弱性 + CookieにHttpOnly属性が設定されていない",
        "CSRF脆弱性 + CookieにSameSite属性が設定されていない",
        "SQLインジェクション + セッションIDが推測可能",
      ],
      correctIndex: 1,
      explanation:
        "XSSによるセッションハイジャックは、XSS脆弱性が存在し、かつCookieにHttpOnly属性が設定されていない場合に成立します。XSSでスクリプトを実行し、document.cookieからセッションIDを読み取って外部に送信します。",
      referenceLink: "/step04-session/session-hijacking",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "セッションハイジャックの被害を限定するための対策として最も有効なものはどれか？",
      options: [
        "セッションIDを長くする",
        "ログインページをHTTPSにする",
        "セッションにIPアドレスやUser-Agentを紐付けて検証する",
        "セッションIDをBase64でエンコードする",
      ],
      correctIndex: 2,
      explanation:
        "セッションにIPアドレスやUser-Agentを紐付けて検証することで、セッションIDが窃取されても攻撃者の環境からのアクセスを検知・拒否できます。ただし、IPが変わるモバイル環境等では注意が必要です。根本対策はXSSの防止とHttpOnly属性の設定です。",
      referenceLink: "/step04-session/session-hijacking",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "HttpOnly属性を設定すれば、セッションハイジャックを完全に防止できる。",
      correctAnswer: false,
      explanation:
        "HttpOnly属性はJavaScript経由でのCookie窃取（XSSによるdocument.cookieの読み取り）を防ぎますが、ネットワーク傍受やブラウザの脆弱性を利用した攻撃には対応できません。Secure属性やSameSite属性の設定、XSS自体の防止など、多層防御が必要です。",
      referenceLink: "/step04-session/session-hijacking",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "セッションハイジャックでは、攻撃者は被害者のパスワードを知らなくてもアカウントにアクセスできる。",
      correctAnswer: true,
      explanation:
        "セッションハイジャックは認証後のセッションIDを窃取する攻撃です。セッションIDはログイン済みの状態を表すため、攻撃者はパスワードを知らなくても、窃取したセッションIDを使って被害者として認証された状態でサービスにアクセスできます。",
      referenceLink: "/step04-session/session-hijacking",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "Stored XSSを利用したセッションハイジャック攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がWebアプリにXSSペイロードを保存する（例: 掲示板の投稿）",
        "被害者がそのページにアクセスし、保存されたスクリプトが実行される",
        "スクリプトがdocument.cookieを読み取り、攻撃者のサーバーに送信する",
        "攻撃者が窃取したセッションIDを自分のブラウザにセットする",
        "攻撃者が被害者のアカウントとしてサービスを利用する",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 1, 4, 0, 2],
      explanation:
        "Stored XSSによるセッションハイジャックは、ペイロード保存→被害者のアクセス→Cookie読み取り・送信→セッションIDのセット→なりすましという流れで進行します。防御にはXSSの防止（出力エスケープ）とHttpOnly属性の設定が重要です。",
      referenceLink: "/step04-session/session-hijacking",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "XSSペイロード内でブラウザのCookieを読み取るために使用されるJavaScriptのプロパティは document.______ である。",
      correctAnswers: ["cookie", "Cookie"],
      explanation:
        "document.cookieプロパティはブラウザに保存されたCookieにアクセスするためのJavaScript APIです。HttpOnly属性が設定されていないCookieはこのプロパティを通じて読み取り可能であり、XSS攻撃でセッションIDを窃取する手段として悪用されます。",
      referenceLink: "/step04-session/session-hijacking",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "セッションハイジャックが「セッションIDを盗む」攻撃であるのに対し、セッション ______ は「攻撃者のIDを被害者に使わせる」攻撃である。",
      correctAnswers: ["固定", "フィクセーション", "fixation", "Fixation"],
      explanation:
        "セッションハイジャックは既存のセッションIDを窃取する攻撃であり、セッション固定（Session Fixation）は攻撃者が用意したIDを被害者に使わせる攻撃です。アプローチは逆ですが、どちらもセッションの乗っ取りが目的です。",
      referenceLink: "/step04-session/session-hijacking",
    },
  ],
} satisfies QuizData;
