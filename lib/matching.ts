// Explicit phrase matching, not a model confidence score.
const aliases: Record<string, string[]> = {
 'turnaround':['人物换脸了','角色长相不一致','character looks different','inconsistent character','キャラクターの顔が変わる'],
 'spatial-continuity':['前后镜头场景变了','镜头之间接不上','房间布局变了','scene changes between shots','shots do not connect','カット間で背景が変わる'],
 'spatial-reference':['同一个房间不同角度','房间多个视角','same room from different angles','同じ部屋を別の角度から'],
 'video-close':['想看手部细节','突出人物表情','focus on facial expression','show hand details','表情を大きく見せたい'],
 'video-medium':['两个人递东西','两人互动','two people exchanging an object','二人のやり取り'],
 'video-wide':['展示整个场景','拍到人物全身和环境','show the whole setting','full body and surroundings','全身と周囲を見せたい'],
 'auth-expiry':['登录后一直跳转','一直跳登录页','登录过期','keeps redirecting to login','logged out repeatedly','ログイン画面に戻される'],
 'duplicate-list':['加载更多出现重复','上一页重复出现','同一条出现两次','load more repeats','same item appears twice','同じ項目が二重に表示'],
 'dependency-install':['装不上依赖','安装依赖失败','依赖装不上','cannot install dependencies','依存パッケージを導入できない'],
 'type-mismatch':['不能赋值给类型','类型对不上','not assignable to type','型に代入できない'],
 'null-runtime':['读取不到属性','cannot read properties of undefined','cannot read properties of null','nullのプロパティを読み取れない'],
 'responsive-layout':['按钮被挤出屏幕','手机显示不全','页面超出屏幕','button goes off screen','horizontal scrollbar','画面からはみ出す'],
 'race':['新结果被旧结果覆盖','后搜的先返回','old results overwrite new','古い結果で上書き'],
 'form-validation':['提交时提示必填','邮箱格式校验','validate email','メール形式を検証'],
 'request-lifecycle':['取消后仍报错','请求一直不结束','request never finishes','キャンセル後もエラー'],
 'list-search':['输入关键词找商品','search products by name','商品名で検索']
};
const weak = new Set(['limit','skip','401','422','undefined','overflow','required field']);
const escape = (s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export function termEvidence(text:string, terms:string[]) {
 const normalized=text.normalize('NFKC').toLowerCase();
 return [...new Set(terms)].filter(term=>{
  const needle=term.normalize('NFKC').toLowerCase();
  const pattern=escape(needle).replace(/[- ]/g,'[-\\s]+');
  const re=new RegExp(/^[a-z0-9 _-]+$/i.test(needle)?`(?<![a-z0-9_])${pattern}(?![a-z0-9_])`:pattern,'gu');
  return [...normalized.matchAll(re)].some(match=>{
   // Suppress explicit exclusions only; do not guess arbitrary negation.
   const before=normalized.slice(Math.max(0,match.index!-24),match.index);
   const after=normalized.slice(match.index!+match[0].length,match.index!+match[0].length+8);
   return !/(?:不是|无需|不需要|不要|并非|not about\s|no need for\s)\s*$/.test(before)
    && !/^(?:は不要|ではない)/.test(after);
  });
 });
}
export function scenarioEvidence(text:string,id:string,terms:string[]) {
 const evidence=termEvidence(text,[...terms,...(aliases[id]||[])]);
 const score=evidence.reduce((sum,t)=>sum+(weak.has(t.toLowerCase())?0.25:t.length>=6?3:2),0);
 return {evidence,score};
}
