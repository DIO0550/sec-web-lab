import type { QuizData } from "../../components/quiz/types";

/**
 * Insecure Deserialization - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "Insecure Deserialization - 理解度テスト",
  description:
    "安全でないデシリアライゼーションの攻撃手法・発生原因・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "Node.js で eval() を使ったデシリアライゼーションが危険な理由はどれか？",
      options: [
        "eval() は JSON のパースが JSON.parse() より遅いため",
        "eval() は文字列を JavaScript コードとして実行するため、任意のコード実行が可能になるため",
        "eval() は非同期処理をブロックするため",
        "eval() はメモリリークを引き起こすため",
      ],
      correctIndex: 1,
      explanation:
        "eval() は渡された文字列を JavaScript コードとしてそのまま実行します。ユーザー入力を eval() で処理すると、require('child_process').execSync('...') のような OS コマンドの実行も可能になり、サーバーの完全な制御権が奪われます。",
      referenceLink: "/step08-advanced/deserialization",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "eval() の安全な代替手段として最も適切なものはどれか？",
      options: [
        "new Function() でサンドボックス化する",
        "vm.runInNewContext() で隔離する",
        "JSON.parse() でデータとしてのみ解釈する",
        "setTimeout() で非同期に実行する",
      ],
      correctIndex: 2,
      explanation:
        "JSON.parse() は純粋なデータパーサーであり、関数呼び出しやコード実行は行いません。eval() と違い、require() や process 等のランタイム API にアクセスする手段がないため、安全にデータを復元できます。new Function() や vm.runInNewContext() もコード実行が可能なため根本対策にはなりません。",
      referenceLink: "/step08-advanced/deserialization",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "JSON.parse() は安全なデシリアライザであり、関数呼び出しやコード実行を行わない。",
      correctAnswer: true,
      explanation:
        "JSON.parse() は JSON 文字列をデータ構造に変換するだけで、コードの実行は行いません。require('child_process') のようなコードを送信しても、JSON として不正な形式なのでパースエラーになります。これが eval() との根本的な違いです。",
      referenceLink: "/step08-advanced/deserialization",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "深いマージ関数（deepMerge）で __proto__ キーをフィルタリングしなくても、JSON.parse() を使っていれば プロトタイプ汚染は発生しない。",
      correctAnswer: false,
      explanation:
        "JSON.parse() は __proto__ をキーとして持つ JSON を正しくパースします。パース自体は無害ですが、その結果を安全でない deepMerge 関数で処理すると、target['__proto__'] への代入が Object.prototype の汚染として機能します。JSON.parse() とは別に、マージ処理での __proto__ フィルタリングが必要です。",
      referenceLink: "/step08-advanced/deserialization",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "eval() を使ったデシリアライゼーション攻撃でサーバー情報を窃取する流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が設定データ投入エンドポイントに ({result: 1+1}) を送信し、式が評価されるか確認する",
        "レスポンスに {\"config\": {\"result\": 2}} が返され、eval() によるコード実行を確認する",
        "攻撃者が require('os').hostname() 等を含むペイロードを送信する",
        "サーバーが eval() で文字列を実行し、OS コマンドの結果が返される",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [3, 1, 0, 2],
      explanation:
        "まず簡単な算術式で eval() によるコード実行が可能かを確認し、成功を確認後に require('os') や require('child_process') を使った危険なペイロードを送信します。eval() はすべての JavaScript コードを実行できるため、サーバーの完全な制御が可能になります。",
      referenceLink: "/step08-advanced/deserialization",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "プロトタイプ汚染を防ぐ安全な深いマージでは、______、constructor、prototype の3つの特殊キーをフィルタリングする。（アンダースコアを含む文字列で回答）",
      correctAnswers: ["__proto__"],
      explanation:
        "__proto__、constructor、prototype は JavaScript でオブジェクトの内部構造（プロトタイプチェーン）にアクセスするための特殊なプロパティです。これらをフィルタリングすることで、深いマージ処理で Object.prototype が汚染されることを防げます。",
      referenceLink: "/step08-advanced/deserialization",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "ESLint でコード中の eval() 使用を静的に検知するルール名は ______ である。（ハイフンを含むルール名で回答）",
      correctAnswers: ["no-eval"],
      explanation:
        "ESLint の no-eval ルールは、コード中の eval() の使用を検知して警告またはエラーにします。eval() はユーザー入力に対して使用されると任意コード実行の脆弱性となるため、セキュリティ上の理由からプロジェクト全体で禁止することが推奨されます。",
      referenceLink: "/step08-advanced/deserialization",
    },
  ],
} satisfies QuizData;
