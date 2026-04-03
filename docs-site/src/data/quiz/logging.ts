import type { QuizData } from "../../components/quiz/types";

/**
 * ログなし/不十分なログの理解度テスト用クイズデータ
 * 4種の問題形式（選択式2問、正誤判定2問、並べ替え1問、穴埋め2問）で計7問
 */
export const quizData = {
  title: "ログなし / 不十分なログ - 理解度テスト",
  description:
    "セキュリティイベントのログ記録の重要性、構造化ログの利点、アクセスログとセキュリティログの違いについての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "OWASPがセキュリティログとモニタリングの不備を分類しているTop 10の識別子はどれか？",
      options: [
        "A01:2021 — Broken Access Control",
        "A03:2021 — Injection",
        "A09:2021 — Security Logging and Monitoring Failures",
        "A07:2021 — Identification and Authentication Failures",
      ],
      correctIndex: 2,
      explanation:
        "OWASPはSecurity Logging and Monitoring FailuresをTop 10のA09:2021に分類しています。ログの欠如がインシデント対応を著しく遅延させ、攻撃の検知が平均200日以上遅れることが報告されています。",
      referenceLink: "/step09-defense/logging",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "セキュリティログに記録すべきでないイベントはどれか？",
      options: [
        "ログイン失敗（ユーザー名、IPアドレス、タイムスタンプ）",
        "ログイン成功（ユーザー名、IPアドレス）",
        "ユーザーが入力したパスワードの平文",
        "権限変更やアクセス拒否のイベント",
      ],
      correctIndex: 2,
      explanation:
        "パスワードの平文はセキュリティログに記録してはいけません。ログが漏洩した場合にパスワードも流出してしまいます。ログには認証の成功・失敗、IP、タイムスタンプなどの文脈情報を記録し、機密データそのものは含めないのが原則です。",
      referenceLink: "/step09-defense/logging",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "アクセスログ（リクエストURL、ステータスコード等）だけで、ブルートフォース攻撃を攻撃として認識するのに十分な情報が得られる。",
      correctAnswer: false,
      explanation:
        "アクセスログでは「POST /api/login 401」が並ぶだけで、「誰が」「何を試みたか」「なぜ失敗したか」の文脈情報が欠落しています。ブルートフォース攻撃を検知するには、ユーザー名、IPアドレス、失敗理由などを含むセキュリティイベントログが必要です。",
      referenceLink: "/step09-defense/logging",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "ログイン成功のイベントもセキュリティログに記録すべきである。その理由は、不正ログインの検知に必要だからである。",
      correctAnswer: true,
      explanation:
        "ログイン成功も記録することで、不正ログイン（窃取した認証情報による成功）を検知できます。通常と異なるIPアドレスや時間帯からのログイン成功は、アカウント侵害の兆候として検知できます。",
      referenceLink: "/step09-defense/logging",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "ログ不備を悪用したブルートフォース攻撃が検知されないまま進行する流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がパスワードリストを用いて大量のログイン試行を自動化する",
        "サーバーが認証チェックを行うが、失敗イベントをログに記録しない",
        "攻撃者がパスワードを特定してログインに成功するが、成功も記録されない",
        "攻撃者がシステム内で横展開を行い、長期間にわたって検知されない",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [1, 3, 0, 2],
      explanation:
        "ログが記録されないため、攻撃者は検知を気にすることなくブルートフォース攻撃を続けられます。ログイン成功も記録されないため不正ログインとして検知されず、侵入後の横展開も長期間発覚しません。",
      referenceLink: "/step09-defense/logging",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "セキュリティログを機械的に検索・分析可能にするためには、自由テキストではなく ______ 形式の構造化ログを使用すべきである。",
      correctAnswers: ["JSON", "json"],
      explanation:
        "JSON形式の構造化ログはログ集約ツール（SIEM等）で検索・分析が容易です。自由テキスト形式のログは人間には読みやすいですが、パターンマッチやフィルタリングが困難で、攻撃パターンの自動検知には不向きです。",
      referenceLink: "/step09-defense/logging",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "ログを改ざん不能な外部ストレージに転送して攻撃者による証拠隠滅を防ぐシステムを一般に ______ と呼ぶ。（アルファベット4文字で回答）",
      correctAnswers: ["SIEM", "siem"],
      explanation:
        "SIEM（Security Information and Event Management）はセキュリティイベントを集約・分析するシステムです。ログを外部のSIEMに転送することで、攻撃者がサーバーのログを削除しても証跡を保全できます。",
      referenceLink: "/step09-defense/logging",
    },
  ],
} satisfies QuizData;
