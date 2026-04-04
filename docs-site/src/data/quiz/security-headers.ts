import type { QuizData } from "../../components/quiz/types";

/**
 * Security Headers - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "セキュリティヘッダー - 理解度テスト",
  description:
    "セキュリティレスポンスヘッダの役割と設定方法についての理解度をチェックしましょう。",
  questions: [
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "Content-Security-Policy（CSP）ヘッダーがXSS攻撃の被害を軽減する仕組みとして正しいものはどれか？",
      options: [
        "CSPがXSSの脆弱性自体を検出して修正する",
        "CSPがリソースの読み込み元を制限し、インラインスクリプトや外部スクリプトの実行をブロックする",
        "CSPがユーザーの入力値を自動的にサニタイズする",
        "CSPがブラウザのJavaScriptエンジンを完全に無効化する",
      ],
      correctIndex: 1,
      explanation:
        "CSPはリソース（スクリプト、スタイル、画像等）の読み込み元を制限するヘッダーです。script-src 'self'を設定すると、自オリジン以外からのスクリプト読み込みとインラインスクリプトの実行がブロックされます。XSS脆弱性自体は修正しませんが、攻撃が成功した場合の被害を大幅に軽減します。",
      referenceLink: "/step07-design/security-headers",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "CSPをいきなりenforceモードで導入するのが危険な理由はどれか？",
      options: [
        "enforceモードはサーバーの処理速度を著しく低下させるため",
        "enforceモードはブラウザの互換性が低いため",
        "正当なスクリプトやスタイルまでブロックしてしまい、サイトが正常に動作しなくなるリスクがあるため",
        "enforceモードはHTTPSでのみ動作するため",
      ],
      correctIndex: 2,
      explanation:
        "既存のアプリケーションに厳格なCSPを適用すると、正当なインラインスクリプトやサードパーティリソースもブロックされ、サイトが正常に動作しなくなります。まずContent-Security-Policy-Report-Only（監視モード）で違反レポートを収集・分析し、問題がないことを確認してからenforceに切り替える段階的導入が推奨されます。",
      referenceLink: "/step07-design/security-headers",
    },
    {
      id: "tf-1",
      type: "true-false",
      text: "セキュリティヘッダーはサーバーが明示的に設定しなければブラウザに付与されないため、多くのWebフレームワークではデフォルトでブラウザの保護機能が無効のままになっている。",
      correctAnswer: true,
      explanation:
        "ブラウザはデフォルトでは最小限の制約しかかけない設計になっています。サーバーから明示的なヘッダーの指示がなければ、インラインスクリプト実行、iframe埋め込み、MIMEスニッフィング等を許容する「許容的」な動作がデフォルトです。",
      referenceLink: "/step07-design/security-headers",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "X-Content-Type-Options: nosniff を設定すると、ブラウザがファイルの中身を推測してスクリプトとして実行するMIMEスニッフィングが防止される。",
      correctAnswer: true,
      explanation:
        "X-Content-Type-Options: nosniffを設定すると、ブラウザはContent-Typeヘッダーで指定されたMIMEタイプを厳密に尊重し、ファイルの中身からMIMEタイプを推測する動作（MIMEスニッフィング）を行いません。これによりテキストファイルがスクリプトとして実行されることを防ぎます。",
      referenceLink: "/step07-design/security-headers",
    },
    {
      id: "ord-1",
      type: "ordering",
      text: "CSPの段階的導入の手順を正しい順序に並べ替えてください。",
      items: [
        "Content-Security-Policy-Report-Onlyヘッダーを設定する",
        "レポートを収集して違反を分析する",
        "正当なリソースがブロックされないようポリシーを調整する",
        "Content-Security-Policyヘッダー（enforceモード）に切り替える",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [3, 1, 0, 2],
      explanation:
        "まずReport-Onlyモードで監視を開始し、どのリソースが違反するかを把握します。レポートを分析してポリシーを調整し、正当なリソースがブロックされないことを確認してからenforceモードに切り替えます。",
      referenceLink: "/step07-design/security-headers",
    },
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "Honoで主要なセキュリティヘッダーを一括設定できる組み込みミドルウェアの名前は ______ である。（キャメルケースで回答）",
      correctAnswers: ["secureHeaders"],
      explanation:
        "HonoのsecureHeadersミドルウェアは、CSP、HSTS、X-Content-Type-Options、X-Frame-Options、Referrer-Policy、Permissions-Policyなどのセキュリティヘッダーを1つの関数呼び出しで一括設定できます。",
      referenceLink: "/step07-design/security-headers",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "ブラウザAPIの使用（カメラ、マイク等）を制限するセキュリティヘッダーは ______-Policy である。（英単語1語で回答）",
      correctAnswers: ["Permissions"],
      explanation:
        "Permissions-Policyヘッダーは、カメラ、マイク、位置情報などのブラウザAPIへのアクセスを制限します。camera=(), microphone=()のように設定することで、XSSと組み合わせたカメラ・マイクの無断使用を防止します。",
      referenceLink: "/step07-design/security-headers",
    },
  ],
} satisfies QuizData;
