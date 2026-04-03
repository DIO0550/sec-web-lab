import type { QuizData } from "../../components/quiz/types";

/**
 * Race Condition (TOCTOU) - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "Race Condition (TOCTOU) - 理解度テスト",
  description:
    "レースコンディション（TOCTOU問題）の攻撃手法・発生原因・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "TOCTOU（Time of Check to Time of Use）問題が発生する根本原因はどれか？",
      options: [
        "SQL インジェクションにより残高データが改ざんされるため",
        "「条件チェック」と「状態更新」がアトミックな操作として実行されておらず、間に他のプロセスが介入できるため",
        "HTTP リクエストが暗号化されていないため",
        "データベースのバックアップが取られていないため",
      ],
      correctIndex: 1,
      explanation:
        "TOCTOU 問題は、SELECT（チェック）と UPDATE（処理）の間に排他制御がなく、2つのリクエストが同じタイミングで状態を読み取ることで発生します。チェック時の前提（残高十分）が更新時には無効になっている状態です。",
      referenceLink: "/step08-advanced/race-condition",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "レースコンディションの根本対策として最も確実な方法はどれか？",
      options: [
        "レートリミットで同一ユーザーからのリクエスト数を制限する",
        "SELECT FOR UPDATE で行ロックを取得し、チェックから更新まで排他制御する",
        "フロントエンドでボタンの二重クリックを防止する",
        "HTTPS で通信を暗号化する",
      ],
      correctIndex: 1,
      explanation:
        "SELECT FOR UPDATE を使うことで、残高の読み取り時に行ロックが取得され、他のトランザクションは最初のトランザクションが完了するまで待機します。これにより「チェック」と「更新」の間に他のプロセスが介入できなくなります。レートリミットやフロントエンドの制御は根本対策にはなりません。",
      referenceLink: "/step08-advanced/race-condition",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "レートリミットを設定すれば、レースコンディションの根本対策になる。",
      correctAnswer: false,
      explanation:
        "レートリミットは攻撃の試行を困難にしますが、根本対策にはなりません。タイミングが合えばレートリミット内の同時リクエストでもレースコンディションは成立します。根本対策は SELECT FOR UPDATE やアドバイザリーロックによる排他制御です。",
      referenceLink: "/step08-advanced/race-condition",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "レースコンディション攻撃では、残高 100 円で 100 円の商品を同時に 2 回購入すると、残高が -100 円になることがある。",
      correctAnswer: true,
      explanation:
        "排他制御がない場合、2つのリクエストが同時に残高 100 円を読み取り、両方が「残高十分」と判断します。両方の UPDATE が実行されると 100 - 100 - 100 = -100 円となり、残高がマイナスになります。これが TOCTOU 問題の典型例です。",
      referenceLink: "/step08-advanced/race-condition",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "レースコンディション攻撃で二重購入が成立する流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が同一商品に対する購入リクエストを同時に 2 つ送信する",
        "リクエスト A とリクエスト B が同じタイミングで残高を SELECT する（両方 100 円）",
        "両方のリクエストが残高チェックを通過する（100 >= 100）",
        "リクエスト A が UPDATE を実行し残高が 0 円になる",
        "リクエスト B も UPDATE を実行し残高が -100 円になる",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [2, 4, 0, 1, 3],
      explanation:
        "レースコンディションでは、2つのリクエストが同時に残高を読み取り、両方がチェックを通過します。その後、順にUPDATEが実行されるため、最終的に残高がマイナスになります。SELECT FOR UPDATE を使えば、リクエスト B はリクエスト A の完了を待つため、更新後の残高 0 円を読み取って正しく拒否されます。",
      referenceLink: "/step08-advanced/race-condition",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "PostgreSQL で行ロックを取得して排他制御を行う SQL 構文は SELECT ... ______ である。（2語で回答）",
      correctAnswers: ["FOR UPDATE"],
      explanation:
        "SELECT ... FOR UPDATE は、SELECT で読み取った行に対して排他ロックを取得します。他のトランザクションが同じ行を SELECT FOR UPDATE しようとすると、最初のトランザクションが完了（COMMIT または ROLLBACK）するまで待機します。これによりチェックと更新の間の介入を防ぎます。",
      referenceLink: "/step08-advanced/race-condition",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "TOCTOU は Time of ______ to Time of Use の略で、チェック時と使用時のタイミング差を悪用する問題である。（英単語1語で回答）",
      correctAnswers: ["Check"],
      explanation:
        "TOCTOU は Time of Check to Time of Use の略です。「チェックした時点」と「実際に使用する時点」の間に状態が変わりうるという問題を表しています。データベース操作に限らず、ファイルアクセスや認可チェックなど、様々な場面で発生しうる汎用的な脆弱性パターンです。",
      referenceLink: "/step08-advanced/race-condition",
    },
  ],
} satisfies QuizData;
