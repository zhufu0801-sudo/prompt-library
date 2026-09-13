"""Original editorial adaptations of reviewed CC0 records; offline drafts only."""
import json,pathlib,csv,io
p=pathlib.Path(__file__).resolve().parents[1]
csv.field_size_limit(10000000)
rows=list(csv.DictReader(io.StringIO((p/'data/sources/prompts-chat/prompts.csv').read_text(encoding='utf-8-sig'))))
sha=json.loads((p/'data/sources/prompts-chat/manifest.json').read_text())['commit']
specs=[(5,'work','spreadsheet-formulas',[
 ('表格公式与边界验证','根据工作表列名、样例行、计算目标和软件版本，给出可粘贴的公式、放置单元格及向下填充方式。先说明列引用、日期格式、分隔符和空值规则。提供正常、空白、重复、错误值四类测试及预期结果；没有计算工具时仅给推导结果并标注未执行，不假装运行 Excel。保留原始数据，不用宏完成可用公式处理的工作。资料：{{materials}}；目标：{{goal}}；软件及地区：{{environment}}。'),
 ('Spreadsheet formulas and edge cases','Using column names, sample rows, calculation goals and software version, supply paste-ready formulas, destination cells and fill-down instructions. State references, date conventions, separators and blank-value rules. Include normal, blank, duplicate and error-value tests with expected outcomes. Without a calculation tool, label derived results as unexecuted; do not pretend to run Excel. Preserve source data and prefer formulas where macros are unnecessary. Data: {{materials}}; goal: {{goal}}; software/locale: {{environment}}.'),
 ('表計算の数式と境界条件','列名、サンプル行、計算目的、ソフトのバージョンに基づき、貼り付け可能な数式、入力先セル、下方向へのコピー方法を示す。参照範囲、日付形式、区切り文字、空欄の扱いを明記する。通常・空欄・重複・エラー値のテストと期待値を出す。計算ツールがない場合は未実行の推定と明記し、Excelを実行したと装わない。元データを保持し、数式で済む処理にマクロを使わない。資料：{{materials}}、目的：{{goal}}、ソフト・地域：{{environment}}。')]),
 (30,'research','usability-review',[
 ('界面可用性评审草稿','基于提供的界面、用户目标和操作流程，输出按影响排序的可用性问题表：具体页面与步骤、观察证据、影响对象、建议文案或布局、验证方法。把已观察的问题与假设分开；没有截图或可访问页面时先给评审框架，不编造用户测试。交付一版关键流程的文字原型，并覆盖键盘操作、错误恢复、空状态和手机屏幕。资料：{{materials}}；用户任务：{{goal}}；限制：{{constraints}}。'),
 ('Usability review draft','Review the supplied interface against user goals and workflows. Rank issues by impact, specifying page/step, observed evidence, affected users, proposed copy or layout and validation method. Separate observations from hypotheses; without screenshots or an accessible page, provide a review framework rather than invented user testing. Deliver a text prototype of the key flow covering keyboard operation, error recovery, empty states and mobile screens. Evidence: {{materials}}; user task: {{goal}}; constraints: {{constraints}}.'),
 ('使いやすさの評価案','提供された画面、利用者の目的、操作手順に基づき、影響順に問題を整理する。画面と操作、観察根拠、影響を受ける利用者、文言・配置の改善案、検証方法を示す。観察と仮説を分け、画像や閲覧可能なページがない場合は評価枠組みを出し、ユーザーテストを捏造しない。主要操作のテキスト版プロトタイプを作り、キーボード操作、エラー復帰、空状態、モバイル画面を扱う。資料：{{materials}}、利用目的：{{goal}}、制約：{{constraints}}。')])]
out=[]
for i,category,key,versions in specs:
 r=rows[i]
 out.append({'id':'pc-draft-'+key,'category':category,'status':'draft','source':{'recordIndex':i,'title':r['act'],'contributor':r['contributor'],'license':'CC0-1.0','commit':sha,'url':f'https://github.com/f/prompts.chat/blob/{sha}/prompts.csv'},'localizations':{l:{'title':title,'prompt':body,'status':'editorial-draft'} for l,(title,body) in zip(['zh','en','ja'],versions)}})
(p/'data/research-library/learning-2026-09-13.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print({'drafts':len(out),'localizations':len(out)*3})
