import type { QuizData } from "../../components/quiz/types";

/**
 * Mass Assignment - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "Mass Assignment - 理解度テスト",
  description:
    "Mass Assignmentの攻撃手法・発生条件・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "Mass Assignment 脆弱性が発生する根本的な原因はどれか？",
      options: [
        "フロントエンドのフォームにバリデーションがないため",
        "サーバーがリクエストボディの全フィールドをそのまま信頼し、許可されたフィールドのみを抽出するフィルタリングを行っていないため",
        "データベースのカラムにデフォルト値が設定されていないため",
        "APIがJSON形式のリクエストを受け付けているため",
      ],
      correctIndex: 1,
      explanation:
        "Mass Assignmentの根本原因は、サーバーがクライアントから送信されたリクエストボディの全フィールドをそのまま信頼してデータベース操作に使用し、許可されたフィールドのみを抽出するフィルタリングを行っていないことです。フロントエンドのフォームはUIであり、セキュリティの境界線ではありません。",
      referenceLink: "/step05-access-control/mass-assignment",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "Mass Assignment 対策として最も効果的な方法はどれか？",
      options: [
        "フロントエンドのフォームから送信できるフィールドを制限する",
        "APIレスポンスから role や isAdmin などの内部フィールドを除外する",
        "ホワイトリスト方式で許可されたフィールドのみをリクエストボディから抽出する",
        "データベースの role カラムにUNIQUE制約を付ける",
      ],
      correctIndex: 2,
      explanation:
        "ホワイトリスト方式で許可されたフィールドのみを明示的に抽出し、それ以外のフィールド（role, isAdmin等）は無視する方法が最も効果的です。フロントエンドの制限は攻撃者がcurlやDevToolsでバイパスでき、レスポンスからの除外は推測を困難にするだけで根本対策ではありません。",
      referenceLink: "/step05-access-control/mass-assignment",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "フロントエンドの登録フォームに role フィールドがなければ、攻撃者は role を送信できないため Mass Assignment は発生しない。",
      correctAnswer: false,
      explanation:
        "フロントエンドのフォームにフィールドがなくても、攻撃者はcurlやDevToolsを使ってリクエストボディに任意のフィールドを追加して直接APIにリクエストを送信できます。フロントエンドの制限はセキュリティの境界線ではなく、サーバーサイドでのフィルタリングが必要です。",
      referenceLink: "/step05-access-control/mass-assignment",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "Zodなどのスキーマバリデーションライブラリを使用してリクエストボディのスキーマを定義し、未知のフィールドを自動除去することは Mass Assignment の有効な対策である。",
      correctAnswer: true,
      explanation:
        "ZodやJoiなどのスキーマバリデーションライブラリでリクエストボディのスキーマを定義すると、スキーマに含まれないフィールド（role, isAdmin等）を自動的に除去できます。TypeScriptとの親和性も高く、ホワイトリスト方式の実装として効果的です。",
      referenceLink: "/step05-access-control/mass-assignment",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "Mass Assignmentによる管理者権限取得攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がDevToolsでユーザー登録APIのリクエスト形式とレスポンスを観察する",
        "レスポンスに role フィールドが含まれていることから、このフィールドの存在を把握する",
        "curlで登録リクエストに role: admin を追加して送信する",
        "サーバーがリクエストボディの全フィールドをそのままDBに保存する",
        "攻撃者が管理者権限でシステムにアクセスする",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [4, 2, 0, 3, 1],
      explanation:
        "Mass Assignment攻撃では、攻撃者がまずAPIの構造を観察してフィールド名を特定し、リクエストボディに内部フィールドを追加して送信します。サーバーがフィルタリングなしで全フィールドを保存するため、攻撃者が指定した role: admin がそのまま反映されます。",
      referenceLink: "/step05-access-control/mass-assignment",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "Mass Assignment 対策では、許可するフィールドを明示的に指定する______方式でリクエストボディからフィールドを抽出する。（カタカナで回答）",
      correctAnswers: ["ホワイトリスト"],
      explanation:
        "ホワイトリスト方式では、許可するフィールド（username, email, password等）を明示的に指定し、それ以外のフィールドは全て無視します。ブラックリスト方式（拒否するフィールドを指定）は新しい内部フィールドが追加された際に漏れが発生するリスクがあります。",
      referenceLink: "/step05-access-control/mass-assignment",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "2012年にGitHubで発生したMass Assignment脆弱性は、______というWebフレームワークのMass Assignment問題がきっかけで、コミュニティ全体で対策が見直された。（フレームワーク名を英語で回答）",
      correctAnswers: ["Ruby on Rails", "Rails", "rails", "ruby on rails"],
      explanation:
        "2012年にGitHubでRuby on RailsのMass Assignment脆弱性が悪用され、攻撃者が任意のリポジトリのSSH公開鍵を登録可能でした。この事件をきっかけにRailsコミュニティ全体でMass Assignment対策（Strong Parameters等）が見直されました。",
      referenceLink: "/step05-access-control/mass-assignment",
    },
  ],
} satisfies QuizData;
