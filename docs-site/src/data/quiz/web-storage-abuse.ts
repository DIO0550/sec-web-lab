import type { QuizData } from "../../components/quiz/types";

/**
 * Web Storage Abuse - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "Web Storage Abuse - 理解度テスト",
  description:
    "localStorage/sessionStorageへの機密データ保存によるリスクと対策についての理解度をチェックしましょう。",
  questions: [
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "localStorageにJWTトークンを保存することが危険な最大の理由はどれか？",
      options: [
        "localStorageの容量が4KBしかなくトークンが入りきらない",
        "localStorageは同一オリジン上の全JavaScriptからアクセス可能で、HttpOnly相当の保護機構がない",
        "localStorageに保存したデータはサーバーに自動送信されてしまう",
        "localStorageはブラウザのタブを閉じると自動的に削除される",
      ],
      correctIndex: 1,
      explanation:
        "localStorageにはHttpOnly属性のようなJavaScriptからのアクセスを遮断する仕組みが設計上存在しません。同一オリジン上で実行されるすべてのJavaScript（XSSスクリプトを含む）からlocalStorage.getItem()で読み取り可能です。XSSが1箇所でも存在すればトークンは即座に窃取されます。",
      referenceLink: "/step07-design/web-storage-abuse",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "JWTトークンをHttpOnly Cookieで管理する場合、フロントエンドのfetchリクエストで必要な設定はどれか？",
      options: [
        "headers: { Authorization: 'Bearer ' + token }",
        "credentials: 'include'",
        "mode: 'no-cors'",
        "cache: 'no-store'",
      ],
      correctIndex: 1,
      explanation:
        "credentials: 'include'を設定すると、ブラウザがリクエストにCookieを自動的に付与します。HttpOnly CookieはJavaScriptからアクセスできないため、Authorization ヘッダーにトークンを手動で付与する方法は使えません。ブラウザのCookie自動送信機能を利用します。",
      referenceLink: "/step07-design/web-storage-abuse",
    },
    {
      id: "tf-1",
      type: "true-false",
      text: "sessionStorageはタブを閉じるとデータが消えるため、localStorageよりも安全にJWTトークンを保存できる。",
      correctAnswer: false,
      explanation:
        "sessionStorageはタブ間でデータが共有されない点やタブを閉じるとデータが消える点でlocalStorageより限定的ですが、同一タブ内ではJavaScriptから常にアクセス可能です。XSSが発生すれば同じタブ内でsessionStorage.getItem()でトークンを読み取れるため、根本的なリスクは変わりません。",
      referenceLink: "/step07-design/web-storage-abuse",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "HttpOnly属性が設定されたCookieは、JavaScriptのdocument.cookieからはアクセスできないが、ブラウザはHTTPリクエストに自動的にCookieを付与する。",
      correctAnswer: true,
      explanation:
        "HttpOnly属性付きのCookieは、ブラウザのHTTP通信層でのみ扱われます。document.cookie APIからは除外されるためJavaScriptから値を取得できませんが、ブラウザは通常通りリクエストにCookieを自動送信します。これにより「XSSでは読めないが認証には使える」という理想的な状態が実現します。",
      referenceLink: "/step07-design/web-storage-abuse",
    },
    {
      id: "ord-1",
      type: "ordering",
      text: "localStorageに保存されたJWTトークンのXSSによる窃取の流れを正しい順序に並べ替えてください。",
      items: [
        "被害者がSPAにログインし、JWTがlocalStorageに保存される",
        "攻撃者がXSS脆弱性を利用してスクリプトを注入する",
        "スクリプトがlocalStorage.getItem('token')でJWTを読み取る",
        "攻撃者のサーバーにJWTが送信され、被害者になりすます",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 0, 3, 1],
      explanation:
        "ログイン時にJWTがlocalStorageに保存された後、XSSスクリプトがlocalStorage.getItem()でトークンを読み取り、攻撃者のサーバーに送信します。攻撃者はそのJWTでAPIにアクセスし、被害者になりすまします。",
      referenceLink: "/step07-design/web-storage-abuse",
    },
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "CookieにJavaScriptからのアクセスを遮断する属性の名前は ______ である。（キャメルケースで回答）",
      correctAnswers: ["HttpOnly", "httpOnly"],
      explanation:
        "HttpOnly属性が設定されたCookieは、JavaScriptのdocument.cookie APIからアクセスできなくなります。これによりXSSが発生してもスクリプトがCookieの値を直接読み取ることができず、トークンの窃取を防ぎます。",
      referenceLink: "/step07-design/web-storage-abuse",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "SPAでアクセストークンをJavaScript変数に保持し、ページリロード時にHttpOnly CookieのRefresh Tokenで再取得するパターンを ______ storage パターンと呼ぶ。（英語で回答）",
      correctAnswers: ["in-memory", "In-memory"],
      explanation:
        "In-memory storageパターンは、アクセストークンをReactのstateなどのJavaScript変数（メモリ）に保持し、localStorageを使わないアプローチです。ページリロード時はHttpOnly CookieのRefresh Tokenでサーバーから新しいアクセストークンを取得します。localStorageのリスクを避けつつSPAの利便性を保てます。",
      referenceLink: "/step07-design/web-storage-abuse",
    },
  ],
} satisfies QuizData;
