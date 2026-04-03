import type { QuizData } from "../../components/quiz/types";

/**
 * Server-Side Template Injection (SSTI) - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "Server-Side Template Injection (SSTI) - 理解度テスト",
  description:
    "SSTIの攻撃手法・発生原因・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "SSTI が発生する根本原因はどれか？",
      options: [
        "テンプレートエンジンのバージョンが古いため",
        "ユーザー入力がテンプレートのデータではなく、テンプレート文字列自体に結合されるため",
        "HTTPS を使用していないため",
        "Content-Type ヘッダーが正しく設定されていないため",
      ],
      correctIndex: 1,
      explanation:
        "SSTI は、ユーザー入力がテンプレートの「データ（コンテキスト変数）」ではなく「テンプレート文字列（コード）」に直接結合されることで発生します。テンプレートエンジンはテンプレート文字列をコードとして解釈・実行するため、攻撃者が任意のテンプレート構文を注入できてしまいます。",
      referenceLink: "/step08-advanced/ssti",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "SSTI の安全な対策として最も適切なものはどれか？",
      options: [
        "ユーザー入力から {{ と }} を正規表現で除去する",
        "テンプレートは固定文字列とし、ユーザー入力はコンテキスト変数として渡す",
        "WAF でテンプレート構文をブロックする",
        "テンプレートエンジンを使用せずに文字列結合で HTML を生成する",
      ],
      correctIndex: 1,
      explanation:
        "根本対策は、テンプレート文字列を開発者が定義した固定値のみで構成し、ユーザー入力はテンプレートエンジンのデータ（コンテキスト変数）として渡すことです。これにより入力がテンプレート構文として解釈されることがなくなります。入力のフィルタリングやWAFはバイパス手法が多く根本対策になりません。",
      referenceLink: "/step08-advanced/ssti",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "SSTI は XSS と同様にブラウザ上でスクリプトが実行される攻撃である。",
      correctAnswer: false,
      explanation:
        "SSTI はサーバーサイドでコードが実行される攻撃です。XSS はブラウザ上でスクリプトが実行されますが、SSTI はテンプレートエンジンがサーバー上で動作するため、環境変数の読み取り、ファイルシステムへのアクセス、さらにはリモートコード実行（RCE）が可能になります。XSS より被害が深刻になりうる点が特徴です。",
      referenceLink: "/step08-advanced/ssti",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "SSTI の偵察フェーズでは、{{7*7}} のような算術式を入力し、結果が 49 と表示されるかどうかでテンプレートインジェクションの可能性を確認する。",
      correctAnswer: true,
      explanation:
        "{{7*7}} を入力して 49 と表示されれば、入力がテンプレート構文として評価されていることを意味します。これにより SSTI が可能であることが判明し、攻撃者はより危険なペイロード（環境変数の読み取りやコード実行）を試みます。",
      referenceLink: "/step08-advanced/ssti",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "SSTI 攻撃でサーバーの機密情報を窃取する流れを正しい順序に並べ替えてください。",
      items: [
        "名前入力フィールドに {{7*7}} を送信してテンプレートインジェクションの可能性を偵察する",
        "レスポンスに 49 が表示され、テンプレート構文が評価されていることを確認する",
        "constructor.constructor 経由で Function コンストラクタにアクセスする危険なペイロードを送信する",
        "サーバーが環境変数やシステム情報を含むレスポンスを返す",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 0, 3, 1],
      explanation:
        "SSTI 攻撃では、まず算術式で偵察し、テンプレートエンジンが入力を構文として評価するかを確認します。成功を確認した後、JavaScript の constructor.constructor を経由して Function コンストラクタにアクセスし、process.env 等の機密情報をサーバーから窃取します。",
      referenceLink: "/step08-advanced/ssti",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "安全な SSTI 対策では、テンプレートは固定文字列とし、ユーザー入力は engine.render(template, { ______ }) のようにデータとして渡す。（変数名を回答）",
      correctAnswers: ["name"],
      explanation:
        "安全な実装では engine.render(template, { name }) のように、ユーザー入力をコンテキスト変数としてテンプレートエンジンに渡します。テンプレート文字列は 'こんにちは、{{name}} さん！' のように固定し、ユーザー入力を含めません。これにより入力がテンプレート構文として解釈されなくなります。",
      referenceLink: "/step08-advanced/ssti",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "SSTI で JavaScript のすべてのオブジェクトが持つ ______ プロパティを経由して Function コンストラクタにアクセスし、任意のコードを実行できる。",
      correctAnswers: ["constructor", "__proto__"],
      explanation:
        "JavaScript では constructor.constructor を経由して Function コンストラクタにアクセスできます。テンプレートエンジンのサンドボックスが不十分な場合、{{constructor.constructor('return process.env')()}} のようなペイロードでサーバー上の機密情報にアクセスできてしまいます。",
      referenceLink: "/step08-advanced/ssti",
    },
  ],
} satisfies QuizData;
