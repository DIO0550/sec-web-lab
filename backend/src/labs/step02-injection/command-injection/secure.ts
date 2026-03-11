import { Hono } from "hono";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const app = new Hono();

// --- 安全バージョン ---

// ✅ execFile() でシェルを介さずにコマンドを実行 + 入力値バリデーション
app.post("/ping", async (c) => {
  const body = await c.req.json<{ host: string }>();
  const { host } = body;

  if (!host) {
    return c.json({ success: false, message: "ホスト名を入力してください" }, 400);
  }

  // ✅ 入力値のバリデーション: IPアドレスまたはホスト名のフォーマットのみ許可
  // 英数字、ドット、ハイフン、コロン（IPv6）のみ
  if (!/^[\w.\-:]+$/.test(host)) {
    return c.json({
      success: false,
      message: "無効なホスト名です。英数字、ドット、ハイフンのみ使用できます",
    }, 400);
  }

  try {
    // ✅ execFile() はシェルを介さずにコマンドを直接実行する
    // 引数は配列として渡されるため、シェルのメタ文字は解釈されない
    // "127.0.0.1; cat /etc/passwd" が入力されても、
    // ping の引数として "127.0.0.1; cat /etc/passwd" 全体が渡される
    // → "unknown host" エラーになるだけ
    const { stdout, stderr } = await execFileAsync("ping", ["-c", "2", host], {
      timeout: 5000,
    });

    return c.json({
      success: true,
      output: stdout,
      stderr: stderr || undefined,
    });
  } catch (err) {
    const error = err as Error & { stdout?: string; stderr?: string };
    return c.json({
      success: false,
      output: error.stdout ?? "",
      message: "pingの実行に失敗しました",
      stderr: error.stderr ?? error.message,
    });
  }
});

export default app;
