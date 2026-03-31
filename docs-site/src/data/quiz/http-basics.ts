import type { QuizData } from "../../components/quiz/types";

/**
 * HTTP基礎の理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え2問、穴埋め2問）を含む
 */
export const quizData = {
  title: "HTTPの基礎 - 理解度テスト",
  description:
    "HTTPリクエスト/レスポンスの構造、HTTPメソッド、ステータスコードについての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "秘密情報（パスワードやトークン）をサーバーに送信する際、なぜGETではなくPOSTを使うべきなのか？",
      options: [
        "POSTの方が通信速度が速いから",
        "GETではURLにパラメータが含まれ、ブラウザ履歴・サーバーログ・Refererヘッダから漏洩するリスクがあるから",
        "GETではボディを送信できないから",
        "POSTの方がサーバー側の処理が簡単だから",
      ],
      correctIndex: 1,
      explanation:
        "GETリクエストのパラメータはURLのクエリ文字列に含まれるため、ブラウザ履歴、サーバーログ、Refererヘッダなど多くの場所に残り、情報漏洩のリスクが高くなります。POSTではパラメータがリクエストボディに含まれるため、これらの経路からの漏洩を防げます。",
      referenceLink: "/foundations/protocol/http-basics#getとpostの使い分け",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "ログイン機能において、存在しないユーザー名に404、パスワード間違いに401を返す実装のセキュリティ上の問題点は何か？",
      options: [
        "ステータスコードの番号が大きすぎてパフォーマンスが低下する",
        "ブラウザがエラーページを自動表示してしまう",
        "攻撃者がステータスコードの違いからユーザー名の存在を確認できる（ユーザー列挙攻撃）",
        "HTTPの仕様に違反している",
      ],
      correctIndex: 2,
      explanation:
        "ステータスコードが異なると、攻撃者はレスポンスの違いからユーザー名の存在有無を推測できます。安全な実装では、どちらの場合も同じステータスコードと同じエラーメッセージを返すべきです。",
      referenceLink:
        "/foundations/protocol/http-basics#セキュリティ上の注意-ステータスコードによる情報漏洩",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "GETリクエストは冪等（idempotent）であり、同じリクエストを何度送っても結果が変わらない。",
      correctAnswer: true,
      explanation:
        "GETは冪等なメソッドです。何回呼んでも同じデータを返します。一方、POSTは呼ぶたびに新しいリソースが作成される可能性があり、冪等ではありません。",
      referenceLink: "/foundations/protocol/http-basics#メソッドの一覧",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "HTTPレスポンスヘッダに含まれる情報は暗号化されているため、第三者には見えない。",
      correctAnswer: false,
      explanation:
        "レスポンスヘッダはブラウザのDevTools（Networkタブ）やcurl -Iで誰でも確認できます。レスポンスヘッダに含まれる情報はすべて公開情報であることを意識する必要があります。HTTPSを使っても、通信相手（ブラウザ利用者）にはヘッダの内容は見えます。",
      referenceLink:
        "/foundations/protocol/http-basics#レスポンスの構造",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "HTTPリクエストの構造を正しい順序に並べ替えてください。",
      items: [
        "リクエストライン（メソッド、パス、バージョン）",
        "ヘッダ",
        "空行",
        "ボディ",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 0, 3, 1],
      explanation:
        "HTTPリクエストは「リクエストライン → ヘッダ → 空行 → ボディ」の順で構成されます。空行はヘッダとボディの区切りを示す重要な要素です。GETリクエストの場合、ボディは含まれません。",
      referenceLink:
        "/foundations/protocol/http-basics#リクエストの構造",
    },
    {
      id: "ord-2",
      type: "ordering",
      text: "HTTPレスポンスの構造を正しい順序に並べ替えてください。",
      items: [
        "ステータスライン（バージョン、ステータスコード、理由フレーズ）",
        "ヘッダ",
        "空行",
        "ボディ",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [3, 2, 0, 1],
      explanation:
        "HTTPレスポンスは「ステータスライン → ヘッダ → 空行 → ボディ」の順で構成されます。リクエストと同様に、空行がヘッダとボディの境界です。",
      referenceLink:
        "/foundations/protocol/http-basics#レスポンスの構造",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "リソースの取得に使うHTTPメソッドは ______ である。（アルファベット大文字で回答）",
      correctAnswers: ["GET"],
      explanation:
        "GETメソッドはリソースの取得に使います。ボディを持たず、冪等なメソッドです。Webブラウザでページを開く際に使用される最も基本的なHTTPメソッドです。",
      referenceLink: "/foundations/protocol/http-basics#メソッドの一覧",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "HTTPレスポンスでサーバー内部エラーを表すステータスコードは ______ である。（3桁の数字で回答）",
      correctAnswers: ["500"],
      explanation:
        "500 Internal Server Error はサーバー内部でエラーが発生したことを示します。セキュリティ上、本番環境ではスタックトレースなどの詳細情報をレスポンスに含めないようにする必要があります。",
      referenceLink:
        "/foundations/protocol/http-basics#代表的なステータスコード",
    },
  ],
} satisfies QuizData;
