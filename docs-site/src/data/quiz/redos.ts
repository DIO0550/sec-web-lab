import type { QuizData } from "../../components/quiz/types";

/**
 * ReDoS (Regular Expression DoS) - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "ReDoS (Regular Expression DoS) - 理解度テスト",
  description:
    "ReDoSの攻撃手法・脆弱な正規表現パターン・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "ReDoS が発生する正規表現パターンの特徴はどれか？",
      options: [
        "パターンが長すぎる（100文字以上）ため",
        "繰り返しの入れ子や重複する選択肢があり、バックトラッキングが指数関数的に増加するため",
        "Unicode 文字を含むパターンであるため",
        "大文字・小文字を区別しないフラグ（i）が付いているため",
      ],
      correctIndex: 1,
      explanation:
        "(a+)+ や (a|a)+ のように、繰り返しの入れ子や重複する選択肢を含むパターンでは、入力の末尾でマッチが失敗した際にエンジンがすべての分割パターンを試行します。入力長 n に対してバックトラッキングが O(2^n) で増加し、処理時間が爆発します。",
      referenceLink: "/step08-advanced/redos",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "ReDoS の最も確実な対策はどれか？",
      options: [
        "入力文字列を 10 文字以下に制限する",
        "正規表現の代わりに indexOf() で文字列検索する",
        "RE2 のような線形時間保証のある DFA ベースの正規表現エンジンを使用する",
        "正規表現のマッチングをワーカースレッドで実行する",
      ],
      correctIndex: 2,
      explanation:
        "RE2 は DFA ベースのアルゴリズムを採用しており、入力長に対して常に線形時間 O(n) でマッチングが完了します。バックトラッキングが発生しないため、どのような入力でも処理時間が爆発しません。入力制限やワーカースレッドは緩和策にはなりますが根本対策ではありません。",
      referenceLink: "/step08-advanced/redos",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "Node.js はシングルスレッドのイベントループモデルであるため、1つの ReDoS 攻撃リクエストでサーバー全体が応答不能になる。",
      correctAnswer: true,
      explanation:
        "Node.js のメインスレッドは1つしかなく、正規表現のマッチングは同期的に実行されます。1つのリクエストで正規表現の処理が数秒〜数分かかると、その間メインスレッドが完全に占有され、他のすべてのリクエストが待機状態になります。",
      referenceLink: "/step08-advanced/redos",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "正規表現パターン /^[a-zA-Z0-9]+$/ は繰り返しの入れ子がないため、ReDoS に対して安全である。",
      correctAnswer: true,
      explanation:
        "/^[a-zA-Z0-9]+$/ は単一の繰り返しのみで、入れ子や重複する選択肢がないため安全です。各文字を消費する方法が一意に決まるため、バックトラッキングは限定的です。問題になるのは (a+)+ のような繰り返しの入れ子や、([a-zA-Z0-9]+\\.)+ のような複雑なパターンです。",
      referenceLink: "/step08-advanced/redos",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "ReDoS 攻撃によるサービス停止の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がメールバリデーションのエンドポイントを特定する",
        "長い繰り返し文字列の末尾にマッチしない文字を付加した入力を送信する",
        "NFA ベースの正規表現エンジンが指数関数的なバックトラッキングを開始する",
        "Node.js のメインスレッドが正規表現マッチングで完全にブロックされる",
        "他の全リクエストが応答不能になりサービスが停止する",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [4, 1, 0, 3, 2],
      explanation:
        "攻撃者はバリデーションエンドポイントを見つけ、aaaaaaaaaaaaaaaaaaaaaaaa! のような「ほぼマッチするが最後で失敗する」入力を送信します。NFA エンジンがすべての分割パターンを試行してメインスレッドがブロックされ、サーバー全体が応答不能になります。",
      referenceLink: "/step08-advanced/redos",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "JavaScript の正規表現エンジンは ______ ベースであり、バックトラッキングにより最悪ケースで指数関数的な計算量になりうる。（アルファベット3文字で回答）",
      correctAnswers: ["NFA"],
      explanation:
        "JavaScript（V8 エンジン）の正規表現は NFA（非決定性有限オートマトン）ベースのエンジンです。NFA はバックトラッキングを使ってマッチングを行うため、パターンによっては最悪ケースで指数関数的な計算量になります。対照的に DFA ベースの RE2 は常に線形時間で完了します。",
      referenceLink: "/step08-advanced/redos",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "DFA ベースの正規表現エンジンでバックトラッキングが発生せず、線形時間でマッチングが完了するライブラリの名前は ______ である。（アルファベット2文字で回答）",
      correctAnswers: ["RE2", "re2"],
      explanation:
        "RE2 は Google が開発した DFA ベースの正規表現エンジンで、入力長に対して常に O(n) の線形時間でマッチングが完了します。Node.js では re2 パッケージとして利用でき、import RE2 from 're2' でインポートして使用します。",
      referenceLink: "/step08-advanced/redos",
    },
  ],
} satisfies QuizData;
