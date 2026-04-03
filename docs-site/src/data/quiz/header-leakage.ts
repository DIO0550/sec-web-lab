import type { QuizData } from "../../components/quiz/types";

/**
 * HTTPヘッダーからの情報漏洩 - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "HTTPヘッダーからの情報漏洩 - 理解度テスト",
  description:
    "HTTPレスポンスヘッダーに含まれる技術情報の漏洩リスクと対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "攻撃者がHTTPレスポンスヘッダーから技術スタック情報を取得する主な目的は何か？",
      options: [
        "Webサイトのデザインを模倣するため",
        "サーバーのパフォーマンスを測定するため",
        "特定バージョンの既知脆弱性を検索し、標的型攻撃を行うため",
        "サーバーの物理的な位置を特定するため",
      ],
      correctIndex: 2,
      explanation:
        "攻撃者はX-Powered-ByやServerヘッダーからフレームワーク名とバージョンを特定し、CVEデータベースやExploit DBで既知の脆弱性を検索します。バージョン固有の脆弱性がわかれば、試行錯誤なしにピンポイントの攻撃が可能になります。",
      referenceLink: "/step01-recon/header-leakage",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "X-Powered-Byヘッダーを削除する対策に加えて、多層防御として有効な手段はどれか？",
      options: [
        "HTTPSを有効にする",
        "依存パッケージを定期的に更新する",
        "レスポンスボディを暗号化する",
        "CookieにSecure属性を付与する",
      ],
      correctIndex: 1,
      explanation:
        "依存パッケージを定期的に更新することで、万が一バージョン情報が漏洩しても最新版であれば既知脆弱性のリスクを低減できます。ヘッダー削除（情報を隠す）と更新（脆弱性をなくす）の両方を行うことが多層防御になります。",
      referenceLink: "/step01-recon/header-leakage",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "HTTPレスポンスヘッダーはブラウザのDevToolsやcurl -Iで誰でも確認できるため、ヘッダーに含まれる情報はすべて公開情報である。",
      correctAnswer: true,
      explanation:
        "HTTPレスポンスヘッダーは認証なしで誰でも取得できます。DevToolsのNetworkタブやcurl -Iコマンドで簡単に確認できるため、ヘッダーに含まれる情報は全て公開情報として扱う必要があります。",
      referenceLink: "/step01-recon/header-leakage",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "X-Powered-ByやServerヘッダーを削除すれば、攻撃者がサーバーの技術スタックを特定する方法は完全になくなる。",
      correctAnswer: false,
      explanation:
        "ヘッダーの削除は偵察を困難にしますが、完全に防ぐことはできません。攻撃者はエラーメッセージの形式、レスポンスの特徴、デフォルトのエラーページなど他の手がかりからも技術スタックを推測できます。そのため多層防御が重要です。",
      referenceLink: "/step01-recon/header-leakage",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "HTTPヘッダー情報漏洩を利用した攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "curl -IやDevToolsでレスポンスヘッダーを取得する",
        "X-Powered-ByやServerヘッダーから技術スタックを特定する",
        "CVEデータベースで該当バージョンの既知脆弱性を検索する",
        "特定した脆弱性を利用して標的型攻撃を実行する",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 0, 3, 1],
      explanation:
        "攻撃者はまずヘッダーを取得し、技術スタックを特定します。次にCVEデータベースで既知脆弱性を検索し、最後にその脆弱性を利用してピンポイントの攻撃を仕掛けます。この偵察フェーズの情報が攻撃の精度を大幅に向上させます。",
      referenceLink: "/step01-recon/header-leakage",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "多くのWebフレームワークがデフォルトで付与する、フレームワーク名を示すHTTPレスポンスヘッダーは ______ である。（ハイフン区切りの英語で回答）",
      correctAnswers: ["X-Powered-By"],
      explanation:
        "X-Powered-Byヘッダーは多くのWebフレームワーク（Express, Hono, PHP等）がデフォルトで付与するヘッダーで、使用しているフレームワーク名が含まれます。セキュリティ対策としてこのヘッダーを削除することが推奨されます。",
      referenceLink: "/step01-recon/header-leakage",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "MIMEスニッフィングを防止し、Content-Typeの値を厳密に適用させるセキュリティヘッダーの値は ______ である。（英小文字で回答）",
      correctAnswers: ["nosniff"],
      explanation:
        "X-Content-Type-Options: nosniff を設定することで、ブラウザはContent-Typeヘッダーの値を厳密に適用し、MIMEスニッフィング（コンテンツの中身を推測して解釈する動作）を行わなくなります。",
      referenceLink: "/step01-recon/header-leakage",
    },
  ],
} satisfies QuizData;
