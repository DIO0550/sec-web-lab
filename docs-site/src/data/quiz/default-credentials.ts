import type { QuizData } from "../../components/quiz/types";

/**
 * デフォルト認証情報 - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "デフォルト認証情報 - 理解度テスト",
  description:
    "初期パスワードのまま運用されたシステムへの侵入リスクと対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "デフォルト認証情報を利用した攻撃がブルートフォース攻撃と大きく異なる点はどれか？",
      options: [
        "攻撃にインターネット接続が不要である",
        "公開情報から入手したパスワードを使うため、数回の試行で突破できる",
        "管理者アカウント以外には使えない",
        "暗号化されたパスワードを解読する必要がある",
      ],
      correctIndex: 1,
      explanation:
        "デフォルト認証情報はマニュアルやGitHub等から公開情報として入手できるため、ブルートフォースのように大量の試行が不要です。admin/admin、admin/admin123 等の数パターンを試すだけで突破できます。",
      referenceLink: "/step03-auth/default-credentials",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "デフォルト認証情報の問題に対する最も効果的な根本対策はどれか？",
      options: [
        "ファイアウォールで管理画面へのアクセスを制限する",
        "初回ログイン時にパスワード変更を強制する仕組みを実装する",
        "管理画面にCAPTCHAを導入する",
        "ログイン試行のログを記録する",
      ],
      correctIndex: 1,
      explanation:
        "初回ログイン時にパスワード変更を強制することで、デフォルトパスワードのまま運用されることを防ぎます。must_change_passwordフラグを使い、変更が完了するまで通常操作を許可しない設計が効果的です。",
      referenceLink: "/step03-auth/default-credentials",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "デフォルト認証情報の攻撃は、レート制限を設けていれば防ぐことができる。",
      correctAnswer: false,
      explanation:
        "デフォルト認証情報の攻撃では数回の試行で成功するため、レート制限（例: 15分に5回まで）の範囲内で突破されてしまいます。根本対策はパスワード変更の強制やデフォルトアカウントの削除です。",
      referenceLink: "/step03-auth/default-credentials",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "2016年のMiraiボットネットは、IoTデバイスのデフォルト認証情報を利用して60万台以上を乗っ取った事例である。",
      correctAnswer: true,
      explanation:
        "Miraiボットネットはカメラやルーター等のIoTデバイスに設定されているデフォルトの認証情報（admin/admin等）を利用して大規模な乗っ取りを行い、史上最大規模のDDoS攻撃を実行しました。",
      referenceLink: "/step03-auth/default-credentials",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "デフォルト認証情報を利用した攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "ターゲットのアプリケーションを特定し、製品名やフレームワーク名を調べる",
        "マニュアルやGitHubからデフォルトの認証情報を入手する",
        "デフォルトの認証情報でログインを試行する",
        "管理者権限でシステムを完全に制御する",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 3, 0, 1],
      explanation:
        "攻撃者はまずターゲットの製品を特定し、公開情報からデフォルトパスワードを入手します。その後デフォルトの認証情報でログインを試み、成功すれば管理者権限でシステム全体を制御できます。",
      referenceLink: "/step03-auth/default-credentials",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "安全な実装では、ユーザーテーブルに ______ というフラグを追加し、デフォルトアカウントにはこのフラグをtrueに設定する。（英語のカラム名で回答、アンダースコア区切り）",
      correctAnswers: ["must_change_password"],
      explanation:
        "must_change_passwordフラグをtrueに設定しておくことで、ログイン時にこのフラグを確認し、パスワード変更が完了するまで通常の操作を許可しない実装が可能です。",
      referenceLink: "/step03-auth/default-credentials",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "デフォルトパスワードでログインが成功した場合、安全な実装ではHTTPステータスコード ______ を返してパスワード変更を要求する。（数字3桁で回答）",
      correctAnswers: ["403"],
      explanation:
        "デフォルトパスワードが検出された場合、HTTPステータスコード403（Forbidden）を返し、requirePasswordChange: trueとともにパスワード変更を要求します。通常のログイン成功（200）とは異なるレスポンスで変更を強制します。",
      referenceLink: "/step03-auth/default-credentials",
    },
  ],
} satisfies QuizData;
