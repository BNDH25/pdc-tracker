/* PDC Tracker · Actions des boutons et restauration d'un fichier
   Script classique (pas un module) : les fichiers js/ partagent la même portée globale
   et sont chargés dans l'ordre fixé dans index.html. */
/* ---------- Actions ---------- */
function toast(m,ms,cls){const t=$('toast');t.className='toast'+(cls?' '+cls:'');t.textContent=m;void t.offsetWidth;t.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('show'),ms||1800)}
function confirmArm(name,msg){if(armed===name){armed=0;return true}armed=name;toast(msg||'Touchez à nouveau pour confirmer');setTimeout(()=>{if(armed===name)armed=0},3000);return false}
const hasData=()=>Object.keys(DB.days).length>0;
const actions={
  prev(){if(cur>START_D){cur=addDays(cur,-1);render()}},
  next(){if(cur<today0()){cur=addDays(cur,1);render()}},
  today(){if(+cur!==+today0()){cur=today0();render()}},
  tab(b){if(tab!==b.dataset.id){mnAlarmStop();tab=b.dataset.id;render(true);scrollTo(0,0)}},
  sub(b){if(pdcSub!==b.dataset.id){pdcSub=b.dataset.id;render(true)}},
  tog(b){const d=getDay(key(cur),true);if(d.locked){toast('Journée validée : touchez « Modifier »');return}d.obj[b.dataset.id]=!d.obj[b.dataset.id];if(b.dataset.id==='SPORT')d.sportAuto=false;save();render()},
  validate(){if(!confirmArm('validate','Touchez à nouveau pour valider'))return;getDay(key(cur),true).locked=true;save();render();toast('Journée validée')},
  unlock(){getDay(key(cur),true).locked=false;save();render()},
  sel(b){const id=b.dataset.id;exBig=exBig===id?null:id;sel=id;render()},
  add(){const v=ST.reps.get();if(!(v>0))return;const prevBest=bestEver(sel),d=getDay(key(cur),true),ex=EX.find(e=>e.id===sel);(d.sets[sel]=d.sets[sel]||[]).push(v);stepVal[sel]=0;syncSport(d);save();render();
    if(prevBest>0&&v>prevBest){toast(`Nouveau record : ${v} rép. (+${v-prevBest})`,3200,'rec');try{navigator.vibrate&&navigator.vibrate([60,50,140])}catch(e){}}
    else toast(`Série de ${v} validée`)},
  del(b){const d=getDay(key(cur));if(!d)return;d.sets[sel].splice(+b.dataset.i,1);syncSport(d);save();render()},
  saveC(){const c=dC();if(!(c.d>0&&c.t>0)){toast('Indiquez une distance et un temps');return}const d=getDay(key(cur),true);d.course={d:c.d,t:c.t,den:c.den};draftC=null;syncSport(d);save();render();toast('Course enregistrée')},
  delC(){const d=getDay(key(cur));if(d){d.course=null;syncSport(d)}draftC=null;save();render()},
  jeun(b){const p=dP();p.jeun=!p.jeun;b.classList.toggle('on',p.jeun)},
  saveP(){const p=dP();getDay(key(cur),true).poids={v:p.v,jeun:p.jeun};save();render();toast('Poids enregistré')},
  delP(){const d=getDay(key(cur));if(d)d.poids=null;draftP=null;save();render()},
  mnCustom(){if(mn.st!=='idle')return;mnEdit=true;render()},
  mnSet(b){if(mn.st!=='idle')return;mnEdit=false;const x=+b.dataset.s;mn={dur:x,st:'idle',end:0,left:x};mnSave();render()},
  mnStart(){mnAlarmStop();mnUnlock();const rem=mn.st==='pause'?mn.left:mn.dur;mn={dur:mn.dur,st:'run',end:Date.now()+rem*1000,left:rem};mnSave();mnLoop();wakeOn();render()},
  mnPause(){if(mn.st!=='run')return;const rem=mnRem();mn={dur:mn.dur,st:'pause',end:0,left:rem};mnSave();mnLoop();wakeOff();render()},
  mnReset(){mn={dur:mn.dur,st:'idle',end:0,left:mn.dur};mnSave();mnLoop();wakeOff();render()},
  pkStart(){pk={st:'run',t0:Date.now(),raw:0,val:0,manual:false};pkSave();clearInterval(pkTimer);pkTimer=setInterval(pkTick,250);wakeOn();render()},
  pkStop(){const s=(Date.now()-pk.t0)/1000;clearInterval(pkTimer);pkTimer=null;wakeOff();pk={st:'done',t0:pk.t0,raw:s,val:Math.max(5,Math.round(s/5)*5),manual:false};pkSave();render()},
  pkManual(){pk={st:'done',t0:Date.now(),raw:0,val:0,manual:true};pkSave();render()},
  pkAdd(){const v=pk.val;if(!(v>0))return;const prev=bestPlank(),d=getDay(key(cur),true);(d.planks=d.planks||[]).push(v);syncSport(d);pkReset();save();render();
    if(prev>0&&v>prev){toast(`Nouveau record : ${fmtDur(v)} (+${v-prev} s)`,3200,'rec');try{navigator.vibrate&&navigator.vibrate([60,50,140])}catch(e){}}
    else toast(`Série de ${fmtDur(v)} validée`)},
  pkCancel(){if(!confirmArm('pkc','Abandonner ce temps ? Touchez à nouveau'))return;pkReset();render()},
  pkDel(b){const d=getDay(key(cur));if(!d||!d.planks)return;d.planks.splice(+b.dataset.i,1);syncSport(d);save();render()},
  per(b){period=b.dataset.id;render()},
  export:doExport,
  save:doSave,
  async exportPrev(){const keep=cur;cur=prevRange(period).e;if(cur<START_D)cur=new Date(START_D);render();await doExport();cur=keep;render()},
  import(){$('importFile').click()},
  async snapRestore(b){let s;try{s=(await snapList()).find(x=>x.id===+b.dataset.id)}catch(e){}if(!s){toast('Copie introuvable');return}
    let d;try{d=JSON.parse(s.data);if(!isDB(d))throw 0}catch(e){toast('Copie illisible');return}
    const f=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});
    if(!await ask('Restaurer cette copie ?',`<p>Copie du ${f.format(new Date(s.at))}.</p>${cmpTable(d,'Copie')}<p class="muted">Vos données actuelles seront d'abord mises de côté dans les copies internes.</p>`,'Remplacer mes données'))return;
    await replaceData(d,'Copie restaurée')},
  undoImport(){if(!confirmArm('undo','Revenir aux données d\'avant l\'import ? Touchez à nouveau'))return;
    try{const d=JSON.parse(lsGet(SK_PREV));if(!isDB(d))throw 0;DB=normDB({days:d.days,meta:d.meta||{}});lsDel(SK_PREV);resetDrafts();save();render();toast('Restauration annulée')}catch(e){toast('Copie précédente illisible')}}
};
function resetDrafts(){draftC=draftP=null;stepVal={}}
document.addEventListener('click',ev=>{const b=ev.target.closest('[data-a]');if(b&&actions[b.dataset.a])actions[b.dataset.a](b)});
$('importFile').addEventListener('change',async ev=>{const f=ev.target.files[0];ev.target.value='';if(!f)return;
  if(f.size>5e6){await ask('Restauration impossible','<p>Fichier trop volumineux pour être une sauvegarde de l\'app.</p><p class="muted">Rien n\'a été modifié.</p>','OK',false,true);return}
  let txt;try{txt=await f.text()}catch(e){toast('Fichier illisible : rien n\'a été modifié',2600);return}
  const c=checkBackup(txt);if(c.err){await ask('Restauration impossible',`<p>${c.err}</p><p class="muted">Rien n'a été modifié.</p>`,'OK',false,true);return}
  const when=c.data.exportedAt?new Date(c.data.exportedAt):new Date(f.lastModified),wf=new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
  if(!await ask('Restaurer cette sauvegarde ?',`<p><b>${esc(f.name)}</b><br>Créée le ${isNaN(when)?'(date inconnue)':wf.format(when)}${c.v?'':' · ancien format, compatible'}</p>${cmpTable(c.data,'Fichier')}<p class="muted">${hasData()?'Vos données actuelles seront d\'abord mises de côté dans les copies internes.':'Aucune donnée actuelle sur ce téléphone.'}</p>`,'Remplacer mes données'))return;
  await replaceData(c.data,`Sauvegarde restaurée (${(n=>`${n} jour${n>1?'s':''}`)(Object.keys(normDB(c.data).days).length)})`)});
