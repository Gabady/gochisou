/* Matched fixed-seed business decisions. Counts engine actions, NOT measured user taps/time/fun. */
'use strict';const E=require('../actions.js'),S=require('../storage.js'),assert=require('node:assert/strict'),fs=require('node:fs');
function run(seed,mode){let s=E.newGame(seed),actions=0,prepared=0;function act(type,p={}){const r=E.transact(s,type,p);assert.ok(r.ok,type+': '+r.error);s=r.state;actions++}
 if(mode==='daily')act('workPlan',{enabled:true,keepCraft:0});
 for(let day=1;day<=75;day++){
  if(s.ended)act('continue');
  for(const id of ['production','processing','quality','storage'])if(s.research[id]<3&&s.rp>=E.D.research[id].base*(s.research[id]+1)+20){act('research',{id});break}
  if(!s.staff.some(t=>t.assigned==='workshop')&&s.money>3600){if(!s.recruitment.candidates.length)act('recruit',{campaign:'flyer',focus:'workshop'});act('hire',{id:s.recruitment.candidates[0].id})}
  for(const id of ['warehouse','workshop','farm'])if(s.facilities[id]<2&&s.money>Math.round(E.D.facilities[id].base*1.65**(s.facilities[id]-1))+3000){act('facility',{id});break}
  if(s.event?.story)act('storyChoice',{choice:'learn'});else if(s.event){const ev=E.D.events[s.event.index],choice=ev.options.find(x=>x[0]==='research'||x[0]==='quality'||x[0]==='learn'||x[0]==='study')?.[0]||ev.options.at(-1)[0];act('event',{choice})}
  for(const candidate of s.candidates.filter(o=>o.minQuality===0)){
   const accepted=E.transact(s,'accept',{id:candidate.id});if(!accepted.ok)continue;
   const p=E.preparePreview(accepted.state,candidate.id);if(!p.ok)continue;
   if(mode!=='quick')act('accept',{id:candidate.id});
   if(mode==='daily'){}
   else if(mode==='quick')act('acceptAndDeliver',{id:candidate.id});
   else if(mode==='batch')act('prepareOrder',{id:candidate.id,deliver:true});
   else {for(const step of p.steps)act(step.type,{id:step.id,n:step.n,policy:'standard'});act('reserve',{id:candidate.id});act('deliver',{id:candidate.id})}
   prepared++;break;
  }
  act('nextDay',{day:s.day});if(day%10===0)s=S.parse(JSON.stringify(S.envelope(s))).runs[s.runId];
 }
 return {actions,prepared,day:s.day,cash:s.money,profit:s.stats.profit,delivered:s.stats.delivered,waste:s.stats.waste,failed:s.stats.failed,rng:s.rng,stats:s.stats,staff:s.staff,materialRanks:s.materialRanks};
}
const results=[];for(const seed of ['KO-MOREBI','FEAST-2026','FRIENDS']){
 const manual=run(seed,'manual'),batch=run(seed,'batch');for(const k of ['prepared','day','cash','profit','delivered','waste','failed','rng','stats','staff','materialRanks'])assert.deepEqual(manual[k],batch[k],seed+' '+k);
 const quick=run(seed,'quick');for(const k of ['prepared','day','cash','profit','delivered','waste','failed','rng','stats','staff','materialRanks'])assert.deepEqual(manual[k],quick[k],seed+' quick '+k);
 const daily=run(seed,'daily');assert.equal(daily.day,76);assert.equal(daily.delivered,75);assert.equal(daily.failed,0);
 results.push({seed,dailyDelegation:{actions:daily.actions,deliveries:daily.delivered,failed:daily.failed,waste:daily.waste,cash:daily.cash},days:75,manualActions:manual.actions,batchActions:batch.actions,quickActions:quick.actions,quickReductionPercent:Math.round((1-quick.actions/manual.actions)*1000)/10,reductionPercent:Math.round((1-batch.actions/manual.actions)*1000)/10,deliveries:batch.delivered,failed:batch.failed,waste:batch.waste,cash:batch.cash,matchedOutcomes:true});
}
fs.writeFileSync(__dirname+'/operation-comparison-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
