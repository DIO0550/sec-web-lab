import type { QuizData } from "../../components/quiz/types";

/**
 * セキュリティヘッダーの欠如 - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "セキュリティヘッダーの欠如 - 理解度テスト",
  description:
    "セキュリティヘッダーの役割とその欠如による脆弱性についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "X-Frame-Options: DENY ヘッダーが設定されていない場合、可能になる攻撃はどれか？",
      options: [
        "SQLインジェクション",
        "クリックジャッキング（iframe埋め込みによるユーザー操作の乗っ取り）",
        "クロスサイトスクリプティング（XSS）",
        "ディレクトリトラバーサル",
      ],
      correctIndex: 1,
      explanation:
        "X-Frame-Optionsが設定されていないと、攻撃者はターゲットサイトをiframeに埋め込んだ罠ページを作成できます。透明なiframeの上にボタンを重ねることで、ユーザーは「景品を受け取る」をクリックしているつもりで実際には「送金」ボタンを押してしまいます。",
      referenceLink: "/step01-recon/header-exposure",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "セキュリティヘッダーが付与されていない場合のブラウザの挙動として正しいものはどれか？",
      options: [
        "ブラウザがエラーを表示してページの読み込みを拒否する",
        "ブラウザが自動的にセキュリティヘッダーを補完する",
        "歴史的な互換性を優先し、保護機能を無効のままにする",
        "ブラウザがサーバーにヘッダーの再送を要求する",
      ],
      correctIndex: 2,
      explanation:
        "ブラウザは「サーバーから指示がなければ、歴史的な互換性を優先する」設計になっています。セキュリティヘッダーが明示的に設定されていなければ、MIMEスニッフィングやiframe埋め込みなどの保護機能は有効にならず、攻撃に対して無防備になります。",
      referenceLink: "/step01-recon/header-exposure",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "Content-Security-Policy ヘッダーを設定することで、外部スクリプトの読み込みを制限し、XSS攻撃の追加防御層として機能する。",
      correctAnswer: true,
      explanation:
        "Content-Security-Policy (CSP) は、ブラウザが読み込むリソースの出自を制限するヘッダーです。default-src 'self' のように設定すると、自ドメイン以外からのスクリプト読み込みが禁止され、XSS攻撃の成功率を大幅に低減できます。",
      referenceLink: "/step01-recon/header-exposure",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "セキュリティヘッダーを全て設定すれば、Webアプリケーションのセキュリティは完全に確保される。",
      correctAnswer: false,
      explanation:
        "セキュリティヘッダーは多層防御の一部であり、これだけで完全に安全にはなりません。入力バリデーション、認証・認可、暗号化など他のセキュリティ対策と組み合わせることが必要です。セキュリティヘッダーはブラウザの保護機能を有効にする「追加の防御層」です。",
      referenceLink: "/step01-recon/header-exposure",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "セキュリティヘッダーの欠如を悪用したクリックジャッキング攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がcurl -Iでターゲットサイトのレスポンスヘッダーを確認する",
        "X-Frame-Optionsヘッダーが欠如していることを発見する",
        "ターゲットサイトを透明なiframeに埋め込んだ罠ページを作成する",
        "被害者が罠ページのボタンをクリックし、意図しない操作が実行される",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [1, 3, 0, 2],
      explanation:
        "攻撃者はまずヘッダーを確認し、X-Frame-Optionsの欠如を発見します。次にターゲットサイトを透明なiframeに埋め込んだ罠ページを作成し、被害者をそのページに誘導します。被害者は罠ページのボタンをクリックしているつもりで、実際にはiframe内の操作を実行してしまいます。",
      referenceLink: "/step01-recon/header-exposure",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "ブラウザのMIMEスニッフィングを防止するために設定するヘッダーは X-Content-Type-Options: ______ である。（英小文字で回答）",
      correctAnswers: ["nosniff"],
      explanation:
        "X-Content-Type-Options: nosniff を設定すると、ブラウザはContent-Typeヘッダーの値を厳密に適用し、コンテンツの中身を推測して解釈する動作（MIMEスニッフィング）を行わなくなります。これにより、悪意のあるファイルがスクリプトとして実行されるリスクを防ぎます。",
      referenceLink: "/step01-recon/header-exposure",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "iframe埋め込みを完全に禁止するX-Frame-Optionsヘッダーの値は ______ である。（英大文字で回答）",
      correctAnswers: ["DENY"],
      explanation:
        "X-Frame-Options: DENY を設定すると、そのページはどのサイトのiframeにも埋め込めなくなります。SAMEORIGINを設定した場合は同一オリジンからの埋め込みのみ許可されます。クリックジャッキング対策として重要なヘッダーです。",
      referenceLink: "/step01-recon/header-exposure",
    },
  ],
} satisfies QuizData;
