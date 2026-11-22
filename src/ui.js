const OL=[["Eğitim",30],["Toplam deneyim",25],["Yöneticilik",25],["Yayın/sertifika",10],["Uluslararası",10]];
const LL=[["Alan uyumu",30],["Sektör deneyimi",30],["Kurum içi kariyer",15],["Önceki görev benzerliği",25]];
const TCOL={"Cumhurbaşkanlığı":"#c8102e","Bakanlık":"#1f5fa8","Bağlı/ilgili kurum":"#00916b","Düzenleyici kurul":"#7b4fb0","Bağımsız kurum":"#d98a00","KİT / kamu şirketi":"#3aa3db","Yargı, Meclis ve TSK":"#4d5a66"};
const tot=(a,L)=>{if(!a)return null;let s=0,m=0;a.forEach((x,i)=>{if(typeof x==="number"){s+=x;m+=L[i][1]}});return{s,m,p:Math.round(s/m*100),part:m<100}};
P.forEach(p=>{p.os=tot(p.o,OL);p.ls=tot(p.l,LL);p.st=p.v==="bos"?"b":(p.v==="yok"||p.v==="yetersiz")?"y":"p"});
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fold=x=>String(x).toLocaleLowerCase("tr").replace(/[çğıöşüâîû]/g,c=>({ç:"c",ğ:"g",ı:"i",ö:"o",ş:"s",ü:"u",â:"a",î:"i",û:"u"}[c]));
const ini=n=>n==="Makam boş"?"—":(n.split(" ")[0][0]+n.split(" ").slice(-1)[0][0]).toLocaleUpperCase("tr");
const S=P.filter(p=>p.st==="p"),N=S.length;
const sc=s=>!s?"—":s.p+(s.part?"*":"");
const types=[...new Set(S.map(p=>p.t))];
const BANDS=[[0,50,"0–49"],[50,70,"50–69"],[70,85,"70–84"],[85,101,"85–100"]];
const KN={ls:"Liyakat",os:"Özgeçmiş"};

/* ---------- state ---------- */
let sel="",qf=null,showAll=false,lastList=[],listY=0,tipId=null;
const fv=$("fv"),so=$("so"),q=$("q"),grid=$("grid"),moreB=$("more");
const inQf=p=>!qf||(p.st==="p"&&qf.f(p));
function setSel(v){sel=v;showAll=false;renderChips();hideTip();draw();cards()}
const resetAll=()=>{sel="";qf=null;q.value="";fv.value="";renderChips()};
function setQf(f){qf=f;showAll=false;if(f)fv.value="";hideTip();draw();cards()}
const go=id=>$(id).scrollIntoView();

