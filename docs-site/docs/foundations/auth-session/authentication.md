---
title: 認証の基礎
sidebar_position: 1
---

# 認証の基礎

> HTTP認証の仕組みと、認証（Authentication）と認可（Authorization）の違いを解説します。Webアプリケーションにおけるアクセス制御の前提知識として重要です。

---

## HTTP認証

### Basic認証

HTTP仕様に含まれる最もシンプルな認証方式。ユーザー名とパスワードをBase64エンコードして `Authorization` ヘッダに含める。

```
# 1. クライアントが保護されたリソースにアクセス
GET /admin HTTP/1.1
Host: example.com

# 2. サーバーが 401 で認証を要求
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Basic realm="Admin Area"

# 3. クライアントが認証情報を送信
GET /admin HTTP/1.1
Host: example.com
Authorization: Basic YWxpY2U6c2VjcmV0MTIz
```

curlでBasic認証を試す:

```bash
# ユーザー名: alice, パスワード: secret123
curl -u alice:secret123 http://localhost:3000/admin

# 上記は以下と同等（Base64エンコード済み）
echo -n "alice:secret123" | base64
# → YWxpY2U6c2VjcmV0MTIz

curl -H "Authorization: Basic YWxpY2U6c2VjcmV0MTIz" http://localhost:3000/admin
```

### Base64は暗号化ではない

**よくある誤解**: Base64でエンコードされているからパスワードは安全だと思う人がいるが、これは完全に間違い。Base64は**エンコーディング方式**であり、**暗号化ではない**。誰でも簡単にデコードできる。

```bash
# Base64のデコードは一瞬でできる
echo "YWxpY2U6c2VjcmV0MTIz" | base64 -d
# → alice:secret123
```

したがって、Basic認証は**必ずHTTPS（TLS）と組み合わせて**使う必要がある。HTTPの平文通信でBasic認証を使うと、ネットワーク上でパスワードが丸見えになる。

### Digest認証

Basic認証のパスワード平文送信の問題を改善するために設計された方式。パスワードそのものではなく、パスワードのハッシュ値をチャレンジ・レスポンス方式で送信する。

```
# 1. サーバーがnonceを含むチャレンジを送信
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Digest realm="Admin", nonce="abc123", qop="auth"

# 2. クライアントがnonceを使ってレスポンスハッシュを計算して送信
GET /admin HTTP/1.1
Authorization: Digest username="alice", realm="Admin",
  nonce="abc123", uri="/admin",
  response="6629fae49393a05397450978507c4ef1",
  qop=auth, nc=00000001, cnonce="xyz789"
```

Digest認証ではパスワードが直接ネットワーク上を流れないが、現在では以下の理由でBasic認証 + HTTPSが推奨されている:

- Digest認証はサーバー側でパスワードの平文（またはMD5ハッシュ）を保持する必要がある
- MD5の脆弱性が発見されている
- HTTPSが普及した現在、TLSによる暗号化でBasic認証の平文問題は解決される

---

## 認証と認可の違い

セキュリティでは<strong>認証（authentication）</strong>と<strong>認可（authorization）</strong>を明確に区別することが重要である。

<div class="auth-comparison">
  <div class="auth-card auth-card--authn">
    <div class="auth-card__icon">🔑</div>
    <div class="auth-card__title">認証 (Authentication)</div>
    <div class="auth-card__question">「あなたは誰ですか?」</div>
    <div class="auth-card__examples">
      <div>ID / パスワード</div>
      <div>生体認証（指紋・顔）</div>
      <div>多要素認証 (MFA)</div>
    </div>
  </div>
  <div class="auth-card auth-card--authz">
    <div class="auth-card__icon">🛡️</div>
    <div class="auth-card__title">認可 (Authorization)</div>
    <div class="auth-card__question">「この操作をする権限がありますか?」</div>
    <div class="auth-card__examples">
      <div>管理者のみユーザー削除可能</div>
      <div>自分のプロフィールのみ編集可能</div>
      <div>ロールベースアクセス制御</div>
    </div>
  </div>
</div>

| 概念 | 英語 | 質問 | 例 |
|------|------|------|-----|
| **認証** | Authentication | 「あなたは誰ですか?」 | ログイン（ID/パスワード）、生体認証、多要素認証 |
| **認可** | Authorization | 「あなたはこの操作をする権限がありますか?」 | 管理者のみがユーザー削除可能、自分のプロフィールのみ編集可能 |

### 処理の順序

認証と認可は必ずこの順序で行われる:

```
1. 認証: ユーザーが自分の身元を証明する
   → セッションIDやトークンが発行される

2. 認可: 認証済みのユーザーがリソースにアクセスできるか判定する
   → 権限チェック（ロールベースアクセス制御等）
```

### セキュリティ上の問題パターン

```typescript
// ⚠️ 認証しているが認可していない例
app.delete('/api/users/:id', async (c) => {
  const sessionId = getCookie(c, 'session_id');
  const currentUser = sessions.get(sessionId);
  if (!currentUser) return c.json({ error: '未認証' }, 401);

  // 認証は通ったが、currentUser が :id のユーザーを削除する「権限」があるかチェックしていない
  // → 一般ユーザーが他人のアカウントを削除できてしまう（IDOR脆弱性）
  const targetId = c.req.param('id');
  await deleteUser(targetId);
  return c.json({ message: '削除しました' });
});
```

```typescript
// ✅ 認証 + 認可の両方を行う例
app.delete('/api/users/:id', async (c) => {
  const sessionId = getCookie(c, 'session_id');
  const currentUser = sessions.get(sessionId);
  if (!currentUser) return c.json({ error: '未認証' }, 401);

  const targetId = c.req.param('id');
  // 認可チェック: 自分自身または管理者のみ削除可能
  if (currentUser.id !== targetId && currentUser.role !== 'admin') {
    return c.json({ error: '権限がありません' }, 403);
  }

  await deleteUser(targetId);
  return c.json({ message: '削除しました' });
});
```

---

## 関連ラボ

以下のラボで、本ドキュメントの知識を実際に試すことができる:

### Step 03: 認証

| ラボ | 関連する知識 |
|------|--------------|
| [デフォルト認証情報](../../step03-auth/default-credentials) | 認証の基本、Basic認証 |
| [ブルートフォース攻撃](../../step03-auth/brute-force) | 認証の仕組み、パスワードの強度 |
| [脆弱なパスワードポリシー](../../step03-auth/weak-password-policy) | 認証の要件 |
| [平文パスワード保存](../../step03-auth/plaintext-password) | 認証情報の安全な管理 |

---

## 参考資料

- [RFC 7617 - The 'Basic' HTTP Authentication Scheme](https://datatracker.ietf.org/doc/html/rfc7617)
- [OWASP - Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
