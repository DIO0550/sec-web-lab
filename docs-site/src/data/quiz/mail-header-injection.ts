import type { QuizData } from "../../components/quiz/types";

/**
 * Mail Header Injection - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "Mail Header Injection - 理解度テスト",
  description:
    "メールヘッダーインジェクションの攻撃手法・仕組み・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "メールヘッダーインジェクションで攻撃者が件名フィールドに注入する制御文字はどれか？",
      options: [
        "NULL文字（\\0）",
        "タブ文字（\\t）",
        "CRLF（\\r\\n）",
        "バックスラッシュ（\\\\）",
      ],
      correctIndex: 2,
      explanation:
        "メールヘッダーインジェクションでは CRLF（\\r\\n）を注入します。メールプロトコル（RFC 5322）ではヘッダーフィールドの区切りが CRLF に依存しているため、ヘッダーの値に CRLF を注入することで新しいヘッダーフィールド（Bcc 等）を追加できてしまいます。",
      referenceLink: "/step02-injection/mail-header-injection",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "メールヘッダーインジェクションの根本対策として最も適切なものはどれか？",
      options: [
        "メール送信機能を廃止する",
        "ヘッダーに設定する全てのユーザー入力から改行コード（\\r と \\n）を除去する",
        "送信先メールアドレスを暗号化する",
        "メール本文のみをサニタイズする",
      ],
      correctIndex: 1,
      explanation:
        "メールヘッダーに使用する全てのユーザー入力から \\r と \\n を除去することが根本対策です。CRLF が除去されればヘッダーの境界として機能しなくなり、注入された文字列はヘッダー値の一部として扱われます。さらにメールライブラリの安全な API を使用することも推奨されます。",
      referenceLink: "/step02-injection/mail-header-injection",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "メールヘッダーインジェクションでは、Bcc ヘッダーの追加だけでなく、CRLF を2回連続で注入することでメール本文まで完全に制御できる。",
      correctAnswer: true,
      explanation:
        "メールプロトコルではヘッダーとボディの境界は空行（CRLF が2回連続: \\r\\n\\r\\n）で区切られます。攻撃者が CRLF を2回連続で注入すると、ヘッダー部を終了させてメールの本文を自由に書き替えることができます。Content-Type を text/html に変更し、フィッシング用の HTML を注入することも可能です。",
      referenceLink: "/step02-injection/mail-header-injection",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "メールヘッダーインジェクションによるスパム送信が行われると、正規のメールサーバーがブラックリストに登録され、正常なメール配信にも影響が出る可能性がある。",
      correctAnswer: true,
      explanation:
        "メールヘッダーインジェクションで大量の Bcc アドレスを注入してスパムを送信すると、正規のメールサーバーがスパム送信元として各種ブラックリストに登録されます。その結果、組織の正常なビジネスメールまで配信できなくなり、メールインフラ全体に影響が及びます。",
      referenceLink: "/step02-injection/mail-header-injection",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "メールヘッダーインジェクションによるスパム送信攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がお問い合わせフォームの件名に CRLF + Bcc ヘッダーを含む文字列を入力する",
        "サーバーがユーザー入力をそのままメールヘッダーに文字列結合する",
        "CRLF が Subject ヘッダーを終了させ、Bcc が新しい独立したヘッダーとして解釈される",
        "SMTP サーバーが Bcc に指定された全アドレスにメールを配信する",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 0, 3, 1],
      explanation:
        "攻撃者が件名に CRLF を含む文字列を入力し、サーバーがそれをサニタイズせずにメールヘッダーに結合します。CRLF が Subject ヘッダーの値を終了させ、続く Bcc: が新しいヘッダーフィールドとして解釈されます。SMTP サーバーはこの Bcc を正規のものとして処理し、指定された全アドレスにメールを送信します。",
      referenceLink: "/step02-injection/mail-header-injection",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "メールプロトコル（RFC 5322）において、ヘッダー部とボディ部の境界は ______ で区切られる。（日本語で回答）",
      correctAnswers: ["空行", "空行（CRLFが2回連続）"],
      explanation:
        "メールメッセージではヘッダー部とボディ部は空行（CRLF が2回連続: \\r\\n\\r\\n）で区切られます。この仕様を悪用して CRLF を2回注入すると、ヘッダー部を強制的に終了させ、攻撃者がメール本文を自由に制御できてしまいます。",
      referenceLink: "/step02-injection/mail-header-injection",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "他の受信者にメールのコピーを送信しつつ、そのアドレスが他の受信者から見えないようにするメールヘッダーは ______ である。（英語で回答）",
      correctAnswers: ["Bcc"],
      explanation:
        "Bcc（Blind Carbon Copy）ヘッダーは他の受信者にメールのコピーを送信しますが、アドレスは他の受信者からは見えません。メールヘッダーインジェクションでは、このBccヘッダーを注入することで、正規の受信者に知られずに攻撃者の指定したアドレスにメールのコピーを送信できます。",
      referenceLink: "/step02-injection/mail-header-injection",
    },
  ],
} satisfies QuizData;
