import type { QuizData } from "../../components/quiz/types";

/**
 * Trusting Unsigned Client Data - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "署名なしデータの信頼 - 理解度テスト",
  description:
    "クライアントデータを署名なしで信頼することによる権限昇格やデータ改ざんの仕組みと対策についての理解度をチェックしましょう。",
  questions: [
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "署名なしCookieで `role=user` を保存している場合、攻撃者がDevToolsで `role=admin` に書き換えると何が起きるか？",
      options: [
        "ブラウザがCookieの変更を自動的に検知して拒否する",
        "サーバーが改ざんを検知できず、攻撃者に管理者権限でのアクセスを許可してしまう",
        "サーバーがCookieの有効期限切れとして扱い、再ログインを要求する",
        "サーバー側のセッションストアと不一致のためエラーになる",
      ],
      correctIndex: 1,
      explanation:
        "署名なしCookieにはHMAC等の改ざん検知機構がないため、サーバーはCookieの値が自分が設定した正しい値であるかを確認する手段がありません。攻撃者がrole=adminに書き換えてリクエストを送信すると、サーバーはそのまま管理者として処理してしまいます。",
      referenceLink: "/step07-design/unsigned-data",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "Hidden Fieldの価格改ざんを根本的に防ぐ方法として最も適切なものはどれか？",
      options: [
        "Hidden Fieldの値をJavaScriptで暗号化する",
        "Hidden Fieldに読み取り専用属性を追加する",
        "Hidden Fieldの値をサーバー側で再検証せず、価格はDBから再取得する",
        "CSSでHidden Fieldを非表示にしてDevToolsから見えなくする",
      ],
      correctIndex: 2,
      explanation:
        "Hidden Fieldの値はDevToolsのElementsタブから直接編集できるため、クライアント側の保護は意味がありません。価格などの重要な値はHidden Fieldに頼らず、サーバー側でDBから再取得して使用すべきです。",
      referenceLink: "/step07-design/unsigned-data",
    },
    {
      id: "tf-1",
      type: "true-false",
      text: "署名付きCookie（HMAC）を使用すると、攻撃者がCookieの値を書き換えた場合にサーバーが改ざんを検知できる。",
      correctAnswer: true,
      explanation:
        "署名付きCookieは、Cookie値とサーバーだけが知る秘密鍵を使ってHMAC署名を生成します。攻撃者がCookieの値を書き換えると署名と値が一致しなくなり、サーバーが改ざんを検知できます。秘密鍵を知らない攻撃者は正しい署名を生成できません。",
      referenceLink: "/step07-design/unsigned-data",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "HTMLの `<input type=\"hidden\">` はユーザーから見えないため、値が改ざんされる心配はない。",
      correctAnswer: false,
      explanation:
        "type=\"hidden\"はブラウザの画面上で非表示になるだけであり、DevToolsのElementsタブで値を自由に閲覧・変更できます。攻撃者はフォーム送信前にHidden Fieldの値（価格、数量、商品ID等）を任意の値に書き換えられます。",
      referenceLink: "/step07-design/unsigned-data",
    },
    {
      id: "ord-1",
      type: "ordering",
      text: "Cookie改ざんによる権限昇格攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がDevToolsでCookieのrole=userを確認する",
        "攻撃者がCookieの値をrole=adminに書き換える",
        "改ざんしたCookieでリクエストを送信する",
        "サーバーが署名なしCookieをそのまま信頼し管理者としてアクセスを許可する",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [3, 1, 0, 2],
      explanation:
        "攻撃者はまずDevToolsでCookieの内容を確認し、署名がないことを把握します。値をadminに書き換えてリクエストを送信すると、サーバーは検証手段を持たないため管理者として処理してしまいます。",
      referenceLink: "/step07-design/unsigned-data",
    },
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "Honoで署名付きCookieの検証に使用する関数は ______ である。（キャメルケースで回答）",
      correctAnswers: ["getSignedCookie"],
      explanation:
        "HonoのgetSignedCookie関数は、署名付きCookieの値を取得し、HMAC署名を検証します。署名が一致しない（改ざんされている）場合はnullを返すため、サーバー側で改ざんを検知できます。",
      referenceLink: "/step07-design/unsigned-data",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "Cookie値の改ざんを検知するために使用される暗号技術で、秘密鍵とメッセージからハッシュ値を生成する仕組みの略称は ______ である。（大文字4文字で回答）",
      correctAnswers: ["HMAC"],
      explanation:
        "HMAC（Hash-based Message Authentication Code）は、秘密鍵とメッセージ（Cookie値）からハッシュ値を生成する仕組みです。秘密鍵を知る者だけが正しいハッシュを計算できるため、署名付きCookieの改ざん検知に使用されます。",
      referenceLink: "/step07-design/unsigned-data",
    },
  ],
} satisfies QuizData;
