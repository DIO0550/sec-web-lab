import type { QuizData } from "../../components/quiz/types";

/**
 * 推測可能なセッションIDの理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "推測可能なセッションID - 理解度テスト",
  description:
    "セッションIDの生成における乱数の品質、エントロピーの重要性、安全な生成方法についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "セッションIDの生成にMath.random()を使うべきではない理由として正しいものはどれか？",
      options: [
        "Math.random()は整数しか生成できないため",
        "Math.random()は実行速度が遅いため",
        "Math.random()は暗号論的に安全ではなく、内部状態から出力を予測できる可能性があるため",
        "Math.random()はブラウザでしか使えずサーバー側では使用できないため",
      ],
      correctIndex: 2,
      explanation:
        "Math.random()は暗号論的に安全な疑似乱数生成器（CSPRNG）ではありません。内部状態の推測により出力を予測できる可能性があり、攻撃者がセッションIDを推測できてしまいます。セッションIDの生成にはcrypto.randomUUID()やcrypto.randomBytes()などのCSPRNGを使用すべきです。",
      referenceLink: "/step04-session/predictable-session-id",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "セッションIDのエントロピーが128ビット以上推奨される理由はどれか？",
      options: [
        "128ビットはURLに収まる最大の長さだから",
        "128ビット以上あれば総当たり攻撃の計算量が現実的な時間内で完了不可能になるから",
        "128ビットは現在のCPUのレジスタサイズと一致するから",
        "128ビットはHTTPヘッダーの最大サイズだから",
      ],
      correctIndex: 1,
      explanation:
        "128ビットのエントロピーがあれば、総当たりの探索空間は2^128（約3.4 x 10^38）通りとなり、現在のコンピューティング能力では現実的な時間内に正しいセッションIDを見つけることは不可能です。OWASPも128ビット以上のエントロピーを推奨しています。",
      referenceLink: "/step04-session/predictable-session-id",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "タイムスタンプ（現在時刻）をもとにセッションIDを生成する方法は、十分なエントロピーがある。",
      correctAnswer: false,
      explanation:
        "タイムスタンプベースのセッションIDは探索空間が非常に狭いです。攻撃者はおおよそのログイン時刻を推測できるため、数秒から数分の範囲を総当たりするだけでセッションIDを特定できます。ミリ秒精度でも探索空間は十分ではありません。",
      referenceLink: "/step04-session/predictable-session-id",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "crypto.randomUUID()は暗号論的に安全な疑似乱数生成器（CSPRNG）を使用してUUID v4を生成する。",
      correctAnswer: true,
      explanation:
        "crypto.randomUUID()はCSPRNG（暗号論的に安全な疑似乱数生成器）を使用してUUID v4を生成します。UUID v4は122ビットのランダム部分を持ち、予測が不可能です。セッションIDの生成に適した安全な方法です。",
      referenceLink: "/step04-session/predictable-session-id",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "連番セッションIDに対する推測攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が自分のアカウントでログインし、セッションIDを確認する",
        "セッションIDが連番であることを発見する（例: 1003）",
        "前後の番号（1001、1002、1004...）を推測する",
        "推測したセッションIDでリクエストを送信する",
        "他のユーザーのセッションへのアクセスに成功する",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 0, 4, 2, 1],
      explanation:
        "連番セッションIDに対する攻撃は、自分のIDの確認→パターン発見→前後の番号の推測→リクエスト送信→他者のセッション乗っ取りという流れで、わずか数回の試行で成功します。CSPRNGによるランダムIDであれば、推測が不可能になります。",
      referenceLink: "/step04-session/predictable-session-id",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "暗号論的に安全な疑似乱数生成器の英語略称は ______ である。",
      correctAnswers: ["CSPRNG", "csprng"],
      explanation:
        "CSPRNG（Cryptographically Secure Pseudo-Random Number Generator）は、暗号論的に安全な疑似乱数生成器です。出力から内部状態を推測することが計算量的に不可能であり、セッションIDやトークンなどの秘密値の生成に適しています。",
      referenceLink: "/step04-session/predictable-session-id",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "Node.jsでUUID v4形式のセッションIDを安全に生成するには crypto.______ を使用する。",
      correctAnswers: ["randomUUID()", "randomUUID"],
      explanation:
        "crypto.randomUUID()はNode.jsの標準ライブラリで提供されるCSPRNGベースのUUID v4生成関数です。122ビットのランダムなエントロピーを持つIDを生成するため、セッションIDの生成に安全に使用できます。",
      referenceLink: "/step04-session/predictable-session-id",
    },
  ],
} satisfies QuizData;
