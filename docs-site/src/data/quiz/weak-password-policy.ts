import type { QuizData } from "../../components/quiz/types";

/**
 * 弱いパスワードポリシー - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "弱いパスワードポリシー - 理解度テスト",
  description:
    "パスワード強度チェックの重要性と安全なパスワードポリシーの実装についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "パスワード強度チェックにおいて、「最低8文字以上」という条件だけでは不十分な理由はどれか？",
      options: [
        "8文字では暗号化できないため",
        "passwordやabcdefghのような弱いパスワードが8文字以上の条件を満たしてしまうため",
        "ユーザーが8文字を覚えられないため",
        "サーバーの処理負荷が高くなるため",
      ],
      correctIndex: 1,
      explanation:
        "「password」は8文字の条件を満たしますが、世界で最もよく使われるパスワードの一つであり、辞書攻撃で最初に試行されます。文字数に加えて文字種の要件とブラックリスト照合を組み合わせる必要があります。",
      referenceLink: "/step03-auth/weak-password-policy",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "安全なパスワードポリシーの実装において、ブラックリスト照合が必要な理由はどれか？",
      options: [
        "文字数と文字種の要件を満たしても辞書上位に含まれるパスワードが存在するため",
        "パスワードの暗号化に必要なため",
        "ブラウザの互換性のため",
        "データベースのストレージ節約のため",
      ],
      correctIndex: 0,
      explanation:
        "「P@ssword1」のように大文字・小文字・数字・記号の全要件を満たしていても、よく使われるパスワードとして辞書に含まれている場合があります。ブラックリスト照合により、このようなパスワードを登録段階で排除できます。",
      referenceLink: "/step03-auth/weak-password-policy",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "パスワードの強度チェックはクライアントサイド（フロントエンド）でのみ実装すれば十分である。",
      correctAnswer: false,
      explanation:
        "クライアントサイドの検証はユーザー体験の向上に役立ちますが、攻撃者はcurl等で直接APIにリクエストを送信してバイパスできます。サーバーサイドでの強度チェックが必須です。",
      referenceLink: "/step03-auth/weak-password-policy",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "2009年のRockYou事件で漏洩した3,200万件のパスワードのうち、最も多く使われていたパスワードは「123456」であった。",
      correctAnswer: true,
      explanation:
        "RockYou事件では3,200万件のパスワードが平文で漏洩し、最多パスワードは「123456」（約29万件）でした。このリストは現在もブルートフォース辞書として広く使用されています。",
      referenceLink: "/step03-auth/weak-password-policy",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "弱いパスワードポリシーを悪用した攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "ユーザーがパスワード強度チェックのないサービスに「123456」で登録する",
        "攻撃者がよく使われるパスワードの辞書（rockyou.txt等）を準備する",
        "攻撃者がターゲットのユーザー名に対して辞書攻撃を実行する",
        "辞書の最上位にある「123456」が一致し、数秒でアカウントが突破される",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [1, 3, 0, 2],
      explanation:
        "弱いパスワードが登録できてしまうと、攻撃者は公開されている辞書を使って数回の試行でパスワードを突破できます。「123456」は辞書の最上位に含まれるため、文字通り最初の試行で成功します。",
      referenceLink: "/step03-auth/weak-password-policy",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "安全なパスワード強度チェックでは、文字数・文字種の要件に加えて、よく使われるパスワードの ______ 照合を行う。（カタカナ6文字で回答）",
      correctAnswers: ["ブラックリスト"],
      explanation:
        "ブラックリスト照合により、「123456」「password」「admin123」等のよく使われるパスワードを登録段階で拒否します。文字数・文字種だけでは防げないパスワードを排除するために不可欠です。",
      referenceLink: "/step03-auth/weak-password-policy",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "覚えやすく推測されにくいパスワード形式として、「correct-horse-battery-staple」のような長い文章形式の ______ が推奨される。（カタカナ5文字で回答）",
      correctAnswers: ["パスフレーズ"],
      explanation:
        "パスフレーズは複数の単語を組み合わせた長い文章形式のパスワードです。覚えやすい一方で十分な長さがあり、ブルートフォースでの突破が困難です。NISTのガイドラインでも推奨されています。",
      referenceLink: "/step03-auth/weak-password-policy",
    },
  ],
} satisfies QuizData;
