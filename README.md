# AI Made Easy

Open-source prompt studio / 三语提示词工作室 / 3言語対応プロンプトスタジオ。
Current release (2026-09-14): **57 homepage modules, 165 task templates, 45 detailed scenarios, eight downloadable GitHub-based Skill documentation packs**. All homepage prompts and usage instructions support Chinese, English and Japanese. See [release and content maintenance](docs/DOMAIN-LIBRARY.md).
Original code and editorial content use the MIT license; upstream content retains its own notices (see LICENSE).

Prompt generation and matching are rule-based; the site does not call a model or create media. Earlier engineering and shot-size batches remain documented in [everyday programming](docs/EVERYDAY-PROGRAMMING.md), [code and shot sizes](docs/CODE-AND-SHOT-SIZES.md), and [spatial continuity](docs/SPATIAL-CONTINUITY.md).

## 当前首页（2026-09-14）

展示编程、AI图片、AI动画、WPS Office、文案、论文，以及长文、教学、翻译、生活、创意、商业、思考，并新增后端、测试、运维、数据分析、产品、项目、求职、沟通、客服、电商、SEO、演示、阅读、出题、本地化、音频、品牌、动画前期与效率等，并补充安全、性能、移动端、自动化、Git、API集成、游戏、3D、商品作图、角色设定、剪辑、小说、研究方法、问卷、事实编辑、活动、社群、培训、运营、采购、易读表达、旅行准备、烹饪和居家等，共57个模块。图片与动画分开；WPS面向金山WPS Office。
右上角支持中文、日文和英文切换，并记住偏好。模板正文、表单、选项和元提示词规则均提供三语版本。
元提示词开关加入澄清问题、输出结构及自检规则；不调用 AI。用户输入和已锁定字段不会被语言切换自动翻译。
历史 309 条模板通过“全部提示词”入口开放，保留原文；原有方案仍可打开与导出。Skill模式提供固定版本ZIP、来源、对应许可证、校验值和三语说明；普通模式无需下载。包内为上游文档或注明来源的适配版，执行脚本及外部依赖不包含，未做目标AI运行认证。
新模板及翻译维护说明见 [data/studio/README.md](data/studio/README.md)。
完整库共366条（87条原创、279条导入）；首页可直接选择165个细分任务模板。五个其他方向的关键词规则和八个学习草稿保留在数据库中，暂不上首页。

一个可以自己维护的提示词网站：搜索数据库 → 填写模板 → 选择和锁定关键词 → 复制、收藏、保存方案。

本阶段**不接入 OpenAI，不安装模型 SDK，不读取 API Key，不进行模型网络请求**。UI 参考 Anthropic frontend-design Skill，采用轻量蓝紫色、留白、分类搜索与紧凑排版，界面与内容结构独立维护。

## 已实现

- 首页57个三语模块、165个可直接选择的细分任务；另保留早期10类30条原创模板。
- 导入 AI Short 公开仓库的 279 条简体中文精选记录，保留原文、中文释义、原编号和引用来源。
- 数据库搜索、分类、内容来源筛选、分页。
- 参数表单、固定/条件推荐词、按已知词库匹配输入、手动添加、选择数量限制。
- 字段锁定；换一组推荐时保留锁定字段和自由填写的内容。
- 提示词实时拼装、手动编辑、复制、TXT 导出。
- 数据库收藏与方案保存、更新；方案包含填写值、锁定状态和最终内容。
- 大字关怀模式（阅读辅助，不是医疗服务）。
- AI 扩展接口保持禁用，调用返回 501。

## 快速运行

需要 Node.js 22.13+ 和 pnpm（推荐使用锁文件对应版本）。

```sh
pnpm install
pnpm content:build
pnpm db:local
pnpm dev
```

打开开发服务打印的地址。默认 `http://localhost:3000`。第一次读取会将版本化内容写入本地 D1，之后复用。SQLite 文件与云端 D1 是不同实例。

```sh
pnpm typecheck
pnpm test
pnpm test:api  # 先保持 pnpm dev 运行
pnpm build
```

`pnpm build` 会先校验内容并生成种子数据。

## 修改和添加内容

| 内容                           | 修改位置                                    |
| ------------------------------ | ------------------------------------------- |
| 模块名称、顺序                 | `data/categories.json`                      |
| 编程模板                       | `data/modules/programming.json`             |
| 其他模块模板                   | `data/modules/<模块>.json`                  |
| 表单、默认值、推荐词、关联条件 | 对应模板的 `fields`                         |
| AI Short 规范化数据            | `data/imports/aishort.json`                 |
| AI Short 原始快照              | `data/imports/aishort.raw.json`（保留不改） |
| 数据来源和固定版本             | `data/imports/manifest.json`                |
| 数据库结构                     | `db/schema.ts`                              |
| 外观与主题                     | `app/globals.css`                           |
| 未来 AI 适配接口               | `lib/ai/provider.ts`                        |

详细步骤见 [内容维护](docs/CONTENT.md)、[数据库结构](docs/DATABASE.md) 和 [未来 AI 接入](docs/AI-READY.md)。

新增模板可以复制同模块的一项，赋予唯一 `id` 和 `slug`，修改正文、字段和词库。正文变量使用 `{{field_key}}`。更新后运行 `pnpm content:build`，校验通过再构建、发布。

不要随意修改现有 ID。下架采用 `status: "archived"`，不要通过删除条目来清理；这样现有数据引用仍可追溯。

## 数据文件

- `database/prompt-library.sqlite`：初始化参考数据库，仅含公开提示词和原创模板，没有用户方案。
- `database/seed.sql`：可读、可复现的数据导入脚本，不混入 schema migration。
- `drizzle/*.sql`：仅数据库结构变化；已发布的迁移不修改，新增迁移继续追加。
- `data/seed.generated.json`：内容构建产物，服务端分批、幂等同步；不是手工编辑入口。

需要重建参考 SQLite 时运行 `python scripts/export-sqlite.py`（Python 标准库即可）。此脚本只重建项目的**参考数据文件**，不会修改线上 D1，已有参考文件会先备份。

## 访客身份与保存

本版未增加账号注册。方案和收藏写入 D1，以 HttpOnly、SameSite=Strict 的随机访客 Cookie 识别；数据库只保存散列标识。不能跨浏览器自动同步，清除 Cookie 后无法自动找回，请导出重要方案。

写入接口校验同源请求、字段类型、长度和数量，用户只能更新自己的方案。暂定最多 100 个方案/访客。本版不是多租户账号系统；公开运营前应补充登录、限流及账号级配额。

## 发布

现有 `.openai/hosting.json` 指向当前 Sites 项目，D1 逻辑绑定为 `DB`。构建产物为 Cloudflare Worker。Sites 发布时先应用 Drizzle schema 迁移，首次请求按内容版本同步种子数据。

GitHub 保存公开源码与参考数据库，不会自动部署线上网站。网站已公开访问。不要把 `.env`、`.dev.vars`、`.wrangler`、用户数据备份、Token 或密钥上传 GitHub。

## 来源与许可

AI Short 来源：[rockbenben/ChatGPT-Shortcut](https://github.com/rockbenben/ChatGPT-Shortcut)。本次固定提交见 `data/imports/manifest.json`。上游 MIT 原文保存在 [licenses/aishort-MIT.txt](licenses/aishort-MIT.txt)。原记录可能包含第三方引用，引用链接均保留。

导入范围仅限公开仓库中的精选数据，**未复制其线上私有数据库、社区用户记录或用户账号信息**。导入是内容存档，不代表已经对专业性、事实准确性或模型执行效果作出验证。
