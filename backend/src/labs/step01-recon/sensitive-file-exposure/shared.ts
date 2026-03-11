// テスト用のダミー機密ファイルの内容
export const DUMMY_ENV = `# ⚠️ これはデモ用のダミーファイルです
DB_HOST=db.internal.example.com
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=super_secret_password_123
API_KEY=sk-live-abcdef1234567890
JWT_SECRET=my-super-secret-jwt-key
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
`;

export const DUMMY_GIT_HEAD = `ref: refs/heads/main
`;

export const DUMMY_GIT_CONFIG = `[core]
\trepositoryformatversion = 0
\tfilemode = true
\tbare = false
[remote "origin"]
\turl = https://github.com/example-corp/internal-app.git
\tfetch = +refs/heads/*:refs/remotes/origin/*
[user]
\temail = developer@example-corp.com
`;

export const DUMMY_ROBOTS_TXT = `User-agent: *
Disallow: /admin/
Disallow: /api/internal/
Disallow: /backup/
Disallow: /config/
# 管理画面とバックアップディレクトリを検索エンジンから隠す
`;
