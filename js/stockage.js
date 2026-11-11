/* PDC Tracker · Stockage local protégé : lecture, contrôle des données, enregistrement
   Script classique (pas un module) : les fichiers js/ partagent la même portée globale
   et sont chargés dans l'ordre fixé dans index.html. */
/* ---------- Stockage local (protégé) ---------- */
const isDB=d=>!!d&&typeof d==='object'&&d.days&&typeof d.days==='object'&&!Array.isArray(d.days)&&Object.values(d.days).every(x=>x&&typeof x==='object');
let memCopy=null,saveFailed=false,rescued=false,persisted=null;
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,v);return true}catch(e){return false}};
const lsDel=k=>{try{localStorage.removeItem(k)}catch(e){}};
function load(){const s=lsGet(SK);if(!s)return memCopy||{days:{},meta:{}};
  try{const d=JSON.parse(s);if(isDB(d))return{days:d.days,meta:d.meta||{}}}catch(e){}
  /* Données illisibles : on les met de côté au lieu de les écraser */
  lsSet(SK_RESCUE+Date.now(),s);rescued=true;return{days:{},meta:{}}}
/* SÉCURITÉ : toute donnée chargée (stockage, fichier restauré, copie) est reconstruite champ par champ.
   Seuls les objectifs et exercices connus, des nombres bornés et des dates valides sont gardés. */
const numIn=(v,min,max)=>{v=Number(v);return Number.isFinite(v)&&v>=min&&v<=max?v:null};
const isKey=k=>typeof k==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(k);
function normDB(d){const days=Object.create(null),src=d&&d.days&&typeof d.days==='object'?d.days:{};
  for(const k of Object.keys(src)){const x=src[k];if(!isKey(k)||k<START||!x||typeof x!=='object')continue;
    const y={obj:{},sets:{},planks:[],poids:null,course:null};
    if(x.obj&&typeof x.obj==='object')for(const o of OBJ)if(x.obj[o]===true)y.obj[o]=true;
    if(x.sets&&typeof x.sets==='object')for(const e of EX)if(Array.isArray(x.sets[e.id]))y.sets[e.id]=x.sets[e.id].slice(0,200).map(v=>numIn(v,1,9999)).filter(v=>v!=null);
    if(Array.isArray(x.planks))y.planks=x.planks.slice(0,200).map(v=>numIn(v,1,86400)).filter(v=>v!=null);
    if(x.course&&typeof x.course==='object'){const c={d:numIn(x.course.d,0.01,1000),t:numIn(x.course.t,0,100000)||0,den:numIn(x.course.den,0,100000)||0};if(c.d)y.course=c}
    if(x.poids&&typeof x.poids==='object'){const v=numIn(x.poids.v,1,700);if(v)y.poids={v,jeun:x.poids.jeun===true}}
    if(x.locked===true)y.locked=true;if(x.sportAuto===true)y.sportAuto=true;days[k]=y}
  const m=d&&d.meta&&typeof d.meta==='object'?d.meta:{},meta={};
  const le=numIn(m.lastExport,0,4e12);if(le)meta.lastExport=le;
  if(m.exports&&typeof m.exports==='object'){meta.exports={};for(const p of ['week','month','year'])if(isKey(m.exports[p]))meta.exports[p]=m.exports[p]}
  return{days:Object.assign({},days),meta}}
let DB=normDB(load());
function save(){memCopy=DB;const ok=lsSet(SK,JSON.stringify(DB));
  if(!ok&&!saveFailed){saveFailed=true;setTimeout(()=>toast('Attention : enregistrement impossible sur cet appareil. Exportez vos données.',4000),50)}
  if(ok)saveFailed=false}
/* SPORT coché automatiquement dès qu'une série ou une course est saisie (pas le poids).
   Décoché seulement si c'est l'app qui l'avait coché et qu'il ne reste plus rien. */
function syncSport(d){if(!d)return;if(hasSport(d)){if(!d.obj.SPORT){d.obj.SPORT=true;d.sportAuto=true}}else if(d.sportAuto){d.obj.SPORT=false;d.sportAuto=false}}
function getDay(k,create){let d=DB.days[k];if(!d&&create)d=DB.days[k]={obj:{},sets:{},planks:[],poids:null,course:null};return d}
/* Demande au navigateur de ne jamais effacer automatiquement les données */
async function askPersist(){try{if(navigator.storage&&navigator.storage.persist){persisted=await navigator.storage.persisted();if(!persisted)persisted=await navigator.storage.persist()}}catch(e){}if(tab==='bilan')render()}
