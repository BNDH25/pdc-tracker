/* PDC Tracker · Configuration : protection anti-cadre, objectifs, exercices, constantes, icônes
   Script classique (pas un module) : les fichiers js/ partagent la même portée globale
   et sont chargés dans l'ordre fixé dans index.html. */
/* SÉCURITÉ : l'app refuse de s'afficher à l'intérieur d'un autre site */
if(window.top!==window.self){document.documentElement.innerHTML='';throw new Error('cadre refusé')}
const OBJ=['SALAT','SPORT','TRAVAIL','APPRENTISSAGE','LECTURE','NO JUNK FOOD','NO THC','NO TABAC','NO PORN'];
const EX=[{id:'tractions',n:'Tractions'},{id:'dips',n:'Dips'},{id:'pompes',n:'Pompes'},{id:'squats',n:'Squats'}];
/* Exercices chronométrés : durées en secondes, stockées dans le champ f de chaque jour */
const CH=[{id:'gainage',n:'Gainage',f:'planks'},{id:'corde',n:'Corde à sauter',f:'ropes'}];
/* Carrés de l'onglet PDC, dans l'ordre d'affichage */
const TILES=EX.concat(CH);
const isCH=id=>CH.some(c=>c.id===id);
/* Premier jour de suivi : rien avant cette date n'est affiché ni compté */
const START='2026-11-10',START_D=new Date(START.replace(/-/g,'/'));
const SK='pdc-tracker-v2',SK_PREV=SK+'-avant-import',SK_RESCUE=SK+'-secours-';
const CHECK='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>';
const LOCK='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PEN='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16v4z"/></svg>';
const CHEV='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
const XMARK='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
