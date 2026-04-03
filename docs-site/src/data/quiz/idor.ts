import type { QuizData } from "../../components/quiz/types";

/**
 * IDOR (Insecure Direct Object Reference) - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "IDOR (Insecure Direct Object Reference) - 理解度テスト",
  description:
    "IDORの攻撃手法・発生条件・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "IDOR が発生する根本的な原因はどれか？",
      options: [
        "サーバーがHTTPS通信を使用していないため",
        "サーバーが認証（誰か）は確認するが認可（何にアクセスしてよいか）を検証していないため",
        "パスワードが平文で保存されているため",
        "CSRFトークンが設定されていないため",
      ],
      correctIndex: 1,
      explanation:
        "IDORの根本原因は、サーバーがリクエスト元のユーザーが「ログイン済みか（認証）」は確認しても、「そのリソースにアクセスする権限があるか（認可）」を検証していないことです。認証と認可は別の概念であり、認証だけでは不十分です。",
      referenceLink: "/step05-access-control/idor",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "IDOR対策として最も効果的な方法はどれか？",
      options: [
        "URLにリソースIDを含めないようフロントエンドを変更する",
        "リソースIDを連番ではなくランダムな文字列にする",
        "サーバーサイドでセッションのユーザーIDとリクエストされたリソースの所有者を照合する",
        "APIレスポンスからIDフィールドを除外する",
      ],
      correctIndex: 2,
      explanation:
        "最も効果的な対策は、サーバーサイドでセッションから取得した現在のユーザーIDとリクエストされたリソースの所有者を照合することです。UUIDの使用は列挙を困難にしますが、UUIDが漏洩すれば同じ問題が発生するため根本対策ではありません。",
      referenceLink: "/step05-access-control/idor",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "リソースIDを連番の整数からUUID v4に変更すれば、IDORの根本対策となる。",
      correctAnswer: false,
      explanation:
        "UUIDは推測が困難なため列挙攻撃を難しくしますが、UUIDが何らかの方法で漏洩すれば同じ問題が発生します。UUIDは多層防御の一部であり、根本対策はサーバーサイドでの認可チェック（リクエスト元ユーザーがリソースの所有者かを検証すること）です。",
      referenceLink: "/step05-access-control/idor",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "URLにIDを含めず、セッションから直接ユーザーIDを取得してデータを返す設計にすれば、IDの書き換えによるIDOR攻撃を防げる。",
      correctAnswer: true,
      explanation:
        "URLにリソースIDを含めず、セッションから現在のユーザーIDを取得する設計にすれば、クライアントがIDを操作する余地がなくなります。例えば GET /api/profile のようにIDを含まないエンドポイントにして、セッションのユーザーIDのみを使用する方法です。",
      referenceLink: "/step05-access-control/idor",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "IDORによる他ユーザーのデータ取得攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が正規ユーザーとしてログインし、自分のプロフィールページのURLを確認する",
        "URLに含まれるリソースID（例: /users/3/profile）のパターンを把握する",
        "IDを別の値（例: /users/1/profile）に書き換えてリクエストを送信する",
        "サーバーが認可チェックなしでリクエストされたIDのデータを返す",
        "攻撃者がIDを連番で繰り返し、全ユーザーのデータを収集する",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 0, 4, 2, 1],
      explanation:
        "IDOR攻撃では、まず攻撃者が自分のURLからIDパターンを把握し、IDを書き換えてリクエストします。サーバーが認可チェックを行わないため、他ユーザーのデータがそのまま返されます。連番IDの場合、1から順にインクリメントするだけで全ユーザーのデータを列挙できます。",
      referenceLink: "/step05-access-control/idor",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "IDORは認証と______の混同が原因で発生する。サーバーが「誰か」は確認しても「何にアクセスしてよいか」を検証しないことが問題である。（漢字2文字で回答）",
      correctAnswers: ["認可"],
      explanation:
        "認証（Authentication）は「誰であるか」を確認するプロセスであり、認可（Authorization）は「何を許可するか」を判定するプロセスです。IDORは認証は行っているが認可を行っていない場合に発生します。",
      referenceLink: "/step05-access-control/idor",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "IDOR対策として、サーバーがリクエストされたリソースIDへのアクセスを拒否する際に返すべきHTTPステータスコードは______である。（半角数字3桁で回答）",
      correctAnswers: ["403"],
      explanation:
        "403 Forbiddenは「リクエストは理解したが、アクセス権限がないため拒否する」という意味のステータスコードです。認証されていない場合の401 Unauthorizedとは異なり、認証済みだが認可されていない場合に使用します。",
      referenceLink: "/step05-access-control/idor",
    },
  ],
} satisfies QuizData;
