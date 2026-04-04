import type { QuizData } from "../../components/quiz/types";

/**
 * 弱いハッシュアルゴリズム - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "弱いハッシュアルゴリズム - 理解度テスト",
  description:
    "MD5/SHA1がパスワードハッシュに不適切な理由とbcrypt/Argon2の優位性についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "MD5がパスワードのハッシュ化に不適切な理由として最も重要なものはどれか？",
      options: [
        "ハッシュ値の長さが短すぎるため",
        "一方向関数ではないため",
        "高速すぎてGPUで毎秒100億回以上計算でき、総当たりが容易なため",
        "最新のブラウザでサポートされていないため",
      ],
      correctIndex: 2,
      explanation:
        "MD5はデータの整合性チェック用に設計された汎用ハッシュ関数であり、「速さ」が利点です。しかしパスワードハッシュでは「遅さ」が必要であり、GPUを使えば毎秒100億回以上計算可能なMD5では、総当たりによる解読が現実的な時間で完了してしまいます。",
      referenceLink: "/step03-auth/weak-hash",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "レインボーテーブル攻撃がMD5には有効でbcryptには無効な理由はどれか？",
      options: [
        "bcryptのハッシュ値はMD5より長いため",
        "bcryptは毎回異なるソルトを自動生成するため、同じパスワードでも異なるハッシュ値になるため",
        "bcryptはインターネット接続がないと動作しないため",
        "bcryptのハッシュ値はデータベースに保存できないため",
      ],
      correctIndex: 1,
      explanation:
        "レインボーテーブルは「同じ入力 → 同じハッシュ値」という性質を利用した事前計算済み対応表です。bcryptはユーザーごとにランダムなソルトを自動生成するため、同じパスワードでも毎回異なるハッシュ値になり、事前計算が無意味になります。",
      referenceLink: "/step03-auth/weak-hash",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "MD5ハッシュ値の長さは32文字（128ビット）であり、ハッシュ値の長さだけでアルゴリズムをほぼ特定できる。",
      correctAnswer: true,
      explanation:
        "MD5は32文字（128ビット）、SHA1は40文字（160ビット）の16進数文字列です。攻撃者はハッシュ値の長さだけでアルゴリズムを特定でき、適切な攻撃ツールを選択できます。",
      referenceLink: "/step03-auth/weak-hash",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "ソルト付きのMD5ハッシュであれば、bcryptと同等の安全性が得られる。",
      correctAnswer: false,
      explanation:
        "ソルトを付与すればレインボーテーブル攻撃は防げますが、MD5の計算速度は変わりません。GPUを使った総当たり攻撃に対しては依然として脆弱です。bcryptはソルトに加えてコスト係数による計算遅延があるため、根本的に安全性が異なります。",
      referenceLink: "/step03-auth/weak-hash",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "MD5ハッシュを悪用したパスワード解読の流れを正しい順序に並べ替えてください。",
      items: [
        "SQLインジェクション等でデータベースからMD5ハッシュ値を取得する",
        "ハッシュ値の長さ（32文字）からMD5アルゴリズムを特定する",
        "レインボーテーブルサービスやHashcat等でハッシュ値を逆引きする",
        "復元した平文パスワードで全アカウントにログインする",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [1, 3, 0, 2],
      explanation:
        "攻撃者はまずDBからハッシュ値を取得し、長さからアルゴリズムを特定します。次にレインボーテーブルやGPUツールで逆引きし、復元したパスワードでアカウントに不正アクセスします。",
      referenceLink: "/step03-auth/weak-hash",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "MD5やSHA1のような汎用ハッシュ関数では、同じパスワードが常に同じハッシュ値になるため、事前計算済みの「ハッシュ→パスワード」対応表である ______ で一発検索できる。（カタカナ8文字で回答）",
      correctAnswers: ["レインボーテーブル"],
      explanation:
        "レインボーテーブルは数十億のハッシュ→パスワード対応が事前計算されたデータベースです。ソルトのないMD5/SHA1ハッシュは、CrackStation等のオンラインサービスに貼り付けるだけで即座に元のパスワードが判明します。",
      referenceLink: "/step03-auth/weak-hash",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "bcryptやArgon2のようなパスワード専用ハッシュ関数は、ハッシュ計算を意図的に遅くするための ______ を持つ。（カタカナ4文字と漢字2文字の組み合わせで回答）",
      correctAnswers: ["コスト係数"],
      explanation:
        "コスト係数（ストレッチング）によりハッシュ1回の計算に約100msかかるよう調整でき、GPU攻撃のコストを劇的に増大させます。MD5が数ナノ秒で完了するのに対し、bcryptは数十万倍遅く設計されています。",
      referenceLink: "/step03-auth/weak-hash",
    },
  ],
} satisfies QuizData;
