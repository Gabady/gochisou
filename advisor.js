/* Read-only daily advice and explicit shortcuts; never spend resources while rendering. */
(function(root){'use strict';
const E=root.GCEngine||(typeof require!=='undefined'?require('./engine.js'):null),{D,clone,check,item}=E,A=E.actions;
const presets={
 orders:{name:'注文を全部任せる',desc:'受注した分だけ収穫・加工して納品。余分な定時収穫は止めます。',keepCraft:0},
 creative:{name:'試作の余力を残す',desc:'加工1枠をあなた用に残し、それ以外で注文を進めます。余分な定時収穫は止めます。',keepCraft:1},
 manual:{name:'自分で進める',desc:'スタッフのおまかせを停止。手作業と注文ごとの一括操作で進めます。'}
};
A.workPreset=(s,p)=>{check(Object.hasOwn(presets,p.mode),'おまかせの選択が不明です');if(p.mode==='manual')s.workPlan.enabled=false;else{s.workPlan={...E.defaultWorkPlan(),enabled:true,keepCraft:presets[p.mode].keepCraft};s.dailyCrop='off'}s.lastResult={title:presets[p.mode].name,text:p.mode==='manual'?'注文の自動準備を停止しました。':'毎日、閉店時に進めます。1日1,200円まで・残りの生産枠と加工枠を使用。',kind:'note'}};
function presetName(s){const p=s.workPlan;if(!p.enabled)return '自分で進める';if(s.dailyCrop==='off'&&p.orders&&p.deliver&&p.target===0&&p.policy==='standard'&&p.budget===1200){if(p.keepCraft===0)return presets.orders.name;if(p.keepCraft===1)return presets.creative.name}return '自分で調整したおまかせ'}
function offerPreview(state,id){try{check(!state.ended,'初回評価が完了しています');const s=clone(state),o=s.candidates.find(o=>o.id===id);check(o,'候補が更新されています');A.accept(s,{id});const contract=s.orders.find(o=>o.id===id),p=E.preparePreview(s,id);check(p.ok,p.reason);return {...p,ok:true,reward:contract.reward,dueDay:contract.dueDay,minQuality:contract.minQuality}}catch(e){return {ok:false,reason:e.message}}}
A.acceptAndDeliver=(s,p)=>{const preview=offerPreview(s,p.id);check(preview.ok,preview.reason);A.accept(s,{id:p.id});A.prepareOrder(s,{id:p.id,deliver:true});s.lastResult.title='注文を受けて、お届けしました';s.lastResult.sub='報酬 '+preview.reward+'円 / この注文は納品済みです。'};
function readyDeliveries(state){let s=clone(state);const ids=[];let reward=0;for(const o of [...s.orders].sort((a,b)=>a.dueDay-b.dueDay||a.acceptedDay-b.acceptedDay)){const copy=clone(s);try{A.deliver(copy,{id:o.id});s=copy;ids.push(o.id);reward+=o.reward}catch(e){/* A not-yet-ready contract is an expected alternative. */}}return {ids,reward,count:ids.length}}
A.deliverReady=s=>{const ready=readyDeliveries(s);check(ready.count>0,'いま納品できる注文はありません');for(const id of ready.ids)A.deliver(s,{id});s.lastResult={title:ready.count+'件、まとめてお届け',text:'報酬 '+ready.reward+'円 / 手元にある完成品を納品しました。',kind:'batch'}};
function closingForecast(state){if(state.ended)return {ok:true,report:null,scheduledIds:[],risks:[]};const result=E.transact(state,'nextDay',{day:state.day});if(!result.ok)return {ok:false,reason:result.error,scheduledIds:[],risks:[]};const report=result.state.lastReport,remaining=new Set(report.pendingOrders.map(o=>o.id)),scheduledIds=state.orders.filter(o=>!remaining.has(o.id)).map(o=>o.id),risks=[];
 for(const o of report.pendingOrders.filter(o=>o.dueDay<=state.day))risks.push({kind:'deadline',id:o.id,title:item(state,o.itemId).name+'の納期が今日まで',text:'このまま閉店すると未納品になります。',to:'trade/orders'});
 if(report.expired.length)risks.push({kind:'expiry',title:report.expired.reduce((n,l)=>n+l.n,0)+'個が閉店時に廃棄',text:report.expired.map(l=>l.name+' ×'+l.n).join(' / '),to:'make/inventory'});
 if(state.event&&['price','repair','delivery'].includes(D.events[state.event.index].kind))risks.push({kind:'event',title:'明日の変更について相談があります',text:'未回答なら費用なしの対応が適用されます。',action:'eventSheet'});
 for(const key of Object.keys(D.contests))if(E.nextContest(state,key)-state.day===1&&!state.contestEntries.some(e=>e.key===key))risks.push({kind:'contest',title:D.contests[key].name+'の出品が今日まで',text:'参加は任意です。提出するなら今日のうちに。',to:'more/contests'});
 return {ok:true,report,scheduledIds,risks};
}
function can(state,type,p){const copy=clone(state);try{A[type](copy,p);return true}catch(e){return false}}
function growthOptions(s){const groups=[];function group(label,to,type,payloads){const count=payloads.filter(p=>can(s,type,p)).length;if(count)groups.push({label,to,count})}
 group('研究','grow/research','research',Object.keys(D.research).map(id=>({id})));
 group('設備の増築','grow/facilities','facility',Object.keys(D.facilities).map(id=>({id})));
 group('仲間の採用','grow/staff','hire',s.recruitment.candidates.map(t=>({id:t.id})));
 group('仕入れ契約','make/buy','supplier',[{}]);
 group('地域への進出','trade/regions','region',Object.keys(D.regions).filter(id=>!s.regions.includes(id)).map(id=>({id})));
 group('製法の研究','make/original','refine',s.recipes.filter(r=>!r.formal&&r.completion<100).slice(-30).map(r=>({id:r.id})));
 group('看板商品の発売','make/original','formalize',s.recipes.filter(r=>!r.formal&&r.completion>=100).slice(-30).map(r=>({id:r.id})));
 group('商品の開発','make/original','develop',Object.keys(D.items).filter(id=>D.items[id].dev&&!s.developed[id]).map(id=>({id})));
 group('品質の改善','grow/research','improve',s.lots.filter(l=>item(s,l.itemId)?.recipe&&l.reworkCount===0&&!l.locked&&!l.reservation&&l.qualityRank<Math.min(6,Math.floor(l.materialPotential)+2)).map(l=>({id:l.lotId,n:1})));
 return groups;
}
function stopAdvice(reason){
 if(/予算/.test(reason))return {title:'1日の予算に届きました',to:'make/plan',link:'予算を調整'};
 if(/自分用/.test(reason))return {title:'試作用に加工枠を残しています',to:'make/plan',link:'任せ方を変える'};
 if(/加工枠|生産枠/.test(reason))return {title:'今日の作業枠を使い切りました',to:'grow/facilities',link:'設備を確認'};
 if(/倉庫/.test(reason))return {title:'倉庫に空きが必要です',to:'make/inventory',link:'在庫を整理'};
 if(/保証|品質|生産技術/.test(reason))return {title:'注文の品質に届く準備が必要です',to:'grow/research',link:'品質を育てる'};
 if(/資金|費用/.test(reason))return {title:'資金が足りません',to:'trade/finance',link:'資金繰りを立て直す'};
 if(/解放|研究|レシピ/.test(reason))return {title:'レシピの解放が必要です',to:'grow/research',link:'研究を確認'};
 return {title:reason||'材料と設定を確認してください',to:'make/inventory',link:'材料を確認'};
}
function todayStatus(s){
 if(s.ended)return {title:'会社の歩みを振り返ろう',close:{ok:true,report:null,scheduledIds:[],risks:[]},ready:{count:0,ids:[],reward:0},active:[],offers:[],choices:[],newOffers:[],growth:[],remaining:{produce:0,craft:0}};
 const close=closingForecast(s),ready=readyDeliveries(s),scheduled=new Set(close.scheduledIds),active=s.orders.map(o=>{const p=E.preparePreview(s,o.id);return {id:o.id,itemId:o.itemId,quantity:o.quantity,dueDay:o.dueDay,reward:o.reward,ready:ready.ids.includes(o.id),scheduled:scheduled.has(o.id),...p}}),offers=s.candidates.map(o=>({id:o.id,itemId:o.itemId,quantity:o.quantity,...offerPreview(s,o.id)}));
 const choices=active.filter(o=>o.ok&&!o.scheduled),newOffers=offers.filter(o=>o.ok),growth=s.ended?[]:growthOptions(s),remaining={produce:Math.max(0,E.productionLimit(s)-s.used.produce),craft:Math.max(0,E.craftLimit(s)-s.used.craft)};
 let title=close.risks.length?'閉店前に確認したいことがあります':close.scheduledIds.length?'あとはスタッフが'+close.scheduledIds.length+'件お届け':choices.length?'いま進められる注文があります':s.orders.length?'残りの注文は準備を整えよう':'受注済みの仕事は完了です';
 if(!close.risks.length&&!s.orders.length&&!s.stats.delivered)title='最初の注文を選んでみよう';
 return {title,close,ready,active,offers,choices,newOffers,growth,remaining};
}
Object.assign(E,{workPresets:presets,presetName,offerPreview,readyDeliveries,closingForecast,growthOptions,stopAdvice,todayStatus});
})(typeof globalThis!=='undefined'?globalThis:this);
