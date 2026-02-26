// app/api/posts/generate/route.ts
// 调用 Claude 生成推文候选，保存为草稿

import { NextResponse } from 'next/server'
import { generateTweets } from '@/lib/ai-generator'
import { getAccount, getMaterials, createPost, markMaterialUsed } from '@/lib/supabase'
import type { GeneratePostRequest } from '@/types'

export async function POST(request: Request) {
  try {
    const body: GeneratePostRequest = await request.json()
    const { accountId, materialId, customInstruction } = body

    // 加载账号和素材
    const account = await getAccount(accountId)
    if (!account) {
      return NextResponse.json({ error: '账号不存在' }, { status: 404 })
    }

    const [material] = await getMaterials({ limit: 1 })
    if (!material && !materialId) {
      return NextResponse.json({ error: '没有可用素材' }, { status: 404 })
    }

    // 如果传了 materialId，直接用；否则自动选一条匹配的
    const targetMaterial = materialId
      ? (await getMaterials({ limit: 1 })).find(m => m.id === materialId) ?? material
      : material

    // AI 生成
    const result = await generateTweets({
      account,
      material: targetMaterial,
      customInstruction,
    })

    // 保存草稿（取评分最高的版本作为默认内容）
    const best = result.variants.sort((a, b) => b.score - a.score)[0]
    const post = await createPost({
      account_id:        accountId,
      material_id:       targetMaterial.id,
      content:           best.text,
      content_variants:  result.variants,
      generation_prompt: result.prompt,
      status:            'pending_review',
    })

    // 标记素材已使用
    await markMaterialUsed(targetMaterial.id)

    return NextResponse.json({ postId: post.id, variants: result.variants })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('generate error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
