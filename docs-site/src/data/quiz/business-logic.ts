import type { QuizData } from "../../components/quiz/types";

/**
 * Business Logic Flaws - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "ビジネスロジックの欠陥 - 理解度テスト",
  description:
    "ビジネスロジックの欠陥による不正操作の仕組みと対策についての理解度をチェックしましょう。",
  questions: [
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "注文APIで `quantity: -5, price: 1000` を送信したとき、サーバー側で `balance - (price * quantity)` が実行された場合の結果はどれか？",
      options: [
        "残高が5,000円減少する",
        "残高が5,000円増加する",
        "エラーが返される",
        "残高に変化がない",
      ],
      correctIndex: 1,
      explanation:
        "total = 1000 * (-5) = -5000 が計算され、balance - (-5000) = balance + 5000 が実行されます。数学的に「負の値を引く」ことは「正の値を足す」ことと等しいため、注文したはずなのに残高が5,000円増加します。",
      referenceLink: "/step07-design/business-logic",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "ビジネスロジックの欠陥を防ぐために、サーバー側で単価（price）をどのように扱うべきか？",
      options: [
        "クライアントから送信されたpriceをそのまま使用する",
        "クライアントのpriceをフロントエンドのバリデーションで検証してから使用する",
        "クライアントのpriceは無視し、サーバー側でDBの商品マスタから価格を取得する",
        "クライアントのpriceが正の値であることだけ確認して使用する",
      ],
      correctIndex: 2,
      explanation:
        "単価（price）はクライアントから受け取るべきではなく、サーバー側で商品マスタ（DB）から取得すべきです。クライアントから送信される値は常に改ざんされうるため、フロントエンドのバリデーションはセキュリティの防御策にはなりません。",
      referenceLink: "/step07-design/business-logic",
    },
    {
      id: "tf-1",
      type: "true-false",
      text: "フロントエンド（JavaScript）でのバリデーションは、UXの向上には役立つが、セキュリティの防御策にはならない。",
      correctAnswer: true,
      explanation:
        "フロントエンドのバリデーションはDevToolsやcurlを使って簡単にバイパスできます。UX向上（ユーザーへの即時フィードバック）には有用ですが、セキュリティ対策としてはサーバー側でのバリデーションが必須です。",
      referenceLink: "/step07-design/business-logic",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "データベースにCHECK制約（例: CHECK (balance >= 0)）を設定すれば、アプリケーション層のバリデーションは不要になる。",
      correctAnswer: false,
      explanation:
        "DB制約はアプリケーション層のバグがあってもデータの整合性を保つ「最後の砦」として重要ですが、アプリケーション層のバリデーションの代替にはなりません。適切なエラーメッセージの返却やビジネスルールの検証はアプリケーション層で行う必要があります。両方を組み合わせた多層防御が推奨されます。",
      referenceLink: "/step07-design/business-logic",
    },
    {
      id: "ord-1",
      type: "ordering",
      text: "安全な注文処理の流れを正しい順序に並べ替えてください。",
      items: [
        "Zodでリクエストのバリデーションを行う（quantity > 0）",
        "トランザクションを開始する（BEGIN）",
        "DBから商品の価格と在庫を取得する（SELECT ... FOR UPDATE）",
        "在庫と残高のチェックを行う",
        "残高と在庫を更新しコミットする（COMMIT）",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 0, 4, 2, 1],
      explanation:
        "まずZodで入力値を検証し、不正な値は早期にリジェクトします。次にトランザクション内でDBから正確な価格と在庫を取得（行ロック付き）し、在庫と残高を確認してから更新・コミットします。この一連の処理がアトミックに実行されることで、不整合を防ぎます。",
      referenceLink: "/step07-design/business-logic",
    },
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "TypeScriptでリクエストのスキーマバリデーションに使用されるライブラリで、`z.number().int().positive()` のように記述できるものは ______ である。（小文字で回答）",
      correctAnswers: ["zod", "Zod"],
      explanation:
        "Zodは、TypeScript向けのスキーマバリデーションライブラリです。z.number().int().positive()のようにチェーンメソッドで型と制約を定義でき、サーバー側でのバリデーションに広く使われています。",
      referenceLink: "/step07-design/business-logic",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "トランザクション内で他のトランザクションからの更新を防ぐために、SQLで行ロックを取得するには SELECT ... ______ ______ を使用する。（2語を半角スペース区切り、大文字で回答）",
      correctAnswers: ["FOR UPDATE"],
      explanation:
        "SELECT ... FOR UPDATEは、選択した行に対して排他ロックを取得します。同時に別のトランザクションが同じ行を更新しようとするとロックが解放されるまで待機するため、在庫チェックと更新の間のレースコンディションを防ぎます。",
      referenceLink: "/step07-design/business-logic",
    },
  ],
} satisfies QuizData;
