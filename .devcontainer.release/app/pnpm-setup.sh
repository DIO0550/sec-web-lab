#!/bin/sh
# pnpm / npm global setup (gist: pnpm-safe-chain-setup.sh のローカル版)
# リリース版devcontainerでは外部Gistに依存せず、このスクリプトを直接COPYして実行する。
set -eu

: "${PNPM_VERSION:=10}"

export PATH="/usr/local/sbin:/usr/local/bin:/usr/bin:/bin:$PATH"

# ユーザー判定でインストール先を決定
if [ "$(id -u)" -ne 0 ]; then
  echo "[setup] Non-root user detected, using user-local installation"

  NPM_PREFIX="$HOME/.npm-global"
  PNPM_HOME="$HOME/.local/share/pnpm"
  PROFILE_FILE="$HOME/.profile"
else
  NPM_PREFIX="/usr/local"
  PNPM_HOME="/pnpm"
  PROFILE_FILE="/etc/profile"
fi

mkdir -p "$NPM_PREFIX"
mkdir -p "$PNPM_HOME"

export PATH="$NPM_PREFIX/bin:$PNPM_HOME:$PATH"

# 非rootの場合はnpm prefixを設定
if [ "$(id -u)" -ne 0 ]; then
  npm config set prefix "$NPM_PREFIX"
fi

echo "[setup] Installing pnpm@${PNPM_VERSION} via npm -g"
npm install -g "pnpm@${PNPM_VERSION}"

hash -r 2>/dev/null || true

echo "[setup] pnpm installed at: $(command -v pnpm)"
pnpm -v

# pnpm設定
pnpm config set -g global-bin-dir "$PNPM_HOME"
pnpm config set --global minimumReleaseAge 7200

# 注意: gistの元版には npm config set ignore-scripts true があるが、
# Vite/esbuild等がネイティブバイナリ配置に install scripts を使うため
# リリース版では設定しない（pnpm install が失敗する）。

# 環境変数を永続化（.profile と .bashrc 両方に）
for f in "$PROFILE_FILE" "$HOME/.bashrc"; do
  if [ -n "$f" ] && ! grep -q "# pnpm/npm global setup" "$f" 2>/dev/null; then
    cat >> "$f" << ENVEOF

# pnpm/npm global setup
export NPM_PREFIX="$NPM_PREFIX"
export PNPM_HOME="$PNPM_HOME"
export PATH="\$NPM_PREFIX/bin:\$PNPM_HOME:\$PATH"
ENVEOF
    echo "[setup] Environment variables added to $f"
  fi
done

# install safe-chain (supply-chain security)
curl -fsSL https://github.com/AikidoSec/safe-chain/releases/latest/download/install-safe-chain.sh | sh

echo "[setup] Done!"
