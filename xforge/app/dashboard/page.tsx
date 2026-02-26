// app/dashboard/page.tsx
// 主控台：10个账号状态总览

import { getAccounts, getPosts, getMaterials } from '@/lib/supabase'
import { Track } from '@/types'

// 赛道中文名
const TRACK_LABEL: Record<Track, string> = {
  crypto_kol: '加密博主',
  ai:         'AI博主',
  airdrop:    '撸毛博主',
}

// 状态颜色
const STATUS_COLOR: Record<string, string> = {
  active:    'bg-emerald-500',
  paused:    'bg-amber-400',
  suspended: 'bg-red-500',
  warming:   'bg-sky-400',
}

export default async function DashboardPage() {
  const [accounts, scheduled, pendingReview, materials] = await Promise.all([
    getAccounts(),
    getPosts({ status: 'scheduled', limit: 50 }),
    getPosts({ status: 'pending_review', limit: 50 }),
    getMaterials({ unused: true, limit: 1 }),
  ])

  const todayPosted = await getPosts({ status: 'posted', limit: 50 })

  // 按赛道分组
  const byTrack = accounts.reduce<Record<string, typeof accounts>>((acc, a) => {
    acc[a.track] = [...(acc[a.track] ?? []), a]
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-mono">
      {/* 顶部标题 */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          XForge <span className="text-zinc-500 font-normal">/ 控制台</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          {new Date().toLocaleDateString('zh-CN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      {/* 全局统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="今日已发" value={todayPosted.length} unit="条" accent="emerald" />
        <StatCard label="排队中"   value={scheduled.length}   unit="条" accent="sky" />
        <StatCard label="待审核"   value={pendingReview.length} unit="条" accent="amber" />
        <StatCard label="素材库存" value={materials.length}   unit="+" accent="violet" />
      </div>

      {/* 账号卡片按赛道分组 */}
      {(Object.entries(byTrack) as [Track, typeof accounts][]).map(([track, accs]) => (
        <section key={track} className="mb-8">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
            {TRACK_LABEL[track]}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {accs.map(account => {
              const acctScheduled = scheduled.filter(p => p.account_id === account.id).length
              const acctPosted    = todayPosted.filter(p => p.account_id === account.id).length
              const usagePct      = Math.round(account.monthly_post_count / account.monthly_post_limit * 100)

              return (
                <a
                  key={account.id}
                  href={`/accounts/${account.id}`}
                  className="block bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-600 transition-colors"
                >
                  {/* 账号头部 */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-bold text-white text-sm">{account.persona_name}</div>
                      <div className="text-zinc-500 text-xs">@{account.twitter_handle}</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${STATUS_COLOR[account.status]}`} />
                  </div>

                  {/* 简介 */}
                  <p className="text-zinc-400 text-xs leading-relaxed mb-3 line-clamp-2">
                    {account.persona_bio}
                  </p>

                  {/* 今日统计 */}
                  <div className="flex gap-4 text-xs mb-3">
                    <span className="text-emerald-400">今日已发 {acctPosted}</span>
                    <span className="text-sky-400">排队 {acctScheduled}</span>
                  </div>

                  {/* 月用量进度条 */}
                  <div>
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>月发帖量</span>
                      <span>{account.monthly_post_count} / {account.monthly_post_limit}</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usagePct > 90 ? 'bg-red-500' :
                          usagePct > 70 ? 'bg-amber-400' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(usagePct, 100)}%` }}
                      />
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </section>
      ))}
    </main>
  )
}

// 统计卡片组件
function StatCard({
  label, value, unit, accent,
}: {
  label: string; value: number; unit: string
  accent: 'emerald' | 'sky' | 'amber' | 'violet'
}) {
  const colors = {
    emerald: 'text-emerald-400 border-emerald-900',
    sky:     'text-sky-400 border-sky-900',
    amber:   'text-amber-400 border-amber-900',
    violet:  'text-violet-400 border-violet-900',
  }
  return (
    <div className={`bg-zinc-900 border rounded-lg p-4 ${colors[accent]}`}>
      <div className={`text-3xl font-bold ${colors[accent].split(' ')[0]}`}>
        {value}<span className="text-base ml-1 text-zinc-500">{unit}</span>
      </div>
      <div className="text-zinc-400 text-sm mt-1">{label}</div>
    </div>
  )
}
