import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ スタックトレースをそのままレスポンスに含める
app.get("/error", (c) => {
  try {
    // 意図的にエラーを発生
    const obj: Record<string, unknown> = {};
    (obj as { nested: { deep: { call: () => void } } }).nested.deep.call();
    return c.json({ success: true });
  } catch (err) {
    // ⚠️ スタックトレースをそのまま返す
    return c.json({
      success: false,
      error: (err as Error).message,
      stack: (err as Error).stack,
      _debug: {
        message: "スタックトレースにファイルパス・行番号・関数名が露出",
        risks: [
          "ソースコード構造の把握",
          "使用ライブラリとバージョンの特定",
          "内部APIのパス推測",
        ],
      },
    }, 500);
  }
});

// ⚠️ デバッグ情報付きエラーハンドラー
app.get("/debug", (c) => {
  return c.json({
    success: false,
    error: "Configuration error",
    debug: {
      nodeVersion: process.version,
      platform: process.platform,
      cwd: process.cwd(),
      env: {
        NODE_ENV: process.env.NODE_ENV || "development",
        DB_HOST: "postgres.internal:5432",
        API_KEY: "sk-demo-key-12345",
      },
    },
    _debug: {
      message: "デバッグ情報にNode.jsバージョン、パス、環境変数（APIキー含む）が露出",
    },
  }, 500);
});

export default app;
