import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: Stack Trace Exposure
// スタックトレース漏洩
// ========================================

// --- 脆弱バージョン ---

// ⚠️ スタックトレースをそのままレスポンスに含める
app.get("/vulnerable/error", (c) => {
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
app.get("/vulnerable/debug", (c) => {
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

// --- 安全バージョン ---

// ✅ スタックトレースをログに記録し、ユーザーには一般メッセージのみ返す
app.get("/secure/error", (c) => {
  try {
    const obj: Record<string, unknown> = {};
    (obj as { nested: { deep: { call: () => void } } }).nested.deep.call();
    return c.json({ success: true });
  } catch (err) {
    // ✅ スタックトレースはサーバーログに記録
    console.error("Internal error:", err);
    // ✅ ユーザーにはエラーIDと一般メッセージのみ返す
    const errorId = Math.random().toString(36).substring(2, 10);
    return c.json({
      success: false,
      message: "内部エラーが発生しました",
      errorId,
      // ✅ スタックトレースや内部情報は含めない
    }, 500);
  }
});

// ✅ デバッグ情報を含めない
app.get("/secure/debug", (c) => {
  return c.json({
    success: false,
    message: "内部エラーが発生しました",
    errorId: Math.random().toString(36).substring(2, 10),
  }, 500);
});

export default app;
