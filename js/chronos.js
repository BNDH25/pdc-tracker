/* PDC Tracker · Chrono de gainage et minuteur de repos (alerte de fin)
   Script classique (pas un module) : les fichiers js/ partagent la même portée globale
   et sont chargés dans l'ordre fixé dans index.html. */
/* ---------- Gainage : chrono, correction avant enregistrement ---------- */
const PK_K=SK+'-chrono';
let pk={st:'idle',t0:0,raw:0,val:0,manual:false},pkTimer=null,wake=null;
try{const s=JSON.parse(lsGet(PK_K)||'null');if(s&&(s.st==='run'||s.st==='done')&&s.t0>0)pk={st:s.st,t0:s.t0,raw:+s.raw||0,val:+s.val>0?+s.val:0,manual:!!s.manual}}catch(e){}
const pkSave=()=>{if(pk.st==='idle')lsDel(PK_K);else lsSet(PK_K,JSON.stringify(pk))};
const fmtDur=s=>{s=Math.max(0,Math.round(s));return`${Math.floor(s/60)}:${pad(s%60)}`};
const pkElapsed=()=>pk.st==='run'?Math.max(0,(Date.now()-pk.t0)/1000):pk.raw;
function pkReset(){clearInterval(pkTimer);pkTimer=null;wakeOff();pk={st:'idle',t0:0,raw:0,val:0,manual:false};pkSave()}
function bestPlank(){let b=0;for(const d of Object.values(DB.days))if(d.planks)for(const v of d.planks)if(v>b)b=v;return b}
async function wakeOn(){try{if(navigator.wakeLock&&!wake){wake=await navigator.wakeLock.request('screen');wake.addEventListener('release',()=>{wake=null})}}catch(e){}}
function wakeOff(){try{wake&&wake.release()}catch(e){}wake=null}
function pkTick(){const el=$('pk-time');if(el)el.textContent=fmtDur(pkElapsed())}
/* ---------- Minuteur de repos : hors bilans ---------- */
const MN_K=SK+'-minuteur',MN_P=[60,90,120,150,180];
let mn={dur:60,st:'idle',end:0,left:60},mnTimer=null;
try{const s=JSON.parse(lsGet(MN_K)||'null');if(s&&+s.dur>=5&&+s.dur<=3600)mn={dur:+s.dur,st:s.st==='run'||s.st==='pause'?s.st:'idle',end:+s.end||0,left:+s.left>0?+s.left:+s.dur}}catch(e){}
const mnSave=()=>lsSet(MN_K,JSON.stringify(mn));
const mnRem=()=>mn.st==='run'?Math.max(0,(mn.end-Date.now())/1000):mn.st==='pause'?mn.left:mn.dur;
function mnTick(){if(mn.st==='run'&&mnRem()<=0){mnDone(Date.now()-mn.end>10000);return}const el=$('mn-time');if(el)el.textContent=fmtDur(Math.ceil(mnRem()))}
function mnLoop(){clearInterval(mnTimer);mnTimer=mn.st==='run'?setInterval(mnTick,250):null}
let mnAc=null;
function mnUnlock(){try{mnAc=mnAc||new (window.AudioContext||window.webkitAudioContext)();if(mnAc.resume)mnAc.resume()}catch(e){}}
/* Carillon doux (deux notes sinus), volume modéré */
let mnOsc=[];
function mnSound(){try{if(!mnAc)return;const t=mnAc.currentTime,mk=(f,t0,dur,vol)=>{const o=mnAc.createOscillator(),g=mnAc.createGain();o.type='sine';o.frequency.setValueAtTime(f,t+t0);
  g.gain.setValueAtTime(0,t+t0);g.gain.linearRampToValueAtTime(vol,t+t0+.03);g.gain.exponentialRampToValueAtTime(.0001,t+t0+dur);o.connect(g);g.connect(mnAc.destination);o.start(t+t0);o.stop(t+t0+dur+.02);
  mnOsc.push(o);o.onended=()=>{mnOsc=mnOsc.filter(x=>x!==o)}};
  mk(880,0,.9,.16);mk(1318.5,.18,1.1,.11)}catch(e){}}
