# XForge — 推特内容生产与发布平台

> 半自动化的多账号推特内容矩阵管理系统
> 10个有独立人设的账号 · 自动抓取素材 · AI生成内容 · 定时发布

---

## 项目概览

XForge 是一个专为加密赛道设计的推特内容运营平台，核心能力：

- **多账号人设管理**：每个账号有独立的垂直赛道、性格和说话风格
- **素材自动抓取**：监控目标博主，自动入库并分类
- **AI内容生成**：基于人设档案生成风格鲜明的推文，人工审核后发布  
- **智能调度发布**：随机时间偏移、速率控制、自动重试
- **数据看板**：账号健康状态、发布日志、互动数据

**赛道分布（初期10个账号）**

| 赛道 | 数量 | 定位 |
|------|------|------|
| 加密二级博主 | 2-3个 | 宏观分析、技术研究 |
| AI博主 | 3-5个 | 工具评测、产品观察、工作流 |
| 撸毛博主 | 3-5个 | 空投情报、教程、数据分析 |

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 15 (App Router) | |
| UI | Tailwind CSS + shadcn/ui | |
| 数据库 | Supabase (PostgreSQL) | 含实时订阅 |
| 认证 | NextAuth.js v4 | X OAuth 2.0 |
| AI生成 | Anthropic Claude API | 内容生成 |
| 定时任务 | Vercel Cron Jobs | 发布调度 |
| 部署 | Vercel | |

---

## 目录结构

```
xforge/
├── README.md                   # 你正在看的这个
├── docs/                       # 项目文档（重要！先读这里）
│   ├── 01-architecture.md      # 系统架构设计
│   ├── 02-personas.md          # 10个账号人设档案
│   ├── 03-ai-prompts.md        # AI生成内容的Prompt模板
│   ├── 04-anti-ban.md          # 防封号策略
│   └── 05-operations.md        # 日常运营手册
│
├── supabase/
│   └── migrations/
│       └── 001_initial.sql     # 数据库建表语句（直接在Supabase执行）
│
├── app/                        # Next.js App Router
│   ├── dashboard/              # 主控台
│   ├── accounts/               # 账号管理
│   ├── compose/                # 内容编辑器
│   ├── materials/              # 素材库
│   └── api/                    # API路由
│       ├── auth/               # NextAuth认证
│       ├── x/                  # X平台API代理
│       ├── accounts/           # 账号CRUD
│       ├── posts/              # 帖子管理
│       └── materials/          # 素材管理
│
├── components/                 # React组件
│   ├── ui/                     # 基础UI组件
│   ├── layout/                 # 布局组件
│   ├── accounts/               # 账号相关组件
│   ├── compose/                # 编辑器组件
│   └── materials/              # 素材库组件
│
├── lib/                        # 核心逻辑
│   ├── supabase.ts             # 数据库客户端
│   ├── auth.ts                 # NextAuth配置
│   ├── x-api.ts                # X平台API封装
│   ├── ai-generator.ts         # Claude AI内容生成
│   ├── scheduler.ts            # 发布调度逻辑
│   ├── rule-engine.ts          # 中英文排版规则（来自MangoType）
│   └── x-count.ts              # 推文字符计数
│
└── types/                      # TypeScript类型定义
    ├── database.ts             # 数据库表类型（从Supabase自动生成）
    └── index.ts                # 全局类型
```

---

## 快速开始（新同事看这里）

### 第一步：环境准备

```bash
# 克隆项目
git clone <repo-url> && cd xforge

# 安装依赖
npm install

# 复制环境变量模板
cp .env.example .env.local
```

### 第二步：配置环境变量

编辑 `.env.local`，填入以下内容（找项目负责人要）：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# X (Twitter) OAuth
AUTH_TWITTER_ID=...
AUTH_TWITTER_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...（随机字符串，openssl rand -base64 32 生成）

# Claude AI
ANTHROPIC_API_KEY=sk-ant-...
```

### 第三步：初始化数据库

1. 登录 [Supabase](https://supabase.com) → 进入项目
2. 左侧菜单 → SQL Editor → New query
3. 粘贴 `supabase/migrations/001_initial.sql` 全部内容 → Run
4. 看到 Success 即完成

### 第四步：启动开发服务器

```bash
npm run dev
# 访问 http://localhost:3000
```

---

## 开发规范

- **分支命名**：`feature/功能名` `fix/问题描述`
- **提交信息**：中文描述，如 `feat: 添加账号人设编辑页面`
- **API路由**：全部在 `app/api/` 下，用 Route Handler
- **数据库操作**：统一通过 `lib/supabase.ts` 导出的客户端
- **类型定义**：所有类型放 `types/`，禁止用 `any`

---

## 重要链接

- Supabase 控制台：https://supabase.com/dashboard
- X 开发者控制台：https://developer.twitter.com/en/portal
- Anthropic Console：https://console.anthropic.com
- Vercel 部署：https://vercel.com/dashboard
