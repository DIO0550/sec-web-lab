FROM ubuntu:24.04

# Node.js バージョン
ARG NODE_VERSION=24
ARG USERNAME=vscode

ENV NODE_VERSION=${NODE_VERSION}
ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8

# 基本パッケージとNode.jsのインストール
RUN apt-get update \
    && apt-get install -y \
        curl \
        ca-certificates \
        gnupg \
        git \
    && useradd -m -s /bin/bash $USERNAME \
    && curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

USER $USERNAME

SHELL ["/bin/bash", "-l", "-c"]

# pnpmセットアップ（gistを外部参照せず、ローカルのスクリプトを使用）
# リポジトリ内では .devcontainer.release/app/pnpm-setup.sh を参照して単体ビルド可能にする。
# リリースzipに入る際は build-release-zip.sh が .devcontainer/app/pnpm-setup.sh に書き換える。
COPY --chown=$USERNAME:$USERNAME .devcontainer.release/app/pnpm-setup.sh /tmp/pnpm-setup.sh
RUN sh /tmp/pnpm-setup.sh && rm /tmp/pnpm-setup.sh

# postCreateCommandなどの非ログインシェルでもpnpmが見えるようにPATHを通す
ENV NPM_PREFIX=/home/vscode/.npm-global
ENV PNPM_HOME=/home/vscode/.local/share/pnpm
ENV PATH=$NPM_PREFIX/bin:$PNPM_HOME:$PATH

WORKDIR /workspace
