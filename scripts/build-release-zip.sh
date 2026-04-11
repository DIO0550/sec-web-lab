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

# Git tag名は `/` を含められるため、ファイル名・ディレクトリ名には安全な値に変換する
# (GitHub Release のタグ名自体は元のTAGを使う)
SAFE_TAG="${TAG//\//_}"

ZIP_NAME="sec-web-lab-${SAFE_TAG}.zip"
DEST_DIR="sec-web-lab-${SAFE_TAG}"

echo "=== リリース用zip生成: ${ZIP_NAME} ==="

# 一時ディレクトリ作成 (終了時に自動削除)
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

WORK="$TMPDIR/$DEST_DIR"
mkdir -p "$WORK"

# 除外対象のリスト
# ROOT_ONLY: ルート直下のみ除外（frontend/src/labs/ 等のネストした同名ディレクトリは残す）
ROOT_ONLY_EXCLUDES=(
  .claude
  .specs
  .playwright
  .playwright-cli
  .orchestrator
  scripts
  docker
  labs
  .devcontainer
  .devcontainer.release
  .github
  CLAUDE.md
)

# ANY_DEPTH: workspace配下のどの階層でも除外（pnpm workspaceのネストnode_modules対策）
ANY_DEPTH_EXCLUDES=(
  node_modules
  .pnpm-store
  .git
)

# tar + パイプで除外リスト適用しながらコピー
TAR_EXCLUDES=()
for item in "${ROOT_ONLY_EXCLUDES[@]}"; do
  TAR_EXCLUDES+=(--exclude="./$item")
done
# ANY_DEPTHは ./$item (ルート直下) と */$item (任意の階層下) の両方を明示
for item in "${ANY_DEPTH_EXCLUDES[@]}"; do
  TAR_EXCLUDES+=(
    --exclude="./$item"
    --exclude="*/$item"
  )
done
# *.png をルート直下のみ除外
TAR_EXCLUDES+=(--exclude="./*.png")
# 過去に生成した出力zipをルート直下から除外（新zipへの混入・肥大化を防ぐ）
TAR_EXCLUDES+=(--exclude="./sec-web-lab-*.zip")

(cd "$REPO_ROOT" && tar cf - "${TAR_EXCLUDES[@]}" .) | (cd "$WORK" && tar xf -)

# ルート直下の *.yml のみ削除（*.yaml は対象外。pnpm-workspace.yaml は .yaml なので影響なし）
find "$WORK" -maxdepth 1 -name '*.yml' -delete

# .devcontainer.release/ → .devcontainer/ にコピー
cp -a "$REPO_ROOT/.devcontainer.release/" "$WORK/.devcontainer/"

# 配布先では .devcontainer.release/ が存在しないため、.devcontainer/ 側のパスに書き換え
# （リポジトリ内では .devcontainer.release/ として単体ビルド検証可能な状態を維持するため、
#  元ファイルは .devcontainer.release/ を参照したままにしている）
# sed -i は GNU/BSD で挙動が異なるため、tempfile + mv でPOSIX準拠の書き換えを行う
for f in \
  "$WORK/.devcontainer/docker-compose.yml" \
  "$WORK/.devcontainer/app/Dockerfile"; do
  sed 's|\.devcontainer\.release/|.devcontainer/|g' "$f" > "$f.tmp"
  mv "$f.tmp" "$f"
done

# zip生成（既存zipを削除して常にクリーンに作成。zip -r は in-place 更新するため）
cd "$TMPDIR"
rm -f "$REPO_ROOT/$ZIP_NAME"
zip -r "$REPO_ROOT/$ZIP_NAME" "$DEST_DIR"

echo "=== 完了: ${ZIP_NAME} ($(du -h "$REPO_ROOT/$ZIP_NAME" | cut -f1)) ==="
