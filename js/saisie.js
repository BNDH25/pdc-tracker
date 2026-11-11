/* PDC Tracker · Saisie : brouillons course/poids, steppers (appui long)
   Script classique (pas un module) : les fichiers js/ partagent la même portée globale
   et sont chargés dans l'ordre fixé dans index.html. */
function dC(){const k=key(cur);if(!draftC||draftC.k!==k)draftC={k,d:0,t:0,den:0};return draftC}
function dP(){const k=key(cur);if(!draftP||draftP.k!==k){const s=(DB.days[k]||{}).poids,l=s||findBack(d=>d.poids&&d.poids.v?d.poids:null)||{v:75,jeun:true};draftP={k,v:l.v,jeun:s?!!s.jeun:true}}return draftP}

/* ---------- Steppers (appui long = défilement rapide) ---------- */
const ST={
  reps:{step:1,min:0,max:500,dec:0,get:()=>stepVal[sel]??0,set:v=>stepVal[sel]=v},
  cd:{step:.1,min:0,max:300,dec:1,get:()=>dC().d,set:v=>dC().d=v},
  ct:{step:1,min:0,max:1440,dec:0,get:()=>dC().t,set:v=>dC().t=v},
  cden:{step:10,min:0,max:9000,dec:0,get:()=>dC().den,set:v=>dC().den=v},
  pv:{step:.1,min:20,max:300,dec:1,get:()=>dP().v,set:v=>dP().v=v},
  mnm:{step:1,min:0,max:99,dec:0,get:()=>Math.floor(mn.dur/60),set:v=>mnSetDur(v*60+mn.dur%60)},
  mns:{step:1,min:0,max:59,dec:0,get:()=>mn.dur%60,set:v=>mnSetDur(Math.floor(mn.dur/60)*60+v)},
  pt:{step:5,snap:5,min:0,max:3600,dec:0,get:()=>pk.val,set:v=>pk.val=v}};
const fmtV=(id,v)=>num(v,ST[id].dec);
function stepper(id,unit,label,big){return `<div class="stp ${big?'big':''}">${label?`<div class="stl">${label}</div>`:''}<div class="stc">
  <button class="sbtn raise" data-st="${id}" data-dir="-1" aria-label="Diminuer">−</button>
  <label class="stw well"><input id="in-${id}" data-in="${id}" inputmode="decimal" autocomplete="off" value="${fmtV(id,ST[id].get())}"><span>${unit}</span></label>
  <button class="sbtn raise" data-st="${id}" data-dir="1" aria-label="Augmenter">+</button></div></div>`}
function bump(id,delta){const c=ST[id],f=10**c.dec;let v;
  if(c.snap){v=c.get();for(let i=0;i<Math.abs(delta);i++)v=delta>0?Math.floor(v/c.snap+1e-9)*c.snap+c.snap:Math.ceil(v/c.snap-1e-9)*c.snap-c.snap}
  else v=Math.round((c.get()+delta*c.step)*f)/f;
  v=Math.min(c.max,Math.max(c.min,v));c.set(v);const el=$('in-'+id);if(el)el.value=fmtV(id,v);after(id)}
/* Validation impossible tant que la valeur principale est à 0 */
function gate(){const q=a=>document.querySelector(`[data-a="${a}"]`),b1=q('add'),b2=q('pkAdd'),b3=q('saveC');
  if(b1)b1.disabled=!(ST.reps.get()>0);if(b2)b2.disabled=!(pk.val>0);if(b3){const c=dC();b3.disabled=!(c.d>0&&c.t>0)}}
function after(id){gate();if(id[0]==='c'){const c=dC(),p=$('pace');if(p)p.textContent=fmtPace(c.t,c.d)}
  if(id==='pt'){const h=$('pk-fmt');if(h)h.textContent=fmtDur(pk.val)}}
let rep=null;
document.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-st]');if(!b)return;e.preventDefault();const id=b.dataset.st,dir=+b.dataset.dir;let n=0;
  const tick=()=>{n++;bump(id,dir*(n>15?5:1))};tick();clearTimeout(rep);rep=setTimeout(function loop(){tick();rep=setTimeout(loop,n>15?70:110)},420)});
['pointerup','pointercancel'].forEach(t=>document.addEventListener(t,()=>{clearTimeout(rep);rep=null}));
document.addEventListener('pointerout',e=>{if(e.target.closest&&e.target.closest('[data-st]')){clearTimeout(rep);rep=null}});
document.addEventListener('input',e=>{const id=e.target.dataset.in;if(!id)return;const v=parseFloat(e.target.value.replace(',','.'));const c=ST[id];if(!isNaN(v)){c.set(Math.min(c.max,Math.max(c.min,v)));after(id)}});
document.addEventListener('focusout',e=>{const id=e.target.dataset&&e.target.dataset.in;if(id)e.target.value=fmtV(id,ST[id].get())});
document.addEventListener('focusin',e=>{if(e.target.dataset&&e.target.dataset.in)setTimeout(()=>e.target.select(),0)});
