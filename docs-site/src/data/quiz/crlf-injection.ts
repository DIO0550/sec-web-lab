import type { QuizData } from "../../components/quiz/types";

/**
 * CRLF Injection (HTTP Header Injection) - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "CRLF Injection - 理解度テスト",
  description:
    "CRLFインジェクションの攻撃手法・影響・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "CRLFインジェクションが成功する根本的な原因はどれか？",
      options: [
        "サーバーがHTTPS通信を使用していないため",
        "HTTPプロトコルのヘッダー区切りが改行コード（\\r\\n）に依存しており、ユーザー入力に含まれる改行コードを除去せずにヘッダーに設定しているため",
        "ブラウザがCookieを自動送信するため",
        "サーバーのメモリが不足しているため",
      ],
      correctIndex: 1,
      explanation:
        "HTTPプロトコルではヘッダーとヘッダーの区切りが \\r\\n（CRLF）に依存しています。サーバーがユーザー入力に含まれる改行コードを除去・エスケープせずにHTTPヘッダーに設定すると、攻撃者は改行コードを注入して新しいヘッダーを追加できます。これがCRLFインジェクションの根本原因です。",
      referenceLink: "/step06-server-side/crlf-injection",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "CRLFインジェクションにより引き起こされる可能性がある攻撃はどれか？",
      options: [
        "SQLインジェクションによるデータベースの改ざん",
        "Set-Cookieヘッダーの注入によるセッション固定攻撃",
        "ファイルアップロードによるWebシェルの設置",
        "XMLパーサーによるファイル読み取り",
      ],
      correctIndex: 1,
      explanation:
        "CRLFインジェクションではSet-Cookieヘッダーを注入でき、被害者のブラウザに任意のCookieを設定できます。これによりセッション固定攻撃が可能になります。さらに \\r\\n\\r\\n で空行を作ることでレスポンスボディも注入でき、フィッシングやキャッシュポイズニングにも発展し得ます。",
      referenceLink: "/step06-server-side/crlf-injection",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "URLエンコードされた %0d%0a はサーバー内部でデコードされると改行コード（\\r\\n）となり、CRLFインジェクションの攻撃に使用される。",
      correctAnswer: true,
      explanation:
        "%0d はキャリッジリターン（\\r）、%0a はラインフィード（\\n）のURLエンコード表現です。サーバーがURLデコードを行った後、この改行コードがHTTPヘッダーの値に含まれると、ヘッダーの境界として解釈され、新しいヘッダーの注入が可能になります。",
      referenceLink: "/step06-server-side/crlf-injection",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "モダンなWebフレームワークはヘッダー設定時に自動で改行コードを除去するため、CRLFインジェクション対策としてアプリケーション側での検証は不要である。",
      correctAnswer: false,
      explanation:
        "多くのモダンフレームワーク（Hono含む）はヘッダー設定時に改行コードを自動除去する機能を持ちますが、全てのケースで保護されるとは限りません。フレームワークのバージョンや設定によって動作が異なる場合があるため、アプリケーション側でも改行コードの検証・除去を行う防御的プログラミングが推奨されます。",
      referenceLink: "/step06-server-side/crlf-injection",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "CRLFインジェクションによるSet-Cookie注入攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が改行コード（%0d%0a）とSet-Cookieヘッダーを含むURLを構築する",
        "被害者がそのURLにアクセスし、サーバーにリクエストが送信される",
        "サーバーがURLパラメータを検証せずにLocationヘッダーにそのまま設定する",
        "改行コードがHTTPヘッダーの境界として解釈され、Set-Cookieが正規のヘッダーとして追加される",
        "被害者のブラウザが注入されたSet-Cookieを処理し、攻撃者指定のCookieが設定される",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 0, 4, 1, 2],
      explanation:
        "攻撃者はまず改行コードを含むURLを構築し、被害者にアクセスさせます。サーバーがパラメータを検証せずにヘッダーに設定すると、改行コードがヘッダーの境界として解釈され、Set-Cookieが新しいヘッダーとして追加されます。ブラウザはこれを正規のレスポンスとして処理し、Cookieを設定します。",
      referenceLink: "/step06-server-side/crlf-injection",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "CRLFとは、______（Carriage Return）と LF（Line Feed）の2つの制御文字の略称である。（英語2文字で回答）",
      correctAnswers: ["CR"],
      explanation:
        "CRLFはCR（Carriage Return、\\r、0x0D）とLF（Line Feed、\\n、0x0A）の組み合わせです。HTTPプロトコルではこの2文字の組み合わせ（\\r\\n）がヘッダーの区切りとして使用されます。CRLFインジェクションという名前は、この制御文字を注入する攻撃であることに由来しています。",
      referenceLink: "/step06-server-side/crlf-injection",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "CRLFインジェクションの根本対策として、ヘッダーに設定する値から改行コードを除去するJavaScriptのコードは url.replace(/[\\r\\n]/g, '______') である。（除去後の文字列を回答）",
      correctAnswers: [""],
      explanation:
        "改行コード（\\r と \\n）を空文字列に置換することで、ユーザー入力から改行コードを完全に除去します。これにより、HTTPヘッダーの境界として機能する文字が排除され、新しいヘッダーの注入が不可能になります。正規表現 /[\\r\\n]/g は全ての \\r と \\n にマッチします。",
      referenceLink: "/step06-server-side/crlf-injection",
    },
  ],
} satisfies QuizData;
