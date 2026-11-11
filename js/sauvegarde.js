/* PDC Tracker · Sauvegarde : copies internes (IndexedDB), export, restauration
   Script classique (pas un module) : les fichiers js/ partagent la même portée globale
   et sont chargés dans l'ordre fixé dans index.html. */
/* ---------- Système de sauvegarde ----------
   1. Copies internes (IndexedDB) : une copie par jour, à 00:05 si l'app est ouverte, sinon dès
      qu'elle est rouverte (un iPhone ne laisse pas une app web travailler fermée). 7 jours gardés,
      + copies faites avant chaque restauration / effacement (3 gardées).
   2. Rappel : bandeau si la dernière sauvegarde externe date de plus de 7 jours.
   3. Sauvegarder : 2 fichiers au nom de l'app + date : JSON (pour restaurer) et PDF (bilan lisible).
   4. Restaurer : vérification + aperçu + confirmation, copie interne AVANT remplacement. */
const APP='pdc-tracker',FORMAT=1,SK_LASTBK=SK+'-derniere-sauvegarde',BK_DAYS=7,SNAP_DAILY=7,SNAP_OTHER=3;
const lastBackup=()=>+lsGet(SK_LASTBK)||DB.meta.lastExport||0;
function setBackupDone(){const t=Date.now();lsSet(SK_LASTBK,String(t));DB.meta.lastExport=t;save()}
/* Alerte d'export par période (semaine, mois, année) : la période précédente, terminée, a-t-elle été exportée ? */
const SK_EXP=SK+'-exports',PNAME={week:'semaine',month:'mois',year:'année'};
function expDone(){let a={};try{a=JSON.parse(lsGet(SK_EXP))||{}}catch(e){}const b=DB.meta.exports||{},o={};for(const k of ['week','month','year'])o[k]=[a[k]||'',b[k]||''].sort().pop();return o}
function markExported(per,endKey){const o=expDone();if(endKey>(o[per]||'')){o[per]=endKey;lsSet(SK_EXP,JSON.stringify(o));DB.meta.exports=o;save()}}
function prevRange(per){const t=today0();let s,e;
  if(per==='week'){e=addDays(t,-((t.getDay()+6)%7)-1);s=addDays(e,-6)}
  else if(per==='month'){s=new Date(t.getFullYear(),t.getMonth()-1,1);e=new Date(t.getFullYear(),t.getMonth(),0)}
  else{s=new Date(t.getFullYear()-1,0,1);e=new Date(t.getFullYear()-1,11,31)}return{s,e}}
function expAlert(per){if(per==='day'||!hasData())return'';const{s,e}=prevRange(per);if(e<START_D)return'';
  if((expDone()[per]||'')>=key(e))return'';const lbl=per==='week'?`Semaine du ${fmtShort.format(s<START_D?START_D:s)} au ${fmtShort.format(e)}`:per==='month'?MONTHS[s.getMonth()][0].toUpperCase()+MONTHS[s.getMonth()].slice(1)+' '+s.getFullYear():'Année '+s.getFullYear();
  return`<div class="bkbar"><span><b>${PNAME[per][0].toUpperCase()+PNAME[per].slice(1)} précédent${per==='week'||per==='year'?'e':''} non exporté${per==='week'||per==='year'?'e':''}</b>${lbl}</span><button data-a="exportPrev">Exporter</button></div>`}
/* IndexedDB */
let idbP=null;
function idb(){return idbP=idbP||new Promise((res,rej)=>{try{const r=indexedDB.open('pdc-tracker-copies',1);
  r.onupgradeneeded=()=>r.result.createObjectStore('snaps',{keyPath:'id',autoIncrement:true});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}}).catch(e=>{idbP=null;throw e})}
const idbReq=(mode,fn)=>idb().then(db=>new Promise((res,rej)=>{const t=db.transaction('snaps',mode),s=t.objectStore('snaps');let out;const q=fn(s);if(q)q.onsuccess=()=>{out=q.result};t.oncomplete=()=>res(out);t.onerror=t.onabort=()=>rej(t.error)}));
async function snapList(){return((await idbReq('readonly',s=>s.getAll()))||[]).sort((a,b)=>b.at-a.at)}
const SNAP_WHY={ouverture:'copie quotidienne',manuelle:'sauvegarde manuelle','avant-restauration':'avant restauration','avant-effacement':'avant effacement'};
/* Renvoie true si la copie est faite (ou inutile), false en cas d'échec */
async function snapPut(why){try{if(!hasData())return true;const data=JSON.stringify(DB),day=key(today0()),all=await snapList(),daily=why==='ouverture';
  if(daily&&all.some(s=>s.why==='ouverture'&&s.day===day))return true;
  await idbReq('readwrite',s=>s.add({at:Date.now(),day,why,n:Object.keys(DB.days).length,data}));
  const g=x=>x==='ouverture'||x==='manuelle'?x:'autre',grp=(await snapList()).filter(s=>g(s.why)===g(why)).slice(g(why)==='autre'?SNAP_OTHER:SNAP_DAILY);
  if(grp.length)await idbReq('readwrite',s=>{grp.forEach(x=>s.delete(x.id))});return true}catch(e){return false}}
