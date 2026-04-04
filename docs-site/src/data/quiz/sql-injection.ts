import type { QuizData } from "../../components/quiz/types";

/**
 * SQL Injection - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "SQL Injection - 理解度テスト",
  description:
    "SQLインジェクションの攻撃手法・仕組み・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "SQL インジェクションが発生する根本的な原因はどれか？",
      options: [
        "データベースのバージョンが古い",
        "ユーザー入力が文字列結合で SQL 文に埋め込まれ、構文の一部として解釈される",
        "HTTPS を使用していない",
        "データベースのパスワードが弱い",
      ],
      correctIndex: 1,
      explanation:
        "SQL インジェクションの根本原因は、ユーザー入力を文字列結合で SQL 文に埋め込むことで、入力値が「データ」ではなく「SQL の構文（命令）」として解釈されてしまう点にあります。シングルクォート ' で文字列リテラルを閉じ、その後に任意の SQL を注入できてしまいます。",
      referenceLink: "/step02-injection/sql-injection",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "パラメータ化クエリ（プリペアドステートメント）が SQL インジェクションを防ぐ理由として正しいものはどれか？",
      options: [
        "入力値から SQL の特殊文字を自動的に除去するから",
        "SQL 文の構造とデータを分離してデータベースに送信するため、入力値が構文として解釈されないから",
        "入力値の長さを制限するから",
        "データベースへの接続を暗号化するから",
      ],
      correctIndex: 1,
      explanation:
        "パラメータ化クエリでは SQL 文の構造（SELECT ... WHERE username = $1）とデータ（' OR 1=1 --）を別々にデータベースに送信します。データベースエンジンはまず SQL 文の構造を解析・コンパイルし、その後にデータを値としてバインドするため、データ内の SQL 構文が命令として実行されることはありません。",
      referenceLink: "/step02-injection/sql-injection",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "SQL インジェクション攻撃では、認証バイパスだけでなく、UNION SELECT を使ってデータベース内の他のテーブルからデータを抽出することも可能である。",
      correctAnswer: true,
      explanation:
        "UNION SELECT を使えば、本来の検索クエリの結果に加えて、users テーブルなど他のテーブルからデータを結合して取得できます。攻撃者は正規のクエリのカラム数を推測し、そのカラム数に合わせた UNION SELECT を注入することで、全ユーザーのユーザー名やパスワードを抽出できます。",
      referenceLink: "/step02-injection/sql-injection",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "WAF（Web Application Firewall）を導入すれば、SQL インジェクションを完全に防止できる。",
      correctAnswer: false,
      explanation:
        "WAF は SQL 構文パターンを含むリクエストを検知・ブロックしますが、バイパス手法が多数存在するため根本対策にはなりません。大文字・小文字の混在、コメントの挿入、エンコーディングの利用など、WAF のルールをすり抜ける方法があります。根本対策はパラメータ化クエリの使用です。",
      referenceLink: "/step02-injection/sql-injection",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "SQL インジェクションによる認証バイパス攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者がログインフォームのユーザー名欄に ' OR 1=1 -- と入力する",
        "サーバーが入力値を文字列結合で SQL 文に組み込む",
        "生成された SQL の WHERE 句が OR 1=1 により常に真となる",
        "データベースが全ユーザーのレコードを返す",
        "アプリケーションが最初のレコード（管理者）としてログインを成立させる",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [3, 0, 4, 2, 1],
      explanation:
        "攻撃者が ' OR 1=1 -- を入力すると、サーバーが文字列結合で SQL を組み立てます。-- 以降はコメントとしてパスワード条件が無視され、OR 1=1 により全レコードが返されます。アプリケーションは最初のレコード（通常は管理者）でログインを成立させてしまいます。",
      referenceLink: "/step02-injection/sql-injection",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "SQL において、-- の後の文字列は ______ として扱われ、実行されない。（日本語で回答）",
      correctAnswers: ["コメント"],
      explanation:
        "SQL では -- 以降の文字列は行コメントとして扱われます。攻撃者はこの仕組みを利用して、' OR 1=1 -- と入力することで、パスワード条件部分をコメントアウトし、認証を完全にバイパスします。",
      referenceLink: "/step02-injection/sql-injection",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "Node.js の pg ドライバでパラメータ化クエリを使用する際、SQL 文中のプレースホルダは ______ のように記述する。（$と数字で回答、例: $3）",
      correctAnswers: ["$1"],
      explanation:
        "pg ドライバでは $1, $2, $3 のように $ と番号でプレースホルダを指定します。pool.query('SELECT * FROM users WHERE username = $1', [username]) のように、SQL 文の構造とデータを分離してデータベースに送信することで、入力値が SQL 構文として解釈されることを防ぎます。",
      referenceLink: "/step02-injection/sql-injection",
    },
  ],
} satisfies QuizData;
