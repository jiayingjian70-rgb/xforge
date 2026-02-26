// app/api/cron/publish-posts/route.ts
// 每5分钟由 Vercel Cron 触发，发布到期的推文

import { NextResponse } from 'next/server'
import { runPublishJob } from '@/lib/scheduler'
import { log } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 60  // 最多执行60秒

export async function GET(request: Request) {
  // 验证 Cron 调用合法性
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runPublishJob()

    await log({
      action: 'cron_publish_posts',
      status: 'success',
      detail: result,
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)

    await log({
      action: 'cron_publish_posts',
      status: 'failed',
      detail: { error: message },
    })

    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
