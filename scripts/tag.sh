#!/usr/bin/env bash
set -euo pipefail

# ルートpackage.jsonのversionからgitタグを作成するスクリプト
# 使用法: ./scripts/tag.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

VERSION="$(node -p "require('$REPO_ROOT/package.json').version")"
if [[ -z "$VERSION" || "$VERSION" == "undefined" ]]; then
  echo "エラー: package.jsonにversionが定義されていません" >&2
  exit 1
fi

TAG="v$VERSION"

if git -C "$REPO_ROOT" rev-parse "$TAG" >/dev/null 2>&1; then
  echo "エラー: タグ $TAG は既に存在します" >&2
  exit 1
fi

git -C "$REPO_ROOT" tag -a "$TAG" -m "Release $TAG"
echo "作成しました: $TAG"
echo "リモートに push するには: git push origin $TAG"