/* ---------- özet ---------- */
function overview(){
const av=k=>Math.round(S.reduce((a,p)=>a+p[k].p,0)/N),md=k=>{const v=S.map(p=>p[k].p).sort((a,b)=>a-b);return N%2?v[N>>1]:Math.round((v[N/2-1]+v[N/2])/2)};
const fBoth=p=>p.os.p>=70&&p.ls.p>=70,fLow=p=>p.ls.p<50,both=S.filter(fBoth).length,low=S.filter(fLow).length,pct=x=>Math.round(x/N*100);
const crit=[...OL.map((c,i)=>[c[0],"o",i,c[1]]),...LL.map((c,i)=>[c[0],"l",i,c[1]])].map(([n,k,i,m])=>{const v=S.map(p=>p[k][i]).filter(x=>typeof x==="number");return{n,k,v:Math.round(v.reduce((a,b)=>a+b,0)/v.length/m*100)}}).sort((a,b)=>b.v-a.v);
const sect=crit.find(c=>c.n==="Sektör deneyimi").v,WN={"Uluslararası":"uluslararası deneyim","Yayın/sertifika":"yayın ve sertifika"},weak=crit.slice(-2).reverse().map(c=>WN[c.n]||c.n.toLocaleLowerCase("tr")).join(" ile ");
$("ovlead").textContent=`Puanlanan ${N} yöneticiden ${both} kişi (%${pct(both)}) iki skorda da 70 ve üzerinde. Yöneticilerin çoğu görev alanından geliyor (sektör deneyimi ortalaması %${sect}); en zayıf alanlar ${weak}.`;
const cnt=st=>P.filter(p=>p.st===st).length;
$("cov").textContent=`${P.length} makam incelendi · ${cnt("p")} puanlandı · ${cnt("y")} kişinin verisi yetersiz · ${cnt("b")} makam boş`;
$("tiles").innerHTML=`<div class="tile"><b>${av("ls")}</b><span>ortalama liyakat<br>ortanca ${md("ls")}</span></div><div class="tile"><b>${av("os")}</b><span>ortalama özgeçmiş<br>ortanca ${md("os")}</span></div><button class="tile" id="tb"><b>%${pct(both)}</b><span>iki skorda da 70+ (${both} kişi)</span><em>Listele →</em></button><button class="tile" id="tl"><b>${low}</b><span>kişinin liyakati 50'nin altında</span><em>Listele →</em></button>`;
$("tb").onclick=()=>{resetAll();setQf({l:"İki skorda da 70+",f:fBoth});go("liste")};
$("tl").onclick=()=>{resetAll();setQf({l:"Liyakati 50'nin altında",f:fLow});go("liste")};
$("dkeys").innerHTML=BANDS.map((b,i)=>`<span><i class="c${i}" style="border:1px solid var(--line)"></i>${b[2]}</span>`).join("")+"<span>Dilimdeki sayı kişi sayısı</span>";
$("dist").innerHTML=["ls","os"].map(k=>`<span>${KN[k]}</span><div class="sbar">${BANDS.map((b,i)=>{const c=S.filter(p=>p[k].p>=b[0]&&p[k].p<b[1]).length;return c?`<button class="c${i}" style="flex:${c}" data-k="${k}" data-b="${i}" aria-label="${KN[k]} ${b[2]}: ${c} kişi, listele" title="${KN[k]} ${b[2]}: ${c} kişi">${c/N>=.05?c:""}</button>`:""}).join("")}</div>`).join("");
$("dist").onclick=e=>{const t=e.target.closest("button");if(!t)return;const k=t.dataset.k,b=BANDS[+t.dataset.b];resetAll();setQf({l:`${KN[k]} ${b[2]}`,f:p=>p[k].p>=b[0]&&p[k].p<b[1]});go("liste")};
$("crit").innerHTML=crit.map(c=>`<span>${c.n} <small>${c.k==="o"?"özgeçmiş":"liyakat"}</small></span><div class="bar"><i style="width:${c.v}%;background:var(--${c.k})"></i></div><b>%${c.v}</b>`).join("");
const T=types.map(t=>{const L=S.filter(p=>p.t===t),a=k=>Math.round(L.reduce((x,p)=>x+p[k].p,0)/L.length);return{t,n:L.length,o:a("os"),l:a("ls")}}).sort((a,b)=>b.l-a.l);
$("types").innerHTML=T.map(r=>`<button class="trow" data-t="${esc(r.t)}"><span class="tn"><span class="dot" style="--c:${TCOL[r.t]}"></span>${esc(r.t)}<small>${r.n} kişi${r.n<5?" · ⚠ küçük grup":""}</small></span><span class="mb"><span class="bar"><i style="width:${r.o}%;background:var(--o)"></i></span><span class="bar"><i style="width:${r.l}%;background:var(--l)"></i></span></span><span class="tv"><span>Ö</span> ${r.o}<br><span>L</span> ${r.l}</span></button>`).join("");
$("types").onclick=e=>{const b=e.target.closest(".trow");if(b){resetAll();setSel(b.dataset.t);go("dagilim")}};
$("ovnote").textContent=`Nasıl okunmalı: Ortalamalar kişi başına eşit ağırlıklı; bazı ölçütleri puanlanamayan kayıtlar 100'e oranlandı. ${S.filter(p=>p.alt).length} kaydın puanı alt sınır, gerçek ortalamalar biraz daha yüksek olabilir. Bakan yardımcıları, valiler ve rektörler kapsam dışında. Skor, belgelenmiş eğitim ve kariyerin göreve uygunluğunu ölçer; görevdeki performansı ve kararları ölçmez.`;
}

