import type { QuizData } from "../../components/quiz/types";

/**
 * Missing Rate Limiting - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "レート制限なし - 理解度テスト",
  description:
    "レート制限の欠如によるブルートフォース攻撃の仕組みと対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "レート制限がない認証エンドポイントに対して、10,000語のパスワード辞書を毎秒100回の速度で試行した場合、全候補を試し終えるのにかかる時間として最も近いものはどれか？",
      options: [
        "約10秒",
        "約1分40秒",
        "約16分40秒",
        "約2時間46分",
      ],
      correctIndex: 1,
      explanation:
        "10,000語 ÷ 毎秒100回 = 100秒 ≒ 約1分40秒です。レート制限がなければ、辞書攻撃は非常に短時間で完了します。「1分間に5回まで」の制限を設けた場合は約33時間かかり、攻撃が現実的でなくなります。",
      referenceLink: "/step07-design/rate-limiting",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "IPベースのレート制限・アカウントロック・段階的遅延の3つを組み合わせる理由として最も適切なものはどれか？",
      options: [
        "1つだけでは処理負荷が高すぎるため、分散して負荷を下げる",
        "それぞれ異なる攻撃パターン（IP変更、分散攻撃等）に対応し、多角的に防御するため",
        "法律上、3つ以上の防御策を実装することが義務付けられているため",
        "3つのうち1つだけでも全ての攻撃を防げるが、冗長性のために組み合わせる",
      ],
      correctIndex: 1,
      explanation:
        "IPベースのレート制限は攻撃速度を低下させますが、IPアドレスを変更する分散攻撃には対応できません。アカウントロックはIP変更による攻撃にも対応できますが、正規ユーザーをロックアウトするDoS攻撃に転用されるリスクがあります。段階的遅延は攻撃効率をさらに下げます。それぞれが異なる弱点を補い合うため、組み合わせが重要です。",
      referenceLink: "/step07-design/rate-limiting",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "アカウントロック機能は、正規ユーザーを意図的にロックアウトさせるDoS攻撃に転用される可能性がある。",
      correctAnswer: true,
      explanation:
        "攻撃者がターゲットのユーザー名で意図的にログイン失敗を繰り返すと、正規ユーザーのアカウントがロックされ、サービスを利用できなくなります。これはアカウントロックの副作用であり、ロック解除の仕組みやCAPTCHAとの組み合わせで対処する必要があります。",
      referenceLink: "/step07-design/rate-limiting",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "段階的遅延（Exponential Backoff）では、ログイン失敗のたびに応答時間が線形に増加する（1秒→2秒→3秒→4秒）。",
      correctAnswer: false,
      explanation:
        "段階的遅延（Exponential Backoff）では、応答時間は指数的に増加します（1秒→2秒→4秒→8秒→16秒...）。線形ではなく指数的に増加することで、攻撃者の試行効率を大幅に低下させます。",
      referenceLink: "/step07-design/rate-limiting",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "レート制限がないAPIに対する辞書攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がターゲットの有効なユーザー名を特定する",
        "パスワード辞書ファイル（rockyou.txt等）を用意する",
        "自動化スクリプトで認証APIに連続リクエストを送信する",
        "サーバーが全リクエストを制限なく処理する",
        "正しいパスワードがヒットした時点でログインに成功する",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 0, 4, 1, 2],
      explanation:
        "辞書攻撃では、まず有効なユーザー名を特定し、パスワード辞書を用意します。自動化ツールで認証APIに連続リクエストを送信し、レート制限がないためサーバーは全リクエストを制限なく処理します。辞書に含まれるパスワードがヒットした時点でログインが成功します。",
      referenceLink: "/step07-design/rate-limiting",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "レート制限によりリクエストが拒否された場合、サーバーが返すべきHTTPステータスコードは ______ である。（数字3桁で回答）",
      correctAnswers: ["429"],
      explanation:
        "HTTP 429 Too Many Requests は、ユーザーが一定時間内に過剰なリクエストを送信した場合にサーバーが返すステータスコードです。レート制限に達したことをクライアントに通知するために使用されます。",
      referenceLink: "/step07-design/rate-limiting",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "多要素認証の略称は ______ であり、パスワードが突破されても第二要素で不正ログインを阻止する最終防衛線となる。（アルファベット3文字で回答）",
      correctAnswers: ["MFA"],
      explanation:
        "MFA（Multi-Factor Authentication: 多要素認証）は、パスワード（知識要素）に加えて、TOTP・SMS（所持要素）やバイオメトリクス（生体要素）などの第二要素を組み合わせた認証方式です。パスワードがブルートフォース攻撃で突破されても、第二要素なしではログインできません。",
      referenceLink: "/step07-design/rate-limiting",
    },
  ],
} satisfies QuizData;
