FROM node:24-bookworm-slim

ARG USERNAME=vscode

ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8

# 追加で必要なパッケージをインストール
# - git: pnpm install時にgit依存を解決するため
# - ca-certificates: node:24-bookworm-slim はdebian slimベースで同梱されないため明示的に追加
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -s /bin/bash $USERNAME

USER $USERNAME

SHELL ["/bin/bash", "-l", "-c"]

# pnpmセットアップ（gistを外部参照せず、ローカルのスクリプトを使用）
# リポジトリ内では .devcontainer.release/app/pnpm-setup.sh を参照して単体ビルド可能にする。
# リリースzipに入る際は build-release-zip.sh が .devcontainer/app/pnpm-setup.sh に書き換える。
COPY --chown=$USERNAME:$USERNAME .devcontainer.release/app/pnpm-setup.sh /tmp/pnpm-setup.sh
RUN sh /tmp/pnpm-setup.sh && rm /tmp/pnpm-setup.sh

# postCreateCommandなどの非ログインシェルでもpnpmが見えるようにPATHを通す
ENV NPM_PREFIX=/home/${USERNAME}/.npm-global
ENV PNPM_HOME=/home/${USERNAME}/.local/share/pnpm
ENV PATH=$NPM_PREFIX/bin:$PNPM_HOME:$PATH

WORKDIR /workspace
