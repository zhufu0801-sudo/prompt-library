# 内容维护

每个模块有独立 JSON 文件。先修改 `data/modules/` 中的数据，不要改聚合生成文件或 SQL。

## 新建模板

1. 找到相近模板并复制一项，放在对应模块数组内。
2. 设置唯一 `id`（推荐 `custom-用途`）和唯一 `slug`。
3. `categoryId` 使用 `data/categories.json` 的已有 ID。
4. 填写 `title`、`description`、`content` 与 `tags`。
5. 在 `fields` 中定义正文中的每一个 `{{变量}}`。
6. 运行 `pnpm content:build`，再运行测试和构建。

字段支持 `text`、`textarea`、`multi`；`required` 控制必填；`defaultValue` 为默认值，multi 使用数组；`options` 为推荐词；`maxSelections` 限制多选。

条件词示例：

```json
"conditionalOptions": {
  "audience": {
    "小红书": ["自然种草", "口语化", "场景分享"],
    "LinkedIn": ["专业正式", "行业观点", "商业价值"]
  }
}
```

这里 `audience` 是已存在的字段 key；当值匹配时，该列表替代默认推荐词。用户可保留已有选择，系统不会静默删除已选内容。

## 规则生成与锁定

- 文本按变量逐一替换，不执行任何模板代码。
- 字段输入中的 `{{文本}}` 按普通内容处理，不递归替换。
- “匹配关键词”只匹配当前模板已知词条，不声称理解全部自然语言。
- 锁定字段不被修改或批量更新。
- “换一组推荐词”只更新有选项的未锁定字段，自由文本保留。
- 改参数会覆盖手动编辑的最终提示词，页面会说明此行为。

## 更新 AI Short

原始数据固定在 manifest 记录的版本。本版不自动联网更新。

1. 从上游选择明确 commit，审查 LICENSE 和内容变化。
2. 保存新的原始快照与哈希。
3. 保持原编号，规范化到 `data/imports/aishort.json`。
4. 保留 `sourceRecordId`、`sourceUrl` 和译文，不混入原创模块。
5. 更新 manifest 后运行内容校验、参考 SQLite 导出和测试。

更新建议由维护者审查后提交，不允许用户上传任意 SQL。
