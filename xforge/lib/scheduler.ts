// lib/scheduler.ts
// 发布调度逻辑
// 被 /api/cron/publish-posts 每5分钟调用一次

import { TwitterApi } from 'twitter-api-v2'
import {
  getDueScheduledPosts,
  updatePostStatus,
  incrementPostCount,
  log,
} from '@/lib/supabase'
import type { Post, Account } from '@/types'

// ============================================================
// 主调度函数（Cron 入口）
// ============================================================

export async function runPublishJob(): Promise<{ published: number; failed: number }> {
  const duePosts = await getDueScheduledPosts()
  let published = 0
  let failed = 0

  for (const post of duePosts) {
    try {
      await publishPost(post)
      published++
    } catch (err) {
      failed++
      console.error(`发布失败 post=${post.id}:`, err)
    }
  }

  return { published, failed }
}

// ============================================================
// 单条发布
// ============================================================

async function publishPost(post: Post): Promise<void> {
  const account = post.account as Account
  if (!account) throw new Error('post.account 未加载')

  // 检查账号状态
  if (account.status !== 'active') {
    await updatePostStatus(post.id, 'failed', {
      error_message: `账号状态为 ${account.status}，跳过发布`,
    })
    return
  }

  // 检查月发帖上限
  if (account.monthly_post_count >= account.monthly_post_limit) {
    await updatePostStatus(post.id, 'failed', {
      error_message: '本月发帖已达上限',
    })
    return
  }

  // 检查最小发帖间隔（2小时）
  const canPost = await checkMinInterval(account.id)
  if (!canPost) {
    // 不算失败，推迟30分钟再试
    const newTime = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    await updatePostStatus(post.id, 'scheduled', { scheduled_at: newTime } as Parameters<typeof updatePostStatus>[2])
    return
  }

  // 调用 X API 发布
  const twitterClient = createTwitterClient(account)
  const result = await twitterClient.v2.tweet(post.content)

  if (!result.data?.id) throw new Error('X API 返回空ID')

  // 更新状态
  await updatePostStatus(post.id, 'posted', {
    twitter_post_id:  result.data.id,
    actual_posted_at: new Date().toISOString(),
  })

  // 增加月发帖计数
  await incrementPostCount(account.id)

  // 记录日志
  await log({
    account_id: account.id,
    post_id:    post.id,
    action:     'post_published',
    status:     'success',
    detail:     { twitter_post_id: result.data.id },
  })
}

// ============================================================
// X API 客户端（按账号凭证创建）
// ============================================================

function createTwitterClient(account: Account): TwitterApi {
  if (!account.access_token) {
    throw new Error(`账号 ${account.twitter_handle} 没有 access_token`)
  }

  // TODO: 如果 account.proxy_url 存在，需要通过代理
  // 目前先不配置代理，后续用 https-proxy-agent 实现
  return new TwitterApi(account.access_token)
}

// ============================================================
// 检查最小发帖间隔
// ============================================================

async function checkMinInterval(accountId: string): Promise<boolean> {
  const { supabaseAdmin } = await import('@/lib/supabase')

  const { data } = await supabaseAdmin
    .from('posts')
    .select('actual_posted_at')
    .eq('account_id', accountId)
    .eq('status', 'posted')
    .order('actual_posted_at', { ascending: false })
    .limit(1)
    .single()

  if (!data?.actual_posted_at) return true // 没有历史记录，可以发

  const lastPostedAt = new Date(data.actual_posted_at)
  const hoursSince   = (Date.now() - lastPostedAt.getTime()) / 3_600_000

  return hoursSince >= 2 // 至少间隔2小时
}

// ============================================================
// 计算实际发布时间（加随机偏移）
// ============================================================

export function calcActualPostTime(scheduledAt: Date, varianceMinutes: number): Date {
  const offsetMs = (Math.random() * 2 - 1) * varianceMinutes * 60_000
  return new Date(scheduledAt.getTime() + offsetMs)
}

// ============================================================
// 计算今天各账号的发布时间表
// ============================================================

export function buildDaySchedule(
  account: { active_hours: number[]; time_variance: number },
  postPerDay: number
): Date[] {
  const today = new Date()
  today.setSeconds(0, 0)

  // 从 active_hours 中取前 postPerDay 个时间点
  const hours = account.active_hours.slice(0, postPerDay)

  return hours.map(hour => {
    const base = new Date(today)
    base.setHours(hour, 0, 0, 0)
    return calcActualPostTime(base, account.time_variance)
  })
}
