/* PDC Tracker · Générateur PDF intégré (sans bibliothèque externe)
   Script classique (pas un module) : les fichiers js/ partagent la même portée globale
   et sont chargés dans l'ordre fixé dans index.html. */
/* ---------- Export PDF + sauvegarde ---------- */
/* Générateur PDF intégré : aucune bibliothèque externe, fonctionne hors ligne. */
const HWID=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,
  667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,
  556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const CP1252={'€':128,'‚':130,'ƒ':131,'„':132,'…':133,'†':134,'‡':135,'ˆ':136,'‰':137,'Š':138,'‹':139,'Œ':140,'Ž':142,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'˜':152,'™':153,'š':154,'›':155,'œ':156,'ž':158,'Ÿ':159,' ':32,' ':32,'−':45};
/* Thème sombre du PDF (reprend les couleurs de l'app) */
const PC={bg:[.071,.078,.098],card:[.118,.129,.161],ink:[.93,.94,.96],mut:[.56,.6,.68],acc:[.376,.584,.98],ok:[.29,.85,.5],line:[.2,.22,.27],track:[.17,.19,.23]};
const pdfEnc=s=>{let o='';for(const ch of String(s).replace(/[\r\n\t]/g,' ')){const c=ch.codePointAt(0);o+=String.fromCharCode(c<256?c:(CP1252[ch]||63))}return o};
const pdfEsc=s=>pdfEnc(s).replace(/[\\()]/g,'\\$&');
const strW=(s,size,bold)=>{let w=0;for(const ch of String(s).normalize('NFD')){const c=ch.charCodeAt(0);if(c>=0x300&&c<=0x36f)continue;w+=(c>=32&&c<=126?HWID[c-32]:556)}return w*size/1000*(bold?1.06:1)};
function newPDF(){const W=595,H=842,M=44,pages=[],f=n=>(+n).toFixed(2),col=c=>c.join(' ');let ops,y;
  const page=()=>{ops=[`${col(PC.bg)} rg 0 0 ${W} ${H} re f`];pages.push(ops);y=H-M};page();
  return{W,M,
    get y(){return y},
    gap(h){y-=h},
    need(h){if(y-h<M){page();return true}return false},
    text(x,s,size=10,o={}){const ls=o.ls||0,w=o.right||o.center?strW(s,size,o.bold)+ls*String(s).length:0,px=o.right?x-w:o.center?x-w/2:x;
      ops.push(`BT /${o.bold?'F2':'F1'} ${size} Tf ${ls} Tc ${col(o.color||PC.ink)} rg ${f(px)} ${f(o.y??y)} Td (${pdfEsc(s)}) Tj ET`)},
    rrect(x,ry,w,h,r,c){const k=.5523*r,R=x+w,T=ry+h;ops.push(`${col(c)} rg ${f(x+r)} ${f(ry)} m ${f(R-r)} ${f(ry)} l ${f(R-r+k)} ${f(ry)} ${f(R)} ${f(ry+r-k)} ${f(R)} ${f(ry+r)} c ${f(R)} ${f(T-r)} l ${f(R)} ${f(T-r+k)} ${f(R-r+k)} ${f(T)} ${f(R-r)} ${f(T)} c ${f(x+r)} ${f(T)} l ${f(x+r-k)} ${f(T)} ${f(x)} ${f(T-r+k)} ${f(x)} ${f(T-r)} c ${f(x)} ${f(ry+r)} l ${f(x)} ${f(ry+r-k)} ${f(x+r-k)} ${f(ry)} ${f(x+r)} ${f(ry)} c f`)},
    rect(x,ry,w,h,c){ops.push(`${col(c)} rg ${f(x)} ${f(ry)} ${f(w)} ${f(h)} re f`)},
    line(x1,y1,x2,y2,c=PC.line,w=.6){ops.push(`${col(c)} RG ${w} w ${f(x1)} ${f(y1)} m ${f(x2)} ${f(y2)} l S`)},
    poly(pts,c,w=1.4){ops.push(`${col(c)} RG ${w} w 1 j 1 J `+pts.map((p,i)=>`${f(p[0])} ${f(p[1])} ${i?'l':'m'}`).join(' ')+' S')},
    dot(x,yy,r=2,c=PC.acc){const k=.5523*r;ops.push(`${col(c)} rg ${f(x+r)} ${f(yy)} m ${f(x+r)} ${f(yy+k)} ${f(x+k)} ${f(yy+r)} ${f(x)} ${f(yy+r)} c ${f(x-k)} ${f(yy+r)} ${f(x-r)} ${f(yy+k)} ${f(x-r)} ${f(yy)} c ${f(x-r)} ${f(yy-k)} ${f(x-k)} ${f(yy-r)} ${f(x)} ${f(yy-r)} c ${f(x+k)} ${f(yy-r)} ${f(x+r)} ${f(yy-k)} ${f(x+r)} ${f(yy)} c f`)},
    build(){const n=pages.length,objs=[],kids=pages.map((_,i)=>`${5+2*i} 0 R`).join(' ');
      objs.push('<< /Type /Catalog /Pages 2 0 R >>',`<< /Type /Pages /Kids [${kids}] /Count ${n} >>`,
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
      pages.forEach((p,i)=>{const t=`PDC TRACKER  ·  ${i+1}/${n}`,foot=`BT /F1 8 Tf 0 Tc ${col(PC.mut)} rg ${f(W/2-strW(t,8)/2)} 24 Td (${pdfEsc(t)}) Tj ET`,
        stream=p.concat(foot).join('\n');
        objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6+2*i} 0 R >>`,
          `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)});
      objs.push('<< /Title (PDC Tracker - Bilan) /Producer (PDC Tracker) >>');
      let out='%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';const off=[];
      objs.forEach((o,i)=>{off.push(out.length);out+=`${i+1} 0 obj\n${o}\nendobj\n`});
      const xr=out.length;
      out+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`+off.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')
        +`trailer\n<< /Size ${objs.length+1} /Root 1 0 R /Info ${objs.length} 0 R >>\nstartxref\n${xr}\n%%EOF`;
      const u=new Uint8Array(out.length);for(let i=0;i<out.length;i++)u[i]=out.charCodeAt(i)&255;
      return new Blob([u],{type:'application/pdf'})}}}
function pdfBars(d,vals,labels,h,max){d.need(h+34);const L=d.M,w=d.W-2*d.M,n=vals.length,g=n>20?2:5,bw=(w-g*(n-1))/n,mx=max||Math.max(1,...vals),base=d.y-h;
  const rr=Math.min(3,bw/2);vals.forEach((v,i)=>{const x=L+i*(bw+g);d.rrect(x,base,bw,h,rr,PC.track);if(v>0)d.rrect(x,base,bw,Math.max(2*rr,Math.min(1,v/mx)*h),rr,PC.acc);
    if(labels[i])d.text(x+bw/2,labels[i],7,{y:base-10,center:true,color:PC.mut})});d.gap(h+26)}
const recapH=n=>n?36+n*14:0;
/* Tableau récapitulatif : si une page se termine au milieu, l'en-tête des colonnes est répété */
function pdfRecap(d,rr,heads,fn){if(!rr.length)return;const L=d.M,R=d.W-d.M;d.need(36+2*14);d.gap(4);d.text(L,'Par '+recapUnit(),8,{bold:true,color:PC.mut});d.gap(13);
  const head=()=>{d.text(L,heads[0],8,{bold:true,color:PC.mut});d.text(L+260,heads[1],8,{bold:true,color:PC.mut,right:true});d.text(R,heads[2],8,{bold:true,color:PC.mut,right:true});d.gap(6);d.line(L,d.y,R,d.y);d.gap(13)};head();
  rr.forEach(r=>{const c=fn(r);if(d.need(15))head();d.text(L,c[0],9);d.text(L+260,c[1],9,{right:true});d.text(R,c[2],9,{right:true});d.gap(14)})}
function buildPDF(){const{s,e}=getRange(),st=stats(daysBetween(s,e)),d=newPDF(),L=d.M,R=d.W-d.M,pw=st.poids,
    pDelta=pw.length>1?pw[pw.length-1].v-pw[0].v:null,sets=EX.reduce((a,x)=>a+st.ex[x.id].sets,0);
  /* Mise en page : un titre de section n'est jamais seul en bas de page. Chaque section est gardée entière
     sur une page (h = hauteur de son contenu) ; si elle est plus grande qu'une page, elle commence en haut d'une page. */
  const sec=(t,h)=>{d.need(46+Math.min(h,640));d.gap(18);d.rrect(L,d.y-2,3,13,1.5,PC.acc);d.text(L+11,t.toUpperCase(),10,{bold:true,ls:1.4});d.gap(10);d.line(L,d.y,R,d.y);d.gap(18)};
  /* En-tête */
  const P={week:'BILAN DE LA SEMAINE',month:'BILAN DU MOIS',year:"BILAN DE L'ANNÉE"}[period];
  d.rrect(L-14,d.y-58,R-L+28,82,14,PC.card);
  d.text(L,'PDC TRACKER',20,{bold:true,ls:2,color:PC.ink});d.text(R,P,8,{bold:true,ls:1.6,right:true,color:PC.acc,y:d.y+6});d.gap(24);
  {const rl=rangeLabel(s,e);d.text(L,rl[0].toUpperCase()+rl.slice(1),12,{bold:true,color:PC.acc})}d.gap(16);
  d.text(L,'Généré le '+new Intl.DateTimeFormat('fr-FR',{dateStyle:'long'}).format(new Date()),8,{color:PC.mut,ls:.4});d.gap(40);
  /* Chiffres clés */
  const kw=(R-L)/4,kp=[['Objectifs',st.pct==null?'–':Math.round(st.pct*100)+' %',st.done+' cochés'],
    ['Répétitions',num(st.reps),sets+' série'+(sets>1?'s':'')],
    ['Course',num(st.run.d,1)+' km',st.run.n+' sortie'+(st.run.n>1?'s':'')],
    ['Poids',pw.length?num(pw[pw.length-1].v,1)+' kg':'–',pDelta==null?'dernière pesée':(pDelta>0?'+':'')+num(pDelta,1)+' kg sur la période']];
  d.need(80);const y0=d.y,cg=8,cw=(R-L-3*cg)/4;
  kp.forEach((c,i)=>{const x=L+i*(cw+cg);d.rrect(x,y0-50,cw,64,10,PC.card);d.text(x+11,c[0].toUpperCase(),7,{y:y0,bold:true,ls:1,color:PC.mut});d.text(x+11,c[1],16,{y:y0-21,bold:true});d.text(x+11,c[2].length>24?c[2].replace(' sur la période',''):c[2],7,{y:y0-38,color:PC.mut})});
  d.gap(58);
  /* Objectifs */
  sec('Objectifs du pattern',OBJ.length*19);
  const bx=L+135,bw=R-bx-95;
  OBJ.forEach(o=>{d.need(18);const p=st.el?st.obj[o]/st.el:0;
    d.text(L,o,10,{bold:true});d.rrect(bx,d.y-1,bw,8,4,PC.track);if(p>0)d.rrect(bx,d.y-1,Math.max(8,bw*p),8,4,p>=1?PC.ok:PC.acc);
    d.text(R,Math.round(p*100)+' %',10,{right:true,bold:true});d.text(R-38,st.obj[o]+'/'+st.el,9,{right:true,color:PC.mut});d.gap(19)});
  {const bk=buckets(s,e),bs=bk.map(b=>stats(b.days));
    sec('Objectifs atteints par '+(period==='year'?'mois':'jour'),114);
    pdfBars(d,bs.map(x=>x.pct==null?0:Math.round(x.pct*100)),bk.map(b=>b.l),80,100)}
  /* Musculation */
  sec('Musculation',20+EX.length*20);
  const cx=[L,L+250,L+340,R];
  d.text(cx[0],'Exercice',8,{bold:true,color:PC.mut});d.text(cx[1],'Total',8,{bold:true,color:PC.mut,right:true});
  d.text(cx[2],'Séries',8,{bold:true,color:PC.mut,right:true});d.text(cx[3],'Record',8,{bold:true,color:PC.mut,right:true});d.gap(6);d.line(L,d.y,R,d.y);d.gap(14);
  EX.forEach(x=>{d.need(20);const r=st.ex[x.id];d.text(cx[0],x.n,10,{bold:true});d.text(cx[1],num(r.reps),10,{right:true});
    d.text(cx[2],String(r.sets),10,{right:true});d.text(cx[3],r.best?r.best+' rép.':'–',10,{right:true});d.gap(6);d.line(L,d.y,R,d.y);d.gap(14)});
  /* Course */
  const nr=recapRows(s,e).length;
  sec('Course à pied',st.run.n?5*16+recapH(nr):16);
  if(!st.run.n){d.text(L,'Aucune sortie sur la période',10,{color:PC.mut});d.gap(16)}else{
  [['Sorties',String(st.run.n)],['Distance',num(st.run.d,1)+' km'],['Temps',st.run.t?fmtMin(st.run.t):'–'],['Dénivelé +',num(st.run.den)+' m'],['Allure moyenne',fmtPace(st.run.t,st.run.d)]]
    .forEach(r=>{d.need(18);d.text(L,r[0],10,{color:PC.mut});d.text(L+130,r[1],10,{bold:true});d.gap(16)});
  pdfRecap(d,recapRows(s,e),['P\u00e9riode','Distance','Temps'],rcRun)}
  /* Gainage */
  sec('Gainage',st.plank.n?3*16+recapH(nr):16);
  if(!st.plank.n){d.text(L,'Aucune série sur la période',10,{color:PC.mut});d.gap(16)}else{
  [['Séries',String(st.plank.n)],['Temps total',st.plank.t?fmtDur(st.plank.t):'–'],['Meilleure série',st.plank.best?fmtDur(st.plank.best):'–']]
    .forEach(r=>{d.need(18);d.text(L,r[0],10,{color:PC.mut});d.text(L+130,r[1],10,{bold:true});d.gap(16)});
  pdfRecap(d,recapRows(s,e),['P\u00e9riode','S\u00e9ries \u00b7 total','Meilleure'],rcPlank)}
  /* Poids */
  sec('Poids',pw.length<2?18:206);
  if(pw.length<2){d.text(L,pw.length?'Une seule pesée sur la période : '+num(pw[0].v,1)+' kg':'Aucune pesée sur la période',10,{color:PC.mut});d.gap(18)}
  else{const H=120;
    const vs=pw.map(p=>p.v),mn=Math.min(...vs),mx=Math.max(...vs),m=Math.max(.5,(mx-mn)*.15),lo=Math.floor((mn-m)*2)/2,hi=Math.ceil((mx+m)*2)/2,
      x0=L+34,x1=R-6,bot=d.y-H,t0=+s,span=Math.max(864e5,+e-t0),X=k=>x0+(fromKey(k)-t0)/span*(x1-x0),Y=v=>bot+(v-lo)/(hi-lo)*H;
    [lo,(lo+hi)/2,hi].forEach(v=>{d.line(x0,Y(v),x1,Y(v));d.text(x0-5,num(v,1),8,{y:Y(v)-3,right:true,color:PC.mut})});
    d.poly(pw.map(p=>[X(p.k),Y(p.v)]),PC.acc);
    if(pw.length<=40)pw.forEach(p=>d.dot(X(p.k),Y(p.v)));
    d.text(x0,fmtShort.format(s),8,{y:bot-12,color:PC.mut});d.text(x1,fmtShort.format(e),8,{y:bot-12,right:true,color:PC.mut});
    d.gap(H+32);
    const sc=[['Première',pw[0].v],['Dernière',pw[pw.length-1].v],['Minimum',mn],['Moyenne',vs.reduce((a,b)=>a+b,0)/vs.length],['Maximum',mx]],cw=(R-L)/5;
    const yy=d.y;sc.forEach((c,i)=>{d.text(L+i*cw,c[0],8,{y:yy,bold:true,color:PC.mut});d.text(L+i*cw,num(c[1],1)+' kg',11,{y:yy-14,bold:true})});d.gap(24)}
  pdfAna(d,sec,analyse(period,s,e));
  return d.build()}
