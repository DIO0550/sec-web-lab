import type { QuizData } from "../../components/quiz/types";

/**
 * ユーザー名列挙 - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "ユーザー名列挙 - 理解度テスト",
  description:
    "エラーメッセージやレスポンス時間の差から生じるユーザー名列挙の脆弱性と対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "ユーザー名列挙を防ぐために、エラーメッセージの統一に加えて必要な対策はどれか？",
      options: [
        "HTTPSを有効にする",
        "ユーザーが見つからない場合もダミーのbcryptハッシュ比較を実行し、レスポンス時間を一定にする",
        "エラーメッセージにHTTPステータスコードを含めない",
        "ログインページにアクセス制限をかける",
      ],
      correctIndex: 1,
      explanation:
        "エラーメッセージを統一しても、bcrypt比較の有無によるレスポンス時間の差（約50-100ms）からユーザーの存在を推測できます。ダミーハッシュとの比較を実行することで処理時間を一定にし、タイミング攻撃を防ぎます。",
      referenceLink: "/step03-auth/username-enumeration",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "ユーザー名列挙がブルートフォース攻撃の「前段階」として危険な理由はどれか？",
      options: [
        "列挙によりサーバーの処理速度が低下するため",
        "列挙で特定したユーザー名に絞って攻撃できるため、攻撃効率が飛躍的に向上するため",
        "列挙によりパスワードハッシュが漏洩するため",
        "列挙によりファイアウォールが無効化されるため",
      ],
      correctIndex: 1,
      explanation:
        "ユーザー名が不明な場合、攻撃者はユーザー名とパスワードの両方を推測する必要があります。列挙でユーザー名が確定すれば、パスワードの推測のみに集中でき、攻撃効率が飛躍的に向上します。",
      referenceLink: "/step03-auth/username-enumeration",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "ログイン失敗時のエラーメッセージを「認証に失敗しました」に統一すれば、ユーザー名列挙を完全に防ぐことができる。",
      correctAnswer: false,
      explanation:
        "メッセージを統一しても、レスポンス時間の差（タイミング攻撃）からユーザーの存在を推測できます。存在するユーザーへのリクエストはbcrypt比較で約50-100ms遅くなるため、メッセージの統一とダミーハッシュ比較の両方が必要です。",
      referenceLink: "/step03-auth/username-enumeration",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "2022年にTwitterでメールアドレス列挙の脆弱性が悪用され、約540万アカウントのメールアドレスが収集された。",
      correctAnswer: true,
      explanation:
        "Twitterのアカウント作成時のメールアドレス確認エンドポイントが悪用され、約540万アカウントのメールアドレスが収集されました。APIのレスポンスがメールアドレスの登録有無を区別していたことが原因です。",
      referenceLink: "/step03-auth/username-enumeration",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "エラーメッセージを利用したユーザー名列挙攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がユーザー名の候補リスト（社員名簿、一般的なユーザー名辞書等）を準備する",
        "各ユーザー名でダミーパスワードを使いログインリクエストを送信する",
        "エラーメッセージの違いからユーザー名の存在を確認する",
        "存在が確認されたユーザー名に対してブルートフォース攻撃を実行する",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 0, 3, 1],
      explanation:
        "攻撃者はまず候補リストを準備し、ダミーパスワードで各ユーザー名を試行します。「パスワードが違います」と返されたユーザー名は存在が確定し、次のステップでブルートフォース攻撃の対象になります。",
      referenceLink: "/step03-auth/username-enumeration",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "安全な実装では、アプリケーション起動時に生成した ______ を使って、存在しないユーザーへのリクエストでもbcrypt比較の処理時間を発生させる。（英語とアンダースコアで回答、2語）",
      correctAnswers: ["DUMMY_HASH", "dummy_hash", "DUMMY HASH", "dummy hash"],
      explanation:
        "DUMMY_HASHはアプリケーション起動時に1回だけbcrypt.hash('dummy-placeholder', 10)で生成し、ユーザーが見つからない場合の比較対象として使用します。これによりbcrypt比較の処理時間が常に発生し、タイミング攻撃を防ぎます。",
      referenceLink: "/step03-auth/username-enumeration",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "レスポンス時間の差異を計測してユーザーの存在を推測する攻撃手法を ______ 攻撃という。（カタカナ4文字で回答）",
      correctAnswers: ["タイミング"],
      explanation:
        "タイミング攻撃は、処理時間の差異から内部状態を推測する攻撃手法です。bcryptの比較処理は約50-100msかかるため、比較の有無がレスポンス時間に反映され、ユーザーの存在が推測されます。",
      referenceLink: "/step03-auth/username-enumeration",
    },
  ],
} satisfies QuizData;
