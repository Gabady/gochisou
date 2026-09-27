/* Delegation uses the ordinary material, cost, lot and daily-capacity rules. */
(function(root){'use strict';
const E=root.GCEngine||(typeof require!=='undefined'?require('./engine.js'):null);
const {D,clone,check,integer,item,qty,total,capacity,productionLimit,craftLimit,produceBatch,batch,craftPlan,manufacture,planTake,uid}=E,A=E.actions;
const defaults=()=>({enabled:false,orders:true,deliver:true,targetItem:'bread',target:0,budget:1200,keepCraft:1,policy:'standard'});
function validatePlan(s){const p=s.workPlan;check(p&&typeof p==='object','おまかせ設定がありません');for(const k of ['enabled','orders','deliver'])check(typeof p[k]==='boolean','おまかせ設定が不正です');check(item(s,p.targetItem)?.recipe,'定番の商品が不明です');integer(p.target,0,30);integer(p.budget,0,100000);integer(p.keepCraft,0,100);check(['standard','mass','careful'].includes(p.policy),'おまかせの製造方針が不正です');integer(s.workPlanUsage.day,1,100000);integer(s.workPlanUsage.spent,0,100000);check(s.harvestProgress&&typeof s.harvestProgress.items==='object','収穫経験の記録が不正です');integer(s.harvestProgress.day,1,100000);for(const [id,p]of Object.entries(s.harvestProgress.items)){check(D.items[id]?.farm,'収穫素材が不正です');integer(p.volume,0,10000000);integer(p.awarded,0,100000)}for(const r of s.recipes){if(r.affinity){const expected=E.F.analyze(r.recipe);check(JSON.stringify(r.affinity)===JSON.stringify(expected),'食材相性の保存値が不正です')}}return true}
function upgrade(s){
 if(s.gameRulesVersion==='2.0.0'){
  s.workPlan=defaults();s.workPlanUsage={day:s.day,spent:0};s.harvestProgress={day:s.day,items:{}};
  for(const r of s.recipes)r.affinity=E.F.analyze(r.recipe);
  s.gameRulesVersion='2.1.0';
  E.log(s,'新しい経営ルールへ引き継ぎ','日常作業のおまかせは停止状態で追加。既存在庫・契約・獲得済み保証を保持。新しい製造から食材相性と収穫量に応じた経験を適用。','milestone');
 }
 if(s.gameRulesVersion==='2.1.0'){s.recruitment={rng:E.hash(s.seed+'|hiring'),round:0,lastDay:0,candidates:[],history:[],lastCampaign:null};s.finance={aidDay:0,reliefUntil:0,autoWork:false,target:1200,soldDay:s.day,sold:0};s.gameRulesVersion='2.2.0';s.contentVersion='57.0';E.log(s,'求人と資金繰りを更新','在籍スタッフと資産を保持。求人募集で新しい候補が現れます。','milestone')}
 if(s.gameRulesVersion==='2.2.0'){s.dining={active:null,album:[]};s.gameRulesVersion='2.3.0';s.contentVersion='58.0';E.log(s,'食卓企画の招待状','期限のない任意の企画を追加。既存の資産・契約・設定は保持。','milestone')}
 return s;
}
function requirements(job){const out={};for(const r of job.requirements||[{itemId:job.itemId,quantity:job.quantity}])out[r.itemId]=(out[r.itemId]||0)+r.quantity;return Object.entries(out).map(([itemId,quantity])=>({itemId,quantity}))}
// Protect all completed parts before preparing dependencies of any other part.
function reserveReady(s,job){
 for(const l of s.lots)if(l.reservation===job.id)l.reservation=null;
 for(const r of requirements(job))for(const p of planTake(s,r.itemId,r.quantity,job.minQuality).lots){const l=s.lots.find(x=>x.lotId===p.lotId);if(p.amount<l.quantity){l.quantity-=p.amount;s.lots.push({...l,lotId:uid(s,'lot'),quantity:p.amount,reservation:job.id})}else l.reservation=job.id}
}
function ready(s,job){return requirements(job).every(r=>qty(s,r.itemId,job.minQuality,job.id)>=r.quantity)}
function workJob(s,job,options={}){
 const start={money:s.money,produce:s.used.produce,craft:s.used.craft},steps=[],limit=options.budget??s.money,policy=options.policy||s.policy,keep=options.keepCraft||0;
 check(['standard','mass','careful'].includes(policy),'試作は個別の製造から行ってください');
 check(policy==='standard'||s.day>=4||s.research.processing>0,'製造方針は4日目または加工研究で解放');
 function costGuard(state){check(start.money-state.money<=limit,'おまかせの残り予算が不足しています')}
 function build(state,id,n,minQuality,trace,path=[]){
  check(trace.length<200&&path.length<16&&!path.includes(id),'製造計画が大きすぎるか、循環しています');const d=item(state,id);check(d,'入手経路がありません');
  if(d.recipe){
   check(state.used.craft<craftLimit(state)-keep,'今日の加工枠が不足しています'+(keep?'（自分用に'+keep+'枠を確保中）':''));
   for(const [material,amount]of Object.entries(d.recipe))ensure(state,material,n*amount,trace,[...path,id]);
   check(state.used.craft<craftLimit(state)-keep,'今日の加工枠が不足しています'+(keep?'（自分用に'+keep+'枠を確保中）':''));const p=craftPlan(state,id,n,{policy});check(p.ok,p.reason);check(p.q.floor>=minQuality,d.name+'は要求品質'+D.ranks[minQuality]+'を保証できません。素材・製法標準化を確認してください');
   manufacture(state,p,{preview:!!options.preview});trace.push({id,n,type:'craft',cost:p.fee,quality:p.q.floor});
  }else if(d.farm){check(E.productionRank(state,id)>=minQuality,d.name+'の生産技術が要求品質に届いていません');A.produce(state,{id,n});trace.push({id,n,type:'produce',cost:n*d.cost,quality:E.productionRank(state,id)})}
  else if(d.buy){check(E.supplyRank(state,id)>=minQuality,d.name+'の仕入れ品質が不足しています');const before=state.money,bought=Math.ceil(n/E.supplyUnit(state))*E.supplyUnit(state);A.buy(state,{id,n:bought});trace.push({id,n:bought,type:'buy',cost:before-state.money,quality:E.supplyRank(state,id)})}
  else throw Error(d.name+'は現在の素材入手経路がありません');costGuard(state);
 }
 function size(state,id){return item(state,id)?.recipe?Math.max(1,batch(state,policy)-(state.buff?.kind==='repair'?1:0)):item(state,id)?.farm?produceBatch(state):100000}
 function ensure(state,id,n,trace,path){let loops=0;while(qty(state,id)<n){check(++loops<=200,'必要な製造量が大きすぎます');build(state,id,Math.min(n-qty(state,id),size(state,id)),0,trace,path)}}
 reserveReady(s,job);let stop='';
 for(const r of requirements(job)){
  let loops=0;while(qty(s,r.itemId,job.minQuality,job.id)<r.quantity){
   check(++loops<=200,'必要な製造量が大きすぎます');const missing=r.quantity-qty(s,r.itemId,job.minQuality,job.id),maximum=Math.min(missing,size(s,r.itemId));let success=false;
   const sizes=maximum<=30?Array.from({length:maximum},(_,i)=>maximum-i):[maximum,...Array.from({length:30},(_,i)=>30-i)];
   for(const n of sizes){
    const candidate=clone(s),trace=[];
    try{build(candidate,r.itemId,n,job.minQuality,trace);reserveReady(candidate,job);Object.assign(s,candidate);steps.push(...trace);success=true;break}
    catch(e){stop=e.message;if(n===1)break}
   }
   if(!success)break;
  }
 }
 const complete=ready(s,job);if(!options.partial)check(complete,stop||'注文を仕上げられませんでした');
 if(job.temporary)for(const l of s.lots)if(l.reservation===job.id)l.reservation=null;
 return {complete,steps,spent:start.money-s.money,produce:s.used.produce-start.produce,craft:s.used.craft-start.craft,stop:complete?'':stop};
}
function preparePreview(state,orderId){try{check(!state.ended,'初回評価が完了しています');const s=clone(state),job=s.orders.find(o=>o.id===orderId);check(job,'受注済みの注文を選んでください');check(job.dueDay>=s.day,'納品期限を過ぎています');const report=workJob(s,job,{preview:true,policy:state.policy==='trial'?'standard':state.policy});return {ok:true,...report,final:total(s)}}catch(e){return {ok:false,reason:e.message}}}
A.prepareOrder=(s,p)=>{const preview=preparePreview(s,p.id);check(preview.ok,preview.reason);const job=s.orders.find(o=>o.id===p.id),report=workJob(s,job,{policy:s.policy==='trial'?'standard':s.policy});if(p.deliver===true)A.deliver(s,{id:p.id});s.lastPreparation=report;s.lastResult={title:p.deliver?'準備して、お届けしました':'注文の準備ができました',text:'生産 '+report.produce+'枠・加工 '+report.craft+'枠 / 追加支出 '+report.spent+'円',sub:p.deliver?'納品報酬 '+job.reward+'円': '完成品をこの注文用に確保しました。',kind:'batch'};};
A.workPlan=(s,p)=>{const candidate={...s.workPlan,...p};const copy={...s,workPlan:candidate};validatePlan(copy);check(candidate.target===0||E.unlocked(s,candidate.targetItem),'定番商品を解放してください');s.workPlan=candidate;s.lastResult={title:'おまかせの方針を更新',text:candidate.enabled?'残りの能力枠と予算内で、営業終了時に進めます。':'おまかせは停止しています。',kind:'note'}};
function runWorkPlan(s,options={}){
 const p=s.workPlan||defaults(),report={steps:[],spent:0,produce:0,craft:0,delivered:0,stops:[],enabled:p.enabled};
 if(!p.enabled)return report;if(s.workPlanUsage?.day!==s.day)s.workPlanUsage={day:s.day,spent:0};
 const jobs=p.orders?[...s.orders].sort((a,b)=>a.dueDay-b.dueDay||a.acceptedDay-b.acceptedDay):[];
 if(p.target>0)jobs.push({id:'work-plan-stock',itemId:p.targetItem,quantity:p.target,minQuality:0,temporary:true});
 for(const job of jobs){
  const before=clone(s);let result;
  try{result=workJob(s,job,{preview:options.preview,partial:true,budget:Math.max(0,p.budget-s.workPlanUsage.spent),keepCraft:p.keepCraft,policy:p.policy})}
  catch(e){Object.assign(s,before);result={steps:[],spent:0,produce:0,craft:0,complete:false,stop:e.message}}
  s.workPlanUsage.spent+=result.spent;report.spent+=result.spent;report.produce+=result.produce;report.craft+=result.craft;report.steps.push(...result.steps);
  if(!result.complete)report.stops.push({id:job.id,itemId:job.itemId,reason:result.stop||'必要な在庫が足りません'});
  if(!job.temporary&&p.deliver&&result.complete){A.deliver(s,{id:job.id});report.delivered++}
 }
 s.lastDelegation=clone(report);return report;
}
A.runWorkPlan=s=>{check(s.workPlan.enabled,'おまかせ設定を有効にしてください');const r=runWorkPlan(s);s.lastResult={title:r.steps.length||r.delivered?'いつもの仕事を、チームで。':'おまかせの状況を確認',text:'生産 '+r.produce+'枠・加工 '+r.craft+'枠 / 支出 '+r.spent+'円 / 納品 '+r.delivered+'件',sub:r.stops.map(x=>x.reason).join(' / ')||'目標数までの準備が完了しています。',kind:'batch'}};
function workPreview(s){const copy=clone(s);return runWorkPlan(copy,{preview:true})}
Object.assign(E,{defaultWorkPlan:defaults,validateWorkPlan:validatePlan,upgrade,preparePreview,runWorkPlan,workPreview,workJob});
const baseValidate=E.validate;E.validate=s=>{baseValidate(s);validatePlan(s);return true};
// transact closes over engine.validate; keep the validation inside each new action too.
const originalTransact=E.transact;E.transact=(state,type,payload,token)=>{const r=originalTransact(state,type,payload,token);if(r.ok){try{E.validate(r.state)}catch(e){return {ok:false,error:e.message,state}}}return r};
})(typeof globalThis!=='undefined'?globalThis:this);
