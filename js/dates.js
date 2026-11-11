/* PDC Tracker · Dates et formats d'affichage
   Script classique (pas un module) : les fichiers js/ partagent la même portée globale
   et sont chargés dans l'ordre fixé dans index.html. */
/* ---------- Dates & formats ---------- */
const pad=n=>String(n).padStart(2,'0');
const key=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const fromKey=k=>new Date(k.replace(/-/g,'/'));
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const today0=()=>{const t=new Date();t.setHours(0,0,0,0);return t};
const fmtLong=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'});
const fmtShort=new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short'});
const MONTHS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const num=(n,dec=0)=>n.toLocaleString('fr-FR',{minimumFractionDigits:dec,maximumFractionDigits:dec});
const fmtMin=m=>{m=Math.round(m||0);const h=Math.floor(m/60);return h?`${h} h ${pad(m%60)}`:`${m} min`};
const fmtPace=(min,km)=>{if(!(km>0&&min>0))return'–';let p=min/km,m=Math.floor(p),s=Math.round((p-m)*60);if(s===60){m++;s=0}return`${m}:${pad(s)} /km`};
