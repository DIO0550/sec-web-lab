import type { QuizData } from "../../components/quiz/types";

/**
 * 文字エンコーディングとセキュリティの理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "文字エンコーディングとセキュリティ - 理解度テスト",
  description:
    "文字集合とエンコーディングの基礎、UTF-8の仕組み、エンコーディングに起因する脆弱性についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "Shift_JISの「5C問題」が引き起こすセキュリティ上の問題はどれか？",
      options: [
        "文字化けによりユーザー体験が悪化する",
        "漢字の2バイト目がバックスラッシュと同じ値（0x5C）になり、エスケープ処理が破壊される",
        "Shift_JISはASCII互換性がないためURLが壊れる",
        "ファイルサイズが大きくなりパフォーマンスが低下する",
      ],
      correctIndex: 1,
      explanation:
        "Shift_JISでは「表」「能」「ソ」などの漢字の2バイト目が0x5C（バックスラッシュ）と同じ値になります。バイト単位でエスケープ処理を行うシステムでは、このマルチバイト文字が誤解釈され、SQLインジェクションやXSSの原因になります。",
      referenceLink: "/foundations/input-handling/character-encoding/character-encoding",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "サーバーがContent-Typeヘッダでcharsetを明示しない場合に起きるセキュリティ上のリスクはどれか？",
      options: [
        "ブラウザがページを表示できなくなる",
        "ブラウザのエンコーディング自動判別を攻撃者に悪用され、意図しないエンコーディングで解釈される",
        "サーバーのメモリ使用量が増大する",
        "HTTPSの証明書検証が失敗する",
      ],
      correctIndex: 1,
      explanation:
        "charsetが指定されていないと、ブラウザがエンコーディングを自動判別します。攻撃者はこれを悪用し、UTF-7などの特殊なエンコーディングで解釈させることで、XSS攻撃を成立させる可能性があります。",
      referenceLink: "/foundations/input-handling/character-encoding/character-encoding",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "UTF-8の非最短形式（overlong encoding）は、現代のRFC 3629準拠パーサでは不正なバイト列として拒否される。",
      correctAnswer: true,
      explanation:
        "RFC 3629では非最短形式は禁止されており、現代のUTF-8パーサはこれを不正なバイト列として拒否します。Node.jsのTextDecoder（fatal: true）もデフォルトで非最短形式を拒否します。ただし、古いシステムや独自実装のパーサでは受け入れてしまう場合があります。",
      referenceLink: "/foundations/input-handling/character-encoding/character-encoding",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "文字集合（character set）と文字エンコーディング（character encoding）は同じ概念である。",
      correctAnswer: false,
      explanation:
        "文字集合は使用可能な文字の集合と各文字に割り当てられた番号（コードポイント）を定義するものです。文字エンコーディングは、そのコードポイントをバイト列に変換する規則です。例えば、Unicodeは文字集合であり、UTF-8やUTF-16はそのエンコーディングです。",
      referenceLink: "/foundations/input-handling/character-encoding/character-encoding",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "UTF-8でASCII文字「A」のバイト表現から文字への変換過程を正しい順序に並べ替えてください。",
      items: [
        "文字「A」のUnicodeコードポイントを確認する（U+0041）",
        "コードポイントの範囲からUTF-8のバイト数を決定する（1バイト）",
        "UTF-8のバイトパターン（0xxxxxxx）に当てはめる",
        "最終的なバイト列（0x41）が得られる",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 3, 0, 1],
      explanation:
        "UTF-8のエンコードでは、まず文字のUnicodeコードポイントを確認し、範囲に応じてバイト数を決定します。そのバイトパターンにコードポイントのビットを当てはめて、最終的なバイト列を得ます。",
      referenceLink: "/foundations/input-handling/character-encoding/character-encoding",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "現在のWebの標準文字エンコーディングは ______ である。",
      correctAnswers: ["UTF-8", "utf-8", "utf8", "UTF8"],
      explanation:
        "UTF-8は現在のWebの標準エンコーディングです。ASCII互換性を持ちつつ、Unicodeのすべての文字を1〜4バイトの可変長で表現できます。セキュリティ上も、アプリケーション全体でUTF-8に統一することが最も重要な対策です。",
      referenceLink: "/foundations/input-handling/character-encoding/character-encoding",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "Node.jsで不正なUTF-8バイト列を検出するには、TextDecoderのコンストラクタオプションで ______ をtrueに設定する。",
      correctAnswers: ["fatal"],
      explanation:
        "TextDecoderのコンストラクタにfatal: trueオプションを指定すると、不正なバイト列（非最短形式や不完全なマルチバイト等）に遭遇した際にTypeErrorがスローされます。デフォルトでは不正なバイト列が置換文字（U+FFFD）に置き換えられるだけでエラーになりません。",
      referenceLink: "/foundations/input-handling/character-encoding/character-encoding",
    },
  ],
} satisfies QuizData;
