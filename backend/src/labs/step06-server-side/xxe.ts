import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: XXE (XML External Entity)
// XML外部エンティティによるファイル読み取り
// ========================================

// --- 脆弱バージョン ---

// ⚠️ XMLをそのままパースし、外部エンティティの参照を許可
// <!ENTITY xxe SYSTEM "file:///etc/passwd"> のようなペイロードで
// サーバー上のファイルを読み取れる
app.post("/vulnerable/import", async (c) => {
  const body = await c.req.text();

  if (!body) {
    return c.json({ success: false, message: "XMLデータを入力してください" }, 400);
  }

  try {
    // ⚠️ XMLを簡易パースし、エンティティ参照を展開するデモ
    // 実際のXMLパーサーでは外部エンティティが解決される
    const nameMatch = body.match(/<name>(.*?)<\/name>/s);
    const emailMatch = body.match(/<email>(.*?)<\/email>/s);

    // ⚠️ DOCTYPE内のENTITY定義を検出してシミュレーション
    const entityMatch = body.match(/<!ENTITY\s+(\w+)\s+SYSTEM\s+"file:\/\/([^"]+)"\s*>/);
    let entityValue = "";
    if (entityMatch) {
      const filePath = entityMatch[2];
      // ⚠️ デモ用: 特定のファイルパスの内容をシミュレーション
      const fakeFiles: Record<string, string> = {
        "/etc/passwd": "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin",
        "/etc/hostname": "web-server-01",
        "/etc/hosts": "127.0.0.1 localhost\n10.0.0.1 internal-api",
      };
      entityValue = fakeFiles[filePath] || `[ファイル読み取り試行: ${filePath}]`;
    }

    // エンティティ参照を展開
    let name = nameMatch?.[1] || "";
    let email = emailMatch?.[1] || "";
    if (entityMatch) {
      const entityName = entityMatch[1];
      name = name.replace(`&${entityName};`, entityValue);
      email = email.replace(`&${entityName};`, entityValue);
    }

    return c.json({
      success: true,
      parsed: { name, email },
      _debug: {
        message: "外部エンティティの解決が有効: file:// スキームでサーバー上のファイルを読み取り可能",
        entityDetected: !!entityMatch,
        entityValue: entityValue || undefined,
      },
    });
  } catch (err) {
    return c.json({
      success: false,
      message: `XML パースエラー: ${(err as Error).message}`,
    }, 500);
  }
});

// --- 安全バージョン ---

// ✅ 外部エンティティ参照を無効化してからパース
app.post("/secure/import", async (c) => {
  const body = await c.req.text();

  if (!body) {
    return c.json({ success: false, message: "XMLデータを入力してください" }, 400);
  }

  try {
    // ✅ DOCTYPE宣言を検出したら拒否（外部エンティティの防止）
    if (body.includes("<!DOCTYPE") || body.includes("<!ENTITY")) {
      return c.json({
        success: false,
        message: "DOCTYPE宣言を含むXMLは処理できません（XXE防止）",
        _debug: {
          message: "外部エンティティ参照を含むXMLを拒否しました",
        },
      }, 400);
    }

    // ✅ エンティティ参照なしで安全にパース
    const nameMatch = body.match(/<name>(.*?)<\/name>/s);
    const emailMatch = body.match(/<email>(.*?)<\/email>/s);

    return c.json({
      success: true,
      parsed: {
        name: nameMatch?.[1] || "",
        email: emailMatch?.[1] || "",
      },
    });
  } catch (err) {
    return c.json({
      success: false,
      message: "XMLの処理中にエラーが発生しました",
    }, 500);
  }
});

export default app;
