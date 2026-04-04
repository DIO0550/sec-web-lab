import type { QuizData } from "../../components/quiz/types";

/**
 * トークンリプレイの理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "トークンリプレイ - 理解度テスト",
  description:
    "JWTのステートレスな性質によるトークン再利用リスクとブラックリストによる防御についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "JWTのステートレスな性質がトークンリプレイ攻撃を可能にする理由はどれか？",
      options: [
        "JWTは暗号化されていないため、内容が誰でも読める",
        "JWTは発行後にサーバー側で無効化する仕組みが標準では備わっていない",
        "JWTはブラウザのCookieにしか保存できない",
        "JWTは有効期限を設定できない",
      ],
      correctIndex: 1,
      explanation:
        "JWTはステートレスなトークンであり、サーバーはトークンの署名と有効期限を検証するだけで認証を行います。標準ではトークンを個別に無効化する仕組みがないため、ログアウト後もトークンが有効期限まで使い続けられてしまいます。",
      referenceLink: "/step04-session/token-replay",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "トークンリプレイ攻撃を防ぐために最も効果的な対策の組み合わせはどれか？",
      options: [
        "JWTのペイロードを暗号化する + ログアウト時にクライアント側でトークンを削除する",
        "トークンブラックリスト + 短い有効期限 + リフレッシュトークンローテーション",
        "トークンをlocalStorageに保存する + 長い有効期限を設定する",
        "JWTの署名アルゴリズムを強化する + トークンをURLに含める",
      ],
      correctIndex: 1,
      explanation:
        "トークンブラックリストでログアウト済みトークンを拒否し、短い有効期限で漏洩時の被害期間を限定し、リフレッシュトークンローテーションで古いトークンを自動的に無効化する組み合わせが最も効果的です。",
      referenceLink: "/step04-session/token-replay",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "クライアント側でJWTトークンを削除（localStorageから消去）すれば、サーバー側でトークンは無効になる。",
      correctAnswer: false,
      explanation:
        "クライアント側でトークンを削除しても、サーバー側ではそのトークンは依然として有効です。攻撃者がトークンのコピーを持っていれば、有効期限が切れるまでそのトークンでアクセスできます。サーバー側でのトークン無効化（ブラックリスト等）が必要です。",
      referenceLink: "/step04-session/token-replay",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "リフレッシュトークンローテーションでは、リフレッシュ時に古いリフレッシュトークンを無効化し新しいものを発行する。",
      correctAnswer: true,
      explanation:
        "リフレッシュトークンローテーションでは、リフレッシュトークンの使用時に古いトークンを無効化し、新しいリフレッシュトークンとアクセストークンを発行します。これにより、リフレッシュトークンが漏洩しても再利用を検知できます。",
      referenceLink: "/step04-session/token-replay",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "トークンリプレイ攻撃（ログアウト後の再利用）の流れを正しい順序に並べ替えてください。",
      items: [
        "被害者がログインしてJWTトークンを取得する",
        "攻撃者が何らかの方法でトークンのコピーを取得する",
        "被害者がログアウトする（クライアント側でトークンを削除）",
        "攻撃者がコピーしたトークンでAPIにリクエストを送信する",
        "サーバーがトークンの署名と有効期限のみ検証し、リクエストを受理する",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [2, 4, 1, 0, 3],
      explanation:
        "トークンリプレイは、被害者のログイン→トークンのコピー取得→ログアウト→コピーでアクセス→サーバーが受理という流れです。サーバーがログアウト状態を管理していないため、有効期限内のトークンを拒否できないことが根本原因です。",
      referenceLink: "/step04-session/token-replay",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "ログアウト済みのトークンを記録し、以降のリクエストで拒否する仕組みをトークン ______ と呼ぶ。",
      correctAnswers: [
        "ブラックリスト",
        "blacklist",
        "Blacklist",
        "BLACKLIST",
      ],
      explanation:
        "トークンブラックリストは、ログアウトや強制失効されたトークンのリストを保持し、認証時にそのリストを参照して無効化されたトークンを拒否する仕組みです。本番環境ではRedis等の高速なストアに保存し、トークンの有効期限と同じTTLを設定します。",
      referenceLink: "/step04-session/token-replay",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "JWTのアクセストークンの有効期限を短く（15分程度に）設定し、期限切れ時に ______ トークンで新しいアクセストークンを取得する設計が推奨される。",
      correctAnswers: [
        "リフレッシュ",
        "refresh",
        "Refresh",
        "REFRESH",
      ],
      explanation:
        "リフレッシュトークンはアクセストークンの更新専用のトークンです。アクセストークンの有効期限を短くすることで漏洩時の被害を限定し、リフレッシュトークンで定期的に新しいアクセストークンを発行する設計が推奨されます。",
      referenceLink: "/step04-session/token-replay",
    },
  ],
} satisfies QuizData;