async function fillSnaps(){const el=$('snaps');if(!el)return;let all;try{all=await snapList()}catch(e){el.innerHTML='<p class="muted">Copies internes indisponibles sur ce navigateur.</p>';return}
  if(!$('snaps'))return;const f=new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  el.innerHTML=all.length?all.map(s=>`<div class="snap"><span>${f.format(new Date(s.at))}<br><small>${+s.n||0} jour${s.n>1?'s':''} · ${esc(SNAP_WHY[s.why]||s.why)}</small></span><button class="ghost raise" style="margin:0;width:auto" data-a="snapRestore" data-id="${+s.id}">Restaurer</button></div>`).join('')
    :'<p class="muted">Aucune copie pour l\'instant : la première sera faite cette nuit à 00:05 (ou à la prochaine ouverture).</p>'}
/* Fenêtre de confirmation (remplace les confirmations du navigateur) */
function ask(title,html,okLabel,danger,info){return new Promise(res=>{const m=document.createElement('div');m.className='modal';
  m.innerHTML=`<div class="box card"><h3>${title}</h3>${html}<button class="primary" data-k="ok" ${danger?'style="background:#ef4444;box-shadow:none"':''}>${okLabel}</button>${info?'':'<button class="ghost raise" data-k="no">Annuler</button>'}</div>`;
  const end=v=>{m.remove();res(v)};m.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(b)end(b.dataset.k==='ok');else if(e.target===m)end(false)});document.body.appendChild(m)})}
function summary(d){const ks=Object.keys(d.days).sort();let sets=0;for(const k of ks){const x=d.days[k];for(const v of Object.values(x.sets||{}))sets+=(v||[]).length}
  const fd=k=>fmtShort.format(fromKey(k));return{n:ks.length,from:ks.length?fd(ks[0]):'–',to:ks.length?fd(ks[ks.length-1]):'–',sets}}
function cmpTable(nw,label){const a=summary(DB),nn=normDB(nw),b=summary(nn),bad=Object.keys(nw&&nw.days||{}).length-b.n;
  return`<table><tr><th></th><th>Actuelles</th><th>${label}</th></tr><tr><td>Jours</td><td>${a.n}</td><td>${b.n}</td></tr><tr><td>Du</td><td>${a.from}</td><td>${b.from}</td></tr><tr><td>Au</td><td>${a.to}</td><td>${b.to}</td></tr><tr><td>Séries muscu</td><td>${a.sets}</td><td>${b.sets}</td></tr></table>${bad>0?`<p class="muted">${bad} jour${bad>1?'s':''} invalide${bad>1?'s':''} ignoré${bad>1?'s':''}.</p>`:''}`}
/* Remplacement des données : copie interne d'abord, sinon on n'écrase rien */
async function replaceData(nw,msg){const okSnap=await snapPut('avant-restauration'),okLs=!hasData()||lsSet(SK_PREV,JSON.stringify(DB));
  if(!okSnap&&!okLs){toast('Copie de sécurité impossible : rien n\'a été modifié',2800);return}
  DB=normDB({days:nw.days,meta:nw.meta||{}});resetDrafts();save();render();toast(msg,2600)}
function backupFile(){const data={app:APP,format:FORMAT,exportedAt:new Date().toISOString(),days:DB.days,meta:DB.meta};
  return new File([JSON.stringify(data)],`${APP}_sauvegarde_${key(today0())}.json`,{type:'application/json'})}
/* Partage iPhone (Enregistrer dans Fichiers) ; à défaut, téléchargement. Renvoie true si fait. */
async function shareOrDownload(files){
  if(navigator.canShare&&navigator.canShare({files})){try{await navigator.share({files});return true}catch(err){if(err&&err.name==='AbortError')return false;}}
  try{files.forEach(f=>{const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)});return true}catch(e){toast('Sauvegarde impossible ici');return false}}
/* Exporter : PDF du bilan de la période affichée + fichier .json, via le partage (Mail, Fichiers…) */
async function doExport(){if(period==='day')return;if(!hasData()){toast('Aucune donnée à exporter');return}
  const{s:rs,e:re}=getRange(),pn={week:'semaine',month:'mois',year:'annee'}[period],files=[];
  try{files.push(new File([buildPDF()],`${APP}_bilan-${pn}_${key(rs)}.pdf`,{type:'application/pdf'}))}catch(err){toast('PDF impossible : fichier .json seul',2600)}
  files.push(backupFile());
  if(await shareOrDownload(files)){setBackupDone();if(re<today0())markExported(period,key(re));render();toast('Export prêt')}}
/* Sauvegarder (bas du Bilan) : point de restauration interne, sans fichier */
const SK_LASTSAVE=SK+'-derniere-sauvegarde-interne';
async function doSave(){if(!hasData()){toast('Aucune donnée à sauvegarder');return}
  if(await snapPut('manuelle')){lsSet(SK_LASTSAVE,String(Date.now()));render();toast('Sauvegarde faite')}else toast('Sauvegarde impossible sur ce navigateur',2600)}
/* Lecture et contrôle d'un fichier de sauvegarde */
function checkBackup(txt){let d;try{d=JSON.parse(txt)}catch(e){return{err:'Ce fichier n\'est pas une sauvegarde lisible.'}}
  if(!d||typeof d!=='object')return{err:'Fichier invalide.'};
  if(d.app!=null&&d.app!==APP)return{err:'Ce fichier vient d\'une autre application.'};
  const v=d.format==null?0:+d.format;if(!(v>=0))return{err:'Version de format inconnue.'};
  if(v>FORMAT)return{err:'Sauvegarde créée par une version plus récente de l\'app. Mettez l\'app à jour puis réessayez.'};
  if(!isDB(d))return{err:'Contenu de la sauvegarde invalide.'};return{data:d,v}}
