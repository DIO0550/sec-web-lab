import type { QuizData } from "../../components/quiz/types";

/**
 * OS Command Injection - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "OS Command Injection - 理解度テスト",
  description:
    "OSコマンドインジェクションの攻撃手法・仕組み・対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "Node.js の child_process モジュールで exec() が危険な理由はどれか？",
      options: [
        "実行速度が遅いため、DoS 攻撃に弱い",
        "コマンド文字列をシェル経由で実行するため、シェルのメタ文字がすべて解釈される",
        "実行結果を暗号化せずに返すため、情報が漏洩する",
        "管理者権限でしか実行できないため、権限昇格が起きる",
      ],
      correctIndex: 1,
      explanation:
        "exec() はコマンド文字列をシェルに渡して実行するため、;, &&, |, $() などのシェルメタ文字がすべて解釈されます。これにより攻撃者はメタ文字を使って複数のコマンドを連結し、任意のOSコマンドを実行できてしまいます。execFile() はシェルを介さないため安全です。",
      referenceLink: "/step02-injection/command-injection",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "OS コマンドインジェクション対策として最も根本的な方法はどれか？",
      options: [
        "入力値から ; や && を正規表現で除去する",
        "exec() の代わりに execFile() を使い、引数を配列として渡す",
        "コマンドの実行結果をログに記録する",
        "アプリケーションを root 権限で実行しない",
      ],
      correctIndex: 1,
      explanation:
        "execFile() はシェルを介さずにコマンドを直接実行し、引数を配列として渡すため、入力値は常に1つの引数として扱われます。シェルメタ文字が構文として解釈される余地がありません。入力値のフィルタリングはバイパスの可能性があり根本対策にはなりません。最小権限での実行は多層防御です。",
      referenceLink: "/step02-injection/command-injection",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: "OS コマンドインジェクションが成功すると、サーバー上の任意のファイルの読み取りだけでなく、バックドアの設置やサーバーの完全な乗っ取りにまで発展し得る。",
      correctAnswer: true,
      explanation:
        "OS コマンドインジェクションはサーバー上で任意のコマンドを実行できるため、ファイルの読み書き、プロセスの起動・停止、バックドアの設置、他のシステムへの攻撃の踏み台化など、サーバーの完全な制御権を奪われる可能性があります。被害範囲は SQL インジェクションよりも広くなり得ます。",
      referenceLink: "/step02-injection/command-injection",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "OS コマンドインジェクションと SQL インジェクションは、どちらも「ユーザー入力がコードとして解釈される」という同じパターンの脆弱性である。",
      correctAnswer: true,
      explanation:
        "両方ともインジェクション系の脆弱性で、ユーザー入力が「データ」として扱われるべきところを「命令（コード）」として処理されてしまうという共通パターンを持っています。SQL インジェクションでは SQL の構文が、コマンドインジェクションではシェルの構文が対象です。",
      referenceLink: "/step02-injection/command-injection",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "OS コマンドインジェクションによるサーバー情報の窃取の流れを正しい順序に並べ替えてください。",
      items: [
        "攻撃者が ping ツールの入力欄に 127.0.0.1; cat /etc/passwd と入力する",
        "サーバーが入力値を文字列結合でシェルコマンドに組み込む",
        "シェルが ; を認識し、2つの独立したコマンドとして解釈する",
        "OS が ping と cat /etc/passwd を順番に実行する",
        "攻撃者がサーバーのユーザー情報を含むレスポンスを取得する",
      ],
      correctOrder: [0, 1, 2, 3, 4],
      initialOrder: [2, 4, 1, 0, 3],
      explanation:
        "攻撃者がセミコロンを使ってコマンドを連結した入力をすると、サーバーが文字列結合でシェルコマンドを組み立てます。シェルは ; をコマンド区切りとして認識し、ping と cat /etc/passwd の2つを順番に実行します。結果として /etc/passwd の内容が攻撃者に返されます。",
      referenceLink: "/step02-injection/command-injection",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "シェルにおいて、前のコマンドの成否に関わらず次のコマンドを実行するための区切り文字は ______ である。（記号1文字で回答）",
      correctAnswers: [";"],
      explanation:
        "セミコロン ; はシェルにおいてコマンドの区切り文字として機能し、前のコマンドの成否に関わらず次のコマンドを実行します。他にも && （前のコマンドが成功した場合のみ次を実行）、||（前のコマンドが失敗した場合のみ次を実行）、|（パイプ）などのメタ文字があります。",
      referenceLink: "/step02-injection/command-injection",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: "Node.js でシェルを介さずにコマンドを安全に実行するには、child_process モジュールの ______ 関数を使用する。（関数名を回答）",
      correctAnswers: ["execFile"],
      explanation:
        "execFile() はシェルを介さずにコマンドを直接実行し、引数を配列として渡します。exec() がコマンド文字列全体をシェルに渡すのに対し、execFile() はコマンドと引数を分離して直接実行するため、シェルメタ文字が解釈される余地がありません。",
      referenceLink: "/step02-injection/command-injection",
    },
  ],
} satisfies QuizData;
