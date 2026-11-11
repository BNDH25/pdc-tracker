/* PDC Tracker · Configuration : protection anti-cadre, objectifs, exercices, constantes, icônes
   Script classique (pas un module) : les fichiers js/ partagent la même portée globale
   et sont chargés dans l'ordre fixé dans index.html. */
/* SÉCURITÉ : l'app refuse de s'afficher à l'intérieur d'un autre site */
if(window.top!==window.self){document.documentElement.innerHTML='';throw new Error('cadre refusé')}
const OBJ=['SALAT','SPORT','TRAVAIL','APPRENTISSAGE','LECTURE','NO JUNK FOOD','NO THC','NO TABAC','NO PORN'];
const EX=[{id:'tractions',n:'Tractions'},{id:'dips',n:'Dips'},{id:'pompes',n:'Pompes'},{id:'squats',n:'Squats'}];
/* Premier jour de suivi : rien avant cette date n'est affiché ni compté */
const START='2026-11-10',START_D=new Date(START.replace(/-/g,'/'));
const SK='pdc-tracker-v2',SK_PREV=SK+'-avant-import',SK_RESCUE=SK+'-secours-';
const CHECK='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>';
const LOCK='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const XMARK='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
