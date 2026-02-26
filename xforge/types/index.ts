// types/index.ts
// XForge 全局类型定义
// 与数据库表结构一一对应

// ============================================================
// 枚举类型
// ============================================================

export type Track = 'crypto_kol' | 'ai' | 'airdrop'

export type AccountStatus = 'active' | 'paused' | 'suspended' | 'warming'

export type PostStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'scheduled'
  | 'posted'
  | 'failed'
  | 'archived'

export type ContentType = 'news' | 'opinion' | 'alpha' | 'tutorial' | 'meme' | 'data' | 'other'

export type Sentiment = 'bullish' | 'bearish' | 'neutral' | 'educational'

export type SourceType = 'twitter_user' | 'keyword' | 'manual'

export type InteractionRuleType = 'auto_like' | 'auto_retweet' | 'auto_follow' | 'auto_reply'

// ============================================================
// 数据库表类型
// ============================================================

export interface Account {
  id: string
  twitter_handle: string
  twitter_id: string | null
  display_name: string
  avatar_url: string | null

  track: Track
  sub_track: string | null

  persona_name: string
  persona_bio: string
  persona_story: string | null
  personality: string[]
  tone_keywords: string[]
  forbidden_topics: string[]

  post_per_day: number
  active_hours: number[]
  time_variance: number

  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null

  proxy_url: string | null

  status: AccountStatus
  warming_until: string | null
  monthly_post_count: number
  monthly_post_limit: number

  created_at: string
  updated_at: string
}

export interface Source {
  id: string
  type: SourceType
  value: string
  display_name: string | null
  tracks: string[]
  priority: number
  is_active: boolean
  last_fetched_at: string | null
  fetch_count: number
  created_at: string
}

export interface Material {
  id: string
  source_id: string | null

  original_text: string
  original_url: string | null
  original_author: string | null
  original_lang: string
  published_at: string | null

  tracks: string[]
  content_type: ContentType | null
  sentiment: Sentiment | null
  importance: number
  tags: string[]
  summary: string | null

  source_type: 'auto' | 'manual'
  is_evergreen: boolean
  used_count: number
  last_used_at: string | null
  expires_at: string | null

  created_at: string
}

export interface PostVariant {
  text: string
  angle: string
  score: number
}

export interface Post {
  id: string
  account_id: string
  material_id: string | null

  content: string
  content_variants: PostVariant[]
  media_urls: string[]

  generation_prompt: string | null
  ai_model: string
  human_edited: boolean

  status: PostStatus
  scheduled_at: string | null
  actual_posted_at: string | null

  twitter_post_id: string | null
  error_message: string | null
  retry_count: number

  likes: number
  retweets: number
  replies: number
  impressions: number
  stats_updated_at: string | null

  created_at: string
  updated_at: string

  // 关联数据（JOIN查询时存在）
  account?: Account
  material?: Material
}

export interface ActivityLog {
  id: string
  account_id: string | null
  post_id: string | null
  action: string
  status: 'success' | 'failed' | 'warning'
  detail: Record<string, unknown> | null
  created_at: string
}

// ============================================================
// API 请求/响应类型
// ============================================================

export interface GeneratePostRequest {
  accountId: string
  materialId: string
  customInstruction?: string  // 额外的生成指令
}

export interface GeneratePostResponse {
  variants: PostVariant[]
  postId: string             // 生成后自动保存为 draft
}

export interface PublishPostRequest {
  postId: string
  scheduledAt?: string       // 不传则立即发布
}

export interface DashboardStats {
  totalAccounts: number
  activeAccounts: number
  todayScheduled: number
  todayPosted: number
  totalMaterials: number
  unusedMaterials: number
  accountStats: {
    accountId: string
    handle: string
    track: Track
    todayCount: number
    monthlyCount: number
    monthlyLimit: number
    status: AccountStatus
  }[]
}
