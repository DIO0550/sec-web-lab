import type { QuizData } from "../../components/quiz/types";

/**
 * 同一オリジンポリシーの理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "同一オリジンポリシー - 理解度テスト",
  description:
    "オリジンの定義、SOPの制限内容、SOPの例外、防げる攻撃と防げない攻撃についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "`https://example.com/page1` と同一オリジンであるURLはどれか？",
      options: [
        "http://example.com/page1",
        "https://api.example.com/page1",
        "https://example.com:8080/page1",
        "https://example.com/page2",
      ],
      correctIndex: 3,
      explanation:
        "オリジンはスキーム+ホスト+ポートの3つで定義されます。パスが異なるだけの `https://example.com/page2` は同一オリジンです。スキーム違い（http vs https）、ホスト違い（サブドメイン違い）、ポート違いはすべて異なるオリジンとなります。",
      referenceLink: "/foundations/browser/same-origin-policy/same-origin-policy",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "同一オリジンポリシー（SOP）で防ぐことができない攻撃はどれか？",
      options: [
        "異なるオリジンのiframeのDOMを読み取る攻撃",
        "fetchで異なるオリジンのAPIレスポンスを読み取る攻撃",
        "formタグを使ったCSRF攻撃",
        "異なるオリジンのページからJavaScriptでデータを窃取する攻撃",
      ],
      correctIndex: 2,
      explanation:
        "SOPはリクエストの送信自体を止めるものではなく、レスポンスの読み取りを制限します。formタグによるリクエスト送信はSOPの例外であり、Cookieも自動送信されるため、CSRF攻撃はSOPでは防げません。",
      referenceLink: "/foundations/browser/same-origin-policy/same-origin-policy",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "同一オリジンポリシーは、異なるオリジンへのリクエストの送信自体を完全にブロックする。",
      correctAnswer: false,
      explanation:
        "SOPが制限するのはレスポンスの読み取りであり、リクエストの送信自体は制限しない場合があります。特に単純リクエストやformタグによる送信はSOPに関係なく送信されます。これがCSRF攻撃が成立する理由の一つです。",
      referenceLink: "/foundations/browser/same-origin-policy/same-origin-policy",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "XSSで注入されたスクリプトは、被害者のページと同じオリジンで実行されるため、SOPの保護を受けられない。",
      correctAnswer: true,
      explanation:
        "XSSにより注入されたスクリプトは、被害者のページと同じオリジンで実行されます。SOPは「異なるオリジン」からのアクセスを制限するものであるため、同一オリジン内のスクリプトには制限がかかりません。",
      referenceLink: "/foundations/browser/same-origin-policy/same-origin-policy",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "オリジンを構成する3つの要素を正しい順序に並べ替えてください（URLの構成順）。",
      items: [
        "スキーム（https等）",
        "ホスト（example.com等）",
        "ポート（443等）",
      ],
      correctOrder: [0, 1, 2],
      initialOrder: [2, 0, 1],
      explanation:
        "オリジンはスキーム（プロトコル）、ホスト（ドメイン名）、ポート番号の3つの組み合わせで定義されます。URLの構成順に並べると、スキーム→ホスト→ポートの順になります。",
      referenceLink: "/foundations/browser/same-origin-policy/same-origin-policy",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "同一オリジンポリシーの英語略称は ______ である。（アルファベット大文字3文字で回答）",
      correctAnswers: ["SOP"],
      explanation:
        "SOP（Same-Origin Policy）は、あるオリジンから読み込まれたドキュメントやスクリプトが、別のオリジンのリソースにアクセスすることを制限するブラウザのセキュリティ機構です。",
      referenceLink: "/foundations/browser/same-origin-policy/same-origin-policy",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "攻撃者が被害者のブラウザを経由して攻撃する手法を ______ 攻撃と呼ぶ。（漢字で回答）",
      correctAnswers: ["受動的", "受動的攻撃"],
      explanation:
        "受動的攻撃（Passive Attack）は、攻撃者が罠を仕掛け、被害者がそれを踏むのを待つ攻撃手法です。XSSやCSRFが代表例で、正規ユーザーのブラウザから正規のリクエストが送信されるため、サーバーからは区別しにくい特徴があります。",
      referenceLink: "/foundations/browser/same-origin-policy/same-origin-policy",
    },
  ],
} satisfies QuizData;
