/* PDC Tracker · Bilan : statistiques, graphiques, courbe de poids, analyses
   Script classique (pas un module) : les fichiers js/ partagent la même portée globale
   et sont chargés dans l'ordre fixé dans index.html. */
/* ---------- BILAN ---------- */
function getRange(){const d=cur;let s,e;
  if(period==='day'){s=e=new Date(d)}else if(period==='week'){s=addDays(d,-((d.getDay()+6)%7));e=addDays(s,6)}
  else if(period==='month'){s=new Date(d.getFullYear(),d.getMonth(),1);e=new Date(d.getFullYear(),d.getMonth()+1,0)}
  else{s=new Date(d.getFullYear(),0,1);e=new Date(d.getFullYear(),11,31)}if(s<START_D)s=new Date(START_D);return{s,e}}
function daysBetween(s,e){const a=[];for(let x=new Date(s);x<=e;x=addDays(x,1))a.push(new Date(x));return a}
function stats(days){const t=today0(),el=days.filter(d=>d>=START_D),st={el:el.length,obj:{},done:0,ex:{},run:{d:0,t:0,den:0,n:0},poids:[],plank:{n:0,t:0,best:0}};
  OBJ.forEach(o=>st.obj[o]=0);EX.forEach(e=>st.ex[e.id]={reps:0,sets:0,best:0});
  el.forEach(dt=>{const k=key(dt),d=DB.days[k];OBJ.forEach(o=>{if(isDone(k,o)){st.obj[o]++;st.done++}});if(!d)return;
    EX.forEach(e=>{const s=(d.sets||{})[e.id]||[];st.ex[e.id].reps+=s.reduce((a,b)=>a+b,0);st.ex[e.id].sets+=s.length;st.ex[e.id].best=Math.max(st.ex[e.id].best,...s,0)});
    (d.planks||[]).forEach(v=>{st.plank.n++;st.plank.t+=v;st.plank.best=Math.max(st.plank.best,v)});
    if(d.course&&d.course.d>0){st.run.d+=d.course.d;st.run.t+=d.course.t||0;st.run.den+=d.course.den||0;st.run.n++}
    if(d.poids&&d.poids.v)st.poids.push({k,v:d.poids.v})});
  st.reps=EX.reduce((a,e)=>a+st.ex[e.id].reps,0);st.pct=st.el?st.done/(st.el*OBJ.length):null;return st}
function buckets(s,e){if(period==='year')return MONTHS.map((m,i)=>({l:m[0].toUpperCase(),days:daysBetween(new Date(s.getFullYear(),i,1),new Date(s.getFullYear(),i+1,0)),hl:i===cur.getMonth()}));
  return daysBetween(s,e).map((d,i)=>({l:period==='week'?'DLMMJVS'[d.getDay()]:(d.getDate()%5===0||d.getDate()===1?String(d.getDate()):''),days:[d],hl:+d===+cur}))}
