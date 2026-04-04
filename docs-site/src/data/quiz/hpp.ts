import type { QuizData } from "../../components/quiz/types";

/**
 * HTTP Parameter Pollution (HPP) - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "HTTP Parameter Pollution (HPP) - 理解度テスト",
  description:
    "HTTPパラメータ汚染（HPP）の攻撃手法・仕組み・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "HPP 攻撃が成立する根本的な原因はどれか？",
      options: [
        "HTTP プロトコルがパラメータの暗号化を義務付けていない",
        "バリデーション層と実行層で重複パラメータの異なる値を参照してしまう",
        "クエリパラメータの長さに制限がない",
        "ブラウザが重複パラメータを自動的にマージする",
      ],
      correctIndex: 1,
      explanation:
        "HPP の根本原因は、バリデーション（検証）と実行が異なるレイヤーで行われ、それぞれが重複パラメータの「別の値」を参照してしまうことです。例えば、バリデーションが最初の値（user）をチェックし、実行層が最後の値（admin）を使うと、検証をすり抜けて管理者権限が取得されます。",
      referenceLink: "/step02-injection/hpp",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "?role=user&role=admin というリクエストを Hono の c.req.query('role') で取得した場合の結果はどれか？",
      options: [
        "'admin'（最後の値）",
        "'user'（最初の値）",
        "['user', 'admin']（配列）",
        "エラーが発生する",
      ],
      correctIndex: 1,
      explanation:
        "Hono の c.req.query() は重複パラメータがある場合に最初の値を返します。一方、PHP の $_GET は最後の値で上書きし、Express の req.query は配列として返します。このフレームワークごとの違いが HPP 攻撃の原因になります。",
      referenceLink: "/step02-injection/hpp",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "HTTP の仕様では、同じ名前のクエリパラメータが複数存在することを禁止していない。",
      correctAnswer: true,
      explanation:
        "HTTP の仕様はパラメータ名の重複を禁止しておらず、?role=user&role=admin は完全に合法な HTTP リクエストです。WAF やプロキシも通常は重複パラメータをブロックしません。この仕様上の許容と、フレームワークごとの処理の違いが HPP 攻撃を可能にしています。",
      referenceLink: "/step02-injection/hpp",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "HPP 対策として、ユーザーからロール（権限）の指定を受け付けず、サーバー側のロジックでロールを決定する設計は有効である。",
      correctAnswer: true,
      explanation:
        "そもそもクライアントにロールを指定させない設計が最も安全です。ユーザー登録時のロールはサーバー側で決定し、管理者によるロール変更は管理画面経由で行うべきです。クライアントからの入力を信頼しない原則は、HPP だけでなく多くのセキュリティ対策の基本です。",
      referenceLink: "/step02-injection/hpp",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "HPP による権限昇格攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が ?role=user&role=admin という重複パラメータを含むリクエストを送信する",
        "バリデーション層が c.req.query('role') で最初の値 'user' を取得してチェックを通過させる",
        "実行層が URLSearchParams.getAll() の最後の値 'admin' を使ってユーザーを登録する",
        "攻撃者が管理者権限を持つアカウントを取得する",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [1, 3, 0, 2],
      explanation:
        "攻撃者が重複パラメータを送信すると、バリデーション層は最初の値 'user' を見てチェックを通過させます。しかし実行層は別の方法でパラメータを取得し、最後の値 'admin' を使ってユーザー登録を行うため、検証を完全にバイパスして管理者アカウントが作成されます。",
      referenceLink: "/step02-injection/hpp",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "HPP 対策として、URLSearchParams の ______ メソッドで全値を配列として取得し、長さが1でない場合はリクエストを拒否する。（メソッド名を回答）",
      correctAnswers: ["getAll"],
      explanation:
        "getAll() メソッドは指定した名前のパラメータの全値を配列として返します。getAll('role') が ['user', 'admin'] のように長さが1でない値を返した場合は重複パラメータが存在するため、リクエストをエラーにします。これにより検証と実行で異なる値が使われることを構造的に防止できます。",
      referenceLink: "/step02-injection/hpp",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "PHP の $_GET で ?role=user&role=admin を受け取った場合、$_GET['role'] の値は ______ になる。（英語で回答）",
      correctAnswers: ["admin"],
      explanation:
        "PHP の $_GET は同名のパラメータが複数ある場合、最後の値で上書きします。そのため ?role=user&role=admin では $_GET['role'] は 'admin' になります。この挙動はフレームワークごとに異なり（Hono は最初の値、Express は配列）、この違いが HPP 攻撃の根本にあります。",
      referenceLink: "/step02-injection/hpp",
    },
  ],
} satisfies QuizData;
