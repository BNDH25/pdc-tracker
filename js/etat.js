/* PDC Tracker · État de l'écran et logique de base (séries, records)
   Script classique (pas un module) : les fichiers js/ partagent la même portée globale
   et sont chargés dans l'ordre fixé dans index.html. */
/* ---------- État ---------- */
let cur=today0()<START_D?new Date(START_D):today0(),tab='obj',pdcSub='muscu',period='week',sel='tractions',stepVal={},armed=0,draftC=null,draftP=null;

/* ---------- Logique ---------- */
const hasSport=d=>!!d&&(Object.values(d.sets||{}).some(a=>a.length)||(d.course&&d.course.d>0)||(d.planks&&d.planks.length>0));
const isDone=(k,id)=>{const d=DB.days[k];return!!(d&&d.obj[id])};
function streak(id,k){let d=fromKey(k);if(!isDone(key(d),id))d=addDays(d,-1);let n=0;while(n<3650&&isDone(key(d),id)){n++;d=addDays(d,-1)}return n}
function findBack(fn){for(let i=0;i<180;i++){const d=DB.days[key(addDays(cur,-i))];const r=d&&fn(d);if(r!=null)return r}return null}
/* Record absolu (meilleure série) d'un exercice, tous jours confondus */
function bestEver(ex){let b=0;for(const d of Object.values(DB.days)){const s=d.sets&&d.sets[ex];if(s)for(const v of s)if(v>b)b=v}return b}
