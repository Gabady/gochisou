/* Browser capabilities are optional: an unavailable API must not stop the game. */
(function(root){'use strict';
const doc=root.document;
const local=/^(file|content):$/.test(root.location.protocol);
const playURL=doc.querySelector('meta[name="game-play-url"]')?.content||'';
let savedY=0,lastFocus=null,modal=false;
function layout(){
  const vv=root.visualViewport,h=vv?.height||root.innerHeight,offset=vv?.offsetTop||0;
  doc.documentElement.style.setProperty('--visible-height',h+'px');
  doc.documentElement.style.setProperty('--visible-top',offset+'px');
  const nav=doc.getElementById('nav'),day=doc.getElementById('daybar');
  const navH=nav?.offsetHeight||80,dayH=day?.offsetHeight||85;
  doc.documentElement.style.setProperty('--nav-height',navH+'px');
  doc.documentElement.style.setProperty('--bottom-space',(navH+dayH+30)+'px');
  const editing=/^(INPUT|TEXTAREA|SELECT)$/.test(doc.activeElement?.tagName||'');
  doc.body.classList.toggle('keyboard-open',editing&&h<root.innerHeight-120);
}
function opened(){
  if(!modal){savedY=root.scrollY;lastFocus=doc.activeElement;modal=true;doc.body.style.top=-savedY+'px';doc.body.classList.add('modal-open')}
  const d=doc.getElementById('sheet');
  if(!d.open){if(typeof d.showModal==='function')d.showModal();else{d.setAttribute('open','');d.setAttribute('aria-modal','true');d.setAttribute('role','dialog');doc.body.classList.add('dialog-fallback')}}
  layout();
}
function closed(){
  const d=doc.getElementById('sheet');
  if(d.open){if(typeof d.close==='function')d.close();else d.removeAttribute('open')}
  if(!modal)return;
  modal=false;doc.body.classList.remove('modal-open','dialog-fallback');doc.body.style.top='';root.scrollTo(0,savedY);
  if(lastFocus?.isConnected)try{lastFocus.focus({preventScroll:true})}catch(e){}
  layout();
}
function readText(file){if(typeof file.text==='function')return file.text();return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(Error('ファイルを読み込めませんでした'));reader.readAsText(file)})}
function shareable(text,name){try{if(typeof File==='undefined'||!root.navigator?.canShare||!root.navigator.share)return null;const files=[new File([text],name,{type:'application/json'})];return root.navigator.canShare({files})?{files}:null}catch(e){return null}}
function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=doc.createElement('a');a.href=url;a.download=name;doc.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
function ready(){const boot=doc.getElementById('boot-panel');if(boot)boot.hidden=true;layout()}
root.addEventListener('resize',layout);
root.visualViewport?.addEventListener('resize',layout);
root.visualViewport?.addEventListener('scroll',layout);
doc.addEventListener('focusin',layout);doc.addEventListener('focusout',()=>setTimeout(layout,0));
doc.getElementById('sheet')?.addEventListener('cancel',e=>{e.preventDefault();closed()});
doc.getElementById('sheet')?.addEventListener('close',()=>{if(!doc.getElementById('sheet').open)closed()});
if(root.ResizeObserver){const observer=new ResizeObserver(layout);for(const id of ['nav','daybar']){const el=doc.getElementById(id);if(el)observer.observe(el)}}
root.GCPlatform={local,playURL,layout,opened,closed,readText,shareable,download,ready};
})(window);
