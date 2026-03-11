import { Hono } from "hono";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ コマンドインジェクション: ユーザー入力をシェルコマンドに直接埋め込む
// 127.0.0.1; cat /etc/passwd でサーバー上のファイルが読み取れる
app.post("/ping", async (c) => {
  const body = await c.req.json<{ host: string }>();
  const { host } = body;

  if (!host) {
    return c.json({ success: false, message: "ホスト名を入力してください" }, 400);
  }

  try {
    // ⚠️ exec() はコマンド文字列をシェル経由で実行する
    // シェルのメタ文字（;, &&, |, $() 等）がそのまま解釈される
    // host に "127.0.0.1; cat /etc/passwd" が入力されると:
    // シェルが "ping -c 2 127.0.0.1; cat /etc/passwd" を実行する
    const { stdout, stderr } = await execAsync(`ping -c 2 ${host}`, {
      timeout: 5000,
    });

    return c.json({
      success: true,
      output: stdout,
      stderr: stderr || undefined,
      // ⚠️ 実行されたコマンドも返す（学習目的）
      _debug: { command: `ping -c 2 ${host}` },
    });
  } catch (err) {
    const error = err as Error & { stdout?: string; stderr?: string };
    return c.json({
      success: false,
      output: error.stdout ?? "",
      stderr: error.stderr ?? error.message,
      _debug: { command: `ping -c 2 ${host}` },
    });
  }
});

export default app;
