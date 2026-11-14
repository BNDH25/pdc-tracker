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
  const row=o=>{const ok=isDone(k,o);
    return `<button class="obj raise ${ok?'on':''}" data-a="tog" data-id="${o}"><span class="chk">${ok?CHECK:''}</span><span class="ol">${o}</span></button>`};
  const foot=locked?`<div class="lockbar card">${LOCK}<span>${isToday?'Journée validée, verrouillée jusqu\'à demain':'Journée validée'}</span><button class="raise" data-a="unlock">Modifier</button></div>`
    :`<button class="primary" data-a="validate">Valider ma journée · ${done}/${OBJ.length}</button>`;
  return `<div class="card summary" style="margin-top:4px">
    <svg class="ring" width="88" height="88" viewBox="0 0 88 88"><circle class="tr" cx="44" cy="44" r="${r}"/><circle class="pr" cx="44" cy="44" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-done/OBJ.length)}" transform="rotate(-90 44 44)"/><text x="44" y="51" text-anchor="middle">${done}/${OBJ.length}</text></svg>
    <div><strong>Objectifs du jour</strong><p class="muted">${Math.round(done/OBJ.length*100)} % atteints</p></div></div>
  <div class="${locked?'locked':''}"><div class="list" style="margin-top:14px">${OBJ.map(row).join('')}</div></div>${foot}`}

function vSport(){const seg=`<div class="seg well">${[['muscu','Musculation'],['course','Course'],['poids','Poids']].map(([k,l])=>`<button class="${pdcSub===k?'on':''}" data-a="sub" data-id="${k}">${l}</button>`).join('')}</div>`;
  return seg+(pdcSub==='muscu'?vMuscu():pdcSub==='course'?vCourse():vPoids())}
/* Carré agrandi : état en mémoire seulement, jamais enregistré */
let exBig=null;
/* Valeur d'une série : répétitions, ou durée pour gainage et corde à sauter */
const serFmt=(id,v)=>isCH(id)?fmtDur(v):String(v);
/* Six carrés (nom, nombre de séries, total) ; un clic agrandit le carré et montre toutes ses séries.
   Sous la grille : saisie de l'exercice choisi, puis volet déroulant « Détail des séries » (modifier / supprimer). */
function vMuscu(){const d=DB.days[key(cur)]||{},kk=key(cur);
  const tiles=TILES.filter(t=>!exBig||t.id===exBig).map(t=>{const s=serOf(d,t.id),big=exBig===t.id,tot=s.reduce((a,v)=>a+v,0);
    return `<button class="ex raise ${sel===t.id?'sel':''} ${big?'big':''}" data-a="sel" data-id="${t.id}" aria-expanded="${big}"><span class="exn">${t.n}</span><span class="ext">${serFmt(t.id,tot)}<small>total</small></span>${big?`<span class="exv">${s.length?s.map((v,i)=>`<span>${serFmt(t.id,v)}${i<s.length-1?' ·':''}</span>`).join(' '):'—'}</span>`:''}<span class="exs">${s.length} série${s.length>1?'s':''}</span></button>`}).join('');
  const x=TILES.find(t=>t.id===sel),timed=isCH(sel),s=serOf(d,sel),best=bestEver(sel),recI=best?s.indexOf(best):-1;
  let body;
  if(!timed)body=`${stepper('reps','rép.','',true)}
    <button class="primary" data-a="add" ${ST.reps.get()>0?'':'disabled'}>Valider la série ${s.length+1}</button>`;
  else if(pk.st!=='idle'&&pk.k!==sel)body=`<p class="muted hint">Chrono en cours : ${TILES.find(t=>t.id===pk.k).n}.</p><button class="ghost raise" data-a="goPk">Aller au chrono</button>`;
  else if(pk.st==='run')body=`<div class="chrono well run" id="pk-time">${fmtDur(pkElapsed())}</div><button class="primary" data-a="pkStop">Arrêter</button>`;
  else if(pk.st==='done')body=`<div class="chrono well" id="pk-fmt">${fmtDur(pk.val)}</div>
    ${stepper('pt','s','Temps à enregistrer',true)}
    <p class="muted hint">${pk.manual?'Saisie manuelle':'Chrono : '+Math.round(pk.raw)+' s ('+fmtDur(pk.raw)+')'} · correction par pas de 5 s</p>
    <button class="primary" data-a="pkAdd" ${pk.val>0?'':'disabled'}>Valider la série ${s.length+1}</button>
    <button class="ghost raise danger" data-a="pkCancel">Abandonner</button>`;
  else body=`<div class="chrono well">0:00</div><button class="primary" data-a="pkStart">Démarrer le chrono</button>
    <button class="ghost raise" data-a="pkManual">Saisir manuellement</button>`;
  const ed=serEdit&&serEdit.k===kk&&serEdit.id===sel?serEdit.i:-1;
  const rows=s.length?s.map((v,i)=>i===ed
    ?`<div class="srow edit"><span class="ix well">${i+1}</span><input id="ser-in" class="sin well" inputmode="${timed?'text':'numeric'}" autocomplete="off" value="${serFmt(sel,v)}" aria-label="Nouvelle valeur"><button class="raise" data-a="serSave" aria-label="Enregistrer">${CHECK}</button><button class="raise" data-a="serCancel" aria-label="Annuler">${XMARK}</button></div>`
    :`<div class="srow"><span class="ix well">${i+1}</span><b>${serFmt(sel,v)}${timed?'':' rép.'}</b>${i===recI?'<span class="rec">Record</span>':''}<button class="raise" data-a="serMod" data-i="${i}" aria-label="Modifier la série">${PEN}</button><button class="raise" data-a="del" data-i="${i}" aria-label="Supprimer la série">${XMARK}</button></div>`).join('')
    :'<div class="empty">Aucune série validée</div>';
  return `<h2>Exercice</h2><div class="grid">${tiles}</div>
  <h2>Saisie</h2><div class="card pad"><div class="ptitle"><b>${x.n}</b><span>${best?`<small>Record ${serFmt(sel,best)}</small>`:''}Série ${s.length+1}</span></div>
    ${body}
    <button class="vol raise" data-a="serToggle" aria-expanded="${serOpen}"><span>Détail des séries</span><span class="cnt">${s.length}</span>${CHEV}</button>${serOpen?`<div class="sets">${rows}</div>`:''}</div>`}
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
