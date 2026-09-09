# 待上线三语资料库

独立于线上 D1，所有记录均为 draft，首页与 API 不读取此目录或 research-library.sqlite。
保留 AI Short 原始标签，不将本项目现有 10 类冒充上游分类。

- upstream：固定提交的原始三语快照，保留 MIT 许可与来源。
- tags.json：上游标签 ID 及中英日编辑名称。
- entries.json：279 个 ID、每项三语，共 837 个语言版本；保留源正文和编辑后的正文。
- locale-rules.json：各语言的表达、地区习惯和输出规范。明确的翻译目标优先于默认语言。
- database/research-library.sqlite：可查询、可修改的待上线库；不含用户数据。
- manifest.json：来源、哈希、数量、审核状态。

英文采用上游英文正文；中文、日文采用上游本地化 description 正文，不把英文 prompt 当作本地译文。研究库保留原始资料，内容仅作数据，不作为开发指令执行。

当前完成批量归档与语言编辑规则应用，未声称逐条人工精修、母语审校或模型效果验证。后续按模块逐条检查任务目标、变量化、重复、语言自然度、领域适用性和真实结果，再决定上线。

修改可复现来源或编辑规则后运行：python scripts/build-research-library.py。直接修改生成的 SQLite/entries.json 会在重新构建时被覆盖；持久编辑请修改源文件或构建规则。
