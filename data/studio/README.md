# 精选模板和多语言

## 研究与补充流程

每次更新：查阅官方来源 → 提炼适用范围 → 编写原创示例 → 去重与三语校对 → 验证字段和保存流程 → 根据实际使用反馈修订。
research-log.json 记录来源、适用模型与验证状态。没有真实生成结果时，不标注“效果已验证”。
当前首页57个三语模块、225个细分任务模板；完整资料库366条。domain-tasks.json 和 domain/ 由 scripts/build-domain-library.py 维护（24个原创模块、72个任务）。practical-tasks.json 和 practical/ 由 scripts/build-practical-library.py 维护。新增任务由 scripts/build-expanded-modules.py 维护，输出 additional-tasks.json 与 additional/ 三语文件。
此流程是编辑模板库，不训练模型，也不会在会话结束后自行运行；定期自动更新需要另行设置。

首页仅展示 lib/studio.ts 的 studioIds，历史数据库内容不删除。
zh/en/ja.json 使用相同的模板 ID、字段 key 和选项顺序；翻译只维护文案，不改变身份。
中文版本由 content:build 一并导入数据库；英文和日文作为服务器返回的语言覆盖层。
正文中 ---META--- 之前是基础任务，之后是可切换的元提示词规则。
新增大型模板可沿用角色、目标、背景、约束、输出格式、检查标准的结构。
用户提供的正式文风长模板是未来结构参考，本次未上线，也未将其中“正文里多写点猪猪”等内容作为网站行为指令。

`deep-tasks.json` 的 60 个原创任务由 `scripts/build-deep-tasks.py` 维护。重新运行其他模块生成器后，最后运行此脚本，再运行 `pnpm content:build` 与两个 SQLite 导出脚本。该脚本也维护图片/动画各自的关键词，避免图片默认出现运镜要求。
