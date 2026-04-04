import type { QuizData } from "../../components/quiz/types";

/**
 * 機密ファイルの露出 - 理解度テスト用クイズデータ
 * 選択式2問、正誤判定2問、並べ替え1問、穴埋め2問（計7問）
 */
export const quizData = {
  title: "機密ファイルの露出 - 理解度テスト",
  description:
    ".env や .git/ などの機密ファイルがWebから露出するリスクと対策についての理解度をチェックしましょう。",
  questions: [
    // === 選択式（Multiple Choice）===
    {
      id: "mc-1",
      type: "multiple-choice",
      text: "攻撃者が .git/ ディレクトリにアクセスできた場合、最も深刻な被害は何か？",
      options: [
        "Gitのバージョンが判明する",
        "コミット履歴からソースコード全体を復元され、内部ロジックやAPIキーが漏洩する",
        "リポジトリのブランチ名が判明する",
        "Gitの設定ファイルが閲覧される",
      ],
      correctIndex: 1,
      explanation:
        ".git/ ディレクトリが公開されていると、オブジェクトファイルを辿ってソースコード全体を復元できます。git-dumper等のツールを使えば自動化も可能で、ソースコード内のAPIキーや脆弱なロジックが全て攻撃者に把握されます。",
      referenceLink: "/step01-recon/sensitive-file-exposure",
    },
    {
      id: "mc-2",
      type: "multiple-choice",
      text: "ドットファイルへのアクセスを防ぐ安全な実装として最も適切なものはどれか？",
      options: [
        ".envファイルの内容を暗号化する",
        "リクエストパスに /. が含まれていたら403 Forbiddenを返すミドルウェアを設置する",
        "静的ファイルのContent-Typeをすべてtext/plainに設定する",
        ".envファイルの拡張子を変更する",
      ],
      correctIndex: 1,
      explanation:
        "リクエストパスの段階でドットファイルへのアクセスを遮断することで、ファイルシステムに到達する前にリクエストが拒否されます。正規表現 /\\./ でパスをチェックするミドルウェアにより、.env, .git/, .htaccess等すべてのドットファイルが一律に保護されます。",
      referenceLink: "/step01-recon/sensitive-file-exposure",
    },

    // === 正誤判定（True/False）===
    {
      id: "tf-1",
      type: "true-false",
      text: ".envファイルや.git/ディレクトリのパスは、すべてのWebアプリケーションで共通の既知パスであり、攻撃者が最初に試すターゲットである。",
      correctAnswer: true,
      explanation:
        ".env, .git/, robots.txt は全てのWebアプリで共通の既知パスです。攻撃者はまずこれらの一般的なパスを順番に試し、アクセスできるかどうかを確認します。特別なツールは不要で、ブラウザやcurlだけで実行できます。",
      referenceLink: "/step01-recon/sensitive-file-exposure",
    },
    {
      id: "tf-2",
      type: "true-false",
      text: "robots.txtはクローラーへの指示ファイルなので、セキュリティ上のリスクはない。",
      correctAnswer: false,
      explanation:
        "robots.txtにDisallow: /admin/ のような記述があると、管理画面のパスが攻撃者に判明します。robots.txtは機密情報を隠す手段ではなく、むしろ攻撃者にとって隠しパスを発見する手がかりになります。",
      referenceLink: "/step01-recon/sensitive-file-exposure",
    },

    // === 並べ替え（Ordering）===
    {
      id: "ord-1",
      type: "ordering",
      text: "機密ファイル露出を利用した攻撃の流れを正しい順序に並べ替えてください。",
      items: [
        "/.env や /.git/HEAD など既知のパスにアクセスを試みる",
        "ドットファイルのフィルタリングがないためサーバーがファイル内容を返す",
        ".envからDB接続情報やAPIキーを取得し、.git/からソースコードを復元する",
        "窃取した認証情報でデータベースに不正アクセスする",
      ],
      correctOrder: [0, 1, 2, 3],
      initialOrder: [3, 1, 0, 2],
      explanation:
        "攻撃者はまず既知のパスにアクセスし、フィルタリングがなければファイル内容を取得します。取得した情報（DB接続情報、ソースコード等）を整理し、最終的にデータベースへの不正アクセスや外部サービスの不正利用につなげます。",
      referenceLink: "/step01-recon/sensitive-file-exposure",
    },

    // === 穴埋め（Fill in the Blank）===
    {
      id: "fib-1",
      type: "fill-in-blank",
      text: "安全な静的ファイル配信では、公開ディレクトリをプロジェクトルートではなく ______ ディレクトリに限定する。（英小文字で回答）",
      correctAnswers: ["public", "./public"],
      explanation:
        "公開ディレクトリを ./public に限定することで、プロジェクトルートにある .env や .git/ などの機密ファイルが配信対象から外れます。serveStatic({ root: './public' }) のように設定します。",
      referenceLink: "/step01-recon/sensitive-file-exposure",
    },
    {
      id: "fib-2",
      type: "fill-in-blank",
      text: ".envファイル自体を使わず、秘密情報をより安全に管理するためのツールやサービスの総称は ______ である。（英語2語で回答）",
      correctAnswers: ["Secrets Manager", "secrets manager", "Secret Manager", "secret manager"],
      explanation:
        "Secrets Manager（AWS SSM, HashiCorp Vault, Docker secrets等）を使えば、.envファイル自体が不要になります。ファイルが存在しなければ漏洩しないため、多層防御として有効です。",
      referenceLink: "/step01-recon/sensitive-file-exposure",
    },
  ],
} satisfies QuizData;
