import type { QuizData } from "../../components/quiz/types";

/**
 * JWT Vulnerabilities - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "JWT Vulnerabilities - 理解度テスト",
  description:
    "JWTの脆弱性（alg=none攻撃・弱い秘密鍵・Claim検証不備）についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "alg=none 攻撃が成功する根本的な原因はどれか？",
      options: [
        "JWT ライブラリが Base64URL デコードに失敗するため",
        "サーバーがトークン内の alg フィールドを信頼し、none が指定されると署名検証をスキップするため",
        "クライアントが秘密鍵を保持しているため",
        "HTTPS 通信が行われていないため",
      ],
      correctIndex: 1,
      explanation:
        "alg=none 攻撃は、JWT ライブラリがトークンのヘッダーに含まれる alg フィールドをそのまま信頼し、alg が none の場合に署名検証をスキップしてしまうことが原因です。攻撃者は秘密鍵を知らなくても、任意のペイロードを持つ有効なトークンを作成できます。",
      referenceLink: "/step08-advanced/jwt-vulnerabilities",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "JWT の Claim 検証不備で起こりうる攻撃はどれか？",
      options: [
        "SQL インジェクションによるデータベースの改ざん",
        "期限切れトークンや別サービス用トークンがそのまま受理される",
        "CSRF トークンの偽造によるリクエスト送信",
        "DNS リバインディングによるオリジン偽装",
      ],
      correctIndex: 1,
      explanation:
        "JWT の exp（有効期限）、aud（対象者）、iss（発行者）などのクレームを検証しない場合、期限切れトークンがそのまま使えたり、別サービス用のトークンで認証を突破できたりします。マイクロサービス環境では「トークン横断攻撃」が成立する危険があります。",
      referenceLink: "/step08-advanced/jwt-vulnerabilities",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "JWT の秘密鍵が「secret」や「password」のような短い文字列であっても、署名アルゴリズムが HS256 であれば安全である。",
      correctAnswer: false,
      explanation:
        "HS256 は HMAC-SHA256 による署名ですが、秘密鍵が短く推測可能な場合、攻撃者は辞書攻撃やブルートフォースで鍵を特定できます。鍵が判明すれば、攻撃者は任意のペイロード（例: role=admin）で正規の署名を持つトークンを自由に生成できます。",
      referenceLink: "/step08-advanced/jwt-vulnerabilities",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "JWT は ヘッダー・ペイロード・署名 の3つの部分で構成され、各部分はドット（.）で区切られている。",
      correctAnswer: true,
      explanation:
        "JWT は「ヘッダー.ペイロード.署名」の形式で構成されます。ヘッダーには署名アルゴリズム、ペイロードにはユーザー情報や有効期限、署名にはヘッダーとペイロードを秘密鍵で署名したものが含まれます。各部分は Base64URL エンコードされ、ドットで区切られます。",
      referenceLink: "/step08-advanced/jwt-vulnerabilities",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "alg=none 攻撃による管理者権限バイパスの流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が正規ユーザーとしてログインし JWT を取得する",
        "JWT をデコードし、ヘッダーの alg を none に、ペイロードの role を admin に変更する",
        "署名部分を空にして改ざんしたトークンを組み立てる",
        "改ざんしたトークンで管理者エンドポイントにアクセスする",
        "サーバーが alg=none を受け入れ、署名検証をスキップして管理者として処理する",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 0, 4, 2, 1],
      explanation:
        "alg=none 攻撃では、まず正規のトークンを取得し、ヘッダーの alg を none に変更、ペイロードの role を admin に書き換え、署名部分を空にしてトークンを再構築します。サーバーがトークン内の alg を信頼するため、署名検証がスキップされ管理者権限でアクセスできてしまいます。",
      referenceLink: "/step08-advanced/jwt-vulnerabilities",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "JWT の標準クレームで、トークンの有効期限を示す 3 文字のクレーム名は ______ である。",
      correctAnswers: ["exp"],
      explanation:
        "exp（Expiration Time）はトークンの有効期限を Unix タイムスタンプで示す標準クレームです。この時刻を過ぎたトークンは無効として拒否すべきです。他にも nbf（Not Before）、iat（Issued At）、iss（Issuer）、aud（Audience）などの標準クレームがあります。",
      referenceLink: "/step08-advanced/jwt-vulnerabilities",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "JWT のヘッダーで署名アルゴリズムを指定するフィールド名は ______ である。（3文字で回答）",
      correctAnswers: ["alg"],
      explanation:
        "alg フィールドは JWT ヘッダーで使用される署名アルゴリズムを指定します。HS256（HMAC-SHA256）や RS256（RSA-SHA256）などが一般的です。alg=none 攻撃では、このフィールドを none に変更することで署名検証をバイパスします。",
      referenceLink: "/step08-advanced/jwt-vulnerabilities",
    },
  ],
} satisfies QuizData;
