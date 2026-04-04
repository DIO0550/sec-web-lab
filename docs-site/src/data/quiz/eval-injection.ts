import type { QuizData } from "../../components/quiz/types";

/**
 * eval Injection - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "eval Injection - 理解度テスト",
  description:
    "evalインジェクションの攻撃手法・影響・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "eval()にユーザー入力を渡した場合に発生する最大の脅威はどれか？",
      options: [
        "JavaScriptの構文エラーによるサーバーのクラッシュ",
        "ブラウザのCookieが漏洩する",
        "RCE（リモートコード実行）によるサーバーの完全な乗っ取り",
        "データベースのテーブルが削除される",
      ],
      correctIndex: 2,
      explanation:
        "eval()はユーザー入力をJavaScriptコードとして実行するため、process.mainModule.require('child_process').execSync()などを通じて任意のOSコマンドを実行できます。これはRCE（Remote Code Execution）であり、サーバーの完全な乗っ取りを意味します。ファイルの読み書き、環境変数の取得、他システムへの攻撃など、あらゆる操作が可能になります。",
      referenceLink: "/step06-server-side/eval-injection",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "eval()を使った数式計算APIの安全な代替実装として最も適切な方法はどれか？",
      options: [
        "eval()の前にユーザー入力から危険なキーワードを除去するフィルタを追加する",
        "Math.jsのような数式専用パーサーを使用し、JavaScriptコードの実行を防ぐ",
        "eval()をsetTimeout()に置き換えて実行する",
        "eval()をtry-catchで囲み、エラーが発生した場合にのみブロックする",
      ],
      correctIndex: 1,
      explanation:
        "Math.jsのevaluate()は独自のパーサーを持ち、数学的な式のみを評価します。process、require、Functionなどのオブジェクトへのアクセスはパーサーが認識しないためエラーとなります。キーワードフィルタは回避手法が多く根本対策になりません。try-catchはコード実行自体を防止しません。",
      referenceLink: "/step06-server-side/eval-injection",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "eval()によるコードインジェクションは、SQLインジェクションやコマンドインジェクションと同じ「データとコードの混同」というパターンに分類される。",
      correctAnswer: true,
      explanation:
        "eval()インジェクション、SQLインジェクション、コマンドインジェクションはいずれも「ユーザーが提供したデータがコード（命令）として解釈・実行される」という共通の根本原因を持ちます。eval()ではJavaScriptコード、SQLiではSQL文、コマンドインジェクションではOSコマンドとして解釈されます。",
      referenceLink: "/step06-server-side/eval-injection",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "Node.jsでeval()を使用した場合、eval内のコードからprocess.envにアクセスして環境変数（DBの接続文字列やAPIキー等）を取得することはできない。",
      correctAnswer: false,
      explanation:
        "eval()は現在のプロセスのコンテキストで実行されるため、processオブジェクトを含むNode.jsの全てのグローバルオブジェクトにアクセスできます。JSON.stringify(process.env)を実行すれば、DB接続文字列、APIキー、秘密鍵などの環境変数が全て漏洩します。",
      referenceLink: "/step06-server-side/eval-injection",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "eval()インジェクションで数式APIからOSコマンド実行にエスカレーションする攻撃手順を正しい順序に並べ替えてください。",
      items: [
        "正常な数式（2 + 3）を送信して、eval()が使用されているか確認する",
        "typeof processを送信して、Node.jsのグローバルオブジェクトにアクセスできるか確認する",
        "process.mainModule.require('child_process')でchild_processモジュールにアクセスする",
        "execSync('id').toString()でOSコマンドを実行し、サーバーを掌握する",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 0, 3, 1],
      explanation:
        "攻撃者はまず正常な入力でAPIの動作を確認し、eval()の使用を推測します。次にtypeof processでNode.jsオブジェクトへのアクセスを確認し、process.mainModule.requireでchild_processモジュールを取得し、最終的にexecSyncでOSコマンドを実行します。この段階的なエスカレーションが典型的な攻撃パターンです。",
      referenceLink: "/step06-server-side/eval-injection",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "ESLintでeval()の使用を静的に検知するために有効にするルール名は no-______ である。（英語で回答）",
      correctAnswers: ["eval"],
      explanation:
        "ESLintのno-evalルールを有効にすると、コード内のeval()使用を静的解析で検知・警告できます。同様にno-new-funcルールでnew Function()の使用も検知できます。これらのルールを開発プロセスに組み込むことで、eval()が誤って使用されることを事前に防止できます。",
      referenceLink: "/step06-server-side/eval-injection",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "eval()インジェクションが成功した場合に実現されるRCEとは、______の略称である。（英語3単語で回答、各単語の頭文字を大文字にする）",
      correctAnswers: ["Remote Code Execution"],
      explanation:
        "RCE（Remote Code Execution = リモートコード実行）は、攻撃者がネットワーク経由でサーバー上の任意のコードを実行できる状態を指します。eval()インジェクションでRCEが成立すると、ファイルの読み書き、OSコマンドの実行、環境変数の取得など、サーバーの完全な制御が可能になります。",
      referenceLink: "/step06-server-side/eval-injection",
    },
  ],
} satisfies QuizData;
