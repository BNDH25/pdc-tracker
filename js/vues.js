/* PDC Tracker · Rendu : en-tête, onglets Pattern et PDC
   Script classique (pas un module) : les fichiers js/ partagent la même portée globale
   et sont chargés dans l'ordre fixé dans index.html. */
/* ---------- Rendu ---------- */
const $=id=>document.getElementById(id);
function renderHeader(){const diff=Math.round((today0()-cur)/864e5);
  $('dTitle').textContent=diff===0?"Aujourd'hui":diff===1?'Hier':fmtLong.format(cur);
  $('dSub').textContent=diff<=1?fmtLong.format(cur):'Revenir à aujourd\'hui';
  $('nextBtn').disabled=diff<=0;$('prevBtn').disabled=+cur<=+START_D;
  document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.id===tab));
  document.body.className='t-'+tab}
function render(anim){renderHeader();const v=$('view');
  v.innerHTML=tab==='obj'?vObj():tab==='sport'?vSport():tab==='chrono'?vMinuteur():vBilan();
  if(tab==='bilan')fillSnaps();
  if(anim){v.classList.remove('anim');void v.offsetWidth;v.classList.add('anim')}}

function vObj(){const k=key(cur),d=DB.days[k],locked=!!(d&&d.locked),isToday=+cur===+today0(),done=OBJ.filter(o=>isDone(k,o)).length,r=36,c=2*Math.PI*r;
  const row=o=>{const ok=isDone(k,o),s=streak(o,k);
    return `<button class="obj raise ${ok?'on':''}" data-a="tog" data-id="${o}"><span class="chk">${ok?CHECK:''}</span><span class="ol">${o}</span>${s>1?`<span class="st">${s} J</span>`:''}</button>`};
  const foot=locked?`<div class="lockbar card">${LOCK}<span>${isToday?'Journée validée, verrouillée jusqu\'à demain':'Journée validée'}</span><button class="raise" data-a="unlock">Modifier</button></div>`
    :`<button class="primary" data-a="validate">Valider ma journée · ${done}/${OBJ.length}</button>`;
  return `<div class="card summary" style="margin-top:4px">
    <svg class="ring" width="88" height="88" viewBox="0 0 88 88"><circle class="tr" cx="44" cy="44" r="${r}"/><circle class="pr" cx="44" cy="44" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-done/OBJ.length)}" transform="rotate(-90 44 44)"/><text x="44" y="51" text-anchor="middle">${done}/${OBJ.length}</text></svg>
    <div><strong>${done===OBJ.length?'Journée parfaite':done>=6?'Belle journée':'Objectifs du jour'}</strong><p class="muted">${Math.round(done/OBJ.length*100)} % atteints</p></div></div>
  <div class="${locked?'locked':''}"><h2>À faire</h2><div class="list">${OBJ.slice(0,5).map(row).join('')}</div>
  <h2>À éviter</h2><div class="list">${OBJ.slice(5).map(row).join('')}</div></div>${foot}`}

function vSport(){const seg=`<div class="seg well">${[['muscu','Musculation'],['gain','Gainage'],['course','Course'],['poids','Poids']].map(([k,l])=>`<button class="${pdcSub===k?'on':''}" data-a="sub" data-id="${k}">${l}</button>`).join('')}</div>`;
  return seg+(pdcSub==='muscu'?vMuscu():pdcSub==='gain'?vGainage():pdcSub==='course'?vCourse():vPoids())}
/* Carré agrandi : état en mémoire seulement, jamais enregistré */
let exBig=null;
/* Petit carré : 4 dernières séries (3 si trop larges), « … » devant s'il y en a d'autres */
const exLast=s=>{let k=Math.min(4,s.length);if(k===4&&s.slice(-4).join('').length>8)k=3;return(s.length>k?'… ':'')+s.slice(-k).join(' · ')};
function vMuscu(){const d=DB.days[key(cur)]||{},sets=d.sets||{};
  const tiles=EX.filter(e=>!exBig||e.id===exBig).map(e=>{const s=sets[e.id]||[],big=exBig===e.id;return `<button class="ex raise ${sel===e.id?'sel':''} ${big?'big':''}" data-a="sel" data-id="${e.id}" aria-expanded="${big}"><span class="exn">${e.n}</span><span class="ext">${s.reduce((a,v)=>a+v,0)}<small>total</small></span><span class="exv">${s.length?(big?s.map((v,i)=>`<span>${v}${i<s.length-1?' ·':''}</span>`).join(' '):exLast(s)):'—'}</span><span class="exs">${s.length} série${s.length>1?'s':''}</span></button>`}).join('');
  const s=sets[sel]||[],ex=EX.find(e=>e.id===sel),best=bestEver(sel),recI=best?s.indexOf(best):-1;
  const rows=s.length?s.map((v,i)=>`<div class="srow"><span class="ix well">${i+1}</span><b>${v} rép.</b>${i===recI?'<span class="rec">Record</span>':''}<button class="raise" data-a="del" data-i="${i}" aria-label="Supprimer la série">${XMARK}</button></div>`).join(''):'<div class="empty">Aucune série validée</div>';
  return `<h2>Exercice</h2><div class="grid">${tiles}</div>
  <h2>Saisie</h2><div class="card pad"><div class="ptitle"><b>${ex.n}</b><span>${best?`<small>Record ${best}</small>`:''}Série ${s.length+1}</span></div>
    ${stepper('reps','rép.','',true)}
    <button class="primary" data-a="add" ${ST.reps.get()>0?'':'disabled'}>Valider la série ${s.length+1}</button>
    <div class="sets">${rows}</div></div>`}
