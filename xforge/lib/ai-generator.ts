// lib/ai-generator.ts
// Claude AI 内容生成器
// 基于账号人设 + 素材，生成推文候选版本

import Anthropic from '@anthropic-ai/sdk'
import type { Account, Material, PostVariant } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ============================================================
// 主生成函数
// ============================================================

export interface GenerateOptions {
  account: Account
  material: Material
  customInstruction?: string  // 额外指令，如"这次多用emoji"
}

export interface GenerateResult {
  variants: PostVariant[]
  prompt: string             // 完整prompt，存入数据库用于复盘
}

export async function generateTweets(options: GenerateOptions): Promise<GenerateResult> {
  const { account, material, customInstruction } = options

  const systemPrompt = buildSystemPrompt(account)
  const userPrompt   = buildUserPrompt(material, account, customInstruction)

  const message = await client.messages.create({
    model:      'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system:     systemPrompt,
    messages:   [{ role: 'user', content: userPrompt }],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  const variants     = parseVariants(responseText)
  const checked      = variants.map(v => ({ ...v, text: qualityCheck(v.text, account) }))
    .filter(v => v.text !== null) as PostVariant[]

  // 至少保证1个版本
  if (checked.length === 0) {
    throw new Error('AI生成的所有版本均未通过质量检查')
  }

  return {
    variants: checked,
    prompt:   `SYSTEM:\n${systemPrompt}\n\nUSER:\n${userPrompt}`,
  }
}

// ============================================================
// Prompt 构建
// ============================================================

function buildSystemPrompt(account: Account): string {
  return `你是 ${account.persona_name}，一个推特博主。

【人设档案】
${account.persona_story ?? account.persona_bio}

【发帖规则】
1. 字数控制在 140 字以内（中文推特友好长度）
2. 风格必须与人设一致，不能变成"通用AI腔"
3. 禁止涉及话题：${account.forbidden_topics.join('、') || '无特殊禁忌'}
4. 常用口头禅（适当使用，不要每次都用）：${account.tone_keywords.join('、')}
5. 严禁：价格预测、投资建议、点名批评具体个人或项目

【格式要求】
- 可以用换行增加节奏感，但不要过度分段
- emoji 使用要自然，不能堆砌
- 不加 #话题标签（除非人设明确要用）
- 直接输出推文内容，不要解释或道歉

【输出格式】
严格输出以下 JSON，不要有其他内容：
{
  "variants": [
    {"text": "版本1内容", "angle": "切入角度描述", "score": 85},
    {"text": "版本2内容", "angle": "切入角度描述", "score": 78},
    {"text": "版本3内容", "angle": "切入角度描述", "score": 72}
  ]
}`
}

function buildUserPrompt(
  material: Material,
  account: Account,
  customInstruction?: string
): string {
  const angles = getAnglesForTrack(account.track)

  return `【素材】
${material.original_text}

来源：${material.original_author ?? '未知'}
类型：${material.content_type ?? '未知'}
情感：${material.sentiment ?? '未知'}

【任务】
以 ${account.persona_name} 的身份，基于以上素材写3个不同角度的推文。
每个版本的切入角度要明显不同。

角度参考（从中选或自创）：
${angles.map((a, i) => `${i + 1}. ${a}`).join('\n')}

${customInstruction ? `【额外要求】\n${customInstruction}` : ''}`
}

// 不同赛道的推荐角度
function getAnglesForTrack(track: string): string[] {
  const angles: Record<string, string[]> = {
    crypto_kol: [
      '结合自己的历史经历或亲历事件',
      '从链上数据/宏观视角切入',
      '反共识的观点（但有理有据）',
      '简短有力的金句式感慨',
      '对比历史上的类似时期',
    ],
    ai: [
      '亲身测试或踩坑经历',
      '商业/产品视角的冷静分析',
      '具体的Workflow或使用技巧',
      '反直觉的观察',
      '给初学者的简单解释',
    ],
    airdrop: [
      '我具体做了什么步骤（附时间成本）',
      '数据化的性价比分析',
      '新手友好的手把手说明',
      '对项目方行为的客观评价',
      '与历史类似项目的比较',
    ],
  }
  return angles[track] ?? angles.crypto_kol
}

// ============================================================
// 解析 AI 返回的 JSON
// ============================================================

function parseVariants(text: string): PostVariant[] {
  try {
    // 提取 JSON（AI有时会在JSON前后加文字）
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return []

    const parsed = JSON.parse(match[0])
    if (!Array.isArray(parsed.variants)) return []

    return parsed.variants
      .filter((v: PostVariant) => v.text && typeof v.text === 'string')
      .map((v: PostVariant) => ({
        text:  v.text.trim(),
        angle: v.angle ?? '',
        score: typeof v.score === 'number' ? v.score : 70,
      }))
  } catch {
    return []
  }
}

// ============================================================
// 质量检查（发布前自动过滤）
// ============================================================

const BANNED_PATTERNS = [
  /涨到\s*[\d.]+/,           // 价格目标
  /跌到\s*[\d.]+/,
  /建议(买入?|卖出?|购买)/,   // 投资建议
  /^(作为|首先|总的来说|综上)/,  // AI腔开头
  /本文|本篇|以上内容/,        // 文章腔
]

function qualityCheck(text: string, account: Account): string | null {
  // 长度检查
  if (text.length > 280) return null

  // 违禁模式
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(text)) return null
  }

  // 检查禁忌话题（简单关键词匹配）
  for (const topic of account.forbidden_topics) {
    if (text.includes(topic)) return null
  }

  return text
}

// ============================================================
// 活人感后处理（轻微随机化）
// ============================================================

export function injectHumanNoise(text: string): string {
  const rand = Math.random()

  // 20%概率：去掉结尾的句号（更像口语）
  if (rand < 0.2 && text.endsWith('。')) {
    return text.slice(0, -1)
  }

  // 10%概率：加一个随性的结尾
  if (rand < 0.1) {
    const endings = ['', '\n\n就这样。', '\n\n想听你们说说。', '\n\n#']
    const ending = endings[Math.floor(Math.random() * endings.length)]
    return text + ending
  }

  return text
}
