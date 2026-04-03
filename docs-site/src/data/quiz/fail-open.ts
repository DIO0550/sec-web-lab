import type { QuizData } from "../../components/quiz/types";

/**
 * Fail-Openの理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "Fail-Open - 理解度テスト",
  description:
    "Fail-OpenとFail-Closeの設計パターン、認証ミドルウェアのエラーハンドリング、next()の配置がセキュリティに与える影響についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "Fail-Open脆弱性の根本原因として最も正確な説明はどれか？",
      options: [
        "認証サーバーの性能が不足している",
        "認証処理で例外が発生した際にデフォルトでアクセスを許可する設計になっている",
        "パスワードのハッシュアルゴリズムが弱い",
        "HTTPSが使用されていない",
      ],
      correctIndex: 1,
      explanation:
        "Fail-Openの根本原因は、認証・認可の処理で例外が発生した場合にデフォルトでアクセスを許可してしまう設計です。セキュリティに関わる処理では、エラーや不確実な状態が発生した場合は常にアクセスを拒否（Fail-Close）すべきです。",
      referenceLink: "/step09-defense/fail-open",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "脆弱なFail-Open実装で、next()がtry-catchの外に配置されている場合に何が起こるか？",
      options: [
        "リクエストが常にタイムアウトする",
        "例外が発生してもリクエストが次のハンドラーに処理される",
        "例外がクライアントにスタックトレースとして返される",
        "サーバーが自動的に再起動する",
      ],
      correctIndex: 1,
      explanation:
        "next()がtry-catchの外にあると、catchブロックに入った後もnext()が呼ばれ、認証されていないリクエストが次のハンドラー（管理者用エンドポイント等）に到達してしまいます。これがFail-Openの典型的なパターンです。",
      referenceLink: "/step09-defense/fail-open",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "Fail-Close設計では、認証チェックが成功した場合のみnext()を呼び出し、例外時はcatchブロック内で明示的にエラーレスポンスを返す。",
      correctAnswer: true,
      explanation:
        "Fail-Close設計の核心は、next()をtryブロック内の認証成功後にのみ配置し、catchブロックでは明示的に500エラー等のレスポンスを返すことです。これにより、例外の有無に関係なく未認証リクエストが通過することを防ぎます。",
      referenceLink: "/step09-defense/fail-open",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "2014年のApple goto failバグは、SSL/TLS証明書検証コードにおけるFail-Openの典型例である。",
      correctAnswer: true,
      explanation:
        "Apple goto failバグはSSL/TLS証明書検証コードのバグにより検証がスキップされ、中間者攻撃が可能になった事例です。コードのバグにより検証処理が正しく完了せずアクセスが許可されてしまう、Fail-Openの典型例として知られています。",
      referenceLink: "/step09-defense/fail-open",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "Fail-Open脆弱性を悪用した認証バイパス攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が不正な形式のトークンで認証エラーを意図的に発生させる",
        "認証ミドルウェアのverifyToken()が例外をスローし、catchブロックに入る",
        "catchブロックでログ出力のみ行い、エラーレスポンスを返さない",
        "try-catchの外にあるnext()が呼ばれ、未認証のまま管理者リソースにアクセスできる",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [3, 1, 0, 2],
      explanation:
        "攻撃者は不正なトークンで例外を誘発します。catchブロックでエラーレスポンスを返さないため処理が続行し、try-catchの外のnext()により未認証リクエストが管理者エンドポイントに到達します。",
      referenceLink: "/step09-defense/fail-open",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "エラー時にアクセスを許可する設計をFail-Openと呼び、エラー時にアクセスを拒否する安全な設計を Fail-______ と呼ぶ。",
      correctAnswers: ["Close", "close", "CLOSE", "クローズ"],
      explanation:
        "Fail-Close（フェイルクローズ）はエラーや不確実な状態が発生した場合にデフォルトでアクセスを拒否する設計パターンです。セキュリティに関わる処理では常にFail-Close設計を採用すべきです。",
      referenceLink: "/step09-defense/fail-open",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "認証サービスへの接続失敗が続く場合に、自動的に全リクエストを拒否するパターンを ______ パターンと呼ぶ。（カタカナで回答）",
      correctAnswers: [
        "サーキットブレーカー",
        "サーキットブレイカー",
      ],
      explanation:
        "サーキットブレーカーパターンは、認証サービスなどの外部サービスへの接続失敗が続く場合に自動的にリクエストを拒否するパターンです。Fail-Closeの延長として、サービス障害時のセキュリティを確保します。",
      referenceLink: "/step09-defense/fail-open",
    },
  ],
} satisfies QuizData;
