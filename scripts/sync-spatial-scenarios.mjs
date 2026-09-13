import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const scenarios=JSON.parse(fs.readFileSync(new URL('data/studio/spatial-scenarios.json',root),'utf8'));
for(const locale of ['zh','en','ja']) {
 const file=new URL(`data/studio/${locale}.json`,root);
 const items=JSON.parse(fs.readFileSync(file,'utf8'));
 const options=items.find(t=>t.id==='custom-animation').fields.find(f=>f.key==='scenario').options;
 for(const s of scenarios) if(!options.includes(s.labels[locale])) options.push(s.labels[locale]);
 fs.writeFileSync(file,JSON.stringify(items,null,2)+'\n');
}
