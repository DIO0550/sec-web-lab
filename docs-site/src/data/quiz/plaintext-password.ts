import type { QuizData } from "../../components/quiz/types";

/**
 * 平文パスワード保存 - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "平文パスワード保存 - 理解度テスト",
  description:
    "パスワードを平文で保存する危険性とbcrypt等によるハッシュ化の重要性についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "パスワードを平文で保存している場合、データベースが漏洩した際に最も深刻な問題はどれか？",
      options: [
        "データベースの容量が増大する",
        "全ユーザーのパスワードが即座に読み取れ、解析なしで全アカウントが乗っ取られる",
        "サーバーの処理速度が低下する",
        "パスワードの文字数制限が発生する",
      ],
      correctIndex: 1,
      explanation:
        "平文保存の場合、DBが漏洩した瞬間に全パスワードがそのまま読み取れます。ハッシュ化されていればクラッキング作業が必要ですが、平文なら解析不要で即座に悪用できます。さらにパスワードの使い回しにより他サービスへの攻撃にも連鎖します。",
      referenceLink: "/step03-auth/plaintext-password",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "bcryptがパスワードハッシュに適している理由として正しいものはどれか？",
      options: [
        "ハッシュ値が短く、ストレージを節約できるため",
        "計算が高速で、ログイン時の待ち時間が少ないため",
        "自動ソルト生成とコスト係数により、事前計算攻撃と総当たりの両方を防げるため",
        "ハッシュ値から元のパスワードを復元できるため",
      ],
      correctIndex: 2,
      explanation:
        "bcryptは自動的にランダムなソルトを生成し（レインボーテーブルを無効化）、コスト係数で計算速度を意図的に遅くします（GPU攻撃のコストを増大）。この2つの特性により、パスワードハッシュに最適です。",
      referenceLink: "/step03-auth/plaintext-password",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "bcryptでハッシュ化すると、同じパスワードからは毎回同じハッシュ値が生成される。",
      correctAnswer: false,
      explanation:
        "bcryptは毎回ランダムなソルトを自動生成するため、同じパスワードでも毎回異なるハッシュ値が生成されます。これによりレインボーテーブル攻撃が無効化されます。検証時はbcrypt.compare()でソルトを含めた比較を行います。",
      referenceLink: "/step03-auth/plaintext-password",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "2019年にFacebookで数億件のパスワードが社内ログに平文で記録されていたことが発覚した。",
      correctAnswer: true,
      explanation:
        "Facebookでは数億件のパスワードが社内ログに平文で記録されていたことが発覚しました。外部漏洩はなかったものの、内部犯行のリスクが指摘されました。平文保存は外部攻撃だけでなく内部脅威にも脆弱です。",
      referenceLink: "/step03-auth/plaintext-password",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "平文パスワード保存を悪用した攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がSQLインジェクション等でデータベースにアクセスする",
        "usersテーブルの全データをダンプする",
        "パスワードがそのまま平文で読み取れることを確認する",
        "取得したパスワードで全アカウントにログインし、他サービスへの攻撃にも使用する",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 0, 3, 1],
      explanation:
        "攻撃者はまずDBへのアクセス手段を確保し、usersテーブルをダンプします。平文で保存されていればパスワードが即座に読み取れ、各アカウントへのログインだけでなく、パスワードの使い回しを利用した他サービスへの攻撃にも悪用されます。",
      referenceLink: "/step03-auth/plaintext-password",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "bcryptでパスワードをハッシュ化する際に、計算の繰り返し回数を制御するパラメータを ______ という。（漢字とカタカナの組み合わせで回答、例: ○○○○）",
      correctAnswers: ["コスト係数"],
      explanation:
        "コスト係数（work factor）はbcryptのハッシュ計算を繰り返す回数を制御します。値を大きくするほど計算が遅くなり、GPU攻撃のコストが増大します。一般的にコスト係数12（約250ms）が推奨されます。",
      referenceLink: "/step03-auth/plaintext-password",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "安全なログイン実装では、入力パスワードと保存ハッシュの比較に bcrypt.______ メソッドを使用する。（英語で回答）",
      correctAnswers: ["compare"],
      explanation:
        "bcrypt.compare()は、入力されたパスワードを保存済みハッシュ値に含まれるソルトとコスト係数でハッシュ化し、結果を比較します。WHEREで直接比較するのではなく、この専用メソッドを使う必要があります。",
      referenceLink: "/step03-auth/plaintext-password",
    },
  ],
} satisfies QuizData;
