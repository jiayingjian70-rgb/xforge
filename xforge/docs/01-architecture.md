# 01 · 系统架构

## 核心数据流

```
素材源（推特博主/关键词）
    ↓ 定时抓取（Vercel Cron）
素材库（materials表）
    ↓ 按赛道/标签分类
内容生成（Claude API + 人设档案）
    ↓ 生成3个候选版本
人工审核（compose页面选择/修改）
    ↓ 批准
发布队列（posts表 status=scheduled）
    ↓ 定时执行（Vercel Cron 每5分钟）
X平台发布（X API v2）
    ↓ 记录结果
数据看板（互动数据回收）
```

---

## 数据库表关系

```
accounts (账号+人设)
    ├── posts (帖子，一对多)
    │       └── materials (来源素材，多对一)
    └── interaction_rules (互动规则，一对多)

sources (素材源)
    └── materials (抓取的内容，一对多)

activity_logs (操作日志，关联accounts和posts)
```

---

## API 路由设计

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/accounts` | GET | 获取所有账号列表 |
| `/api/accounts/[id]` | GET/PATCH | 获取/更新单个账号 |
| `/api/posts` | GET/POST | 帖子列表/创建草稿 |
| `/api/posts/[id]` | PATCH/DELETE | 更新/删除帖子 |
| `/api/posts/generate` | POST | AI生成内容 |
| `/api/materials` | GET/POST | 素材库列表/手动添加 |
| `/api/x/publish` | POST | 发布到X平台 |
| `/api/x/upload` | POST | 上传媒体文件 |
| `/api/cron/fetch-materials` | GET | 定时抓取素材（Cron触发） |
| `/api/cron/publish-posts` | GET | 定时发布帖子（Cron触发） |

---

## 页面路由设计

| 路由 | 页面 | 说明 |
|------|------|------|
| `/dashboard` | 主控台 | 10个账号状态总览，今日发布计划 |
| `/accounts` | 账号列表 | 所有账号的人设和状态管理 |
| `/accounts/[id]` | 账号详情 | 编辑人设、查看发布历史 |
| `/compose` | 内容创作 | 选账号→选素材→AI生成→审核→发布 |
| `/materials` | 素材库 | 查看/添加/管理所有素材 |

---

## Cron Jobs 配置（vercel.json）

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-materials",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/publish-posts", 
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

## 防封号核心机制

详见 `docs/04-anti-ban.md`，关键点：
1. 每个账号配独立代理IP（`accounts.proxy_url`）
2. 发布时间随机偏移 ±15分钟（`accounts.time_variance`）
3. 同账号发帖间隔 ≥ 2小时
4. 月发帖量监控，接近上限自动暂停
5. 不同账号内容不重复
