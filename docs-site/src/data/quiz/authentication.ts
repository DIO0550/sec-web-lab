import type { QuizData } from "../../components/quiz/types";

/**
 * 認証の基礎の理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "認証の基礎 - 理解度テスト",
  description:
    "HTTP認証の仕組み、認証と認可の違い、Basic認証とDigest認証についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "認証（Authentication）と認可（Authorization）の違いについて、正しい説明はどれか？",
      options: [
        "認証はリソースへのアクセス権限を確認し、認可はユーザーの身元を確認する",
        "認証はユーザーの身元を確認し、認可はそのユーザーが操作する権限を持っているか確認する",
        "認証と認可は同じ意味であり、どちらもログイン処理を指す",
        "認証はサーバー側の処理で、認可はクライアント側の処理である",
      ],
      correctIndex: 1,
      explanation:
        "認証（Authentication）は「あなたは誰ですか？」を確認する処理で、認可（Authorization）は「あなたはこの操作をする権限がありますか？」を確認する処理です。この2つは必ず認証→認可の順序で行われます。",
      referenceLink: "/foundations/auth-session/authentication/authentication",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "認証は通過しているが認可チェックを行っていないAPIエンドポイントで起きる脆弱性はどれか？",
      options: [
        "XSS（クロスサイトスクリプティング）",
        "SQLインジェクション",
        "IDOR（安全でない直接オブジェクト参照）による権限バイパス",
        "CSRF（クロスサイトリクエストフォージェリ）",
      ],
      correctIndex: 2,
      explanation:
        "認証だけ行い認可チェックをしていない場合、ログイン済みの一般ユーザーが他人のリソースにアクセスできてしまうIDOR脆弱性が発生します。例えば、一般ユーザーが他人のアカウントを削除できるなどの問題が起きます。",
      referenceLink: "/foundations/auth-session/authentication/authentication",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "Basic認証で使われるBase64エンコーディングは暗号化方式の一つであり、パスワードを安全に保護する。",
      correctAnswer: false,
      explanation:
        "Base64はエンコーディング方式であり暗号化ではありません。誰でも簡単にデコードできるため、パスワードの保護にはなりません。Basic認証は必ずHTTPS（TLS）と組み合わせて使う必要があります。",
      referenceLink: "/foundations/auth-session/authentication/authentication",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "現在ではDigest認証よりもBasic認証+HTTPSの組み合わせが推奨されている。",
      correctAnswer: true,
      explanation:
        "Digest認証はサーバー側でパスワードの平文またはMD5ハッシュを保持する必要があり、MD5の脆弱性も発見されています。HTTPSが普及した現在では、TLSによる暗号化でBasic認証の平文問題は解決されるため、Basic認証+HTTPSが推奨されています。",
      referenceLink: "/foundations/auth-session/authentication/authentication",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "Basic認証のフローを正しい順序に並べ替えてください。",
      items: [
        "クライアントが保護されたリソースにアクセスする",
        "サーバーが401 Unauthorizedとwww-Authenticateヘッダを返す",
        "クライアントがユーザー名:パスワードをBase64エンコードする",
        "AuthorizationヘッダにBase64文字列を含めて再リクエストする",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 0, 3, 1],
      explanation:
        "Basic認証では、まずクライアントがリソースにアクセスし、サーバーが401で認証を要求します。クライアントはユーザー名とパスワードをBase64エンコードし、Authorizationヘッダに含めて再度リクエストを送信します。",
      referenceLink: "/foundations/auth-session/authentication/authentication",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "認証済みユーザーがリソースにアクセスする権限がない場合に返すHTTPステータスコードは ______ である。（3桁の数字で回答）",
      correctAnswers: ["403"],
      explanation:
        "403 Forbiddenは、認証は成功しているがリソースへのアクセス権限がない場合に返すステータスコードです。未認証の場合は401 Unauthorizedを返します。",
      referenceLink: "/foundations/auth-session/authentication/authentication",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "サーバーが認証を要求する際に返すHTTPステータスコードは ______ である。（3桁の数字で回答）",
      correctAnswers: ["401"],
      explanation:
        "401 Unauthorizedは、認証が必要であることを示すステータスコードです。サーバーはこのレスポンスとともにWWW-Authenticateヘッダで認証方式を指定します。",
      referenceLink: "/foundations/auth-session/authentication/authentication",
    },
  ],
} satisfies QuizData;
