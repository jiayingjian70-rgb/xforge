# 04 · 防封号策略

> X平台的反自动化检测非常成熟。这份文档记录了所有已知风险和对应措施。
> **任何新功能开发前都要过一遍这里的检查清单。**

---

## 封号风险等级

| 风险 | 级别 | 对策 |
|------|------|------|
| 多账号同IP | 🔴 极高 | 每账号独立代理 |
| 发帖节奏过于规律 | 🔴 极高 | 时间随机偏移 |
| 不同账号发相同内容 | 🔴 极高 | 内容去重检查 |
| 新账号立刻高频发帖 | 🟠 高 | 暖号期2周 |
| 纯API操作无人工行为 | 🟠 高 | 偶尔手动发帖 |
| 内容过于规律/模板化 | 🟡 中 | 风格随机化 |
| 月发帖超过平台上限 | 🟡 中 | 月度计数监控 |
| 账号无基本互动 | 🟡 中 | 互动规则配置 |

---

## 具体实施措施

### 1. 代理IP（最重要）

每个账号必须配置独立代理，存储在 `accounts.proxy_url`：

```
格式：socks5://username:password@host:port
      http://username:password@host:port

推荐服务商：Oxylabs, Bright Data, Smartproxy
建议类型：住宅IP（Residential），而不是数据中心IP
```

在 `lib/x-api.ts` 中，每次API调用都通过对应账号的代理：

```typescript
const client = new TwitterApi({
  appKey: process.env.AUTH_TWITTER_ID!,
  appSecret: process.env.AUTH_TWITTER_SECRET!,
  accessToken: account.access_token,
  accessSecret: account.access_secret,
}, {
  // 通过账号专属代理
  agent: createProxyAgent(account.proxy_url),
})
```

### 2. 时间随机化

发帖时间 = 计划时间 + 随机偏移

```typescript
// lib/scheduler.ts
function getActualPostTime(scheduledAt: Date, variance: number): Date {
  const offsetMs = (Math.random() * 2 - 1) * variance * 60 * 1000
  return new Date(scheduledAt.getTime() + offsetMs)
}

// 例：计划21:00发，variance=15
// 实际在 20:45 ~ 21:15 之间随机
```

### 3. 同账号最小间隔

同一账号两条帖子之间，强制间隔不低于2小时：

```typescript
// 发布前检查
const lastPost = await getLastPost(accountId)
const hoursSinceLast = (Date.now() - lastPost.actual_posted_at) / 3600000
if (hoursSinceLast < 2) {
  throw new Error('MIN_INTERVAL_NOT_MET')
}
```

### 4. 内容去重

发布前检查内容相似度，防止不同账号发近似内容：

```typescript
// 简单版：检查最近7天所有账号发过的内容
// 使用Jaccard相似度，阈值0.6以上视为重复
async function isDuplicateContent(newContent: string): Promise<boolean> {
  const recentPosts = await getRecentPosts(7) // 最近7天
  for (const post of recentPosts) {
    const similarity = jaccardSimilarity(newContent, post.content)
    if (similarity > 0.6) return true
  }
  return false
}
```

### 5. 暖号期管理

新账号前2周只做互动，不发帖：

```sql
-- 查询哪些账号还在暖号期
SELECT twitter_handle, warming_until 
FROM accounts 
WHERE status = 'warming' AND warming_until > NOW();
```

暖号期结束后，系统自动将 status 改为 'active'。

### 6. 月发帖量监控

每月1日重置计数，接近上限时触发警告：

- 80%：发送警告通知
- 95%：自动暂停该账号发布

```sql
-- 每月1日执行（配置在 Vercel Cron 或 Supabase pg_cron）
UPDATE accounts SET monthly_post_count = 0 
WHERE DATE_TRUNC('month', updated_at) < DATE_TRUNC('month', NOW());
```

### 7. 手动行为注入

每周至少手动发1-2条真实内容，不通过系统：
- 回复评论
- 转发感兴趣的内容
- 发一条随性的想法

这降低账号被识别为纯机器人的概率。

---

## 紧急处理流程

### 账号被限流（Rate Limited）

```
symptoms: API返回 429 错误
action: 
  1. 将账号 status 改为 'suspended'
  2. 停止所有该账号的发布任务
  3. 等待24小时
  4. 手动测试API是否恢复
  5. 恢复后改回 'active'
```

### 账号被封禁

```
symptoms: API返回 403，或登录显示账号被封
action:
  1. 立刻停止该账号所有操作
  2. 检查 activity_logs 找原因
  3. 向X申诉（如果是误判）
  4. 评估其他账号是否有相同行为
```

---

## 合规红线（永远不碰）

这些内容会直接触发X的内容审核，导致封号：

- ❌ 协调性不真实行为（多账号统一行动转发同一内容）
- ❌ 平台操纵（买粉、刷互动）
- ❌ 自动化垃圾信息（相同内容多账号发布）
- ❌ 误导性信息（错误新闻、虚假截图）
- ❌ 金融诈骗相关内容
