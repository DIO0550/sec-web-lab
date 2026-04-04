import type { QuizData } from "../../components/quiz/types";

/**
 * Privilege Escalation（権限昇格） - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "権限昇格 (Privilege Escalation) - 理解度テスト",
  description:
    "権限昇格の攻撃手法・発生条件・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "権限昇格の脆弱性が発生する最も根本的な原因はどれか？",
      options: [
        "管理者用ページのURLが推測しやすいこと",
        "フロントエンドでの管理者メニュー非表示だけでAPIレベルのロール検証が行われていないこと",
        "パスワードの強度が不十分であること",
        "セッションIDが予測可能であること",
      ],
      correctIndex: 1,
      explanation:
        "権限昇格の根本原因は、管理者用エンドポイントがフロントエンドのUI制御（ナビゲーションの非表示）だけで保護されており、サーバーサイドでユーザーのロール（権限レベル）を検証していないことです。フロントエンドの制御はUXのためのものであり、セキュリティの境界線ではありません。",
      referenceLink: "/step05-access-control/privilege-escalation",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "権限昇格対策として、ミドルウェアパターンでロール検証を行う最大のメリットはどれか？",
      options: [
        "コード量が減りパフォーマンスが向上する",
        "フロントエンドのUIと連動して動作する",
        "管理者用エンドポイントに対してロール検証のチェック漏れを防げる",
        "データベースへのアクセスが不要になる",
      ],
      correctIndex: 2,
      explanation:
        "ミドルウェアパターンでは、管理者用ルートグループに対してロール検証を一括適用します。各エンドポイントで個別にチェックを書く必要がないため、チェック漏れ（新しいエンドポイント追加時にロール検証を忘れる）を防げます。",
      referenceLink: "/step05-access-control/privilege-escalation",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "管理者ページへのリンクをフロントエンドのナビゲーションから非表示にすれば、一般ユーザーが管理者APIにアクセスすることを防げる。",
      correctAnswer: false,
      explanation:
        "フロントエンドのUI制御はユーザー体験（UX）のためのものであり、セキュリティの境界線ではありません。一般ユーザーでもDevToolsやcurlを使ってURLを直接入力すれば、管理者用APIにリクエストを送信できます。セキュリティはサーバーサイドで実装する必要があります。",
      referenceLink: "/step05-access-control/privilege-escalation",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "IDORが「水平方向」の認可不備（同じ権限レベルの他ユーザーへのアクセス）であるのに対し、権限昇格は「垂直方向」の認可不備（上位権限への昇格）である。",
      correctAnswer: true,
      explanation:
        "IDORは同じ権限レベルのユーザー間でリソースIDを書き換えて他ユーザーのデータにアクセスする「水平方向」の認可不備です。権限昇格は一般ユーザーが管理者権限の操作を実行する「垂直方向」の認可不備です。どちらもアクセス制御の欠如が原因です。",
      referenceLink: "/step05-access-control/privilege-escalation",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "一般ユーザーによる権限昇格攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が一般ユーザーとしてログインし、DevToolsやソースコードから管理者用エンドポイントのURLを特定する",
        "一般ユーザーのセッションCookieで管理者用API（例: /api/admin/users）に直接リクエストを送信する",
        "サーバーがセッションCookieの有効性（認証）のみ確認し、ロール（認可）を検証せずにリクエストを処理する",
        "管理者専用の全ユーザー一覧や設定情報が返される",
        "攻撃者がユーザー削除や設定変更などの管理者操作を実行する",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 1, 4, 0, 2],
      explanation:
        "権限昇格攻撃では、攻撃者がまず管理者用エンドポイントのURLを特定し、一般ユーザーのセッションで直接リクエストを送信します。サーバーがロールを検証しないため、管理者専用データが返され、さらに強力な管理者操作も実行可能になります。",
      referenceLink: "/step05-access-control/privilege-escalation",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "ユーザーに「ロール（役割）」を割り当て、ロールに応じてアクセスできる機能を制限する仕組みを______と呼ぶ。（アルファベット4文字の略称で回答）",
      correctAnswers: ["RBAC"],
      explanation:
        "RBAC（Role-Based Access Control: ロールベースアクセス制御）は、ユーザーに割り当てられたロール（admin, user等）に基づいてアクセス権限を制御する仕組みです。権限昇格は、このRBACがサーバーサイドで正しく実装されていない場合に発生します。",
      referenceLink: "/step05-access-control/privilege-escalation",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "Honoでは、管理者用ルートグループに対してロール検証を一括適用するために______パターンを使用する。（カタカナで回答）",
      correctAnswers: ["ミドルウェア"],
      explanation:
        "ミドルウェアパターンでは、requireAdmin のようなミドルウェア関数を admin.use('*', requireAdmin) で全管理者エンドポイントに一括適用します。これにより、個々のエンドポイントでロール検証を書き忘れるリスクがなくなります。",
      referenceLink: "/step05-access-control/privilege-escalation",
    },
  ],
} satisfies QuizData;
