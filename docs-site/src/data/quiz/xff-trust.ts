import type { QuizData } from "../../components/quiz/types";

/**
 * X-Forwarded-For Trust - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "X-Forwarded-For信頼の問題 - 理解度テスト",
  description:
    "X-Forwarded-Forヘッダの無条件信頼によるレート制限回避の仕組みと対策についての理解度をチェックしましょう。",
  questions: [
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "サーバーがX-Forwarded-Forヘッダの先頭値を無条件に信頼してレート制限に使用している場合、攻撃者がレート制限を回避する方法はどれか？",
      options: [
        "X-Forwarded-Forヘッダを削除してリクエストを送信する",
        "リクエストごとにX-Forwarded-Forヘッダに異なるIPアドレスを設定する",
        "X-Forwarded-Forヘッダにlocalhostを設定する",
        "X-Forwarded-Forヘッダに複数のIPアドレスをカンマ区切りで設定する",
      ],
      correctIndex: 1,
      explanation:
        "攻撃者がリクエストごとにX-Forwarded-Forヘッダに異なるIPアドレスを設定すると、サーバーは各リクエストを別々のクライアントからのものと認識します。IPベースのレート制限のカウントがリクエストごとにリセットされるため、制限が事実上無効化されます。",
      referenceLink: "/step07-design/xff-trust",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "X-Forwarded-Forヘッダから安全にクライアントIPを取得する方法として正しいものはどれか？",
      options: [
        "ヘッダの先頭（左端）のIPアドレスを採用する",
        "ヘッダの末尾（右端）のIPアドレスを採用する",
        "信頼できるプロキシのリストを定義し、右端から走査して信頼できないIPを返す",
        "ヘッダに含まれる全IPアドレスの中からランダムに1つ選択する",
      ],
      correctIndex: 2,
      explanation:
        "安全なIP取得では、信頼できるプロキシのIPアドレスを明示的に定義し、X-Forwarded-Forヘッダを右端から走査して、信頼できるプロキシではない最初のIPを返します。クライアントが先頭に挿入した偽のIPは無視されます。",
      referenceLink: "/step07-design/xff-trust",
    },
    {
      id: "tf-1",
      type: "true-false",
      text: "X-Forwarded-ForヘッダはHTTPの仕様上クライアントが自由に設定でき、サーバーに到達する前にリバースプロキシが上書きしない限り、偽の値がそのまま使用される。",
      correctAnswer: true,
      explanation:
        "HTTPの仕様上、クライアントは任意のヘッダーを送信でき、X-Forwarded-Forもその例外ではありません。リバースプロキシがproxy_set_header X-Forwarded-For $remote_addr;のように上書きしなければ、クライアントが設定した偽の値がアプリケーションに到達します。",
      referenceLink: "/step07-design/xff-trust",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "X-Forwarded-Forヘッダの偽装は、レート制限の回避だけでなく、監査ログに偽のIPアドレスを記録させて攻撃の追跡を困難にする効果もある。",
      correctAnswer: true,
      explanation:
        "サーバーがX-Forwarded-Forの値をそのままログに記録する場合、攻撃者が毎回異なるIPを設定すると、すべて異なるIPからのアクセスとして記録されます。同一攻撃者からの攻撃と判別できなくなり、インシデント調査やフォレンジックが困難になります。",
      referenceLink: "/step07-design/xff-trust",
    },
    {
      id: "ord-1",
      type: "ordering",
      text: "X-Forwarded-For偽装によるレート制限回避攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が通常のリクエストでレート制限に到達する",
        "攻撃者がX-Forwarded-Forヘッダに偽のIPを設定する",
        "サーバーが先頭値を新しいクライアントIPとして認識する",
        "レート制限カウントがリセットされ攻撃が継続可能になる",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [2, 0, 3, 1],
      explanation:
        "攻撃者はまず通常のリクエストでレート制限に到達した後、X-Forwarded-Forヘッダに偽のIPを設定してリクエストを再送します。サーバーは新しいIPからの新規アクセスと認識し、レート制限のカウントをリセットしてしまいます。",
      referenceLink: "/step07-design/xff-trust",
    },
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "X-Forwarded-Forヘッダの形式で、左側が最初の送信元（クライアント）、右に行くほどプロキシに近くなる。このヘッダの略称は ______ である。（大文字3文字で回答）",
      correctAnswers: ["XFF"],
      explanation:
        "XFF（X-Forwarded-For）ヘッダは、リバースプロキシを経由する際にクライアントの元のIPアドレスを伝達するためのHTTPヘッダーです。各プロキシが送信元IPをカンマ区切りで追記していきます。",
      referenceLink: "/step07-design/xff-trust",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "Nginxでクライアントが送信したX-Forwarded-Forヘッダをプロキシが上書きする設定は proxy_set_header X-Forwarded-For $______; である。（Nginxの変数名で回答）",
      correctAnswers: ["remote_addr"],
      explanation:
        "Nginxのproxy_set_header X-Forwarded-For $remote_addr;は、クライアントが送信したX-Forwarded-Forヘッダの値をプロキシの接続元IP（$remote_addr）で上書きします。これによりクライアントの自己申告値がアプリケーションに到達しなくなります。",
      referenceLink: "/step07-design/xff-trust",
    },
  ],
} satisfies QuizData;
