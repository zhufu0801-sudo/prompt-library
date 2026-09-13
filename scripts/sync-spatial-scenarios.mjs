import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const scenarios=['spatial-scenarios','engineering-scenarios','code-and-shots'].flatMap(name=>JSON.parse(fs.readFileSync(new URL(`data/studio/${name}.json`,root),'utf8')));
for(const locale of ['zh','en','ja']) {
 const file=new URL(`data/studio/${locale}.json`,root);
 const items=JSON.parse(fs.readFileSync(file,'utf8'));
 for(const s of scenarios) {
  const module=['build','debug','review'].includes(s.task)?'custom-programming':'custom-animation';
  const options=items.find(t=>t.id===module).fields.find(f=>f.key==='scenario').options;
  if(!options.includes(s.labels[locale])) options.push(s.labels[locale]);
 }
 fs.writeFileSync(file,JSON.stringify(items,null,2)+'\n');
}
