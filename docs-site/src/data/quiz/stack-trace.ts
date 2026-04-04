import type { QuizData } from "../../components/quiz/types";

/**
 * スタックトレース漏洩の理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "スタックトレース漏洩 - 理解度テスト",
  description:
    "スタックトレースから漏洩する情報の種類、エラーIDシステムの仕組み、安全なエラーハンドリングについての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "スタックトレースから攻撃者が得られない情報はどれか？",
      options: [
        "ファイルパスとプロジェクトのディレクトリ構造",
        "使用フレームワークやライブラリの名前",
        "ユーザーのパスワードハッシュ",
        "内部関数名とコードの行番号",
      ],
      correctIndex: 2,
      explanation:
        "スタックトレースにはファイルパス、ライブラリ名、関数名、行番号などのコード構造情報が含まれますが、データベースに保存されているパスワードハッシュはスタックトレースには通常含まれません。ただし、詳細エラーメッセージにはDB関連情報が含まれる場合があります。",
      referenceLink: "/step09-defense/stack-trace",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "安全な実装でクライアントに返すエラーレスポンスとして最も適切なのはどれか？",
      options: [
        "error.messageとerror.stackの全文",
        "エラーIDと汎用メッセージのみ",
        "エラーが発生したファイル名と行番号",
        "使用しているNode.jsのバージョン情報",
      ],
      correctIndex: 1,
      explanation:
        "安全な実装ではcrypto.randomUUID()で生成したエラーIDと汎用メッセージのみをクライアントに返します。エラーIDにより、運用チームはサーバーログを検索して詳細を確認でき、セキュリティとデバッグ能力を両立できます。",
      referenceLink: "/step09-defense/stack-trace",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "スタックトレースに含まれるライブラリ名とバージョン情報は、攻撃者がそのライブラリの既知の脆弱性（CVE）を調査する手がかりとなる。",
      correctAnswer: true,
      explanation:
        "スタックトレースからライブラリ名やパス（例: hono/dist/cjs/）が判明すると、攻撃者はそのライブラリのバージョンを推定し、CVEデータベースで既知の脆弱性を検索できます。これにより二次攻撃の成功率が大幅に上がります。",
      referenceLink: "/step09-defense/stack-trace",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "グローバルエラーハンドラー（app.onError）を設定すれば、個別のルートにtry-catchを書く必要は一切ない。",
      correctAnswer: false,
      explanation:
        "グローバルエラーハンドラーは未処理の例外をキャッチする安全網ですが、個別のルートで適切なエラーハンドリング（入力バリデーションエラーの400返却等）を行うことも重要です。両方を組み合わせることで堅牢なエラーハンドリングが実現します。",
      referenceLink: "/step09-defense/stack-trace",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "エラーIDシステムを使った安全なエラーハンドリングの流れを正しい順序に並べ替えてください。",
      items: [
        "アプリケーション内で例外が発生する",
        "エラーハンドラーがcrypto.randomUUID()でユニークなエラーIDを生成する",
        "エラーの詳細（スタックトレース含む）をエラーIDと共にサーバーログに記録する",
        "クライアントにはエラーIDと汎用メッセージのみを返す",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 3, 0, 1],
      explanation:
        "例外が発生すると、まずユニークなエラーIDを生成し、詳細をそのIDと共にサーバーログに記録します。クライアントにはエラーIDと汎用メッセージのみを返すことで、運用チームはIDでログを検索して原因特定が可能です。",
      referenceLink: "/step09-defense/stack-trace",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "Honoフレームワークでグローバルエラーハンドラーを設定するメソッドは app.______() である。",
      correctAnswers: ["onError"],
      explanation:
        "Honoではapp.onError()メソッドでグローバルエラーハンドラーを設定します。このハンドラーは全ての未処理例外をキャッチし、スタックトレースが漏洩しないよう統一的なエラーレスポンスを返します。",
      referenceLink: "/step09-defense/stack-trace",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "本番環境でエラー詳細を自動的に抑制するために使用する環境変数は _______ である。（アルファベットで回答）",
      correctAnswers: ["NODE_ENV", "node_env"],
      explanation:
        "NODE_ENV環境変数をproductionに設定することで、本番環境ではエラー詳細を抑制し、開発環境でのみデバッグ情報を表示する切り替えを実現できます。ただし、フレームワークに依存せず明示的なエラーハンドラーも設定すべきです。",
      referenceLink: "/step09-defense/stack-trace",
    },
  ],
} satisfies QuizData;
