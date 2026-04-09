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

# pnpmインストール (外部Gist非依存のインライン版)
RUN corepack enable pnpm

USER $USERNAME

SHELL ["/bin/bash", "-l", "-c"]

WORKDIR /workspace
