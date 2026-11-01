const API='https://site.api.espn.com/apis/',S=API+'site/v2/sports/soccer/';
const LG=[['uefa.champions','دوري الأبطال'],['eng.1','الإنجليزي'],['esp.1','الإسباني'],['ita.1','الإيطالي'],['ger.1','الألماني'],['fra.1','الفرنسي'],['ksa.1','السعودي']];
const P=document.body.dataset.p,$=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const J=async u=>{const r=await fetch(u);if(!r.ok)throw Error(r.status);return r.json()};
const g=(o,p)=>p.split('.').reduce((a,k)=>a==null?a:a[k],o);
const ymd=d=>d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');
const day=o=>{const d=new Date();d.setDate(d.getDate()+o);return d};
const tm=iso=>new Date(iso).toLocaleTimeString('ar',{hour:'2-digit',minute:'2-digit'});
const ERR='<div class="ms">تعذّر تحميل البيانات. افتح الملف من متصفح Chrome وتأكد من الإنترنت.</div>';
const LOAD='<div class="ms">جاري التحميل...</div>';
/* ===== الهيكل المشترك + الوضع الليلي ===== */
const NAV=[['index.html','matches','المباريات'],['leagues.html','leagues','الدوريات'],['clubs.html','clubs','الأندية'],['news.html','news','الأخبار'],['contact.html','contact','تواصل معنا']];
const root=document.documentElement;
root.dataset.theme=localStorage.getItem('kl_theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
document.body.insertAdjacentHTML('afterbegin',`<header class="top"><a class="logo" href="index.html">⚽ كورة لايف</a><nav>${NAV.map(n=>`<a href="${n[0]}" class="${n[1]===P?'on':''}">${n[2]}</a>`).join('')}</nav><button id="th" aria-label="الوضع الليلي"></button></header><main id="app"></main><footer>© كورة لايف — البيانات من ESPN و Wikipedia</footer><div class="md" id="md"><div class="bx"><button class="x" id="x">✕</button><div id="mb"></div></div></div>`);
const icon=()=>$('#th').textContent=root.dataset.theme==='dark'?'☀️':'🌙';icon();
$('#th').onclick=()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';localStorage.setItem('kl_theme',root.dataset.theme);icon()};
const openM=h=>{$('#mb').innerHTML=h;$('#md').classList.add('on')};
$('#x').onclick=()=>$('#md').classList.remove('on');$('#md').onclick=e=>{if(e.target.id==='md')$('#md').classList.remove('on')};
const hero=(t,s)=>$('#app').insertAdjacentHTML('beforebegin',`<div class="hero"><h1>${t}</h1><p>${s}</p></div>`);
const chips=(id,items,cur)=>`<div class="chips" id="${id}">${items.map(i=>`<button data-k="${i[0]}" class="${i[0]===cur?'on':''}">${i[1]}</button>`).join('')}</div>`;
const onChips=(id,fn)=>$('#'+id).querySelectorAll('button').forEach(b=>b.onclick=()=>{$('#'+id).querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));fn(b.dataset.k)});
/* ===== المباريات ===== */
function mHtml(e,slug){
  const c=g(e,'competitions.0')||{},cs=c.competitors||[],h=cs.find(x=>x.homeAway==='home')||cs[0]||{},a=cs.find(x=>x.homeAway==='away')||cs[1]||{};
  const ty=g(e,'status.type')||{};let mid,lb,cl='st';
  if(ty.state==='pre'){mid=`<b>${tm(e.date)}</b>`;lb='لم تبدأ'}else{mid=`<b>${esc(h.score)} - ${esc(a.score)}</b>`;if(ty.state==='in'){cl='st lv';lb='مباشر • '+esc(g(e,'status.displayClock')||'')}else lb=ty.completed?'انتهت':esc(ty.shortDetail)}
  const T=(x,k)=>`<div class="t ${k}"><img src="${esc(g(x,'team.logo'))}" alt=""><span>${esc(g(x,'team.shortDisplayName')||g(x,'team.displayName'))}</span></div>`;
  return `<div class="m" data-id="${esc(e.id)}" data-lg="${slug}">${T(h,'')}<div class="sc">${mid}<div class="${cl}">${lb}</div></div>${T(a,'a')}</div>`;
}
const plHtml=p=>{const n=g(p,'athlete.displayName')||'',im=g(p,'athlete.headshot.href');return `<div class="pl"><i>${im?`<img src="${esc(im)}" alt="" loading="lazy">`:esc(n.split(' ').map(w=>w[0]).slice(0,2).join(''))}</i><div>${esc(n)}<small>${esc(p.jersey||'')} ${esc(g(p,'position.abbreviation')||'')}</small></div></div>`};
async function matchModal(id,slug){
  openM(LOAD);
  try{
    const d=await J(S+slug+'/summary?event='+id),c=g(d,'header.competitions.0')||{},cs=c.competitors||[];
    const h=cs.find(x=>x.homeAway==='home')||cs[0]||{},a=cs.find(x=>x.homeAway==='away')||cs[1]||{};
    const L=(x)=>`<img src="${esc(g(x,'team.logos.0.href'))}" alt=""><div>${esc(g(x,'team.displayName'))}</div>`;
    let html=`<div class="hd"><div class="two"><div>${L(h)}</div><div>${L(a)}</div></div><h2 style="direction:ltr">${esc(h.score||'')} - ${esc(a.score||'')}</h2><div class="st">${esc(g(d,'header.competitions.0.status.type.detail')||'')}</div></div>`;
    const R=d.rosters||[];
    if(R.length){html+='<h4>التشكيلة</h4><div class="two">'+R.map(r=>`<div><b>${esc(g(r,'team.displayName'))} ${r.formation?'• '+esc(r.formation):''}</b>${(r.roster||[]).filter(p=>p.starter).map(plHtml).join('')||'<div class="st">غير متاحة بعد</div>'}</div>`).join('')+'</div>';
      html+='<h4>البدلاء</h4><div class="two">'+R.map(r=>`<div>${(r.roster||[]).filter(p=>!p.starter).map(plHtml).join('')}</div>`).join('')+'</div>'}
    const T=g(d,'boxscore.teams')||[];
    if(T.length>1){const A=T.find(t=>t.homeAway==='home')||T[0],B=T.find(t=>t!==A);
      html+='<h4>إحصائيات المباراة</h4>'+(A.statistics||[]).map(s=>{const o=(B.statistics||[]).find(z=>z.name===s.name);return `<div class="sr"><b>${esc(s.displayValue)}</b><span>${esc(s.label)}</span><b>${esc(o?o.displayValue:'-')}</b></div>`}).join('')}
    if(!R.length&&T.length<2)html+='<div class="ms">التفاصيل غير متاحة لهذه المباراة بعد.</div>';
    openM(html);
  }catch(e){openM(ERR)}
}
document.addEventListener('click',e=>{const m=e.target.closest('.m[data-id]');if(m)matchModal(m.dataset.id,m.dataset.lg)});
async function scoreboards(slugs,dates){
  const r=await Promise.allSettled(slugs.map(s=>J(S+s[0]+'/scoreboard?dates='+dates)));let h='',ok=0;
  r.forEach((x,i)=>{if(x.status!=='fulfilled')return;ok++;const ev=(x.value.events||[]).sort((a,b)=>new Date(a.date)-new Date(b.date));if(ev.length)h+=`<div class="lg">${slugs[i][1]}</div>`+ev.map(e=>mHtml(e,slugs[i][0])).join('')});
  if(!ok)throw Error('x');return h||'<div class="ms">لا توجد مباريات في هذه الفترة.</div>';
}
if(P==='matches'){
  hero('المباريات والنتائج','اضغط على أي مباراة لعرض التشكيلة والإحصائيات');
  let cur='0',t;$('#app').innerHTML=chips('dy',[['-1','أمس'],['0','اليوم'],['1','غداً']],'0')+'<div id="o"></div>';
  const ld=async()=>{clearTimeout(t);try{$('#o').innerHTML=await scoreboards(LG,ymd(day(+cur)))}catch(e){$('#o').innerHTML=ERR}t=setTimeout(()=>{if(!$('#md').classList.contains('on'))ld()},30000)};
  onChips('dy',k=>{cur=k;$('#o').innerHTML=LOAD;ld()});$('#o').innerHTML=LOAD;ld();
}
/* ===== الدوريات ===== */
if(P==='leagues'){
  hero('الدوريات','الترتيب والنتائج والمباريات الأسبوعية');
  let lg='eng.1',wk=0;$('#app').innerHTML=chips('lc',LG,lg)+'<div class="card" style="padding:8px;overflow-x:auto" id="st"></div><div class="wk"><button id="pv">→ السابق</button><b id="wl"></b><button id="nx">التالي ←</button></div><div id="fx"></div>';
  const stat=(e,n)=>{const s=(e.stats||[]).find(x=>x.name===n);return s?s.displayValue:'-'};
  async function stand(){
    $('#st').innerHTML=LOAD;
    try{const d=await J(API+'v2/sports/soccer/'+lg+'/standings'),en=(g(d,'children.0.standings.entries')||g(d,'standings.entries')||[]).slice().sort((a,b)=>(+stat(a,'rank')||99)-(+stat(b,'rank')||99));
      if(!en.length)throw Error('x');
      $('#st').innerHTML='<table class="tb"><tr><th>#</th><th style="text-align:right">الفريق</th><th>لعب</th><th>ف</th><th>ت</th><th>خ</th><th>له</th><th>عليه</th><th>فارق</th><th>نقاط</th></tr>'+en.map((e,i)=>`<tr><td>${i+1}</td><td><img src="${esc(g(e,'team.logos.0.href'))}" alt="">${esc(g(e,'team.shortDisplayName')||g(e,'team.displayName'))}</td><td>${stat(e,'gamesPlayed')}</td><td>${stat(e,'wins')}</td><td>${stat(e,'ties')}</td><td>${stat(e,'losses')}</td><td>${stat(e,'pointsFor')}</td><td>${stat(e,'pointsAgainst')}</td><td>${stat(e,'pointDifferential')}</td><td><b>${stat(e,'points')}</b></td></tr>`).join('')+'</table>'}catch(e){$('#st').innerHTML=ERR}
  }
  async function fix(){
    const a=day(wk*7-3),b=day(wk*7+3);$('#wl').textContent=a.toLocaleDateString('ar',{day:'numeric',month:'short'})+' – '+b.toLocaleDateString('ar',{day:'numeric',month:'short'});
    $('#fx').innerHTML=LOAD;try{$('#fx').innerHTML=await scoreboards([LG.find(l=>l[0]===lg)],ymd(a)+'-'+ymd(b))}catch(e){$('#fx').innerHTML=ERR}
  }
  onChips('lc',k=>{lg=k;wk=0;stand();fix()});$('#pv').onclick=()=>{wk--;fix()};$('#nx').onclick=()=>{wk++;fix()};stand();fix();
}
/* ===== الأندية ===== */
if(P==='clubs'){
  hero('الأندية','اختر نادياً لعرض نبذته ولاعبيه');
  let lg='eng.1';$('#app').innerHTML=chips('lc',LG,lg)+'<div class="grid" id="gr"></div>';
  async function wiki(n){try{const q=await J('https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch='+encodeURIComponent(n+' football club'));const t=g(q,'query.search.0.title');if(!t)return'';const s=await J('https://en.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(t));return s.extract||''}catch(e){return''}}
  async function club(id){
    openM(LOAD);
    try{const [d,r]=await Promise.all([J(S+lg+'/teams/'+id),J(S+lg+'/teams/'+id+'/roster').catch(()=>({}))]),t=d.team||{},w=await wiki(t.displayName||'');
      let pl=r.athletes||[];if(pl[0]&&pl[0].items)pl=pl.flatMap(x=>x.items);
      const by={};pl.forEach(p=>{const k=g(p,'position.displayName')||'لاعبون';(by[k]=by[k]||[]).push(p)});
      openM(`<div class="hd"><img src="${esc(g(t,'logos.0.href'))}" alt=""><h2>${esc(t.displayName)}</h2><div class="st">${esc(g(t,'standingSummary')||'')} ${t.franchise&&t.franchise.venue?'• ملعب: '+esc(t.franchise.venue.fullName):''}</div></div>${w?`<h4>نبذة وتاريخ</h4><p dir="ltr" style="text-align:left;line-height:1.7;font-size:14px">${esc(w)}</p>`:''}<h4>اللاعبون</h4>`+(Object.keys(by).map(k=>`<b class="st">${esc(k)}</b><div class="two">${by[k].map(p=>`<div class="pl"><i>${g(p,'headshot.href')?`<img src="${esc(p.headshot.href)}" alt="" loading="lazy">`:esc((p.displayName||'').slice(0,2))}</i><div>${esc(p.displayName)}<small>${esc(p.jersey||'')} ${p.age?'• '+esc(p.age)+' سنة':''} ${esc(p.citizenship||'')}</small></div></div>`).join('')}</div>`).join('')||'<div class="ms">قائمة اللاعبين غير متاحة.</div>'))
    }catch(e){openM(ERR)}
  }
  async function teams(){$('#gr').innerHTML=LOAD;try{const d=await J(S+lg+'/teams'),ts=(g(d,'sports.0.leagues.0.teams')||[]).map(x=>x.team);if(!ts.length)throw Error('x');$('#gr').innerHTML=ts.map(t=>`<div class="cl" data-id="${esc(t.id)}"><img src="${esc(g(t,'logos.0.href'))}" alt="" loading="lazy">${esc(t.displayName)}</div>`).join('');$('#gr').querySelectorAll('.cl').forEach(c=>c.onclick=()=>club(c.dataset.id))}catch(e){$('#gr').innerHTML=ERR}}
  onChips('lc',k=>{lg=k;teams()});teams();
}
/* ===== الأخبار ===== */
if(P==='news'){
  hero('الأخبار','آخر أخبار كرة القدم من ESPN (بالإنجليزية)');
  let lg='eng.1';$('#app').innerHTML=chips('lc',LG,lg)+'<div id="o"></div>';
  const ld=async()=>{$('#o').innerHTML=LOAD;try{const d=await J(S+lg+'/news'),a=d.articles||[];if(!a.length)throw Error('x');$('#o').innerHTML=a.map(x=>`<a class="nw" href="${esc(g(x,'links.web.href')||'#')}" target="_blank" rel="noopener noreferrer">${g(x,'images.0.url')?`<img src="${esc(x.images[0].url)}" alt="" loading="lazy">`:''}<div><h3>${esc(x.headline)}</h3><p>${esc(x.description||'')}</p></div></a>`).join('')}catch(e){$('#o').innerHTML=ERR}};
  onChips('lc',k=>{lg=k;ld()});ld();
}
/* ===== تواصل معنا ===== */
if(P==='contact'){
  hero('تواصل معنا','اكتب رسالتك وسنقرأها');
  $('#app').innerHTML='<form class="card" id="f"><input id="n" placeholder="الاسم" required><input id="e" type="email" placeholder="البريد الإلكتروني" required><textarea id="t" rows="5" placeholder="رسالتك" required minlength="10"></textarea><button class="btn">إرسال</button><div class="ms" id="r"></div></form>';
  $('#f').onsubmit=e=>{e.preventDefault();const a=JSON.parse(localStorage.getItem('kl_msgs')||'[]');a.push({n:$('#n').value,e:$('#e').value,t:$('#t').value,d:new Date().toISOString()});localStorage.setItem('kl_msgs',JSON.stringify(a));$('#f').reset();$('#r').textContent='تم حفظ رسالتك. شكراً لتواصلك.'};
}
