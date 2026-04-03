import type { QuizData } from "../../components/quiz/types";

/**
 * セッション有効期限の理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め1問）で計6問
 */
export const quizData = {
  title: "セッション有効期限 - 理解度テスト",
  description:
    "セッションタイムアウトの種類、有効期限設定の重要性、サーバー側・クライアント側の管理についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "アイドルタイムアウトと絶対タイムアウトの違いとして正しいものはどれか？",
      options: [
        "アイドルタイムアウトはサーバー側の設定、絶対タイムアウトはクライアント側の設定",
        "アイドルタイムアウトは最後のアクセスからの経過時間、絶対タイムアウトはセッション作成からの経過時間で判定する",
        "アイドルタイムアウトはGETリクエストのみ対象、絶対タイムアウトはすべてのリクエストが対象",
        "アイドルタイムアウトはログインセッションのみ対象、絶対タイムアウトは未ログインセッションも対象",
      ],
      correctIndex: 1,
      explanation:
        "アイドルタイムアウトは最後のアクティビティ（リクエスト）からの経過時間でセッションを失効させる仕組みです。絶対タイムアウトはセッション作成時点からの経過時間で失効させます。両方を併用することで、放置されたセッションと長時間使い続けられるセッションの両方に対応できます。",
      referenceLink: "/step04-session/session-expiration",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "CookieのMax-Age属性だけでセッション有効期限を管理する場合の問題はどれか？",
      options: [
        "Max-Ageの値が大きすぎるとブラウザがCookieを保存しない",
        "Max-AgeはHTTPS通信でのみ有効である",
        "クライアント側の制御であるため、Cookieを手動でコピーすればMax-Age後もサーバー側でセッションが有効なまま",
        "Max-Ageはセッション開始時にしか設定できない",
      ],
      correctIndex: 2,
      explanation:
        "CookieのMax-Ageはブラウザ側でCookieを削除するタイミングを制御するだけです。攻撃者がCookieの値（セッションID）をコピーしていれば、ブラウザのCookieが消えてもサーバー側ではセッションが有効なままです。サーバー側でもタイムアウトを管理する必要があります。",
      referenceLink: "/step04-session/session-expiration",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "セッションに有効期限を設定しなくても、ブラウザを閉じればセッションは必ず無効になる。",
      correctAnswer: false,
      explanation:
        "ブラウザを閉じてもサーバー側のセッションは自動的に無効にはなりません。Cookie自体はセッションCookie（Max-Ageなし）であればブラウザ終了時に削除されますが、サーバー側のセッションデータは残ります。また、モダンブラウザにはセッション復元機能があるため、セッションCookieも復元されることがあります。",
      referenceLink: "/step04-session/session-expiration",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "スライディング有効期限（アクティビティごとにタイムアウトをリセット）は、アイドルタイムアウトの一種である。",
      correctAnswer: true,
      explanation:
        "スライディング有効期限はアイドルタイムアウトの実装方法の一つです。ユーザーがアクセスするたびにタイムアウトのカウントダウンがリセットされるため、アクティブに利用中のユーザーはセッションが維持され、放置されたセッションは自動的に失効します。",
      referenceLink: "/step04-session/session-expiration",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "セッション有効期限の不備を突いた攻撃シナリオを正しい順序に並べ替えてください。",
      items: [
        "被害者が共有PCでWebアプリにログインする",
        "被害者がログアウトせずにブラウザを閉じてその場を離れる",
        "攻撃者がブラウザの履歴やCookieからセッションIDを取得する",
        "サーバー側でセッションが有効期限なしのため依然として有効である",
        "攻撃者が被害者のアカウントにアクセスする",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [4, 2, 0, 3, 1],
      explanation:
        "有効期限のないセッションでは、ログアウトし忘れた共有PCから攻撃者がセッションIDを取得し、時間が経過してもそのセッションが有効なためアカウントにアクセスできてしまいます。適切なタイムアウト設定があれば、この攻撃ウィンドウを限定できます。",
      referenceLink: "/step04-session/session-expiration",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "CookieのブラウザFSでの有効期間を秒数で指定する属性は ______ である。",
      correctAnswers: ["Max-Age", "max-age", "MaxAge", "maxAge", "MAX-AGE"],
      explanation:
        "Max-Age属性はCookieの有効期間を秒数で指定します。この期間が経過するとブラウザがCookieを削除します。ただし、これはクライアント側の制御であり、サーバー側のセッション管理とは独立しているため、両方で適切に有効期限を管理する必要があります。",
      referenceLink: "/step04-session/session-expiration",
    },
  ],
} satisfies QuizData;
