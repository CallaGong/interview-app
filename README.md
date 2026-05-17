# CaseReady

咨询求职 AI 助手 — Phase 1：Case 拆解练习

## 快速开始

1. 安装依赖：

```bash
npm install
```

2. 复制环境变量并填入 Anthropic API Key：

```bash
cp .env.local.example .env.local
```

3. 启动开发服务器：

```bash
npm run dev
```

4. 打开 [http://localhost:3000](http://localhost:3000)，点击「开始 Case 练习」。

## 环境变量

| 变量 | 说明 |
|------|------|
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com) 获取 |

## 功能

- **Case 练习** (`/case`)：三道预置 Case，流式 AI 对话，框架追踪，输入「结束评估」获取 JSON 评分报告。
