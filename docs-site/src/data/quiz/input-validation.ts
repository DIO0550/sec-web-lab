import type { QuizData } from "../../components/quiz/types";

/**
 * Input Validation（入力バリデーション設計の原則）の理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "Input Validation - 理解度テスト",
  description:
    "入力バリデーションの設計原則、ホワイトリスト方式とブラックリスト方式の違い、バリデーション・サニタイゼーション・エスケープの役割についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "ブラックリスト方式のバリデーションがホワイトリスト方式より劣る理由として最も正確なのはどれか？",
      options: [
        "ブラックリストの方が実装が複雑だから",
        "攻撃パターンが無限にあり、大文字混在やエンコーディング変換で回避されるから",
        "ブラックリストはパフォーマンスが悪いから",
        "ブラックリストはフロントエンドでしか使えないから",
      ],
      correctIndex: 1,
      explanation:
        "ブラックリスト方式は「危険な入力」を列挙して拒否しますが、攻撃パターンは無限に存在します。<Script>（大文字混在）、<scr<script>ipt>（分割）、%3Cscript%3E（エンコーディング）など回避手法が多数あり、すべてを網羅することは不可能です。",
      referenceLink: "/step09-defense/input-validation",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "バリデーション・サニタイゼーション・エスケープの関係として正しいのはどれか？",
      options: [
        "3つのうちいずれか1つを実装すれば十分である",
        "エスケープだけ実装すればバリデーションとサニタイゼーションは不要である",
        "3つは代替ではなく補完の関係であり、すべて必要である",
        "バリデーションとサニタイゼーションは同じものの別名である",
      ],
      correctIndex: 2,
      explanation:
        "バリデーション（入力受付時に拒否）、サニタイゼーション（処理前に除去・変換）、エスケープ（出力時に無害化）は代替ではなく補完の関係です。バリデーションは入り口、エスケープは出口の防御であり、すべてを組み合わせて多層防御を実現します。",
      referenceLink: "/step09-defense/input-validation",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "HTMLフォームのrequired属性やtype=\"email\"によるクライアント側バリデーションがあれば、サーバー側のバリデーションは不要である。",
      correctAnswer: false,
      explanation:
        "クライアント側のバリデーションはDevToolsでフォームを改ざんしたり、curlで直接リクエストを送信することで完全にバイパスできます。クライアント側はユーザー利便性のため、サーバー側のバリデーションがセキュリティ上必須です。",
      referenceLink: "/step09-defense/input-validation",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "zodなどのスキーマバリデーションライブラリを使っていれば、パラメータ化クエリ（プリペアドステートメント）は不要である。",
      correctAnswer: false,
      explanation:
        "バリデーションとパラメータ化クエリはそれぞれ異なる防御層です。バリデーションは不正な入力を拒否しますが、バリデーションを通過した正当な入力でもSQL構文として解釈される可能性があります。パラメータ化クエリは入力がSQL構文として解釈されないことを保証する別の防御層です。",
      referenceLink: "/step09-defense/input-validation",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "ユーザー入力を安全に処理するための各段階を正しい順序に並べ替えてください。",
      items: [
        "ユーザー入力を受け取る",
        "バリデーション: 型・形式・範囲を検証し、不正な入力を拒否する",
        "サニタイゼーション: 危険な部分を除去・変換する",
        "エスケープ: 出力先に応じて特殊文字を無害化してレスポンスやDBに出力する",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [0, 3, 1, 2],
      explanation:
        "入力処理の流れは、受け取り → バリデーション（拒否）→ サニタイゼーション（変換）→ エスケープ（出力時無害化）の順です。バリデーションは入り口で不正データを止め、エスケープは出口で安全な出力を保証します。",
      referenceLink: "/step09-defense/input-validation",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "zodでユーザー名を英数字とアンダースコアのみに制限するバリデーションには z.string().______ メソッドを使用する。",
      correctAnswers: ["regex", "regex()"],
      explanation:
        "zodのz.string().regex()メソッドで正規表現パターンを指定し、ホワイトリスト方式のバリデーションを実現します。例えば.regex(/^[a-zA-Z0-9_]+$/)とすることで、許可する文字種を明示的に定義できます。",
      referenceLink: "/step09-defense/input-validation",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "Honoフレームワークでzodバリデーションをミドルウェアとして使用するための関数名は ______ である。（キャメルケースで回答）",
      correctAnswers: ["zValidator"],
      explanation:
        "@hono/zod-validatorパッケージが提供するzValidator関数は、zodスキーマをHonoのミドルウェアとして使用できるようにします。zValidator('json', schema)のように指定することで、リクエストボディのバリデーションを宣言的に記述できます。",
      referenceLink: "/step09-defense/input-validation",
    },
  ],
} satisfies QuizData;