function vGainage(){const d=DB.days[key(cur)]||{},pl=d.planks||[],best=bestPlank(),tot=pl.reduce((a,b)=>a+b,0),recI=best?pl.indexOf(best):-1;
  let body;
  if(pk.st==='run')body=`<div class="chrono well run" id="pk-time">${fmtDur(pkElapsed())}</div><button class="primary" data-a="pkStop">Arrêter</button>`;
  else if(pk.st==='done')body=`<div class="chrono well" id="pk-fmt">${fmtDur(pk.val)}</div>
    ${stepper('pt','s','Temps à enregistrer',true)}
    <p class="muted hint">${pk.manual?'Saisie manuelle':'Chrono : '+Math.round(pk.raw)+' s ('+fmtDur(pk.raw)+')'} · correction par pas de 5 s</p>
    <button class="primary" data-a="pkAdd" ${pk.val>0?'':'disabled'}>Valider la série ${pl.length+1}</button>
    <button class="ghost raise danger" data-a="pkCancel">Abandonner</button>`;
  else body=`<div class="chrono well">0:00</div><button class="primary" data-a="pkStart">Démarrer le chrono</button>
    <button class="ghost raise" data-a="pkManual">Saisir manuellement</button>`;
  const rows=pl.length?pl.map((v,i)=>`<div class="srow"><span class="ix well">${i+1}</span><b>${fmtDur(v)}</b>${i===recI?'<span class="rec">Record</span>':''}<button class="raise" data-a="pkDel" data-i="${i}" aria-label="Supprimer la série">${XMARK}</button></div>`).join(''):'<div class="empty">Aucune série validée</div>';
  return `<h2>Gainage</h2><div class="card pad"><div class="ptitle"><b>Chrono</b><span>${best?`<small>Record ${fmtDur(best)}</small>`:''}Série ${pl.length+1}</span></div>
    ${body}<div class="sets">${rows}</div>${pl.length?`<div class="status"><span>Total du jour : ${fmtDur(tot)}</span></div>`:''}</div>`}
function vCourse(){const saved=(DB.days[key(cur)]||{}).course,c=dC();
  return `<h2>Course à pied</h2><div class="card pad">
    ${stepper('cd','km','Distance')}${stepper('ct','min','Temps')}${stepper('cden','m','Dénivelé +')}
    <div class="pace well">Allure<b id="pace">${fmtPace(c.t,c.d)}</b></div>
    <button class="primary" data-a="saveC" ${c.d>0&&c.t>0?'':'disabled'}>${saved?'Mettre à jour':'Enregistrer la course'}</button>
    ${saved?`<div class="status">${CHECK}<span>Enregistrée : ${num(saved.d,1)} km · ${fmtMin(saved.t)} · ${saved.den} m D+</span><button class="raise" data-a="delC">Supprimer</button></div>`:''}</div>`}
function vPoids(){const saved=(DB.days[key(cur)]||{}).poids,p=dP();
  const prev=findBack(d=>d!==DB.days[key(cur)]&&d.poids&&d.poids.v?d.poids.v:null);
  return `<h2>Poids du jour</h2><div class="card pad">
    ${stepper('pv','kg','Poids',true)}
    <button class="switch well ${p.jeun?'on':''}" data-a="jeun"><span>À jeun</span><span class="knob"></span></button>
    <button class="primary" data-a="saveP">${saved?'Mettre à jour':'Enregistrer le poids'}</button>
    ${saved?`<div class="status">${CHECK}<span>Enregistré : ${num(saved.v,1)} kg${saved.jeun?' · à jeun':''}</span><button class="raise" data-a="delP">Supprimer</button></div>`:prev!=null?`<div class="status"><span>Précédente pesée : ${num(prev,1)} kg</span></div>`:''}</div>`}