/* ---------- dağılım ---------- */
const chips=$("chips"),sv=$("sv"),fig=$("fig"),tip=$("tip");
function renderChips(){
chips.innerHTML=[["","Tüm kurumlar",N]].concat(types.map(t=>[t,t,S.filter(p=>p.t===t).length])).map(([v,l,n])=>`<button class="chip" data-t="${esc(v)}" aria-pressed="${v===sel}">${v?`<span class="dot" style="--c:${TCOL[v]}"></span>`:""}${esc(l)}<small>${n}</small></button>`).join("");
}
chips.onclick=e=>{const c=e.target.closest(".chip");if(c)setSel(c.dataset.t)};
function hideTip(){tipId=null;tip.hidden=true;sv.querySelectorAll(".pt.on").forEach(d=>d.classList.remove("on"))}
function showTip(id,x,y){
const p=P.find(r=>r.id==id);if(!p)return;tipId=+id;
tip.innerHTML=`<button class="x" aria-label="Kapat">×</button><b>${esc(p.n)}</b><div class="ro">${esc(p.u)} · ${esc(p.k)}</div><div class="sc"><div><span>Özgeçmiş</span><strong>${sc(p.os)}</strong></div><div><span>Liyakat</span><strong>${sc(p.ls)}</strong></div></div><button class="btn pri go">Detayı aç</button>`;
tip.hidden=false;tip.setAttribute("aria-live","polite");
const W=fig.clientWidth,H=fig.clientHeight,tw=tip.offsetWidth,th=tip.offsetHeight;
let L=x+16,T=y-th/2;if(L+tw>W-8)L=x-16-tw;if(L<8)L=Math.max(8,(W-tw)/2);T=Math.min(Math.max(8,T),H-th-8);
tip.style.left=L+"px";tip.style.top=T+"px";
sv.querySelectorAll(".pt").forEach(d=>d.classList.toggle("on",d.dataset.id==id));
tip.querySelector(".x").onclick=hideTip;
tip.querySelector(".go").onclick=()=>openP(id);
}
function draw(){
const W=fig.clientWidth,H=fig.clientHeight;if(!W)return;
const narrow=W<520,ml=narrow?32:42,mr=12,mt=22,mb=34;
const pool=S.filter(p=>!sel||p.t===sel);
const lo=f=>Math.max(0,Math.floor((Math.min(...pool.map(f))-5)/10)*10);
const x0=Math.min(40,lo(p=>p.os.p)),y0=Math.min(40,lo(p=>p.ls.p));
const X=v=>ml+(v-x0)/(100-x0)*(W-ml-mr),Y=v=>mt+(100-v)/(100-y0)*(H-mt-mb);
const qq=fold(q.value.trim()),hit=p=>(!qq||fold(p.n+" "+p.k).includes(qq))&&inQf(p);
let g="";
for(let v=x0;v<=100;v+=narrow?20:10)g+=`<line x1="${X(v)}" x2="${X(v)}" y1="${mt}" y2="${H-mb}" stroke="var(--line)"/><text class="ax" x="${X(v)}" y="${H-mb+18}" text-anchor="middle">${v}</text>`;
for(let v=y0;v<=100;v+=20)g+=`<line x1="${ml}" x2="${W-mr}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text class="ax" x="${ml-6}" y="${Y(v)+4}" text-anchor="end">${v}</text>`;
g+=`<line x1="${X(70)}" x2="${X(70)}" y1="${mt}" y2="${H-mb}" stroke="var(--mute)" stroke-dasharray="4 4"/><line x1="${ml}" x2="${W-mr}" y1="${Y(70)}" y2="${Y(70)}" stroke="var(--mute)" stroke-dasharray="4 4"/>`;
g+=`<text class="ax" x="${W-mr}" y="${H-2}" text-anchor="end">Özgeçmiş →</text><text class="ax" x="${ml}" y="${mt-8}">↑ Liyakat</text>`;
const Q=[["Güçlü özgeçmiş, yüksek liyakat",p=>p.os.p>=70&&p.ls.p>=70],["Alanında yetişmiş, özgeçmiş sınırlı",p=>p.os.p<70&&p.ls.p>=70],["Güçlü özgeçmiş, alan uyumu zayıf",p=>p.os.p>=70&&p.ls.p<70],["İkisi de 70 altı",p=>p.os.p<70&&p.ls.p<70]].map(([l,f])=>[l,pool.filter(f).length]);
if(!narrow){g+=`<text class="q" x="${W-mr-6}" y="${mt+14}" text-anchor="end">${Q[0][0]} · ${Q[0][1]}</text><text class="q" x="${ml+8}" y="${mt+14}">${Q[1][0]} · ${Q[1][1]}</text><text class="q" x="${W-mr-6}" y="${H-mb-8}" text-anchor="end">${Q[2][0]} · ${Q[2][1]}</text><text class="q" x="${ml+8}" y="${H-mb-8}">${Q[3][0]} · ${Q[3][1]}</text>`}
$("quad").innerHTML=Q.map(([l,n])=>`<div><b>${n}</b> ${l}</div>`).join("");
const seen={},pts=pool.map(p=>{const k=p.os.p+"|"+p.ls.p,n=seen[k]=(seen[k]||0)+1,a=n*2.4;return{p,x:X(p.os.p)+(sel?0:((p.id*37)%5-2)*1.6)+(n>1?Math.cos(a)*7:0),y:Y(p.ls.p)+(n>1?Math.sin(a)*7:0)}});
const r=sel?7:narrow?5:6,boxes=pts.map(o=>({x1:o.x-r-1,x2:o.x+r+1,y1:o.y-r-1,y2:o.y+r+1}));
const coll=b=>boxes.some(c=>b.x1<c.x2&&b.x2>c.x1&&b.y1<c.y2&&b.y2>c.y1)||b.x1<ml||b.x2>W-mr||b.y1<mt||b.y2>H-mb;
let lab="";
if(sel||qq||qf)pts.filter(o=>hit(o.p)).sort((a,b)=>a.y-b.y).forEach(o=>{const s=o.p.n.split(" ").slice(-1)[0],w=s.length*7.3+2;
for(const [dx,an] of [[r+4,"start"],[-r-4,"end"]]){const bx=an==="start"?o.x+dx:o.x+dx-w,b={x1:bx,x2:bx+w,y1:o.y-9,y2:o.y+6};if(!coll(b)){boxes.push(b);lab+=`<text x="${o.x+dx}" y="${o.y+4}" text-anchor="${an}" pointer-events="none">${esc(s)}</text>`;break}}});
g+=pts.map(o=>{const c=TCOL[o.p.t];return `<g class="pt${hit(o.p)?"":" dim"}${o.p.id===tipId?" on":""}" data-id="${o.p.id}" data-x="${o.x}" data-y="${o.y}"><circle cx="${o.x}" cy="${o.y}" r="15" fill="transparent"/><circle cx="${o.x}" cy="${o.y}" r="${r}" fill="${o.p.alt?"var(--bg)":c}" stroke="${c}" stroke-width="${o.p.alt?2.5:1.5}"/></g>`}).join("")+lab;
sv.innerHTML=g;
if(tipId){const d=sv.querySelector(`.pt[data-id="${tipId}"]`);d?showTip(tipId,+d.dataset.x,+d.dataset.y):hideTip()}
}
sv.onclick=e=>{const d=e.target.closest(".pt");if(d){e.stopPropagation();showTip(d.dataset.id,+d.dataset.x,+d.dataset.y)}else hideTip()};
sv.onkeydown=e=>{const ds=[...sv.querySelectorAll(".pt:not(.dim)")].sort((a,b)=>a.dataset.x-b.dataset.x||a.dataset.y-b.dataset.y);if(!ds.length)return;
if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();let i=ds.findIndex(d=>+d.dataset.id===tipId);i=i<0?0:(i+(e.key==="ArrowRight"?1:-1)+ds.length)%ds.length;const d=ds[i];showTip(d.dataset.id,+d.dataset.x,+d.dataset.y)}
else if(e.key==="Enter"&&tipId)openP(tipId)};
document.addEventListener("keydown",e=>{if(e.key==="Escape")hideTip()});

