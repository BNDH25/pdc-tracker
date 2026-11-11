/* PDC Tracker · Démarrage : minuteries, copies automatiques, mode hors ligne
   Script classique (pas un module) : les fichiers js/ partagent la même portée globale
   et sont chargés dans l'ordre fixé dans index.html. */
/* ---------- Démarrage ---------- */
/* SÉCURITÉ : double contrôle anti-cadre (le code est réparti en plusieurs fichiers) */
if(window.top!==window.self)throw new Error('cadre refusé');
let shownToday=+today0();
function dayCheck(){const t=+today0();if(t!==shownToday){if(+cur===shownToday){cur=today0();draftC=draftP=null}shownToday=t;render()}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden){dayCheck();snapPut('ouverture');pkTick();mnTick();if(pk.st==='run'||mn.st==='run'||mnAl)wakeOn()}});setInterval(dayCheck,60000);
if(pk.st==='run'){pkTimer=setInterval(pkTick,250);wakeOn()}
mnBoot();
render();
askPersist();
/* Copie interne automatique à l'ouverture (une par jour, 7 jours gardés) */
snapPut('ouverture').then(()=>{if(tab==='bilan')fillSnaps()});
/* Copie quotidienne à 00:05 si l'app est restée ouverte */
(function nightly(){const n=new Date(),t=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1,0,5);
  setTimeout(()=>{snapPut('ouverture').then(()=>{if(tab==='bilan')fillSnaps()});nightly()},t-n)})();
if('serviceWorker' in navigator&&location.protocol==='https:'||location.hostname==='localhost')
  navigator.serviceWorker&&navigator.serviceWorker.register('sw.js').catch(()=>{});
