import type { QuizData } from "../../components/quiz/types";

/**
 * ブルートフォース攻撃 - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "ブルートフォース攻撃 - 理解度テスト",
  description:
    "パスワード総当たり攻撃の仕組みとレート制限等の防御策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "ブルートフォース攻撃が成立するために最も重要な条件はどれか？",
      options: [
        "攻撃者がターゲットの個人情報を知っていること",
        "ログイン試行の回数に制限がないこと",
        "パスワードが平文で保存されていること",
        "サーバーがHTTPSを使用していないこと",
      ],
      correctIndex: 1,
      explanation:
        "ブルートフォース攻撃は、パスワード候補を片っ端から試す攻撃です。ログイン試行に回数制限がなければ、攻撃者は数万〜数百万のパスワードを自動化ツールで高速に試行でき、いずれ正しいパスワードに到達します。",
      referenceLink: "/step03-auth/brute-force",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "レート制限を「15分間に5回まで」に設定した場合、10,000語のパスワード辞書を全て試すのにかかる時間に最も近いものはどれか？",
      options: [
        "約1時間",
        "約1日",
        "約20日",
        "約1年",
      ],
      correctIndex: 2,
      explanation:
        "15分間に5回の制限では、1時間に20回、1日に480回の試行が可能です。10,000語の辞書を試すには10,000 / 480 = 約20.8日かかり、攻撃が現実的でなくなります。",
      referenceLink: "/step03-auth/brute-force",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "レート制限だけでブルートフォース攻撃を完全に防ぐことができる。",
      correctAnswer: false,
      explanation:
        "レート制限は攻撃速度を大幅に低下させますが、IPアドレスを変えたり分散攻撃を行うことで回避される可能性があります。多要素認証（MFA）やアカウントロック等の多層防御を組み合わせることが重要です。",
      referenceLink: "/step03-auth/brute-force",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "2014年のiCloudセレブリティ写真流出事件は、Find My iPhone APIにレート制限がなかったことが原因の一つである。",
      correctAnswer: true,
      explanation:
        "iCloudの「Find My iPhone」APIにレート制限がなく、ブルートフォースでセレブリティのアカウントが突破されました。プライベート写真が大量に流出し、APIのレート制限の重要性が広く認識されるきっかけとなりました。",
      referenceLink: "/step03-auth/brute-force",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "ブルートフォース攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がパスワード辞書（rockyou.txt等）を準備する",
        "自動化ツールでログインエンドポイントに連続リクエストを送信する",
        "サーバーがレート制限なしで各試行に成功/失敗を返す",
        "辞書内のパスワードが一致した時点でログインに成功する",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [3, 1, 0, 2],
      explanation:
        "攻撃者はまず辞書を準備し、自動化ツールで高速にログインを試行します。サーバーにレート制限がなければ何度でも試行でき、辞書内のパスワードが一致すれば攻撃が成功します。",
      referenceLink: "/step03-auth/brute-force",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "レート制限を超えたログイン試行に対して、サーバーが返すべきHTTPステータスコードは ______ である。（数字3桁で回答）",
      correctAnswers: ["429"],
      explanation:
        "HTTP 429（Too Many Requests）は、レート制限を超えたリクエストに対して返すステータスコードです。クライアントに対して「しばらく待ってから再試行してください」という意味を伝えます。",
      referenceLink: "/step03-auth/brute-force",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "失敗するたびに応答時間を指数的に増やしてブルートフォースの速度を低下させる手法を ______ という。（英語で回答、2語をスペース区切り）",
      correctAnswers: ["Exponential Backoff", "exponential backoff"],
      explanation:
        "Exponential Backoff（指数バックオフ）は、失敗するたびに待機時間を2倍、4倍、8倍と指数的に増やす手法です。攻撃者の試行速度を大幅に低下させる多層防御策の一つです。",
      referenceLink: "/step03-auth/brute-force",
    },
  ],
} satisfies QuizData;