/* ---------- liste ---------- */
const tagMap=p=>{const a=[];if(p.sec===1)a.push('<span class="tag" title="Göreve seçimle gelmiş">Seçilmiş</span>');if(p.sec===2)a.push('<span class="tag" title="Daha önce milletvekilliği yapmış">Eski milletvekili</span>');if(p.alt)a.push('<span class="tag w" title="Kariyer kronolojisi eksik; puan daha yüksek olabilir">Alt sınır</span>');if(p.v==="kısmi"&&!p.alt)a.push('<span class="tag w" title="Bazı bilgiler yalnızca ikincil kaynakta bulundu">Kısmi veri</span>');if(p.st==="y")a.push('<span class="tag w">Verisi yetersiz</span>');if(p.st==="b")a.push('<span class="tag w">Makam boş</span>');return a.join("")};
const meter=(l,s,k)=>`<div class="mtr"><span>${l}</span><div class="bar"><i style="width:${s&&s.p||0}%;background:var(--${k})"></i></div><b>${sc(s)}</b></div>`;
const avc=p=>p.st==="b"?"#9aa0a6":TCOL[p.t];
function cards(){
const qq=fold(q.value.trim()),f=fv.value,o=so.value;
let L=P.filter(p=>(!qq||fold(p.n+" "+p.k+" "+p.u).includes(qq))&&(!sel||p.t===sel)&&(!f||p.st===f)&&inQf(p));
const key=p=>!p.os||!p.ls?-999:o==="o"?p.os.p:o==="d"?p.os.p-p.ls.p:p.ls.p;
L.sort((a,b)=>o==="a"?a.n.localeCompare(b.n,"tr"):o==="t"?a.t.localeCompare(b.t,"tr")||key(b)-key(a):key(b)-key(a));
const ci=L.findIndex(p=>p.id===1);if(ci>0)L.unshift(...L.splice(ci,1));
lastList=L.map(p=>p.id);
const act=[];if(sel)act.push(["t",`Kurum türü: ${sel}`]);if(qf)act.push(["q",qf.l]);
$("active").innerHTML=act.map(([k,l])=>`<span class="badge">${esc(l)}<button data-k="${k}" aria-label="${esc(l)} filtresini kaldır">×</button></span>`).join("");
const lim=showAll||qq||sel||f||qf?L.length:24,V=L.slice(0,lim);
moreB.hidden=V.length>=L.length;moreB.textContent=`Tümünü göster (${L.length})`;
grid.innerHTML=V.length?V.map(p=>`<button class="card" data-id="${p.id}"><div class="av" style="--c:${avc(p)}">${esc(ini(p.n))}</div><div><div class="nm">${esc(p.n)}</div><div class="ro">${esc(p.u)} · ${esc(p.k)}</div><div class="ty"><span class="dot" style="--c:${avc(p)}"></span>${esc(p.t)}</div>${meter("Özgeçmiş",p.os,"o")}${meter("Liyakat",p.ls,"l")}<div class="tags">${tagMap(p)}</div></div></button>`).join(""):'<p class="empty">Bu filtrelere uyan kayıt yok.</p>';
}
$("active").onclick=e=>{const b=e.target.closest("button");if(!b)return;b.dataset.k==="t"?setSel(""):setQf(null)};
q.oninput=()=>{showAll=false;hideTip();draw();cards()};
fv.oninput=()=>{if(fv.value)qf=null;showAll=false;draw();cards()};
so.oninput=cards;
moreB.onclick=()=>{showAll=true;cards()};
const openP=id=>{listY=scrollY;location.hash="p"+id};
grid.onclick=e=>{const c=e.target.closest(".card");if(c)openP(c.dataset.id)};

