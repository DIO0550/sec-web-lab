import type { QuizData } from "../../components/quiz/types";

/**
 * JavaScript・DOMの基礎の理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "JavaScript・DOMの基礎 - 理解度テスト",
  description:
    "DOM操作のセキュリティ、evalの危険性、プロトタイプチェーンとPrototype Pollutionについての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "ユーザー入力をDOMに反映する際、XSSを防ぐために使うべきプロパティはどれか？",
      options: [
        "element.innerHTML",
        "element.outerHTML",
        "element.textContent",
        "element.insertAdjacentHTML",
      ],
      correctIndex: 2,
      explanation:
        "textContentはHTMLタグを解釈せずテキストとしてそのまま設定するため、XSSのリスクがありません。innerHTMLやouterHTML、insertAdjacentHTMLはHTMLとして解釈されるため、ユーザー入力をそのまま渡すとスクリプトが実行される可能性があります。",
      referenceLink: "/foundations/js-dom/js-dom-basics/js-dom-basics",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "Prototype Pollution攻撃で `Object.prototype` が汚染されると何が起きるか？",
      options: [
        "ブラウザがクラッシュする",
        "すべてのオブジェクトに攻撃者が定義したプロパティが追加され、認可バイパスなどが起きる",
        "JavaScriptのガベージコレクションが停止する",
        "DOMツリーが破壊される",
      ],
      correctIndex: 1,
      explanation:
        "Object.prototypeはすべてのオブジェクトの祖先であるため、ここにプロパティを追加すると、既存・新規を問わずすべてのオブジェクトにそのプロパティが現れます。例えば isAdmin: true を注入されると、権限チェックがバイパスされる可能性があります。",
      referenceLink: "/foundations/js-dom/js-dom-basics/js-dom-basics",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "eval()の代わりにnew Function()を使えば、ユーザー入力を安全に実行できる。",
      correctAnswer: false,
      explanation:
        "new Function()はeval()と同等に危険です。文字列をJavaScriptコードとして実行するため、ユーザー入力を渡すと任意のコード実行を許可してしまいます。setTimeout()やsetInterval()に文字列引数を渡す場合も同様に危険です。",
      referenceLink: "/foundations/js-dom/js-dom-basics/js-dom-basics",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "DOMイベントは子要素から親要素に向かってバブリング（伝搬）する。",
      correctAnswer: true,
      explanation:
        "DOMイベントは子要素で発生した後、親要素に向かってバブリング（伝搬）します。この仕組みを利用して、親要素でイベントを委譲して処理する「イベントデリゲーション」というパターンが使われます。",
      referenceLink: "/foundations/js-dom/js-dom-basics/js-dom-basics",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "JavaScriptのプロトタイプチェーンにおけるプロパティ探索の順序を正しく並べ替えてください。",
      items: [
        "オブジェクト自身のプロパティを確認する",
        "オブジェクトのプロトタイプ（__proto__）を確認する",
        "プロトタイプチェーンを辿り、Object.prototypeまで探索する",
        "見つからなければundefinedを返す",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 0, 3, 1],
      explanation:
        "プロパティへのアクセス時、まずオブジェクト自身を確認し、なければプロトタイプ、さらにその上のプロトタイプと辿っていきます。Object.prototypeまで探索しても見つからなければundefinedが返されます。",
      referenceLink: "/foundations/js-dom/js-dom-basics/js-dom-basics",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "HTMLドキュメントをプログラムから操作するためのAPIの名称は ______ である。（アルファベット大文字3文字で回答）",
      correctAnswers: ["DOM"],
      explanation:
        "DOM（Document Object Model）は、HTMLドキュメントをプログラムから操作するためのAPIです。ブラウザはHTMLを解析してDOMツリー（木構造）を構築し、JavaScriptからこのツリーを読み書きできるようにします。",
      referenceLink: "/foundations/js-dom/js-dom-basics/js-dom-basics",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "Prototype Pollution対策として、プロトタイプを持たないオブジェクトを生成する方法は `Object.create(______)` である。",
      correctAnswers: ["null"],
      explanation:
        "Object.create(null)で生成されたオブジェクトはプロトタイプを持たないため、__proto__プロパティが存在しません。これにより、プロトタイプチェーンを通じた汚染の影響を受けないオブジェクトを安全に使用できます。",
      referenceLink: "/foundations/js-dom/js-dom-basics/js-dom-basics",
    },
  ],
} satisfies QuizData;
