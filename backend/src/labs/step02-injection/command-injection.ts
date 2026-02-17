import { Hono } from "hono";
import { exec, execFile } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

const app = new Hono();

// ========================================
// Lab: OS Command Injection
// ユーザー入力でサーバーのコマンドを操る
// ========================================

// --- 脆弱バージョン ---

// ⚠️ コマンドインジェクション: ユーザー入力をシェルコマンドに直接埋め込む
// 127.0.0.1; cat /etc/passwd でサーバー上のファイルが読み取れる
app.post("/vulnerable/ping", async (c) => {
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

// --- 安全バージョン ---

// ✅ execFile() でシェルを介さずにコマンドを実行 + 入力値バリデーション
app.post("/secure/ping", async (c) => {
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
