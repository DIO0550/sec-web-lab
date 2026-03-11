import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ JSON文字列をパースし、特定のキーがあればコード実行をシミュレーション
app.post("/deserialize", async (c) => {
  const body = await c.req.text();

  if (!body) {
    return c.json({ success: false, message: "データを入力してください" }, 400);
  }

  try {
    const data = JSON.parse(body);

    // ⚠️ デシリアライズ後にオブジェクトのメソッドを実行（シミュレーション）
    // 実際のシリアライゼーションライブラリ（pickle, Java ObjectInputStream等）では
    // __reduce__, readObject() 等のメソッドが自動実行される
    if (data.__type === "Command" && data.command) {
      // ⚠️ デシリアライズされたオブジェクトのcommandプロパティを実行
      return c.json({
        success: true,
        message: "オブジェクトをデシリアライズしました",
        result: `コマンド実行: ${data.command}`,
        _debug: {
          message: "安全でないデシリアライゼーション: 悪意あるオブジェクトのメソッドが自動実行される",
          executedCommand: data.command,
          risks: [
            "リモートコード実行 (RCE)",
            "ファイルシステムアクセス",
            "権限昇格",
          ],
        },
      });
    }

    return c.json({
      success: true,
      message: "オブジェクトをデシリアライズしました",
      data,
      _debug: {
        message: "任意のオブジェクトがデシリアライズされる",
      },
    });
  } catch (err) {
    return c.json({ success: false, message: `パースエラー: ${(err as Error).message}` }, 400);
  }
});

export default app;
