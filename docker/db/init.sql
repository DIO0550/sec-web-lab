-- sec-web-lab DB初期化スクリプト
-- 意図的に脆弱な設計を含む (学習目的)

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- 意図的に平文保存 (脆弱)
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    must_change_password BOOLEAN DEFAULT false,  -- Step03: デフォルト認証情報ラボ用
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初期データ
INSERT INTO users (username, password, email, role, must_change_password)
VALUES
    ('admin', 'admin123', 'admin@example.com', 'admin', true),  -- デフォルト認証情報（要変更）
    ('user1', 'password1', 'user1@example.com', 'user', false),
    ('user2', 'password2', 'user2@example.com', 'user', false)
ON CONFLICT (username) DO NOTHING;

INSERT INTO posts (user_id, title, content)
VALUES
    (1, 'Welcome to sec-web-lab', 'This is the admin post.'),
    (2, 'Hello World', 'My first post as user1.')
ON CONFLICT DO NOTHING;
