/* Original recipes: one transparent, bounded correction to the quality draw. */
(function(root){'use strict';
const D=root.GCData||(typeof require!=='undefined'?require('./data.js'):null);
const aliases={premiumWheat:'wheat',freshVegetable:'vegetable',brandMeat:'meat',richMilk:'milk',milkBread:'bread',premiumBread:'bread',brandSweets:'sweets',fruitParfait:'sweets',staminaBento:'bento'};
// These describe a combined dish, rather than separate dishes on a menu.
const pairs=[
 ['flour','milk',3,'生地と乳のコクがまとまる'],['bread','milk',3,'香ばしさをミルクが包む'],
 ['vegetable','meat',3,'野菜の軽さと肉のうま味'],['deli','vegetable',2,'惣菜に彩りと軽さ'],
 ['sweets','milk',3,'甘い生地にまろやかさ'],['bread','meat',2,'食べ応えのある惣菜パン'],
 ['bread','vegetable',2,'野菜の食感がアクセント'],['flour','meat',2,'包む生地と具のうま味'],
 ['wheat','milk',2,'穀物とミルクの素朴な味'],['flour','vegetable',1,'野菜を生地に少し添える'],
 ['bread','deli',2,'パンに合うおかず'],['bento','vegetable',1,'彩りのあるひと皿'],
 ['meat','milk',1,'乳のコクで味を丸くする'],['bread','sweets',1,'おやつ向けの甘いパン'],
 ['wheat','vegetable',0,'素材の方向をこれから探る'],['flour','bread',0,'穀物の味が重なる'],
 ['salad','milk',-1,'生野菜の水分で乳の味がぼやける'],['bento','milk',-1,'米料理と乳のまとめ方に工夫が必要'],
 ['sweets','vegetable',-1,'青い香りと甘みが競合'],['sweets','salad',-2,'生野菜の水分と菓子の食感が競合'],
 ['sweets','meat',-2,'甘い菓子と肉の味が強く競合'],['sweets','deli',-3,'惣菜の塩味と菓子の繊細さがぶつかる'],
 ['sweets','bento',-3,'弁当と菓子を一体化すると味が散る'],['salad','deli',1,'日常の食事に向く組み合わせ']
];
const key=(a,b)=>[a,b].sort().join('|'),table=new Map(pairs.map(([a,b,tier,reason])=>[key(a,b),{tier,reason}]));
const labels=['とても悪い','悪い','少し悪い','未知・中立','少し良い','良い','とても良い'];
function analyze(ingredients){
 const ids=[...new Set(Object.entries(ingredients).filter(([,n])=>n>0).map(([id])=>aliases[id]||id))].sort(),details=[];
 for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
  const found=table.get(key(ids[i],ids[j])),tier=found?.tier||0;
  details.push({a:ids[i],b:ids[j],tier,label:labels[tier+3],reason:found?.reason||'まだ方向性を決めない組み合わせ'});
 }
 const total=details.reduce((n,p)=>n+p.tier,0),bonus=Math.max(-24,Math.min(24,total*4));
 return {version:1,details,total,bonus,weak:Math.abs(total)<=1,jitter:Math.abs(total)<=1?8:0};
}
function distribution(base,a){
 if(!a)return base.slice();const jitter=a.weak?Array.from({length:17},(_,i)=>i-8):[0];
 let cumulative=0,previous=0;return base.map((p,q)=>{
  cumulative+=p;const boundary=q===6?1000:Math.min(1000,Math.ceil(cumulative*1000-1e-9));
  const cdf=boundary<=0?0:boundary>=1000?1:jitter.reduce((v,j)=>v+Math.max(0,Math.min(1000,boundary-(a.bonus+j)*10))/1000,0)/jitter.length;
  const result=Math.max(0,cdf-previous);previous=cdf;return result;
 });
}
function draw(s,base,a,rand){
 const raw=Math.floor(rand(s)*1000),random=a?.weak?Math.floor(rand(s)*17)-8:0,bonus=a?.bonus||0;
 const adjusted=Math.max(0,Math.min(999,raw+(bonus+random)*10));let cumulative=0,q=base.findLastIndex?base.findLastIndex(p=>p>0):6;
 for(let i=0;i<base.length;i++){cumulative+=base[i];if(adjusted<Math.ceil(cumulative*1000-1e-9)){q=i;break}}
 return {quality:q,raw:raw/10,compatibility:bonus,random,adjusted:adjusted/10};
}
const F={analyze,distribution,draw,labels};root.GCFlavor=F;if(typeof module!=='undefined')module.exports=F;
})(typeof globalThis!=='undefined'?globalThis:this);
