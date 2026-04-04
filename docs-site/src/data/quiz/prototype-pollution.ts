import type { QuizData } from "../../components/quiz/types";

/**
 * Prototype Pollution - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "Prototype Pollution - 理解度テスト",
  description:
    "プロトタイプ汚染の攻撃手法・発生メカニズム・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "Prototype Pollution が「全オブジェクトに影響する」理由はどれか？",
      options: [
        "JavaScript ではすべての変数がグローバルスコープに属するため",
        "Object.prototype はプロトタイプチェーンの終端であり、すべてのオブジェクトが共有するため",
        "Node.js がオブジェクトをキャッシュして再利用するため",
        "JSON.parse() がすべてのオブジェクトに同じプロパティを設定するため",
      ],
      correctIndex: 1,
      explanation:
        "JavaScript のすべてのオブジェクトは、プロトタイプチェーンを通じて Object.prototype を共有しています。Object.prototype にプロパティを注入すると、そのプロセス内のすべてのオブジェクトがそのプロパティを持つかのように振る舞います。",
      referenceLink: "/step08-advanced/prototype-pollution",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "Prototype Pollution の根本対策として適切でないものはどれか？",
      options: [
        "__proto__、constructor、prototype を危険なキーとしてフィルタリングする",
        "Object.create(null) でプロトタイプのないオブジェクトを使用する",
        "Map を使用してキーと値をプロトタイプチェーンと独立した構造に格納する",
        "JSON.stringify() でオブジェクトを文字列に変換してから保存する",
      ],
      correctIndex: 3,
      explanation:
        "JSON.stringify() はオブジェクトをシリアライズするだけで、プロトタイプ汚染の対策にはなりません。有効な対策は、危険なキーのフィルタリング、Object.create(null) によるプロトタイプチェーンのないオブジェクトの使用、Map による構造的な分離です。",
      referenceLink: "/step08-advanced/prototype-pollution",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "JSON.parse() で __proto__ をキーに持つ JSON をパースしただけでは、プロトタイプ汚染は発生しない。",
      correctAnswer: true,
      explanation:
        "JSON.parse() は __proto__ を通常の文字列キーとしてパースするだけで、プロトタイプチェーンへの代入は行いません。汚染が発生するのは、パース結果を deepMerge 等の再帰的マージ関数で処理する際に、target['__proto__'] への代入がプロトタイプへのアクセサとして機能するときです。",
      referenceLink: "/step08-advanced/prototype-pollution",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "Prototype Pollution は権限昇格だけでなく、child_process.spawn() のオプション汚染を通じてリモートコード実行（RCE）にも発展しうる。",
      correctAnswer: true,
      explanation:
        "child_process.spawn() はオプションオブジェクトを受け取りますが、shell や env が明示的に設定されていない場合、プロトタイプチェーンから値を取得します。Object.prototype.shell = true が設定されていると、コマンドがシェル経由で実行され、コマンドインジェクションやRCEが可能になります。",
      referenceLink: "/step08-advanced/prototype-pollution",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "Prototype Pollution による isAdmin 権限昇格の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が {\"__proto__\": {\"isAdmin\": true}} を含む JSON をマージエンドポイントに送信する",
        "サーバーの deepMerge() が __proto__ を通常のキーとして処理し Object.prototype が汚染される",
        "Object.prototype.isAdmin が true に設定される",
        "サーバーの if (user.isAdmin) チェックでプロトタイプチェーンから true が返される",
        "攻撃者を含むすべてのユーザーが管理者として扱われる",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 0, 4, 1, 2],
      explanation:
        "攻撃者が __proto__ を含む JSON を送信すると、deepMerge が Object.prototype を汚染し、isAdmin: true がすべてのオブジェクトから参照可能になります。user オブジェクト自身に isAdmin がなくても、プロトタイプチェーンを辿って true が返されるため、全ユーザーが管理者として認識されます。",
      referenceLink: "/step08-advanced/prototype-pollution",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "プロトタイプチェーンを持たないオブジェクトを作成するには Object.create(______) を使用する。",
      correctAnswers: ["null"],
      explanation:
        "Object.create(null) は [[Prototype]] が null のオブジェクトを作成します。このオブジェクトはプロトタイプチェーンを持たないため、万が一 __proto__ への代入が発生しても Object.prototype には影響しません。マージ先のオブジェクトとして使うことで安全性が向上します。",
      referenceLink: "/step08-advanced/prototype-pollution",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "JavaScript でオブジェクト自身が持つプロパティ（プロトタイプから継承したものではない）を確認するメソッドは Object.prototype.______ である。",
      correctAnswers: ["hasOwnProperty"],
      explanation:
        "hasOwnProperty() はオブジェクト自身が持つプロパティ（own property）かどうかを判定します。プロトタイプチェーンから継承されたプロパティは false を返します。Prototype Pollution の影響を受けないコードを書くには、obj.isAdmin ではなく obj.hasOwnProperty('isAdmin') でチェックすることが有効です。",
      referenceLink: "/step08-advanced/prototype-pollution",
    },
  ],
} satisfies QuizData;
