# Prompts.chat 内容整理进度 · 2026-09-12

## 本批内容

- 已保存官方 prompts.csv 的 2,169 条原始记录，固定提交和 SHA-256 见 data/sources/prompts-chat/manifest.json。原始快照不是已审核模板，不进入网页运行时。
- 阅读并改写 12 条编程、图片与动画主题，提供 36 份中文、英文、日文内容。与原有 10 个场景一起形成 6 种任务、22 个细分场景，首页仍只有两个模块。
- 另外整理写作、翻译、教育、研究、会议、内容策划 6 个主题，共 18 份三语草稿，仅保存，不上线。后续从草稿继续审核，不必重新采集。
- 原文、作者、记录索引、上游提交、许可和编辑版本分开保存。网站上的模板是编辑改写，不声称是原作者原文或官方背书。
- 数据库 scenario-library.sqlite 保存原始数据、分类、场景和语言版本；prompt-library.sqlite 保留主目录结构。均为内容导出，不含真实用户方案。

## 使用与分类

编程：新功能开发／错误排查／代码审查，再选导航、权限、单元测试、SPA 路由、登录质量、证据审查、无障碍等场景。

视觉：图片／单镜头／分镜，再选幻想场景、产品九宫格、照片分镜、六格叙事、卡通微动作等。手动场景仅在所属任务生效；更换任务时不改写用户正文。未手动选择时按关键词建议，不能理解代码或照片，也不做语义推断。

增加对话助手、项目编程代理、通用视觉、Midjourney 图片、ComfyUI 图片和 Runway Gen-4 视频的六种交付方式。品牌只是对应使用方式，不意味着全模型测试通过。视觉大模板先交给文本助手生成最终画面／运动提示词，再把最终部分放进目标生成工具。没有接入模型 API 或 MCP。

## 来源核对

- 用户视频：https://www.douyin.com/video/7684183645510274339 。已查看页面说明和可见画面，未取得完整音频转写；不把介绍文字冒充逐字视频记录。
- 官方项目：https://github.com/f/prompts.chat 。LICENSE 明确 prompts.csv、PROMPTS.md 和用户提示词文本采用 CC0；网站代码及自有内容 MIT。此批仅改写 CC0 数据，保留 LICENSE 与 LICENSE-CC0。
- 官方 README 确认 MCP 端点 https://prompts.chat/api/mcp 。本次只研究其可检索、可复用的结构，不安装或连接外部 MCP。
- Midjourney：https://docs.midjourney.com/hc/en-us/articles/32023408776205-Prompt-Basics
- Runway：https://help.runwayml.com/hc/en-us/articles/39789879462419-Gen-4-Video-Prompting-Guide
- ComfyUI：https://docs.comfy.org/tutorials/basic/text-to-image

## 后续批次

1. 从原始快照中逐条筛选剩余内容，去重、核对风险与适用范围后才标为已改写；不要全量直接发布。
2. 优先扩充数据库/API、性能排查、角色一致性与镜头连续性。其他模块保持草稿状态直到用户要求上线。
3. 依据真实使用反馈优化三语措辞与软件交付方式；关键词匹配不能当作模型识别，实际生成效果需要在对应软件中测试。
4. 每批开始和发布前检查剩余用量。额度不足时记录已完成项与下一条来源索引，不使用重置额度，除非用户明确授权。

## 验证与恢复

内容编译、类型检查、场景及三语行为测试、方案保存接口检查通过后才发布。重新导出：先运行 curate-prompts-chat.py、curate-prompt-drafts.py，再运行 content:build、export-sqlite.py、export-scenario-library.py。数据库只从编辑 JSON 构建，直接改导出库不会反写 JSON。
