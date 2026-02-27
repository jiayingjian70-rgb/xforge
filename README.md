[素材库_0xYuxi列表.md](https://github.com/user-attachments/files/25597523/_0xYuxi.md)
# 📚 素材库 — @0xYuxi 四个列表内容整理
> 整理时间：2026年2月26日  
> 数据来源：@0xYuxi 的四个 X 列表（近期推文）

---

## 列表概览

| 列表名称 | 列表ID | 成员数 | 定位 |
|---|---|---|---|
| 小博主 | 1721585371853783166 | 129 | 综合类小博主 |
| 小博主——DeFi、套利类 | 1911479732706894129 | 28 | DeFi/套利策略 |
| 小博主——杂项，输出或转发优质内容 | 1911489114186379355 | — | 优质内容转发 |
| 小博主——撸毛，项目投研 | 1911479582085271673 | 48 | 撸毛/项目研究 |

---

## 一、🤖 AI × Crypto 前沿

### 1. ClaudeCode + OpenClaw 自动交易系统
- **来源**：@wangray（Ray Wang）
- **核心观点**：用 ClaudeCode + OpenClaw 搭 Polymarket 自动交易系统
- **关键公式**：人类反应 10 秒 vs 自动化系统 0.3 秒，Δt = 9.7秒 = alpha
- **策略要素**：EV 找边际 → Kelly 定仓位 → Frank-Wolfe 做组合优化 → AI agent 连接信号源
- **教程来源**：@noisyb0y1（英文全套教程）
- **素材价值**：⭐⭐⭐⭐⭐ 可做 AI 工具教程/量化交易选题

---

### 2. AI Agent 即将重塑加密交易基础设施
- **来源**：@HHorsley（Hunter Horsley，转发方 @otterpal24）
- **核心观点**："Agents will soon be responsible for most internet transactions, we'll need blockchains that support >1M TPS"
- **意义**：链上基础设施升级需求，AI agent 接管交易将是趋势
- **素材价值**：⭐⭐⭐⭐ 宏观叙事类

---

### 3. Claude Code 深度用户复盘
- **来源**：@runes_leo（Leo）
- **核心痛点**：
  - 没有遗忘：过时经验会被反复加载影响后续对话
  - Memory Misevolution：错误经验写入 patterns.md 后被自动加载反复犯错
- **土法解决方案**：today.md → MEMORY.md 工作流
- **素材价值**：⭐⭐⭐⭐ 工具使用 tips 类

---

### 4. OpenClaw Memory 终极指南
- **来源**：@lijiuer92（李韭二）
- **核心内容**：OpenClaw 小龙虾 Memory 反复失忆问题解决方案
- **链接内容**：X 文章形式
- **素材价值**：⭐⭐⭐⭐ 工具教程类

---

### 5. 6551 全新闻源 MCP + SKILL 开源
- **来源**：@cryptoxiao
- **核心内容**：6551 的 X + 全网新闻源 MCP 与 SKILL 完整开源
  - 包含 OpenNews MCP（新闻资讯数据服务）
  - 包含 OpenTwitter MCP（推特数据服务）
- **命令**：`npx clawhub install infra403/opennews-mcp`
- **素材价值**：⭐⭐⭐⭐⭐ 工具分享类，适合开发者受众

---

### 6. AI 正在重构工作范式
- **来源**：@AriXZone（魔都老猿），@otterpal24
- **观点**：停止学 AI 技巧，把 AI 用到真实生产中，优化生意而非玩玩具
- **对应争议**：麦肯锡顾问说"建议停止学 AI"
- **素材价值**：⭐⭐⭐ 观点争鸣/价值观类

---

### 7. AI 赋能创业者：Swarm 蜂群架构
- **来源**：@runes_leo（Leo）
- **核心金句**："未来一代企业家，不会雇佣一个 10 人团队去做一套系统就能搞定的事"
- **引用**：@elvissun 的 Swarm 架构，将"软件工程"这台机器完全压缩成了"个人"的控制台
- **硬核标准**：实证驱动——只相信真实 Commit、真实收入、真实报错
- **素材价值**：⭐⭐⭐⭐ 适合创业/AI 独立开发者受众

---

### 8. Agentic Coding：烧掉 90 亿 Token 的经验教训
- **来源**：@yq_acc（YQ）
- **标题**：Agentic Coding: Learnings and Pitfalls after Burning 9 Billion Tokens
- **背景**：2023 年 3 月开始 Solidity-chatbot 项目，GPT-4 发布第三天
- **AI 核心定位**："AI is an amplifier, not inventor"
- **素材价值**：⭐⭐⭐⭐⭐ 深度长文素材，适合技术分享

---

## 二、📈 预测市场（Polymarket）

### 9. 预测市场的"不可能三角"
- **来源**：@bonnazhu（Bonna | U酸乳）
- **核心模型**：预测市场存在不可能三角：
  - **顶点**：信息效率（Information Efficiency）
  - **底点左**：投机自由（Speculative Freedom）
  - **底点右**：流动性内生性（Endogenous Liquidity）
- **三种类型**：
  - Type A：CLOB = 信息效率 + 投机自由
  - Type B：Bonding Curve = 投机自由 + 流动性内生性
  - Type C：Parimutuel = 信息效率 + 流动性内生性
- **结论**：主流事件流动性护城河在 Polymarket/Kalshi，长尾事件做市意愿低，责任转嫁给 AMM LP
- **素材价值**：⭐⭐⭐⭐⭐ 高质量框架性内容

---

### 10. Polymarket 套利漏洞：链下撮合 + 链上结算
- **来源**：@rich_adul（Adul）
- **核心发现**：$0.1 成本，一天赚 $16,427
- **原理**：Polymarket 是"链下撮合+链上结算"，中间有几秒时间差
- **攻击窗口**：
  ① 正常下单，链下撮合成功
  ② 同时在链上把钱包清空
- **素材价值**：⭐⭐⭐⭐⭐ 热门事件，链上安全/套利机制科普

---

### 11. Polymarket No 仓位策略
- **来源**：@rich_adul（Adul）
- **策略**：月底4个市场的 No 仓位，收益率稳定碾压余额宝
- **素材价值**：⭐⭐⭐ 实操策略类

---

### 12. Polymarket 首页改版观察
- **来源**：@chessxyz（Chess蔡司）
- **内容**：
  - Polymarket 改版频率加快，UI 更合理
  - 个人地址累计交易 Vol 已超 1M+ USD，排名 10989
- **素材价值**：⭐⭐ 行情/观察类

---

### 13. Polymarket LP 攻略
- **来源**：@Rubywang（Ruby@Day1Global Podcast）
- **关键点**：
  - 除了交易量和日活，LP 和 OI 做空投有高权重
  - 目前只有 1% 地址有 LP rewards
- **素材价值**：⭐⭐⭐⭐ 操作指南类

---

## 三、💰 DeFi / 套利

### 14. Buidlpad Phase 3 固定 8% APY
- **来源**：@joejoedefi（JoeJoe）
- **详情**：
  - Phase 3 接替 Phase 2
  - 存款窗口：UTC 2月28日8点～3月3日8点
  - 金库总存款上限：$20M（单地址无存款上限）
  - 8% APY on @base，$3M
  - Phase 3 结束时间：3月31日上午 8 点 UTC
- **素材价值**：⭐⭐⭐ 机会类

---

### 15. Boros 新市场：黄金/BTC/ETH 利率到期日
- **来源**：@0xanonnnn（QQ ろヾゝ甜到昨晚的Yankee）
- **新市场详情**（到期日 2026.3.27）：
  - USDT 抵押：XAUUSDT-Binance、GOLDUSDC-Hyperliquid、XAGUSDT-Binance、BTCUSDC-Hyperliquid
  - BTC 抵押：BTCUSDC-Hyperliquid、BTCUSDT-Gate
  - ETH 抵押：ETHUSDT-Gate
- **素材价值**：⭐⭐⭐ 机会类

---

### 16. Lighter DEX 上的 ARC 攻击事件
- **来源**：@yourQuantGuy
- **事件经过**：某账户在 Lighter 上开仓约 2 亿个 ARC 多合约（价值约 $2400 万），最后所有空仓被 adl 平仓
- **素材价值**：⭐⭐⭐⭐ 链上事件/风险教育

---

## 四、🏗️ 项目投研 / 撸毛

### 17. grvt.io 规则变更
- **来源**：@lilevexyz（Retarded Eve）
- **变更**：$100k 以内 10% APY 规则更改为：存至少 250u + 邀请好友 + 好友交易 5 次 margin 获得 11% 叠加 APY
- **素材价值**：⭐⭐⭐ 撸毛机会类

---

### 18. ICO 退款选择
- **来源**：相关讨论
- **观点**：最好的选择就是不做 ICO，全部退款，改成空投
- **相关争论**：@0xleng1 vs @0xZergs，项目方选择性聋
- **素材价值**：⭐⭐ 市场情绪类

---

### 19. YHe（币安）身份证遗失风险提示
- **来源**：@heyibinance
- **内容**：如曾在中国经身份证遗失，可能被作为"被执行人"；女性尤其注意可能被黄谣。建议查询法院系统
- **素材价值**：⭐⭐⭐ 风险提示/生活类

---

### 20. eth2030.com 项目
- **来源**：@yq_acc
- **核心观点**：能 code eth2030.com 的人别人为何 couldn't — AI 是放大器，不是发明家
- **护城河讨论**：独特知识 + AI 执行力的组合才是真壁垒
- **素材价值**：⭐⭐⭐⭐ 加密 + AI 融合叙事

---

## 五、💡 认知 / 观点类

### 21. 独立开发者为何总穷
- **来源**：@shadouyoua（bbshare）
- **转自**：Reddit 帖子 "After 8 failed side projects, I finally get why most indie hackers stay broke"
- **核心洞察**：
  - 大家都在为开发者造工具，没人在为不知道"tech stack"的人造东西
  - 真正的金矿藏在那些"看起来很赚钱的土行业"：水管工、牙医、本地花店
  - 这些行业没有竞争，因为"不酷"，没人发推文
- **金句**：Are we all just LARPing as entrepreneurs while building productivity tools nobody needs?
- **素材价值**：⭐⭐⭐⭐⭐ 强共鸣感，适合独立开发/创业受众

---

### 22. 写社媒是为了塑造共同记忆
- **来源**：@0xTykoo（Tykoo）
- **观点**：写社媒就是为了塑造共同记忆，不写别人就写，你也要有权衡，不然相关者会出来塑造新的记忆
- **金句**："做正确的事"和"正确地做事"的区别
- **素材价值**：⭐⭐⭐⭐ 内容创作方法论类

---

### 23. 云算力市场 vs 端侧算力市场
- **来源**：@oceanheart_cai（Hugo Tsai）
- **核心问题**：许多工作发条消息就可以完成，还有必要每人一台电脑吗？
- **判断**：
  - 云算力市场会进一步指数增长
  - 端侧算力市场还看不清
- **素材价值**：⭐⭐⭐ 宏观趋势类

---

### 24. 清仓特斯拉的理由
- **来源**：@Aiallmaker（袁起Hashman）
- **核心观点**：为什么会清仓特斯拉——有些比特斯拉更好、更有护城河、更有成长空间的伟大公司
- **素材价值**：⭐⭐⭐ 投资观点类

---

### 25. Meta 整合稳定币支付
- **来源**：某博主
- **核心信息**：Facebook、Instagram、WhatsApp 合计全球 30 亿用户，若这些 App 里直接整合稳定币支付，相当于给用户提供了内置加密钱包
- **素材价值**：⭐⭐⭐⭐⭐ 叙事/宏观趋势类

---

### 26. AI 杀猪盘：AI 负责谈恋爱，也负责做假律师
- **来源**：@TechFlowPost（TechFlow深潮）
- **标题**：这个杀猪盘里，AI 负责谈恋爱，也负责做假律师执照
- **内容**：诈骗园区里，一个 ChatGPT 账号就干了——取代两个分工
- **素材价值**：⭐⭐⭐⭐ 内容警示/AI 滥用报道类

---

### 27. 国内经济通缩现实感知
- **来源**：@ØxLoki_Zeng（OxLoki）
- **内容**：切实感受到国内经济通缩 — 周末开车回深圳，省会城市四星酒店含双早+下午茶+无限咖啡，优惠后 ¥100
- **素材价值**：⭐⭐⭐ 生活/市场情绪类

---

### 28. Jane Street 成为 SLV 最大持有人
- **来源**：@zerohedge（转发方：@lxrcr1201 老李来了）
- **内容**：Jane Street Q4 新增 2060 万股 SLV，目前是 SLV 最大持有者；白银一天 -40% 后有散户问是否有主力干预
- **素材价值**：⭐⭐⭐ 金融市场/宏观

---

## 六、🔑 高频人物 & 账号索引

| 账号 | 姓名/昵称 | 主要领域 | 出现频率 |
|---|---|---|---|
| @bonnazhu | Bonna \| U酸乳 | 预测市场研究 | ⭐⭐⭐⭐⭐ |
| @rich_adul | Adul | Polymarket 套利 | ⭐⭐⭐⭐ |
| @runes_leo | Leo | AI 工具/创业 | ⭐⭐⭐⭐ |
| @wangray | Ray Wang | AI × 量化 | ⭐⭐⭐ |
| @chessxyz | Chess蔡司 | Polymarket 交易 | ⭐⭐⭐ |
| @cryptoxiao | Cryptoxiao | AI 工具/6551 | ⭐⭐⭐ |
| @otterpal24 | Otter | 综合转发 | ⭐⭐⭐ |
| @Aiallmaker | 袁起Hashman | 投资/AI创业 | ⭐⭐⭐ |
| @shadouyoua | bbshare | 创业/独立开发 | ⭐⭐ |
| @TechFlowPost | TechFlow深潮 | 行业报道 | ⭐⭐ |
| @lijiuer92 | 李韭二 | AI 工具 | ⭐⭐ |
| @yq_acc | YQ | Agentic Coding | ⭐⭐ |
| @yourQuantGuy | Your Quant Guy | DeFi 量化 | ⭐⭐ |

---

## 七、📌 选题方向建议

根据以上素材，可产出的内容方向：

1. **教程类**：ClaudeCode + OpenClaw 自动交易教程（高互动潜力）
2. **深度分析**：预测市场不可能三角框架解析
3. **安全提示**：Polymarket 链下撮合漏洞机制科普
4. **工具分享**：6551 开源 MCP 工具 + Claude Code Memory 管理
5. **叙事类**：Meta 30亿用户 + 稳定币 = 最大加密钱包入口
6. **观点类**：AI 是放大器而非发明家——独立开发者需要什么样的护城河
7. **警示类**：AI 赋能诈骗升级（AI 杀猪盘）
8. **创业洞察**：独立开发者为何总穷——去"土行业"找金矿

---

*以上素材均来自公开 X 推文，仅供内容创作参考，请注明来源。*
