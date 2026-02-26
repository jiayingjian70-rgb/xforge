// lib/supabase.ts
// 数据库客户端 - 项目所有数据库操作都通过这里

import { createClient } from '@supabase/supabase-js'
import type { Account, Material, Post, Source, ActivityLog, PostStatus } from '@/types'

// ============================================================
// 客户端实例
// ============================================================

// 前端用（受 RLS 策略限制）
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 后端用（绕过 RLS，只在 Server Component 和 API Route 中使用）
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// ============================================================
// Accounts 操作
// ============================================================

export async function getAccounts(status?: Account['status']): Promise<Account[]> {
  let query = supabaseAdmin
    .from('accounts')
    .select('*')
    .order('track', { ascending: true })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw new Error(`getAccounts: ${error.message}`)
  return data ?? []
}

export async function getAccount(id: string): Promise<Account | null> {
  const { data, error } = await supabaseAdmin
    .from('accounts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function updateAccount(
  id: string,
  updates: Partial<Omit<Account, 'id' | 'created_at' | 'updated_at'>>
): Promise<Account> {
  const { data, error } = await supabaseAdmin
    .from('accounts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateAccount: ${error.message}`)
  return data
}

export async function incrementPostCount(accountId: string): Promise<void> {
  await supabaseAdmin.rpc('increment_post_count', { account_id: accountId })
}

// ============================================================
// Materials 操作
// ============================================================

export interface GetMaterialsOptions {
  tracks?: string[]
  contentType?: string
  unused?: boolean        // 只看没用过的
  limit?: number
  orderBy?: 'importance' | 'created_at' | 'used_count'
}

export async function getMaterials(options: GetMaterialsOptions = {}): Promise<Material[]> {
  let query = supabaseAdmin.from('materials').select('*')

  if (options.tracks?.length) {
    query = query.overlaps('tracks', options.tracks)
  }
  if (options.contentType) {
    query = query.eq('content_type', options.contentType)
  }
  if (options.unused) {
    query = query.eq('used_count', 0)
  }

  // 过滤过期素材
  query = query.or('expires_at.is.null,expires_at.gt.now()')

  const orderCol = options.orderBy ?? 'importance'
  query = query.order(orderCol, { ascending: false })

  if (options.limit) query = query.limit(options.limit)

  const { data, error } = await query
  if (error) throw new Error(`getMaterials: ${error.message}`)
  return data ?? []
}

export async function addMaterial(
  material: Omit<Material, 'id' | 'created_at' | 'used_count' | 'last_used_at'>
): Promise<Material> {
  const { data, error } = await supabaseAdmin
    .from('materials')
    .insert(material)
    .select()
    .single()

  if (error) throw new Error(`addMaterial: ${error.message}`)
  return data
}

export async function markMaterialUsed(materialId: string): Promise<void> {
  await supabaseAdmin
    .from('materials')
    .update({
      used_count: supabaseAdmin.rpc('increment', { x: 1 }) as unknown as number,
      last_used_at: new Date().toISOString(),
    })
    .eq('id', materialId)
}

// ============================================================
// Posts 操作
// ============================================================

export async function getPosts(filters: {
  accountId?: string
  status?: PostStatus | PostStatus[]
  limit?: number
}): Promise<Post[]> {
  let query = supabaseAdmin
    .from('posts')
    .select('*, account:accounts(twitter_handle,display_name,track,avatar_url), material:materials(original_text,content_type)')
    .order('created_at', { ascending: false })

  if (filters.accountId) query = query.eq('account_id', filters.accountId)

  if (filters.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status)
    } else {
      query = query.eq('status', filters.status)
    }
  }

  if (filters.limit) query = query.limit(filters.limit)

  const { data, error } = await query
  if (error) throw new Error(`getPosts: ${error.message}`)
  return (data ?? []) as Post[]
}

export async function createPost(post: {
  account_id: string
  material_id?: string
  content: string
  content_variants?: Post['content_variants']
  generation_prompt?: string
  status?: PostStatus
  scheduled_at?: string
}): Promise<Post> {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .insert({ status: 'draft', ...post })
    .select()
    .single()

  if (error) throw new Error(`createPost: ${error.message}`)
  return data
}

export async function updatePostStatus(
  postId: string,
  status: PostStatus,
  extra?: { twitter_post_id?: string; error_message?: string; actual_posted_at?: string }
): Promise<void> {
  await supabaseAdmin
    .from('posts')
    .update({ status, ...extra })
    .eq('id', postId)
}

// 获取即将到期需要发布的帖子（Cron Job用）
export async function getDueScheduledPosts(): Promise<Post[]> {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('*, account:accounts(*)')
    .eq('status', 'scheduled')
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(20) // 每次最多处理20条

  if (error) throw new Error(`getDueScheduledPosts: ${error.message}`)
  return (data ?? []) as Post[]
}

// ============================================================
// Activity Logs 操作
// ============================================================

export async function log(entry: {
  account_id?: string
  post_id?: string
  action: string
  status: ActivityLog['status']
  detail?: Record<string, unknown>
}): Promise<void> {
  await supabaseAdmin.from('activity_logs').insert(entry)
  // 日志不抛错，静默失败
}

export async function getRecentLogs(accountId?: string, limit = 50): Promise<ActivityLog[]> {
  let query = supabaseAdmin
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (accountId) query = query.eq('account_id', accountId)

  const { data } = await query
  return data ?? []
}
