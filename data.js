/* ごちそうカンパニー v58 — self-contained content data. */
(function(root){'use strict';
const D={version:'58',schema:3,rules:'2.3.0',content:'58.0',ranks:['E','D','C','B','A','S','SS'],rankNames:['素朴','ふつう','良品','上質','特選','逸品','名品']};
D.items={
 wheat:{name:'小麦',kind:'raw',price:50,cost:12,tags:['香ばしい'],farm:true},
 vegetable:{name:'野菜',kind:'raw',price:60,cost:15,tags:['さっぱり','彩り'],farm:true},
 meat:{name:'肉',kind:'raw',price:210,cost:140,tags:['濃厚','満足'],buy:true},
 milk:{name:'牛乳',kind:'raw',price:160,cost:90,tags:['まろやか'],buy:true},
 premiumWheat:{name:'高級小麦',kind:'raw',price:340,cost:210,tags:['香ばしい'],buy:true,rare:true},
 freshVegetable:{name:'朝採れ野菜',kind:'raw',price:330,cost:200,tags:['さっぱり','彩り'],buy:true,rare:true},
 brandMeat:{name:'ブランド肉',kind:'raw',price:600,cost:380,tags:['濃厚','満足'],buy:true,rare:true},
 richMilk:{name:'濃厚ミルク',kind:'raw',price:480,cost:280,tags:['まろやか','濃厚'],buy:true,rare:true},
 flour:{name:'小麦粉',kind:'material',price:130,recipe:{wheat:2},fee:10,tags:['香ばしい'],unlock:0},
 bread:{name:'焼きたてパン',kind:'food',price:280,recipe:{flour:1},fee:20,tags:['香ばしい','携帯'],unlock:0},
 salad:{name:'彩りサラダ',kind:'food',price:300,recipe:{vegetable:2},fee:20,tags:['さっぱり','彩り'],unlock:0},
 deli:{name:'おうちの惣菜',kind:'food',price:540,recipe:{vegetable:1,meat:1},weights:{vegetable:.35,meat:.65},fee:30,tags:['家庭的','満足'],unlock:1},
 sweets:{name:'ひだまりケーキ',kind:'food',price:590,recipe:{flour:1,milk:1},weights:{flour:.65,milk:.35},fee:40,tags:['まろやか','彩り'],unlock:2},
 premiumBread:{name:'黄金のクロワッサン',kind:'food',price:860,recipe:{flour:2,milk:1},weights:{flour:.7,milk:.3},fee:65,tags:['香ばしい','濃厚'],unlock:2,qualityUnlock:2},
 bento:{name:'まんぷく弁当',kind:'food',price:1100,recipe:{deli:1,vegetable:1},weights:{deli:.75,vegetable:.25},fee:55,tags:['家庭的','携帯','満足'],unlock:3},
 milkBread:{name:'ミルクパン',kind:'food',price:820,recipe:{flour:1,milk:1},weights:{flour:.65,milk:.35},fee:40,tags:['まろやか','家庭的','携帯'],unlock:2,dev:true,region:'shopping',devCost:1200},
 brandSweets:{name:'宝石のカップケーキ',kind:'food',price:1550,recipe:{sweets:1,richMilk:1},weights:{sweets:.7,richMilk:.3},fee:80,tags:['彩り','濃厚'],unlock:4},
 staminaBento:{name:'スタミナ弁当',kind:'food',price:1700,recipe:{deli:1,brandMeat:1},weights:{deli:.6,brandMeat:.4},fee:80,tags:['満足','携帯'],unlock:3,dev:true,region:'city',devCost:2500},
 fruitParfait:{name:'ご当地パフェ',kind:'food',price:1800,recipe:{sweets:1,richMilk:1},weights:{sweets:.6,richMilk:.4},fee:90,tags:['彩り','まろやか'],unlock:4,dev:true,region:'prefecture',devCost:3800},
 luxurySet:{name:'ごちそうギフト',kind:'food',price:3200,recipe:{premiumBread:1,brandSweets:1},weights:{premiumBread:.6,brandSweets:.4},fee:120,tags:['香ばしい','彩り','濃厚'],unlock:5,dev:true,region:'national',devCost:6000}
};
D.roles={farm:{name:'農家',stat:'production',desc:'収穫量・素材育成'},workshop:{name:'職人',stat:'craft',desc:'品質・バッチ効率'},sales:{name:'営業',stat:'sales',desc:'仕入れ小口化・契約'},lab:{name:'研究員',stat:'research',desc:'日次研究P'},warehouse:{name:'物流',stat:'logistics',desc:'容量・入庫時の保存'}};
D.staff=[
 {id:'minori',name:'みのり',role:'farm',color:'#e8ad46',trait:'畑の名人',special:'harvest',rarity:'通常',cost:900,stats:[8,2,3,2,4],line:'土の様子、今日はいい感じです。'},
 {id:'komugi',name:'こむぎ',role:'workshop',color:'#df8067',trait:'パンへの情熱',special:'bread',rarity:'通常',cost:1200,stats:[3,8,3,3,2],line:'この焼き色、覚えておきたいですね。'},
 {id:'aoi',name:'あおい',role:'sales',color:'#729fc6',trait:'小口の交渉人',special:'small',rarity:'レア',cost:2000,stats:[2,4,10,3,5],line:'必要な分だけ。相談してみましょう。'},
 {id:'shiori',name:'しおり',role:'lab',color:'#a693bc',trait:'試作ノート',special:'study',rarity:'レア',cost:2400,stats:[3,5,2,10,3],line:'うまくいかなかった理由も、発見です。'},
 {id:'haru',name:'はる',role:'warehouse',color:'#76aa91',trait:'鮮度の番人',special:'fresh',rarity:'レア',cost:1900,stats:[4,2,5,3,10],line:'先に届いた箱から、使いましょう。'},
 {id:'ren',name:'れん',role:'workshop',color:'#b4896a',trait:'大量調理',special:'batch',rarity:'レア',cost:2800,stats:[3,9,4,3,4],line:'同じ味を、たくさんの人へ。'},
 {id:'yui',name:'ゆい',role:'workshop',color:'#d886aa',trait:'繊細な仕上げ',special:'finish',rarity:'激レア',cost:4200,stats:[2,12,3,6,2],line:'最後のひと手間に、気持ちを込めて。'},
 {id:'souta',name:'そうた',role:'sales',color:'#709c9d',trait:'地域のつなぎ役',special:'local',rarity:'通常',cost:1500,stats:[4,3,8,2,5],line:'おいしかったって、聞いてきました。'}
];
D.recruitment={
 flyer:{name:'町のチラシ',cost:300,count:2,odds:[80,18,2,0],guarantee:0,desc:'小さな予算で、地元の仲間を探す。'},
 listing:{name:'求人サイト',cost:1200,count:3,odds:[50,38,11,1],guarantee:1,desc:'1人目はレア以上。必要な職種を着実に補う。'},
 network:{name:'ネット求人広告',cost:3000,count:4,odds:[22,48,26,4],guarantee:1,desc:'幅広い応募から、専門性のある仲間を選ぶ。'},
 commercial:{name:'テレビCM',cost:6500,count:6,odds:[5,35,48,12],guarantee:2,desc:'1人目は激レア以上。大きな募集で出会いを広げる。'}
};
D.staffRarities=['通常','レア','激レア','伝説'];
D.staffSkills={harvest:{name:'畑の名人',desc:'農家担当時、生産バッチ＋1個。'},bread:{name:'パンへの情熱',desc:'職人担当時、パン類の品質分布を改善。'},batch:{name:'大量調理',desc:'職人担当時、加工バッチ＋2個。'},finish:{name:'繊細な仕上げ',desc:'職人担当・丁寧製造時、品質分布を改善。'},small:{name:'小口の交渉人',desc:'営業担当時、1個単位で仕入れ可能。'},local:{name:'地域のつなぎ役',desc:'営業担当時、町内の契約報酬＋5%。'},study:{name:'試作ノート',desc:'研究担当時、毎日の研究P＋4。'},fresh:{name:'鮮度の番人',desc:'物流担当時、新規入庫の保管期間＋1営業日。'}};
D.finance={workPay:220,aid:1000,aidThreshold:500,aidInterval:7,reliefDays:3,saleLimit:10,autoTarget:1200};
D.customers=[
 {id:'sakura',name:'さくらさん',place:'町の喫茶室',segment:'家族層',region:'town',tags:['家庭的','香ばしい'],use:'朝食とおやつ',lines:['いつもの朝が、ちょっと楽しみに。','このパンを目当てに来る人が増えました。','うちの定番、あなたの会社の味です。','記念日の一皿も、お願いしたいです。']},
 {id:'rikuto',name:'りくとくん',place:'放課後クラブ',segment:'学生',region:'town',tags:['携帯','満足'],use:'放課後の差し入れ',lines:['みんなで分けて食べます！','次の練習の日にも頼みたいな。','うちのチーム公認の味だね。','大会の応援弁当、お願い！']},
 {id:'momo',name:'ももさん',place:'商店街の本屋',segment:'子ども',region:'shopping',tags:['彩り','まろやか'],use:'読み聞かせ会',lines:['お話のあとに、みんなでおやつ。','子どもたちが名前を覚えました。','次は絵本みたいなお菓子を。','商店街のお祭りでも紹介します。']},
 {id:'makoto',name:'まことさん',place:'駅前デザイン室',segment:'会社員',region:'city',tags:['携帯','満足'],use:'会議の昼食',lines:['仕事の合間に、ほっとできます。','会議の人気メニューになりました。','新しいチームにも紹介します。','大切なお客さまの日も頼みます。']},
 {id:'nagi',name:'なぎさん',place:'旅の案内所',segment:'観光客',region:'prefecture',tags:['彩り','携帯'],use:'旅のおみやげ',lines:['この町らしい、おいしさですね。','旅の思い出に選ばれています。','遠くからお問い合わせが来ました。','町の名物として紹介します。']},
 {id:'kaede',name:'かえでさん',place:'小さなホテル',segment:'富裕層',region:'national',tags:['濃厚','香ばしい'],use:'記念日の贈り物',lines:['丁寧な仕事が伝わります。','記念日の一皿にぴったりでした。','あなたの看板商品を、ぜひ。','全国のお客さまに届けましょう。']},
 {id:'sora',name:'そらさん',place:'海の向こうの食卓',segment:'観光客',region:'overseas',tags:['家庭的','彩り'],use:'日本の食の紹介',lines:['遠くの食卓が、近くなりました。','この味の物語も伝えたいです。','次のごちそうも楽しみです。','海を越える定番になりました。']}
];
D.regions={town:{name:'こもれび町',short:'町内',cost:0,lv:1,rep:0,tags:['家庭的','香ばしい'],desc:'日常食の安定需要。基礎商品で関係を育てやすい。',goal:'町内納品 8件'},shopping:{name:'花咲く商店街',short:'商店街',cost:3500,lv:3,rep:12,tags:['まろやか','家庭的'],desc:'子どもの催しと差し入れ。ミルクパン開発の入口。',goal:'商店街納品 8件'},city:{name:'あさひ市',short:'市内',cost:7000,lv:5,rep:25,tags:['携帯','満足'],desc:'会議の昼食とまとめ注文。弁当の活躍する街。',goal:'市内納品 8件'},prefecture:{name:'みなと観光圏',short:'県内',cost:13000,lv:7,rep:45,tags:['彩り','携帯'],desc:'旅のおみやげとご当地パフェ。見た目もおいしさ。',goal:'県内納品 8件'},national:{name:'全国の食卓',short:'全国',cost:22000,lv:10,rep:65,tags:['濃厚','香ばしい'],desc:'記念日の贈り物と指名注文。品質の安定が鍵。',goal:'全国納品 8件'},overseas:{name:'海の向こう',short:'海外',cost:38000,lv:13,rep:90,tags:['家庭的','彩り'],desc:'日本の食と物語を届ける。高品質ギフトに機会。',goal:'海外納品 8件'}};
D.facilities={farm:{name:'畑',base:900,desc:'生産枠＋1・1バッチ＋1'},workshop:{name:'工房',base:1200,desc:'加工枠＋1・品質分布が改善'},warehouse:{name:'倉庫',base:850,desc:'容量＋16・Lv3/5で保管期間＋1'},lab:{name:'研究室',base:1400,desc:'毎日の研究P＋4'}};
D.research={production:{name:'生産研究',desc:'生産バッチ＋1・素材育成＋1',base:18},processing:{name:'加工研究',desc:'加工バッチ＋1・Lv2ごとに加工枠＋1',base:22},quality:{name:'品質研究',desc:'品質分布を改善・高級パンを解放',base:26},storage:{name:'倉庫管理',desc:'容量＋8・Lv3で入庫時の保存＋1日',base:20},sales:{name:'販売研究',desc:'契約補正＋4%・Lv2ごとに受注枠＋1',base:24},recipe:{name:'レシピ研究',desc:'惣菜→ケーキ→弁当→高級菓子→ギフト',base:25}};
D.policies={standard:{name:'標準',size:1,quality:0,fee:1},mass:{name:'量産',size:1.65,quality:-.65,fee:.85},careful:{name:'丁寧',size:.6,quality:1,fee:1.3},trial:{name:'試作',size:.45,quality:.25,fee:1.4}};
D.auto={autoWheat:{name:'自動小麦畑',item:'wheat',cost:2000,lv:2},autoVeg:{name:'自動野菜畑',item:'vegetable',cost:2200,lv:2},flourMill:{name:'製粉所',item:'flour',cost:3000,lv:3},breadFactory:{name:'パン工房ライン',item:'bread',cost:4500,lv:4},saladKitchen:{name:'サラダ工房',item:'salad',cost:4200,lv:4},premiumLine:{name:'高級パンライン',item:'premiumBread',cost:7000,lv:6}};
D.contests={breadCup:{name:'こもれびパン祭り',first:15,period:30,tag:'香ばしい',product:'bread',fee:200,prize:2800},saladFest:{name:'夏の彩りフェス',first:30,period:60,tag:'さっぱり',product:'salad',fee:350,prize:4500},sweetsCup:{name:'秋のごちそう展',first:45,period:60,tag:'彩り',product:null,fee:600,prize:7000},nationalFeast:{name:'全国ごちそう品評会',first:60,period:60,tag:'家庭的',original:true,fee:1000,prize:12000}};
D.rivals={volume:{name:'まんぷく食品',style:'量産型',tag:'満足',threshold:47,fee:350,reward:1500,bonus:'量産の加工直接費 −10%'},luxury:{name:'月白アトリエ',style:'高級型',tag:'濃厚',threshold:70,fee:650,reward:3000,bonus:'高品質契約の補正 ＋5%'},local:{name:'おとなり食堂',style:'地域密着型',tag:'家庭的',threshold:42,fee:300,reward:1200,bonus:'町内契約の補正 ＋5%'},lab:{name:'ひらめきキッチン',style:'研究型',tag:'彩り',threshold:65,fee:550,reward:2500,bonus:'毎日の研究P ＋3'}};
D.seasons=[{name:'春',tag:'彩り',color:'#e5efe0',hint:'行楽と新生活。彩りのあるごちそうが人気。'},{name:'夏',tag:'さっぱり',color:'#dbefeb',hint:'軽い食事と涼やかなおやつ。'},{name:'秋',tag:'香ばしい',color:'#f3e3c4',hint:'香ばしさがおいしい実りの季節。'},{name:'冬',tag:'濃厚',color:'#e5edf1',hint:'濃厚な味と贈り物が喜ばれます。'}];
D.trends=[{name:'健康ブーム',tag:'さっぱり'},{name:'パン日和',tag:'香ばしい'},{name:'SNS映え',tag:'彩り'},{name:'節約上手',tag:'家庭的'},{name:'小さな贅沢',tag:'濃厚'}];
D.events=[
 {name:'朝市からのお誘い',body:'翌営業日は仕入れが20%引き。今日の契約条件は変わりません。',kind:'sale',options:[['invite','案内を受け取る','明日の仕入れ −20%'],['research','素材の話を聞く','研究P ＋12']]},
 {name:'職人のひらめき',body:'次の一皿に生かせそうなメモが届きました。',kind:'idea',options:[['quality','仕上げを学ぶ','研究P ＋18'],['growth','育成を進める','全スタッフ経験 ＋3']]},
 {name:'地元テレビの取材',body:'どんな会社として紹介してもらいましょう？',kind:'tv',options:[['local','町の定番を紹介','評判 ＋3'],['study','開発の工夫を紹介','研究P ＋15']]},
 {name:'原料価格の高騰予告',body:'翌営業日の新規仕入れは20%増。今日の契約報酬は変わりません。',kind:'price',options:[['deal','協同仕入れで備える','資金200円で翌日の高騰を回避'],['accept','在庫中心で乗り切る','費用なし・翌日だけ仕入れ＋20%']]},
 {name:'急な団体注文',body:'町の集まりでサラダが必要に。受注枠と当日の受注上限を使います。',kind:'group',options:[['order','条件を見て候補に加える','サラダ4個・E以上・3日間'],['skip','今回は見送る','損失なし']]},
 {name:'うれしい口コミ',body:'「また食べたい」が町に広がっています。',kind:'word',options:[['rep','お礼を伝える','評判 ＋3'],['learn','感想を開発に生かす','研究P ＋12']]},
 {name:'設備点検の相談',body:'翌営業日の工房効率が落ちる予兆。今なら簡単な点検で備えられます。',kind:'repair',options:[['fix','予防点検を行う','200円・通常通り'],['slow','少量ずつ丁寧に動かす','費用なし・翌日の加工バッチ −1']]},
 {name:'配送便の遅延予告',body:'運送費が上がりそう。受注済み注文の期限は変えません。',kind:'delivery',options:[['pay','代替便を手配','150円・影響なし'],['negotiate','共同便を相談','研究P10・影響なし'],['wait','明日は自社で運ぶ','翌日の営業補正なし・納品は可能']]}
];
D.scenarios={standard:{name:'はじめての会社',desc:'60日で、あなたらしい会社を。',days:60,money:6000},small:{name:'小さな倉庫の大きな工夫',desc:'30日間・倉庫容量24から。廃棄10個以下、納品20件。',days:30,money:6000},luxury:{name:'ひと皿の贅沢',desc:'30日間・加工枠2から。A以上を10個製造。',days:30,money:9000},local:{name:'町のいつもの味',desc:'30日間・町内市場に専念。常連2人と信頼関係を築く。',days:30,money:5000},team:{name:'ふたりの品評会',desc:'60日間・スタッフ最大2人。全国品評会で入賞を目指す。',days:60,money:7000}};
root.GCData=D;if(typeof module!=='undefined')module.exports=D;
})(typeof globalThis!=='undefined'?globalThis:this);
