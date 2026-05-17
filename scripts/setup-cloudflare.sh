#!/bin/bash
# CaseReady Cloudflare 本地环境一键配置（需先释放磁盘空间 ≥5GB）
set -e
cd "$(dirname "$0")/.."

echo "→ 安装依赖..."
npm install

echo "→ 配置本地密钥..."
if [ ! -f .dev.vars ]; then
  cp .dev.vars.example .dev.vars
  echo "请编辑 .dev.vars 填入 ANTHROPIC_API_KEY"
fi

echo "→ D1 本地迁移..."
npx wrangler d1 migrations apply caseready-db --local

echo "→ 构建静态前端..."
npm run build

echo "→ 完成！运行: npm run dev"