/* ---------- detay ---------- */
const host=u=>{try{return new URL(u).hostname.replace(/^www\./,"")}catch(e){return u}};
function detail(p){
const sub=(a,L,G,k)=>a?a.map((v,i)=>`<div class="subc"><div class="mtr"><span>${L[i][0]}</span><div class="bar"><i style="width:${typeof v==="number"?v/L[i][1]*100:0}%;background:var(--${k})"></i></div><b>${typeof v==="number"?v+"/"+L[i][1]:v==="UY"?"uygulanmaz":"veri yok"}</b></div>${G&&G[i]?`<p>${esc(G[i])}</p>`:""}</div>`).join(""):'<p class="note">Bu kişi için puanlamaya yetecek bilgi bulunamadı.</p>';
const big=(s,l)=>`<div><b>${sc(s)}</b><span>${l}${s&&s.part?` · ${s.s}/${s.m} puan`:""}</span></div>`;
const peers=S.filter(r=>r.t===p.t),avg=k=>Math.round(peers.reduce((a,r)=>a+r[k].p,0)/peers.length);
const rk=p.st==="p"?[...peers].sort((a,b)=>b.ls.p-a.ls.p).indexOf(p)+1:0;
const cmp=peers.length>1&&p.st==="p"?`<p class="cmp">${esc(p.t)} ortalaması: özgeçmiş ${avg("os")}, liyakat ${avg("ls")} · liyakatte ${peers.length} kişi içinde ${rk}.</p>`:"";
const li=lastList.indexOf(p.id),prv=li>0?lastList[li-1]:null,nxt=li>=0&&li<lastList.length-1?lastList[li+1]:null;
const warn=p.st==="y"?"Görevdeki kişi doğrulandı, ancak puanlamaya yetecek özgeçmiş bilgisi açık kaynaklarda bulunamadı.":p.st==="b"?"Makam şu an boş; atama yapıldığında kayıt güncellenecek.":p.alt?"Kariyer kronolojisi kısmen belgelendi; puanlar yalnızca belgelenmiş verilere dayanan bir alt sınır.":p.os&&p.os.part?"Bazı ölçütler veri yokluğu ya da uygulanamazlık nedeniyle puanlanmadı; toplam 100'e oranlandı (* işareti).":"";
const inf=[["Kurum",p.k],["Kurum türü",p.t],["Unvan",p.u],["Atanma",p.d],["Doğum yılı",p.dy],["Eğitim",p.ed],["Kariyer",p.kr]].filter(r=>r[1]);
$("dbody").innerHTML=`<div class="nav2"><button class="btn" id="bk">← Listeye dön</button>${prv?`<button class="btn" data-go="${prv}">‹ Önceki</button>`:""}${nxt?`<button class="btn" data-go="${nxt}">Sonraki ›</button>`:""}</div>
<div class="dh"><div class="av big" style="--c:${avc(p)}">${esc(ini(p.n))}</div><div><h2 tabindex="-1">${esc(p.n)}</h2><div class="ro">${esc(p.u)} · ${esc(p.k)}</div><div class="tags">${tagMap(p)}</div></div><div class="big2">${big(p.os,"Özgeçmiş")}${big(p.ls,"Liyakat")}</div></div>
${cmp}${warn?`<div class="warn">${warn}</div>`:""}
<div class="cols"><div><h3>Özgeçmiş skoru</h3>${sub(p.o,OL,p.g&&p.g.o,"o")}</div><div><h3>Liyakat skoru</h3>${sub(p.l,LL,p.g&&p.g.l,"l")}</div></div>
<div class="cols" style="margin-bottom:48px"><div><h3>Bilgiler</h3><dl>${inf.map(r=>`<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join("")}</dl></div>
<div class="src"><h3>Kaynaklar</h3>${p.bio?`<p>Resmî biyografi ve fotoğraf: <a href="${esc(p.bio)}">${esc(host(p.bio))}</a></p>`:'<p class="note">Resmî biyografi sayfası bulunamadı.</p>'}${(p.src||[]).map((u,i)=>`<p>Kaynak ${i+1}: <a href="${esc(u)}">${esc(host(u))}</a></p>`).join("")}<p><a href="#yontem">Puanlar nasıl hesaplandı?</a></p><p class="note">Son kontrol: 22 Kasım 2026</p></div></div>`;
$("bk").onclick=()=>{back=true;location.hash=""};
$("dbody").querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{location.hash="p"+b.dataset.go});
}

/* ---------- yönlendirme ---------- */
let back=false;
function route(){
const h=location.hash,m=h.match(/^#p(\d+)$/),p=m&&P.find(x=>x.id==m[1]);
$("list").style.display=p?"none":"block";$("detail").style.display=p?"block":"none";
if(p){detail(p);scrollTo(0,0);$("dbody").querySelector("h2").focus({preventScroll:true});return}
draw();
if(h==="#yontem"){const d=$("yontem");d.open=true;d.scrollIntoView()}
else if(h&&$(h.slice(1)))$(h.slice(1)).scrollIntoView();
else if(back){scrollTo(0,listY);back=false}
}
addEventListener("hashchange",route);
const navs=[...document.querySelectorAll(".secnav a")];
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)navs.forEach(a=>a.classList.toggle("on",a.dataset.s===e.target.id))}),{rootMargin:"-45% 0px -50% 0px"});
["ozet","dagilim","liste"].forEach(id=>io.observe($(id)));
const ro=new ResizeObserver(draw);ro.observe(fig);
overview();renderChips();cards();route();
}
</script>
</body>
</html>
