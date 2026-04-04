import type { QuizData } from "../../components/quiz/types";

/**
 * 暗号化・ハッシュの基礎の理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "暗号化・ハッシュの基礎 - 理解度テスト",
  description:
    "共通鍵暗号・公開鍵暗号・ハッシュ関数の違い、TLS/HTTPSの仕組みについての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "パスワードの保存にSHA-256などの汎用ハッシュ関数を直接使うべきでない理由はどれか？",
      options: [
        "SHA-256は出力が短すぎてパスワードを表現できないから",
        "SHA-256は一方向関数ではないから",
        "SHA-256は高速すぎるため総当たり攻撃が容易であり、ソルトがないためレインボーテーブル攻撃にも脆弱だから",
        "SHA-256はJavaScriptでは使用できないから",
      ],
      correctIndex: 2,
      explanation:
        "汎用ハッシュ関数は高速に設計されているため、攻撃者が大量のパスワード候補を試す総当たり攻撃が容易です。また、ソルトがないためレインボーテーブル（事前計算済みハッシュの辞書）で逆引きが可能です。bcryptやArgon2はソルト付きで意図的に低速に設計されており、パスワード保存に適しています。",
      referenceLink: "/foundations/crypto/crypto-basics",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "TLSで使われる「ハイブリッド暗号」とはどのような仕組みか？",
      options: [
        "MD5とSHA-256を組み合わせてハッシュを生成する仕組み",
        "公開鍵暗号で安全に共通鍵を交換し、以降の通信は高速な共通鍵暗号で行う仕組み",
        "クライアントとサーバーが交互に暗号化と復号を行う仕組み",
        "2つの異なる共通鍵を交互に使って暗号化する仕組み",
      ],
      correctIndex: 1,
      explanation:
        "ハイブリッド暗号は、公開鍵暗号の「鍵の配送問題を解決できる」利点と、共通鍵暗号の「高速な暗号化」の利点を組み合わせた方式です。TLSでは公開鍵暗号で安全に共通鍵を交換し、その共通鍵を使って実際のデータを暗号化します。",
      referenceLink: "/foundations/crypto/crypto-basics",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "ハッシュ関数は一方向関数であり、ハッシュ値から元のデータを復元することはできない。",
      correctAnswer: true,
      explanation:
        "ハッシュ関数の重要な特性の一つが一方向性です。入力からハッシュ値は計算できますが、ハッシュ値から元の入力を復元することは計算上不可能です。これがパスワードの保存にハッシュ関数が使われる理由です。",
      referenceLink: "/foundations/crypto/crypto-basics",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "共通鍵暗号は公開鍵暗号と比べて低速であるが、鍵の配送問題がないという利点がある。",
      correctAnswer: false,
      explanation:
        "逆です。共通鍵暗号は高速ですが、鍵の配送問題（通信相手に安全に共通鍵を渡す方法がない）があります。公開鍵暗号は低速ですが、公開鍵は公開しても安全なため鍵の配送問題を解決できます。",
      referenceLink: "/foundations/crypto/crypto-basics",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "TLS証明書の信頼チェーン（証明書チェーン）を、末端から最上位の順に並べ替えてください。",
      items: [
        "サーバー証明書（Webサイトの証明書）",
        "中間CA証明書（中間認証局の証明書）",
        "ルートCA証明書（ブラウザに事前登録された認証局の証明書）",
      ],
      correctOrder: [0, 1, 2],
      initialOrder: [1, 2, 0],
      explanation:
        "証明書チェーンでは、サーバー証明書が中間CAによって署名され、中間CAがルートCAによって署名されます。ブラウザはサーバー証明書からルートCAまで辿り、信頼性を確認します。",
      referenceLink: "/foundations/crypto/crypto-basics",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "パスワードの保存に推奨される最新のハッシュアルゴリズムは ______ である。",
      correctAnswers: ["Argon2", "argon2", "ARGON2"],
      explanation:
        "Argon2は最新のパスワードハッシュアルゴリズムとして推奨されています。メモリハード関数として設計されており、GPU/ASICによる並列攻撃に対しても耐性があります。bcryptも依然として安全ですが、新規プロジェクトではArgon2が推奨されます。",
      referenceLink: "/foundations/crypto/crypto-basics",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "HTTPSの正式な意味は「HTTP over ______」である。（アルファベット大文字3文字で回答）",
      correctAnswers: ["TLS"],
      explanation:
        "HTTPSは「HTTP over TLS（Transport Layer Security）」の略称です。TLSはHTTP通信を暗号化するプロトコルで、通信の盗聴・改ざんを防ぎます。",
      referenceLink: "/foundations/crypto/crypto-basics",
    },
  ],
} satisfies QuizData;
