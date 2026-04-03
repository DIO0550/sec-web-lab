import type { QuizData } from "../../components/quiz/types";

/**
 * Predictable Password Reset Token - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "推測可能なパスワードリセットトークン - 理解度テスト",
  description:
    "パスワードリセットトークンの推測攻撃の仕組みと対策についての理解度をチェックしましょう。",
  questions: [
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "パスワードリセットトークンが連番（0001, 0002, ...）で生成される場合の最も深刻な問題はどれか？",
      options: [
        "トークンの文字数が短すぎてURLが見栄えが悪い",
        "データベースのインデックス効率が低下する",
        "探索空間が狭く（4桁なら1万通り）、総当たりで他人のトークンを容易に推測できる",
        "連番はデータベースの主キーと重複する可能性がある",
      ],
      correctIndex: 2,
      explanation:
        "4桁の連番トークンは1万通りしかないため、自動化スクリプトで数分以内に全パターンを網羅できます。攻撃者はメールにアクセスすることなく、トークンの推測だけでパスワードリセットを実行し、アカウントを乗っ取ることができます。",
      referenceLink: "/step07-design/password-reset",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "安全なパスワードリセットトークンの生成方法として最も適切なものはどれか？",
      options: [
        "Math.random()で乱数を生成する",
        "Date.now()のタイムスタンプをトークンとして使用する",
        "crypto.randomUUID()で暗号論的に安全な乱数を生成する",
        "ユーザーIDとメールアドレスを連結した文字列をトークンとする",
      ],
      correctIndex: 2,
      explanation:
        "crypto.randomUUID()は暗号論的に安全な乱数生成器を使用し、UUID v4の場合は約2^122通りのパターンがあるため、総当たりは事実上不可能です。Math.random()は暗号論的に安全ではなく、Date.now()は時刻が分かれば前後を探索できます。",
      referenceLink: "/step07-design/password-reset",
    },
    {
      id: "tf-1",
      type: "true-false",
      text: "パスワードリセットトークンに有効期限を設定する理由は、攻撃者が総当たりに使える時間を制限するためである。",
      correctAnswer: true,
      explanation:
        "トークンに有効期限（30分など）を設定することで、攻撃者がトークンを推測できる時間が限られます。期限切れのトークンはサーバーが拒否するため、時間をかけた総当たり攻撃を困難にします。",
      referenceLink: "/step07-design/password-reset",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "パスワードリセットトークンが暗号論的に安全であれば、リセットトークン検証エンドポイントにレート制限を設ける必要はない。",
      correctAnswer: false,
      explanation:
        "暗号論的に安全なトークンであっても、多層防御の考え方からレート制限を設けるべきです。将来的にトークン生成に脆弱性が発見された場合の安全ネットとなり、また大量のリクエストによるサーバー負荷の軽減にもなります。",
      referenceLink: "/step07-design/password-reset",
    },
    {
      id: "ord-1",
      type: "ordering",
      text: "推測可能なトークンを利用したパスワードリセット攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がターゲットのメールアドレスを指定してリセットを要求する",
        "サーバーが連番トークンを生成しDBに保存する",
        "攻撃者がトークンを0001から9999まで総当たりで試す",
        "有効なトークンを発見し被害者のパスワードを変更する",
        "攻撃者が変更後のパスワードでログインしアカウントを乗っ取る",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [2, 4, 0, 1, 3],
      explanation:
        "攻撃者はターゲットのリセットを要求した後、サーバーが生成した連番トークンを総当たりで推測します。有効なトークンを発見するとパスワードを変更し、被害者のアカウントを乗っ取ります。メールにアクセスする必要がない点がこの攻撃の特徴です。",
      referenceLink: "/step07-design/password-reset",
    },
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "Node.jsでUUID v4を安全に生成するために使用する関数は crypto.______ である。（キャメルケースで回答）",
      correctAnswers: ["randomUUID"],
      explanation:
        "crypto.randomUUID()はNode.jsの標準ライブラリに含まれる関数で、暗号論的に安全な乱数を使用してUUID v4を生成します。約2^122通りのパターンがあり、総当たりは事実上不可能です。",
      referenceLink: "/step07-design/password-reset",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "使用済みのリセットトークンを再利用できないようにするために、データベースのトークンレコードに ______ フラグを設定する。（英語で回答）",
      correctAnswers: ["used"],
      explanation:
        "トークンを一度使用したら即座にusedフラグをtrueに設定し、再利用を防止します。これにより攻撃者が有効なトークンを窃取しても、被害者が先にトークンを使用していれば攻撃は失敗します。",
      referenceLink: "/step07-design/password-reset",
    },
  ],
} satisfies QuizData;
