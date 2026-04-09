#!/usr/bin/env bash
set -euo pipefail

# リリース用zip生成スクリプト
# 使用法: ./scripts/build-release-zip.sh [バージョンタグ]
# 引数省略時は最新のgitタグを自動取得

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# バージョンタグの取得
TAG="${1:-$(git -C "$REPO_ROOT" describe --tags --abbrev=0 2>/dev/null || true)}"
if [[ -z "$TAG" ]]; then
  echo "エラー: バージョンタグが指定されておらず、gitタグも見つかりません" >&2
  exit 1
fi

ZIP_NAME="sec-web-lab-${TAG}.zip"
DEST_DIR="sec-web-lab-${TAG}"

echo "=== リリース用zip生成: ${ZIP_NAME} ==="

# 一時ディレクトリ作成 (終了時に自動削除)
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

WORK="$TMPDIR/$DEST_DIR"
mkdir -p "$WORK"

# 除外対象のリスト
EXCLUDES=(
  .claude
  .specs
  .playwright
  .playwright-cli
  .orchestrator
  .git
  node_modules
  .pnpm-store
  scripts
  docker
  labs
  .devcontainer
  .devcontainer.release
  .github
  CLAUDE.md
  LICENSE
)

# tar + パイプで除外リスト適用しながらコピー
TAR_EXCLUDES=()
for item in "${EXCLUDES[@]}"; do
  TAR_EXCLUDES+=(--exclude="./$item")
done
# *.png をルート直下のみ除外
TAR_EXCLUDES+=(--exclude="./*.png")

(cd "$REPO_ROOT" && tar cf - "${TAR_EXCLUDES[@]}" .) | (cd "$WORK" && tar xf -)

# ルート直下の *.yml を削除 (pnpm-workspace.yaml は残す)
find "$WORK" -maxdepth 1 -name '*.yml' ! -name 'pnpm-workspace.yaml' -delete

# .devcontainer.release/ → .devcontainer/ にコピー
cp -a "$REPO_ROOT/.devcontainer.release/" "$WORK/.devcontainer/"

# zip生成
cd "$TMPDIR"
zip -r "$REPO_ROOT/$ZIP_NAME" "$DEST_DIR"

echo "=== 完了: ${ZIP_NAME} ($(du -h "$REPO_ROOT/$ZIP_NAME" | cut -f1)) ==="