function bars(vals,labels,hl,fmt){const W=320,H=140,pb=18,pt=16,n=vals.length,gap=n>20?2:7,bw=(W-gap*(n-1))/n,ih=H-pb-pt,max=Math.max(1,...vals.map(v=>v||0)),rx=Math.min(5,bw/2);
  let g='';vals.forEach((v,i)=>{const x=i*(bw+gap),h=v?Math.max(2,v/max*ih):0;
    g+=`<rect class="bg" x="${x}" y="${pt}" width="${bw}" height="${ih}" rx="${rx}"/>`;
    if(h)g+=`<rect class="b ${hl[i]?'hl':''}" x="${x}" y="${H-pb-h}" width="${bw}" height="${h}" rx="${rx}"/>`;
    if(n<=12&&v)g+=`<text class="v" x="${x+bw/2}" y="${Math.max(11,H-pb-h-4)}" text-anchor="middle">${fmt(v)}</text>`;
    if(labels[i])g+=`<text x="${x+bw/2}" y="${H-4}" text-anchor="middle">${labels[i]}</text>`});
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${g}</svg>`}

/* Courbe de poids : axe X proportionnel aux dates, survol / glissé = valeur exacte */
function wChart(pw,s,e){if(pw.length<2)return`<p class="muted">${pw.length?'Une seule pesée sur la période : il en faut au moins 2 pour tracer la courbe.':'Aucune pesée sur la période.'}</p>`;
  const W=320,H=160,L=36,R=12,T=14,B=22,t0=+s,span=Math.max(864e5,+e-t0);
  const vs=pw.map(p=>p.v),mn=Math.min(...vs),mx=Math.max(...vs),m=Math.max(.5,(mx-mn)*.15),lo=Math.floor((mn-m)*2)/2,hi=Math.ceil((mx+m)*2)/2;
  const X=k=>L+(fromKey(k)-t0)/span*(W-L-R),Y=v=>T+(hi-v)/(hi-lo)*(H-T-B);
  const pts=pw.map(p=>[+X(p.k).toFixed(1),+Y(p.v).toFixed(1),p.v,fmtShort.format(fromKey(p.k))]);
  let g='';[lo,(lo+hi)/2,hi].forEach(v=>{const y=Y(v);g+=`<line class="grid" x1="${L}" x2="${W-R}" y1="${y}" y2="${y}"/><text x="${L-6}" y="${y+3}" text-anchor="end">${num(v,1)}</text>`});
  g+=`<text x="${L}" y="${H-5}">${fmtShort.format(s)}</text><text x="${W-R}" y="${H-5}" text-anchor="end">${fmtShort.format(e)}</text>`;
  const line=pts.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join(''),base=H-B;
  g+=`<path class="ar" d="${line}L${pts[pts.length-1][0]} ${base}L${pts[0][0]} ${base}Z"/><path class="ln" d="${line}"/>`;
  if(pts.length<=31)pts.forEach(p=>g+=`<circle class="dot" cx="${p[0]}" cy="${p[1]}" r="3"/>`);
  const lp=pts[pts.length-1];g+=`<circle class="dot" cx="${lp[0]}" cy="${lp[1]}" r="4.5"/>`;
  g+=`<g class="tip"><line y1="${T}" y2="${base}"/><circle class="dot" r="5"/><rect height="22" rx="6" width="96"/><text text-anchor="middle"></text></g>`;
  return `<svg class="chart wchart" viewBox="0 0 ${W} ${H}" data-pts='${JSON.stringify(pts)}' role="img" aria-label="Évolution du poids">${g}</svg>
  <div class="wstats"><span>Min <b>${num(mn,1)} kg</b></span><span>Moy. <b>${num(vs.reduce((a,b)=>a+b,0)/vs.length,1)} kg</b></span><span>Max <b>${num(mx,1)} kg</b></span></div>`}
function wTip(e){const svg=e.target.closest&&e.target.closest('.wchart');if(!svg)return;const pts=JSON.parse(svg.dataset.pts),r=svg.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*320;
  let p=pts[0];for(const q of pts)if(Math.abs(q[0]-x)<Math.abs(p[0]-x))p=q;
  const tip=svg.querySelector('.tip'),ty=p[1]-32<4?p[1]+10:p[1]-32;
  tip.querySelector('line').setAttribute('x1',p[0]);tip.querySelector('line').setAttribute('x2',p[0]);
  const c=tip.querySelector('circle');c.setAttribute('cx',p[0]);c.setAttribute('cy',p[1]);
  const t=tip.querySelector('text');t.textContent=`${p[3]} · ${num(p[2],1)} kg`;
  const w=Math.ceil(t.getComputedTextLength()*1.08)+18,cx=Math.min(320-12-w/2,Math.max(36+w/2,p[0]));
  t.setAttribute('x',cx);t.setAttribute('y',ty+15);
  const rc=tip.querySelector('rect');rc.setAttribute('width',w);rc.setAttribute('x',cx-w/2);rc.setAttribute('y',ty);
  tip.classList.add('show')}
document.addEventListener('pointermove',wTip);document.addEventListener('pointerdown',wTip);
document.addEventListener('pointerout',e=>{const svg=e.target.closest&&e.target.closest('.wchart');if(svg&&!svg.contains(e.relatedTarget)){const t=svg.querySelector('.tip');t&&t.classList.remove('show')}});

function rangeLabel(s,e){if(period==='day')return fmtLong.format(s);if(period==='week')return`Semaine du ${fmtShort.format(s)} au ${fmtShort.format(e)}`;if(period==='month')return MONTHS[s.getMonth()]+' '+s.getFullYear();return'Année '+s.getFullYear()}
function recapRows(s,e){if(period==='day')return[];const out=[],DJ=['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.'];
  if(period==='week')daysBetween(s,e).forEach(x=>out.push({l:DJ[x.getDay()]+' '+x.getDate(),days:[x]}));
  else if(period==='month'){let a=new Date(s);while(a<=e){let b=addDays(a,6-((a.getDay()+6)%7));if(b>e)b=new Date(e);
    out.push({l:+a===+b?fmtShort.format(a):a.getDate()+'–'+fmtShort.format(b),days:daysBetween(a,b)});a=addDays(b,1)}}
  else MONTHS.forEach((m,i)=>out.push({l:m,days:daysBetween(new Date(s.getFullYear(),i,1),new Date(s.getFullYear(),i+1,0))}));
  return out.map(r=>({l:r.l,st:stats(r.days)})).filter(r=>r.st.el>0)}
const recapUnit=()=>({week:'jour',month:'semaine',year:'mois'}[period]||'');
const rcRun=r=>[r.l,r.st.run.n?num(r.st.run.d,1)+' km':'–',r.st.run.t?fmtMin(r.st.run.t):'–'];
const rcPlank=r=>[r.l,r.st.plank.n?r.st.plank.n+' × · '+fmtDur(r.st.plank.t):'–',r.st.plank.best?fmtDur(r.st.plank.best):'–'];
function recapTable(rows,heads,fn){if(!rows.length)return'';return`<div class="sub">Par ${recapUnit()}</div><table class="rc"><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr>${rows.map(r=>`<tr>${fn(r).map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table>`}
/* ---------- Analyses (Semaine, Mois, Année) ----------
   analyse() calcule tout à partir des données existantes, sans rien inventer ; anaView() met en forme ;
   le Bilan (anaHTML) et le PDF (pdfAna) affichent la même chose. Donnée absente ou division par zéro : « – ».
   Période précédente commençant avant le démarrage de l'app, ou sans aucun jour actif : pas de comparaison. */
const ND='–';
function anaTot(days,s,e){const t={reps:0,sets:0,km:0,act:0,pl:0,ex:{}};EX.forEach(x=>t.ex[x.id]={reps:0,sets:0,best:0});
  daysBetween(s,e).forEach(x=>{const d=days[key(x)];if(!d)return;if(hasSport(d))t.act++;
    EX.forEach(ex=>{const r=t.ex[ex.id];((d.sets||{})[ex.id]||[]).forEach(v=>{r.reps+=v;r.sets++;if(v>r.best)r.best=v})});
    if(d.course&&d.course.d>0)t.km+=d.course.d;(d.planks||[]).forEach(v=>t.pl+=v)});
  EX.forEach(x=>{t.reps+=t.ex[x.id].reps;t.sets+=t.ex[x.id].sets});return t}
function analyse(per,s,e,days=DB.days,now=today0()){
  const r0=per==='week'?addDays(e,-6):per==='month'?new Date(e.getFullYear(),e.getMonth(),1):new Date(e.getFullYear(),0,1);
  const ds=daysBetween(s,e),t=anaTot(days,s,e),a={per,t,n:daysBetween(r0,e).length};
  let rd=0,rt=0;ds.forEach(x=>{const c=(days[key(x)]||{}).course;if(c&&c.d>0&&c.t>0){rd+=c.d;rt+=c.t}});a.run={d:rd,t:rt};
  const ps=per==='week'?addDays(r0,-7):per==='month'?new Date(r0.getFullYear(),r0.getMonth()-1,1):new Date(r0.getFullYear()-1,0,1);
  const pt=ps>=START_D?anaTot(days,ps,addDays(r0,-1)):null;a.prev=pt&&pt.act>0?pt:null;
  if(per==='week')return a;
  a.perAct=t.act?t.reps/t.act:null;
  /* Semaines du lundi au dimanche, limitées à la période */
  const wk=[];ds.forEach(x=>{if(!wk.length||x.getDay()===1)wk.push({s:x,e:x,reps:0});const w=wk[wk.length-1],d=days[key(x)];w.e=x;
    if(d)EX.forEach(ex=>((d.sets||{})[ex.id]||[]).forEach(v=>w.reps+=v))});
  a.bestWeek=wk.reduce((b,w)=>w.reps>(b?b.reps:0)?w:b,null);
  let run=0,best=0;ds.forEach(x=>{run=hasSport(days[key(x)])?run+1:0;if(run>best)best=run});a.streak=best;
  const pw=ds.map(x=>(days[key(x)]||{}).poids).filter(p=>p&&p.v>0).map(p=>p.v);
  a.w=pw.length?{first:pw[0],last:pw[pw.length-1],mean:pw.reduce((x,v)=>x+v,0)/pw.length,n:pw.length}:null;
  if(per==='month')return a;
  const y=e.getFullYear();
  a.months=MONTHS.map((nm,m)=>{const ms=new Date(y,m,1),me=new Date(y,m+1,0),cs=ms<START_D?new Date(START_D):ms,
    w=daysBetween(cs,me).map(x=>(days[key(x)]||{}).poids).filter(p=>p&&p.v>0).map(p=>p.v);
    return{nm,t:anaTot(days,cs,me),el:me>=START_D&&ms<=now,w:w.length?{min:Math.min(...w),max:Math.max(...w),mean:w.reduce((x,v)=>x+v,0)/w.length}:null}});
  a.nm=a.months.filter(o=>o.el).length;
  a.bestMonth=a.months.reduce((b,o)=>o.t.reps>(b?b.t.reps:0)?o:b,null);
  a.rec=EX.map(ex=>{const f=a.months.find(o=>o.t.ex[ex.id].sets>0);return{ex,first:f?{v:f.t.ex[ex.id].best,nm:f.nm}:null,best:t.ex[ex.id].best}});
  return a}
function anaView(a){const t=a.t,V=[],sg=v=>v>0?'+':v<0?'−':'',cap=s=>s[0].toUpperCase()+s.slice(1),
  dlt=(c,p,dec,u)=>{if(p==null)return ND;const d=c-p;return sg(d)+num(Math.abs(d),dec)+u+(p>0?` (${sg(d)}${num(Math.abs(Math.round(d/p*100)))} %)`:'')},
  avg=(x,n)=>n>0?num(x/n,1):ND,kg=v=>v==null?ND:num(v,1)+' kg';
  const top=Math.max(0,...EX.map(x=>t.ex[x.id].best));
  V.push({t:'Musculation',head:['Exercice','Séries','Moy. / série','Meilleure'],
    rows:EX.map(x=>{const r=t.ex[x.id];return[x.n,String(r.sets),avg(r.reps,r.sets),r.best?String(r.best):ND]}).concat([['Global',String(t.sets),avg(t.reps,t.sets),top?String(top):ND]])});
  const act=[['Jours actifs',`${t.act} / ${a.n}`]];
  if(a.per!=='week')act.push(['Répétitions par jour actif',a.perAct==null?ND:num(a.perAct,1)],
    ['Plus longue série de jours actifs',a.streak?`${a.streak} jour${a.streak>1?'s':''}`:ND],
    ['Meilleure semaine',a.bestWeek?`${fmtShort.format(a.bestWeek.s)} au ${fmtShort.format(a.bestWeek.e)} · ${num(a.bestWeek.reps)} rép.`:ND]);
  if(a.per==='year')act.push(['Meilleur mois',a.bestMonth?`${cap(a.bestMonth.nm)} · ${num(a.bestMonth.t.reps)} rép.`:ND],
    ['Moyenne mensuelle · répétitions',a.nm?num(t.reps/a.nm,1):ND],['Moyenne mensuelle · distance',a.nm?num(t.km/a.nm,1)+' km':ND]);
  V.push({t:'Activité',rows:act});
  V.push({t:'Course',rows:[['Allure moyenne',fmtPace(a.run.t,a.run.d)],['Vitesse moyenne',a.run.d>0&&a.run.t>0?num(a.run.d/(a.run.t/60),1)+' km/h':ND]]});
  if(a.per!=='week'){const w=a.w;V.push({t:'Poids',rows:[['Première pesée',kg(w&&w.first)],['Dernière pesée',kg(w&&w.last)],['Moyenne',kg(w&&w.mean)],
    ['Variation',w&&w.n>1?sg(w.last-w.first)+num(Math.abs(w.last-w.first),1)+' kg':ND]]})}
  if(a.per==='year'){
    V.push({t:'Progression des records',head:['Exercice','Premier mois','Record','Progression'],
      rows:a.rec.map(r=>[r.ex.n,r.first?`${r.first.v} (${r.first.nm})`:ND,r.best?String(r.best):ND,r.first?dlt(r.best,r.first.v,0,''):ND])});
    const wm=a.months.filter(o=>o.w);
    V.push({t:'Poids par mois',head:['Mois','Minimum','Maximum','Moyenne'],rows:wm.length?wm.map(o=>[cap(o.nm),kg(o.w.min),kg(o.w.max),kg(o.w.mean)]):[['Aucune pesée',ND,ND,ND]]});
    V.push({t:'Totaux de l\'année',rows:[['Distance',num(t.km,1)+' km'],['Répétitions',num(t.reps)],['Gainage',t.pl?fmtDur(t.pl):ND]]})}
  const p=a.prev;
  V.push({t:{week:'Par rapport à la semaine précédente',month:'Par rapport au mois précédent',year:'Par rapport à l\'année précédente'}[a.per],
    head:['Indicateur','Période','Précédente','Évolution'],rows:[['Répétitions',num(t.reps),p?num(p.reps):ND,dlt(t.reps,p&&p.reps,0,'')],
    ['Distance',num(t.km,1)+' km',p?num(p.km,1)+' km':ND,dlt(t.km,p&&p.km,1,' km')],['Jours actifs',String(t.act),p?String(p.act):ND,dlt(t.act,p&&p.act,0,'')]]});
  return V}
const anaHTML=a=>'<h2>Analyses</h2>'+anaView(a).map(x=>`<div class="card pad ana"><div class="sub">${esc(x.t)}</div><table>${x.head?`<tr>${x.head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr>`:''}${x.rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div>`).join('');
/* PDF : chaque tableau est une section gardée entière sur une page (même pagination que le reste du bilan) */
function pdfAna(d,sec,a){const L=d.M,R=d.W-d.M;
  anaView(a).forEach(x=>{const cx=(x.head||x.rows[0]).length===4?[L,L+250,L+370,R]:[L,R];
    sec('Analyses · '+x.t,20*(x.rows.length+(x.head?1:0)));
    const row=(r,h)=>{d.need(20);r.forEach((c,i)=>d.text(cx[i],c.replace(/[\u202f\u00a0]/g,' '),h?8:10,{bold:h||i===0,color:h?PC.mut:PC.ink,right:i>0}));d.gap(6);d.line(L,d.y,R,d.y);d.gap(14)};
    if(x.head)row(x.head,true);x.rows.forEach(r=>row(r,false))})}
function vBilan(){const{s,e}=getRange(),st=stats(daysBetween(s,e)),P={day:'Jour',week:'Semaine',month:'Mois',year:'Année'};
  const last=DB.meta.lastExport,due=last?(Date.now()-last)>7*864e5:(today0()-START_D)>=7*864e5,pw=st.poids,pDelta=pw.length>1?pw[pw.length-1].v-pw[0].v:null,hasPrev=!!lsGet(SK_PREV),rr=recapRows(s,e),byObj=`<div class="sub">Par objectif</div>${OBJ.map(o=>{const p=st.el?Math.round(st.obj[o]/st.el*100):0;return`<div class="rate"><span class="n">${o}</span><span class="bar"><i style="width:${p}%"></i></span><span class="p">${p} %</span></div>`}).join('')}`;
  let charts;
  if(period!=='day'){const bk=buckets(s,e),bs=bk.map(b=>stats(b.days)),hl=bk.map(b=>b.hl),lb=bk.map(b=>b.l);
    charts=`<h2>Objectifs atteints par ${period==='year'?'mois':'jour'}</h2><div class="card pad">${bars(bs.map(x=>x.pct==null?0:Math.round(x.pct*100)),lb,hl,v=>v+'%')}${byObj}</div>
    <h2>Répétitions</h2><div class="card pad">${bars(bs.map(x=>x.reps),lb,hl,v=>v>=1000?(v/1000).toFixed(1)+'k':v)}</div>
    <h2>Poids</h2><div class="card pad">${wChart(pw,s,e)}</div>`}
  else charts=`<h2>Répétitions du jour</h2><div class="card pad">${bars(EX.map(x=>st.ex[x.id].reps),EX.map(x=>x.n.toUpperCase()),EX.map(()=>1),v=>v)}</div>`;
  const safe=persisted===true?`<p class="muted safe ok"><i></i>Stockage protégé : le navigateur ne l'effacera pas</p>`
    :persisted===false?`<p class="muted safe ko"><i></i>Stockage non garanti : installez l'app sur l'écran d'accueil et exportez chaque semaine</p>`:'';
  return `<div class="seg well">${Object.entries(P).map(([k,l])=>`<button class="${period===k?'on':''}" data-a="per" data-id="${k}">${l}</button>`).join('')}</div>
  ${expAlert(period)}<div class="rlabel">${rangeLabel(s,e)}</div>
  <div class="kpis">
    <div class="kpi card"><span>Objectifs</span><b>${st.pct==null?'–':Math.round(st.pct*100)+' %'}</b><small>${st.done} cochés</small></div>
    <div class="kpi card"><span>Répétitions</span><b>${num(st.reps)}</b><small>${EX.reduce((a,x)=>a+st.ex[x.id].sets,0)} séries</small></div>
    <div class="kpi card"><span>Course</span><b>${num(st.run.d,1)} km</b><small>${st.run.n} sortie${st.run.n>1?'s':''} · ${num(st.run.den)} m D+</small></div>
    <div class="kpi card"><span>Poids</span><b>${pw.length?num(pw[pw.length-1].v,1)+' kg':'–'}</b><small>${pDelta==null?'dernière pesée':(pDelta>0?'+':'')+num(pDelta,1)+' kg sur la période'}</small></div>
  </div>
  ${charts}
  <h2>Musculation</h2><div class="card pad"><table><tr><th>Exercice</th><th>Total</th><th>Séries</th><th>Record</th></tr>${EX.map(x=>`<tr><td>${x.n}</td><td>${num(st.ex[x.id].reps)}</td><td>${st.ex[x.id].sets}</td><td>${st.ex[x.id].best||'–'}</td></tr>`).join('')}</table></div>
  <h2>Course</h2><div class="card pad"><table><tr><td>Distance</td><td>${num(st.run.d,1)} km</td></tr><tr><td>Temps</td><td>${st.run.t?fmtMin(st.run.t):'–'}</td></tr><tr><td>Dénivelé +</td><td>${num(st.run.den)} m</td></tr><tr><td>Allure moyenne</td><td>${fmtPace(st.run.t,st.run.d)}</td></tr></table>${recapTable(rr,['Période','Distance','Temps'],rcRun)}</div>
  <h2>Gainage</h2><div class="card pad"><table><tr><td>Séries</td><td>${st.plank.n}</td></tr><tr><td>Temps total</td><td>${st.plank.t?fmtDur(st.plank.t):'–'}</td></tr><tr><td>Meilleure série</td><td>${st.plank.best?fmtDur(st.plank.best):'–'}</td></tr></table>${recapTable(rr,['Période','Séries · total','Meilleure'],rcPlank)}</div>
  ${period!=='day'?anaHTML(analyse(period,s,e)):''}
  ${rescued?`<div class="banner warn"><b>Données illisibles détectées.</b> Elles ont été mises de côté sur cet appareil sans être effacées. Importez votre dernière sauvegarde${period==='year'?'':' depuis la vue Année'}.</div>`:''}
  ${saveFailed?`<div class="banner warn"><b>Enregistrement impossible.</b> Le navigateur refuse le stockage (navigation privée ?). Exportez avant de fermer.</div>`:''}
  ${period!=='day'?`<button class="primary" data-a="export" style="margin-top:24px">Exporter · ${PNAME[period]}</button>
  <p class="muted" style="margin-top:8px;text-align:center">PDF du bilan + fichier .json de restauration · Mail, Fichiers…</p>`:''}
  ${period==='year'?`<h2>Sauvegarde et données</h2><div class="card pad">
    <button class="ghost raise" style="margin-top:0" data-a="save">Sauvegarder</button>
    <p class="muted" style="margin:8px 0 6px;text-align:center">${(()=>{const t=+lsGet(SK_LASTSAVE);return t?'Dernière sauvegarde : '+new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(t)):'Copie des données sur ce téléphone, sans fichier'})()}</p>
    <button class="ghost raise" data-a="import">Restaurer un fichier .json</button>
    ${hasPrev?`<button class="ghost raise" data-a="undoImport">Annuler la dernière restauration</button>`:''}
    ${safe}</div>
  <h2>Copies internes</h2><div class="card pad"><p class="muted" style="margin:0 0 4px">Copie automatique chaque jour + vos sauvegardes manuelles (7 de chaque). Sur ce téléphone uniquement : utile après une erreur de saisie, pas en cas de perte du téléphone.</p><div id="snaps"><p class="muted">Chargement…</p></div></div>`:''}`}
