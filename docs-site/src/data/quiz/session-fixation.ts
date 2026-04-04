import type { QuizData } from "../../components/quiz/types";

/**
 * セッション固定の理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "セッション固定 - 理解度テスト",
  description:
    "セッション固定攻撃の仕組み、セッションIDの再生成による防御、セッションハイジャックとの違いについての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "セッション固定攻撃の特徴として正しいものはどれか？",
      options: [
        "攻撃者が被害者の既存セッションIDを盗み取る",
        "攻撃者があらかじめ用意したセッションIDを被害者に使わせる",
        "攻撃者がサーバーのセッションストアに直接アクセスする",
        "攻撃者がセッションIDを総当たりで推測する",
      ],
      correctIndex: 1,
      explanation:
        "セッション固定攻撃は、攻撃者が自分の知っているセッションIDを被害者に使わせ、被害者がそのIDでログインした後にセッションを乗っ取る手法です。セッションIDを「盗む」のではなく「仕込む」点がセッションハイジャックとの違いです。",
      referenceLink: "/step04-session/session-fixation",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "セッション固定攻撃を防ぐ最も効果的な対策はどれか？",
      options: [
        "セッションIDを暗号化して送信する",
        "ログイン成功時にセッションIDを再生成する",
        "セッションIDをURLパラメータに含める",
        "セッションの有効期限を長く設定する",
      ],
      correctIndex: 1,
      explanation:
        "ログイン成功時にセッションIDを再生成（session regeneration）することで、攻撃者が事前に仕込んだセッションIDは無効になります。被害者には新しいセッションIDが発行されるため、攻撃者は古いIDでアクセスできなくなります。",
      referenceLink: "/step04-session/session-fixation",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "セッション固定攻撃は、ログイン前にサーバーがセッションIDを発行し、ログイン後もそのIDを変更しない場合に成立する。",
      correctAnswer: true,
      explanation:
        "セッション固定攻撃が成立する前提条件は、ログイン前に発行されたセッションIDがログイン後もそのまま有効であることです。攻撃者がログイン前のセッションIDを知っていれば、被害者のログイン後にそのIDでアクセスできてしまいます。",
      referenceLink: "/step04-session/session-fixation",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "セッション固定攻撃は、攻撃者自身がターゲットサイトのアカウントを持っていなくても実行できる。",
      correctAnswer: true,
      explanation:
        "セッション固定攻撃では、攻撃者はターゲットサイトにアクセスしてセッションIDを取得するだけで十分です。そのIDを被害者に使わせ、被害者がログインすれば、攻撃者は被害者のセッションを乗っ取れます。攻撃者自身のアカウントは不要です。",
      referenceLink: "/step04-session/session-fixation",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "セッション固定攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がターゲットサイトにアクセスしてセッションIDを取得する",
        "攻撃者が取得したセッションIDを被害者に使わせる（罠リンク等）",
        "被害者がそのセッションIDのままログインする",
        "サーバーがセッションIDを変更せずにログイン状態を紐付ける",
        "攻撃者が同じセッションIDで被害者のアカウントにアクセスする",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [2, 4, 0, 1, 3],
      explanation:
        "セッション固定攻撃は、ID取得→被害者への仕込み→被害者のログイン→サーバーがIDを変更しない→攻撃者がアクセスという流れで進みます。防御の要は、ログイン成功時にサーバーがセッションIDを再生成するステップ4の部分です。",
      referenceLink: "/step04-session/session-fixation",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "ログイン成功時にセッションIDを新しく発行し直す処理を、セッションIDの ______ と呼ぶ。",
      correctAnswers: ["再生成", "リジェネレーション", "regeneration"],
      explanation:
        "セッションIDの再生成（regeneration）は、認証成功時に新しいセッションIDを発行し、古いIDを無効化する処理です。これにより、攻撃者が事前に知っていたセッションIDではアクセスできなくなります。",
      referenceLink: "/step04-session/session-fixation",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "セッション固定では攻撃者がセッションIDを被害者に「仕込む」のに対し、セッション ______ では攻撃者がセッションIDを被害者から「盗む」。",
      correctAnswers: ["ハイジャック", "hijacking", "Hijacking"],
      explanation:
        "セッション固定は「攻撃者が知っているIDを被害者に使わせる」攻撃であり、セッションハイジャックは「被害者のIDを攻撃者が盗む」攻撃です。アプローチは逆ですが、結果としてセッションが乗っ取られる点は同じです。",
      referenceLink: "/step04-session/session-fixation",
    },
  ],
} satisfies QuizData;