/* Alerte de fin : pulsation du fond et de la carte, bip doux toutes les 2 s et vibration en boucle jusqu'au toucher ; arrêt auto à 10 min */
let mnAl=null;const MN_SND_GAP=2000,MN_VIB=[500,300,500],MN_VIB_GAP=2400,MN_AL_MAX=600000;
const mnVib=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
function mnAlarmStart(){mnAlarmStop();const a={n:0,snd:null,vib:null,max:null};mnAl=a;
  const ring=()=>{if(mnAl!==a)return;a.n++;mnSound()};
  ring();a.snd=setInterval(ring,MN_SND_GAP);
  mnVib(MN_VIB);a.vib=setInterval(()=>mnVib(MN_VIB),MN_VIB_GAP);
  a.max=setTimeout(mnAlarmStop,MN_AL_MAX);
  document.addEventListener('pointerdown',mnAlarmStop,true);document.addEventListener('touchstart',mnAlarmStop,true);
  wakeOn();const c=$('mn-time');if(c)c.classList.add('fin');
  let f=$('flash');if(!f){f=document.createElement('div');f.id='flash';document.body.appendChild(f)}f.className='on'}
/* Le premier toucher arrête seulement l'alerte : il est absorbé (aucun bouton déclenché), puis tout redevient normal */
function mnEat(e){e.preventDefault();e.stopImmediatePropagation()}
function mnAlarmStop(ev){if(!mnAl)return;
  if(ev&&ev.type){mnEat(ev);document.addEventListener('click',mnEat,{capture:true,once:true});setTimeout(()=>document.removeEventListener('click',mnEat,true),800)}const a=mnAl;mnAl=null;clearInterval(a.snd);clearInterval(a.vib);clearTimeout(a.max);
  document.removeEventListener('pointerdown',mnAlarmStop,true);document.removeEventListener('touchstart',mnAlarmStop,true);
  mnOsc.forEach(o=>{try{o.stop()}catch(e){}});mnOsc=[];mnVib(0);
  if(mn.st!=='run')wakeOff();const c=$('mn-time');if(c)c.classList.remove('fin');const f=$('flash');if(f)f.className=''}
function mnDone(silent){clearInterval(mnTimer);mnTimer=null;wakeOff();mn={dur:mn.dur,st:'idle',end:0,left:mn.dur};mnSave();
  if(!silent){mnAlarmStart();toast('Repos terminé',2500,'rec')}
  if(tab==='chrono')render()}
function mnBoot(){if(mn.st==='run'){if(mnRem()<=0)mnDone(Date.now()-mn.end>10000);else{mnLoop();wakeOn()}}}
let mnEdit=false;
function mnSetDur(x){x=Math.min(5999,Math.max(5,Math.round(x)));mn={dur:x,st:'idle',end:0,left:x};mnSave();const el=$('mn-time');if(el)el.textContent=fmtDur(x)}
function vMinuteur(){const r=mn.st,t=Math.ceil(mnRem()),cust=!MN_P.includes(mn.dur)||mnEdit,dis=r!=='idle'?'disabled':'';
  return `<div class="mview"><div class="card pad mcard"><div class="chrono well ${r==='run'?'run':''} ${mnAl?'fin':''}" id="mn-time">${fmtDur(t)}</div>
    <div class="mnp">${MN_P.map(x=>`<button class="raise ${!cust&&mn.dur===x?'on':''}" data-a="mnSet" data-s="${x}" ${dis}>${fmtDur(x)}</button>`).join('')}<button class="raise ${cust?'on':''}" data-a="mnCustom" ${dis}>Perso</button></div>
    ${cust&&r==='idle'?`<div class="mncust">${stepper('mnm','min','Minutes')}${stepper('mns','s','Secondes')}</div>`:''}
    <button class="primary" data-a="${r==='run'?'mnPause':'mnStart'}">${r==='run'?'Arrêter':r==='pause'?'Reprendre':'Démarrer'}</button>
    <button class="ghost raise" data-a="mnReset">Réinitialiser</button></div></div>`}
