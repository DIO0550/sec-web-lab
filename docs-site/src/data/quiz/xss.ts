import type { QuizData } from "../../components/quiz/types";

/**
 * Cross-Site Scripting (XSS) - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "Cross-Site Scripting (XSS) - 理解度テスト",
  description:
    "XSSの攻撃手法・種類・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "Reflected XSS と Stored XSS の最も大きな違いはどれか？",
      options: [
        "Reflected XSS はサーバー側で発生し、Stored XSS はクライアント側で発生する",
        "Reflected XSS は攻撃コードが URL に含まれ、Stored XSS は攻撃コードがデータベースに保存される",
        "Reflected XSS は JavaScript を使い、Stored XSS は HTML のみを使う",
        "Reflected XSS は対策が困難だが、Stored XSS は容易に対策できる",
      ],
      correctIndex: 1,
      explanation:
        "Reflected XSS は攻撃コードが URL パラメータに含まれ、サーバーがそれをレスポンスに反映することで発生します。一方、Stored XSS は攻撃コードがデータベースに保存され、他のユーザーがそのデータを含むページを表示するたびに実行されます。Stored XSS はリンクのクリックが不要で、ページを表示するだけで攻撃が成立する点がより危険です。",
      referenceLink: "/step02-injection/xss",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "XSS 対策として最も根本的かつ重要な方法はどれか？",
      options: [
        "WAF（Web Application Firewall）で <script> パターンをブロックする",
        "Cookie に HttpOnly 属性を付与する",
        "出力時にコンテキストに応じたエスケープ処理を行う",
        "Content-Security-Policy ヘッダーを設定する",
      ],
      correctIndex: 2,
      explanation:
        "出力エスケープが XSS の根本対策です。HTML コンテキストでは < を &lt; に、> を &gt; に変換することで、ユーザー入力が HTML タグとして解釈されることを防ぎます。CSP や HttpOnly Cookie は多層防御として有効ですが、エスケープ漏れの保険であり根本対策ではありません。WAF はバイパス手法が多く根本対策になりません。",
      referenceLink: "/step02-injection/xss",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "React の JSX で {} 式を使って値を出力する場合、デフォルトでエスケープ処理が行われるため、通常は XSS が発生しない。",
      correctAnswer: true,
      explanation:
        "React の JSX では {} 式で出力された値はデフォルトでエスケープされます。ただし dangerouslySetInnerHTML を使用した場合はエスケープが行われないため、DOM-based XSS が発生する可能性があります。",
      referenceLink: "/step02-injection/xss",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "HttpOnly 属性を Cookie に設定すれば、XSS 攻撃によるすべての被害を完全に防ぐことができる。",
      correctAnswer: false,
      explanation:
        "HttpOnly 属性は JavaScript からの Cookie アクセスを禁止するため、Cookie の窃取は防げます。しかし XSS が成立すれば、ページ内容の改ざん、フィッシングフォームの埋め込み、キーロガーの設置など、Cookie 窃取以外の被害は防げません。HttpOnly は多層防御の一部であり、根本対策ではありません。",
      referenceLink: "/step02-injection/xss",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "Reflected XSS による Cookie 窃取攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が悪意あるスクリプトを含む URL を作成し、被害者に送信する",
        "被害者がリンクをクリックし、脆弱な Web サーバーにリクエストを送信する",
        "サーバーが入力値をエスケープせずに HTML レスポンスに埋め込んで返す",
        "被害者のブラウザが HTML を解析し、スクリプトをそのオリジンの権限で実行する",
        "盗まれた Cookie が攻撃者のサーバーに送信される",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [2, 4, 0, 3, 1],
      explanation:
        "Reflected XSS では、攻撃者がスクリプトを含む URL を作成し、被害者がそのリンクをクリックしてサーバーにリクエストを送ります。サーバーが入力値をエスケープせずに HTML に埋め込むと、ブラウザがそのスクリプトをそのオリジンの正規コードとして実行し、Cookie が攻撃者のサーバーに送信されます。",
      referenceLink: "/step02-injection/xss",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "HTML エスケープでは、< という文字を ______ という文字参照に変換することで、ブラウザがタグの開始として解釈することを防ぐ。（&で始まる文字参照を回答）",
      correctAnswers: ["&lt;"],
      explanation:
        "< を &lt; に変換することで、ブラウザは <script> をタグではなく「<script>」というテキストとして表示します。同様に > は &gt; に、\" は &quot; に変換します。これが出力エスケープの基本です。",
      referenceLink: "/step02-injection/xss",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "React で HTML 文字列をエスケープせずに DOM に挿入するために使用する、XSS のリスクがある属性の名前は ______ である。（キャメルケースで回答）",
      correctAnswers: ["dangerouslySetInnerHTML"],
      explanation:
        "dangerouslySetInnerHTML は React で HTML 文字列を直接 DOM に挿入するための属性です。名前に「dangerously」が含まれている通り、この属性を使うとエスケープが行われず、XSS のリスクが生じます。DOM-based XSS の原因となります。",
      referenceLink: "/step02-injection/xss",
    },
  ],
} satisfies QuizData;
