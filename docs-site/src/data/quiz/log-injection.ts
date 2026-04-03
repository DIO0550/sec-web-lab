import type { QuizData } from "../../components/quiz/types";

/**
 * ログインジェクションの理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "ログインジェクション - 理解度テスト",
  description:
    "ログインジェクションの攻撃手法、改行文字を使ったログ偽造、サニタイズと構造化ログによる防御についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "ログインジェクション攻撃で攻撃者がユーザー名に含める最も重要な文字はどれか？",
      options: [
        "シングルクォート（'）",
        "改行文字（\\n）",
        "セミコロン（;）",
        "アンパサンド（&）",
      ],
      correctIndex: 1,
      explanation:
        "ログインジェクションでは改行文字（\\n）が最も重要です。テキスト形式のログでは改行がエントリの区切りとなるため、改行を含む入力を送ることでログに偽のエントリを挿入できます。",
      referenceLink: "/step09-defense/log-injection",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "ログインジェクションの根本対策として最も効果的な組み合わせはどれか？",
      options: [
        "ログファイルの暗号化とアクセス制限",
        "入力のサニタイズと構造化ログ（JSON形式）の使用",
        "ログの出力量を最小限に抑える",
        "ログをクラウドストレージに保存する",
      ],
      correctIndex: 1,
      explanation:
        "入力のサニタイズ（制御文字の除去）と構造化ログ（JSON形式）の組み合わせが根本対策です。構造化ログではユーザー入力はフィールド値として扱われるため、改行があってもログの構造を破壊できません。",
      referenceLink: "/step09-defense/log-injection",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "JSON形式の構造化ログを使用すれば、ユーザー入力に改行文字が含まれていてもログの構造は破壊されない。",
      correctAnswer: true,
      explanation:
        "JSON形式の構造化ログでは、ユーザー入力はフィールドの値として扱われます。JSON内では改行文字は\\nとしてエスケープされるため、ログエントリの区切りとして解釈されず、ログの構造を破壊できません。",
      referenceLink: "/step09-defense/log-injection",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "ログインジェクションによる被害は、ログの信頼性が損なわれるだけで、実際のセキュリティインシデントには発展しない。",
      correctAnswer: false,
      explanation:
        "ログインジェクションは深刻な被害をもたらします。偽のログエントリにより攻撃行為が正常操作に見せかけられ検知が遅れたり、SIEMが偽ログに反応して大量のアラートを発報し正規のアラートが埋もれる（アラート疲れ）問題が発生します。",
      referenceLink: "/step09-defense/log-injection",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "ログインジェクション攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が改行コードを含むユーザー名でログインリクエストを送信する",
        "サーバーがユーザー入力をサニタイズせずにconsole.logに書き込む",
        "改行文字が実際の改行として解釈され、偽のログエントリが記録される",
        "ログ分析者やSIEMシステムが偽エントリを正規のログとして扱ってしまう",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 0, 3, 1],
      explanation:
        "攻撃者が改行を含む入力を送信し、サニタイズされずにログに書き込まれると、改行が新しいエントリとして解釈されます。ログシステムは偽エントリを正規のものと区別できません。",
      referenceLink: "/step09-defense/log-injection",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "ログに書き込む前にユーザー入力から除去すべき制御文字には、改行（\\n）、キャリッジリターン（\\r）、______ などがある。（記号1文字で回答）",
      correctAnswers: ["\\t", "タブ", "tab", "Tab", "TAB"],
      explanation:
        "ログ用のサニタイズでは改行（\\n）、キャリッジリターン（\\r）、タブ（\\t）などの制御文字を除去します。sanitizeForLog関数ではこれらの文字をreplace(/[\\r\\n\\t]/g, '')で除去します。",
      referenceLink: "/step09-defense/log-injection",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "CWE-117 は「ログに対する不適切な出力 ______」としてログインジェクションを分類している。（カタカナで回答）",
      correctAnswers: [
        "ニュートラライゼーション",
        "ニュートラリゼーション",
        "サニタイゼーション",
        "エスケープ",
        "無害化",
      ],
      explanation:
        "CWE-117は「Improper Output Neutralization for Logs（ログに対する不適切な出力ニュートラライゼーション）」として分類されています。ログに書き込む前にユーザー入力を無害化（ニュートラライズ）することが求められます。",
      referenceLink: "/step09-defense/log-injection",
    },
  ],
} satisfies QuizData;
