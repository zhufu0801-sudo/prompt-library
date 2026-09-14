# Broader task coverage — 2026-09-14

This release adds 24 original modules and 72 task-specific briefs in Chinese,
English and Japanese. Homepage totals: **57 modules / 165 selectable tasks**.
The full catalog contains **366 records: 87 original and 279 preserved AI Short
imports**. A module record contains several selectable tasks; these counts are
different views, not quantities to add together.

## New coverage

| Module | Three distinct tasks |
| --- | --- |
| 应用安全与权限 | 越权检查、会话加固、依赖与密钥检查 |
| 性能优化与并发 | 瓶颈定位、缓存失效、竞态修复 |
| 移动应用开发 | 页面导航、离线同步、权限与通知 |
| 脚本与文件自动化 | 文件整理、批量转换、定时任务 |
| Git 协作与发布 | 合并冲突、PR评审、版本迁移 |
| 第三方 API 与集成 | 客户端封装、Webhook验签、数据对账 |
| 游戏机制与原型 | 状态机、关卡教学、存档兼容 |
| 3D 资产与材质 | 模型需求、PBR贴图、导出检查 |
| 商品与空间作图 | 白底细节、使用场景、室内布局 |
| 角色与视觉设定 | 三视图、表情动作、风格规范 |
| 视频剪辑与后期 | 时间线、字幕排版、多平台导出 |
| 小说与叙事创作 | 情节伏笔、场景对话、时间线核对 |
| 研究设计与方法 | 问题变量、研究流程、方法章节 |
| 问卷与访谈分析 | 问卷预测试、访谈提纲、质性编码 |
| 事实写作与编辑 | 报道、来源核查、正式文稿润色 |
| 活动策划与执行 | 岗位流程、预算物料、异常预案 |
| 社群运营与互动 | 新手路径、参与活动、争议处理 |
| 员工培训与知识交接 | 新人上手、实操课程、岗位交接 |
| 流程管理与日常运营 | SOP、改进实验、库存台账 |
| 采购与供应商沟通 | 询价函、报价对比、到货验收 |
| 易读表达与无障碍内容 | 简明改写、替代文本、操作指引 |
| 旅行安排与行前准备 | 约束日程、行李清单、低步行路线核查 |
| 家常烹饪与餐食安排 | 食谱、菜单采购、多菜时间表 |
| 居家收纳与植物记录 | 收纳、家务维护、盆栽观察 |

## Editing and provenance

- Edit `scripts/build-domain-library.py`: stable module/task IDs, localized
  labels, module context, input questions, search synonyms and distinct
  deliverables are kept together. Each `¦` separates Chinese, English and
  Japanese; task keywords use `|`.
- Run `python scripts/build-domain-library.py` to rebuild `data/studio/domain/`
  and `domain-{modules,tasks}.json`, then `pnpm content:build`.
- Refresh reference databases with `python scripts/export-sqlite.py` and
  `python scripts/export-scenario-library.py`. These are content exports, not
  backups of user plans. The task table now includes 165 published tasks and
  five unpublished topic rules.
- This batch is original editorial work (`original-task-brief`), not another
  upstream import. `sourceReferences` is empty rather than fabricated.
  Earlier AI Short and Prompts.chat source snapshots retain their provenance.
- Guided output is assembled from the selected task, user input and applicable
  existing rules. No model calls, generated media or external software execution
  are performed by the website. Existing eight Skill documentation packs remain
  available; adding a module does not certify or force an unrelated Skill.

## Runtime and verification

`/api/studio` now loads modules in sets of at most 80 IDs, using four content
queries per set, instead of four per module. Missing templates remain null so
the API fails visibly; published status, tag/field ordering and conditional
suggestions are preserved. Database content seeding remains bounded to 90
statements per batch and preserves user-owned tables.

Validated: type checking, 25 automated test cases (including all new task
compositions in three languages), API save/restore for 57 modules in each
language, search/source filters, visitor isolation, CSRF and validation limits,
existing Skill download hashes, and production build. Browser checks cover
Webhook search, character turnarounds, English questionnaires and Japanese
mobile layout. The existing build warning for a client chunk above 500 KB
remains; this release does not claim a complete lint cleanup or external-AI
runtime certification.
