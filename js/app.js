"use strict";
/* Pet Heroes Companion — vanilla SPA */
const PETS = window.PETS||[], META = window.META||{}, AREAS = window.AREAS||[],
      REBIRTHS = window.REBIRTHS||[], LEADERS = window.LEADERS||[], SRC = window.SOURCES||{sources:[]},
      TYPES = window.TYPES||{list:[],strong:{},weak:{}}, INCOME = window.INCOME||{areaBasePerHour:{},offline:{}},
      EVENTS = window.EVENTS||[], ALWAYS_ON = window.ALWAYS_ON||[], STORE = window.STORE||{pets:[],skins:[],other:[]},
      PETDEX = window.PETDEX||{rooms:[]}, TRADES = window.TRADES||{toGold:[],toCrystal:[],qty:{}},
      SHOP_ROT = window.SHOP_ROTATION||null, LEADER_PVE = window.LEADER_PVE||{}, LEADER_BENCH = window.LEADER_BENCH||{};
const APP_VERSION = "1.2";  // bump this every release (shown on Home so users can confirm they're updated)
const $ = (s,r=document)=>r.querySelector(s);
const el = (tag,cls,html)=>{const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e;};
const esc = s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const slug = s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
I18N.initLang();
const T=(k,v)=>I18N.t(k,v), C=k=>I18N.c(k);
const tips_data = ()=> C("tips") || (META.tips||[]);
const leaderT = (n,field)=>{ const L=C("leaders"); return (L&&L[n]&&L[n][field]); };

const typeColor = t=>`var(--t-${t||"Normal"})`;
const rarColor  = r=>`var(--r-${r||"Other"})`;

/* number formatting with game suffix tiers */
const SUF=["","K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","De","UnD"];
function fmtNum(v){
  if(v==null||(typeof v==="number"&&isNaN(v)))return "—";
  if(!isFinite(v))return "∞";
  if(v<1000)return (Math.round(v*100)/100).toString();
  let tier=Math.floor(Math.log10(v)/3); tier=Math.min(tier,SUF.length-1);
  let m=v/Math.pow(10,tier*3);
  let s=m.toFixed(m<10?3:m<100?2:1).replace(/\.?0+$/,"");
  return s+" "+SUF[tier];
}
function fmtHrs(h){
  if(!isFinite(h)) return "—";
  if(h<1) return Math.max(1,Math.round(h*60))+" min";
  if(h<48){ const H=Math.floor(h), m=Math.round((h-H)*60); return m?`${H}h ${m}m`:`${H}h`; }
  return (h/24).toFixed(1)+" d";
}
function parseNum(str){
  str=String(str).trim().replace(/,/g,"");
  let m=str.match(/^([\d.]+)\s*([A-Za-z]+)?$/); if(!m)return NaN;
  let val=parseFloat(m[1]); if(!m[2])return val;
  let i=SUF.findIndex(s=>s.toLowerCase()===m[2].toLowerCase());
  return i<0?NaN:val*Math.pow(10,i*3);
}

/* pet image or placeholder */
function petAvatar(p,cls=""){
  const wrap=el("div","pavatar "+cls);
  if(p.img){
    const img=el("img"); img.loading="lazy"; img.alt=p.name; img.src="images/pets/"+p.img;
    img.onerror=()=>{img.remove(); wrap.appendChild(placeholder(p));};
    wrap.appendChild(img);
  } else wrap.appendChild(placeholder(p));
  return wrap;
}
function placeholder(p){
  const ph=el("div","ph",esc((p.name||"?").trim()[0]||"?"));
  ph.parentElement&&0; ph.style.cssText=`width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${typeColor(p.type)},var(--bg2))`;
  return ph;
}

/* ---------- PLAYER DATA (localStorage) ---------- */
const PH = {
  KEY:"phData_v1", data:{},
  load(){ try{ this.data = JSON.parse(localStorage.getItem(this.KEY)||"{}"); }catch(e){ this.data={}; } },
  save(){ try{ localStorage.setItem(this.KEY, JSON.stringify(this.data)); }catch(e){} },
  get(id){ return this.data[id]||{owned:0,released:0}; },
  set(id,patch){ const cur=this.get(id); this.data[id]={...cur,...patch};
    if(!this.data[id].owned && !this.data[id].released) delete this.data[id]; this.save(); },
  owned(id){ return (this.get(id).owned)||0; },
  released(id){ return (this.get(id).released)||0; },
  hasAny(id){ return !!this.data[id] && (this.data[id].owned>0||this.data[id].released>0); },
  profile(){ try{ return JSON.parse(localStorage.getItem("phProfile")||"{}"); }catch(e){ return {}; } },
  setProfile(p){ try{ const cur=this.profile(); localStorage.setItem("phProfile", JSON.stringify({...cur,...p})); }catch(e){} },
  fav(){ try{ return localStorage.getItem("phFav")||null; }catch(e){ return null; } },
  setFav(id){ try{ if(this.fav()===id) localStorage.removeItem("phFav"); else localStorage.setItem("phFav",id); }catch(e){} },
  reset(){ this.data={}; this.save(); try{ localStorage.removeItem("phProfile"); localStorage.removeItem("phFav"); }catch(e){} }
};
/* ---------- SOUND FX (cute pops, Web Audio — no files) ---------- */
const SFX = {
  ctx:null, muted:(()=>{ try{ return localStorage.getItem("phMute")==="1"; }catch(e){ return false; } })(),
  setMuted(m){ this.muted=m; try{ localStorage.setItem("phMute", m?"1":"0"); }catch(e){} },
  ac(){ if(!this.ctx){ try{ this.ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return this.ctx; },
  blip(f1,f2,dur,vol){ if(this.muted)return; const c=this.ac(); if(!c)return; if(c.state==="suspended")c.resume();
    const o=c.createOscillator(), g=c.createGain(), t=c.currentTime;
    o.type="sine"; o.frequency.setValueAtTime(f1,t); o.frequency.exponentialRampToValueAtTime(f2,t+dur);
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||0.16,t+0.012); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t+dur+0.02); },
  pop(){ this.blip(520,880,0.10); },        // mark obtained
  unpop(){ this.blip(540,300,0.09,0.12); }, // unmark
  fav(){ this.blip(700,1180,0.13); setTimeout(()=>this.blip(1180,1480,0.08),70); }, // favorite (two-note)
  tap(){ this.blip(600,720,0.05,0.08); }
};
PH.load();
const byId = id => PETS.find(p=>p.petId===id);
const byName = nm => PETS.find(p=>p.name===nm);
function typeMult(atk,def){
  if((TYPES.strong[atk]||[]).includes(def))return 2;
  if((TYPES.weak[atk]||[]).includes(def))return 0.5;
  return 1;
}
// avg type effectiveness across a (possibly multi-type) leader
function avgMult(atkType, defTypes){ if(!defTypes||!defTypes.length)return 1; return defTypes.reduce((a,t)=>a+typeMult(atkType,t),0)/defTypes.length; }
// avg effectiveness of a multi-type attacker (leader) against a single defender type (player pet)
function avgMult2(atkTypes, defType){ if(!atkTypes||!atkTypes.length)return 1; return atkTypes.reduce((a,t)=>a+typeMult(t,defType),0)/atkTypes.length; }
// PvE leader battle (faithful to tracker "PvE Calculator"): win if player kills the leader before it kills you.
// team = array of petIds. Each pet uses its base DPS and its current released-count Boosted HP.
const PVE_CRIT = 1.339; // Critical Level 339 — scales both sides, so it cancels in the verdict (kept for TTK display)
function leaderBattle(teamIds, L){
  const pets=teamIds.map(byId).filter(Boolean);
  const lv=LEADER_PVE[L.n];
  if(!lv || !pets.length) return null;
  // player: effective DPS counts each pet's type advantage vs the leader; HP is the sum of boosted HP
  let pEffDPS=0, pHP=0, rawDPS=0;
  pets.forEach(p=>{ rawDPS+=p.dps||0; pEffDPS += (p.dps||0)*avgMult(p.type, L.types); pHP += petMaxHP(p, PH.released(p.petId)); });
  pEffDPS*=PVE_CRIT;
  // leader: its damage scales by the team's avg resistance to the leader's type(s) (leader attacking each player pet)
  const resist = pets.reduce((a,p)=>a+avgMult2(L.types, p.type),0)/pets.length;
  const lEffDPS = lv.effDPS*PVE_CRIT*resist;
  const playerTTK = lv.effHP/pEffDPS;      // seconds for player to kill leader
  const leaderTTK = pHP/lEffDPS;           // seconds for leader to kill player
  return { win: playerTTK<leaderTTK, playerTTK, leaderTTK, margin: leaderTTK/playerTTK,
           playerDPS:pEffDPS, playerHP:pHP, rawDPS, leaderHP:lv.effHP, leaderDPS:lEffDPS,
           needDPSx: playerTTK/leaderTTK }; // >1 means you'd need that much more DPS (or HP) to win
}
// is this pet only obtainable from a pet leader (hard to farm many)?
function isLeaderOnly(name){
  const d=dropIndex[name]; if(!d||!d.length)return false;
  return d.every(s=>/Leader|Legend/i.test(s.src));
}
// pet name -> leader number it's the reward of (you only obtain it AFTER beating that leader)
const REWARD_LEADER={};
LEADERS.forEach(L=>{ if(L.reward) REWARD_LEADER[L.reward]=L.n; });

// best (highest %) non-leader egg source for a pet name
function bestEgg(name){
  const d=(dropIndex[name]||[]).filter(s=>!/Leader|Legend|Rebirth/i.test(s.src));
  return d.length ? d.slice().sort((a,b)=>b.pct-a.pct)[0] : null;
}
// player income/hr: their typed-in real rate if set (active farming is far above passive area income),
// else the game's passive area formula AreaBasePerHour × (1+rebirths×0.2).
function playerIncome(prof){
  prof=prof||PH.profile();
  if(prof.incHr!=null && isFinite(prof.incHr) && prof.incHr>0) return prof.incHr;
  const area=prof.area!=null?Math.max(1,Math.min(38,prof.area)):1;
  const reb=prof.rebirths!=null?Math.max(0,prof.rebirths):0;
  return (INCOME.areaBasePerHour[area]||1)*(1+reb*0.2);
}
function hasIncomeBasis(prof){ prof=prof||PH.profile(); return (prof.incHr>0)||prof.area!=null||prof.rebirths!=null; }
// best farmable egg source for a pet (highest drop %, excluding rebirth/leader), with its gold/hatch cost
function hatchSourceFor(name){
  let best=null;
  SRC.sources.forEach(s=>{
    if(/Rebirth|Leader|Legend/i.test(s.group||"")) return;
    s.drops.forEach(dr=>{ if(dr.pet===name && dr.pct>0){
      if(!best||dr.pct>best.pct) best={egg:dr.from||s.name, pct:dr.pct, gold:parseNum(s.cost)}; }});
  });
  return best;
}
// versatility: how many leaders each pet is type-effective for (reuse value across the progression)
const PET_USES={};
PETS.forEach(p=>{ let c=0; LEADERS.forEach(L=>{ if(L.types.some(T=>typeMult(p.type,T)===2) && !(REWARD_LEADER[p.name]>=L.n)) c++; }); PET_USES[p.petId]=c; });
// acquisition model. rankPer = per-copy grind weight (for ranking). costType drives the human display.
// Big pets cost scarce Rebirth Coins (1 per hatch, 1 coin per rebirth) → genuinely expensive to stack.
function acquisitionCost(pet){
  const cat=pet.category, direct=bestEgg(pet.name);
  if(direct) return {rankPer:100/direct.pct, label:`${direct.src} (${direct.pct}%)`, tier:cat==="Rainbow"?4:1, costType:"eggs"};
  if(cat==="Golden"){
    let best=null;
    TRADES.toGold.filter(t=>t.resultId===pet.petId).forEach(t=>{const e=bestEgg(t.input); if(e&&(!best||e.pct>best.pct))best={...e,q:t.qty,from:t.input};});
    if(best) return {rankPer:best.q*(100/best.pct), label:`trade ${best.q}× ${best.from}`, tier:3, costType:"eggs"};
  }
  if(cat==="Crystal"){
    const ci=TRADES.toCrystal.filter(t=>t.resultId===pet.petId)[0];
    if(ci){ let best=null;
      TRADES.toGold.filter(t=>t.result===ci.input).forEach(t=>{const e=bestEgg(t.input); if(e&&(!best||e.pct>best.pct))best={...e};});
      if(best) return {rankPer:150*(100/best.pct), label:`trade 150× (${best.src})`, tier:5, costType:"eggs"};
    }
    return {rankPer:1e6, label:"trade-up (Crystal)", tier:5, costType:"eggs"};
  }
  if(cat==="Rainbow") return {rankPer:1e5, label:"luck-based (Rainbow)", tier:5, costType:"luck"};
  if(cat==="Big") return {rankPer:2000, label:"Rebirth Coin egg", tier:4, costType:"coins", coinsPer:1/0.35};
  const any=(dropIndex[pet.name]||[])[0];
  if(any) return {rankPer:100/(any.pct||0.5), label:any.from||any.src, tier:4, costType:"eggs"};
  return {rankPer:5e4, label:"event / special", tier:4, costType:"eggs"};
}
// human-readable cost for n copies (eggs to hatch, or scarce Rebirth Coins)
function costDisplay(a,n){
  if(a.costType==="coins") return T("opt_coins",{n:Math.max(1,Math.round((a.coinsPer||1)*n))});
  if(a.costType==="luck") return esc(a.label);
  return T("opt_eggs",{n:fmtNum(Math.max(1,Math.round(a.rankPer*n)))});
}
// EGG-centric plan: which eggs to farm. Each hatch gives a basket of pets, so an egg whose
// co-drops are also type-effective (now or for later leaders) is more efficient to farm.
function eggTier(n){ return n<150?1 : n<600?2 : n<2500?3 : n<12000?4 : 5; }
function buildLeaderPlan(L){
  const hps=(L.recommended||[]).map(r=>r.hp||0).filter(h=>h>0).sort((a,b)=>a-b);
  const targetHP=hps.length ? hps[Math.floor(hps.length/2)] : 1500;
  const copies=L.elite?1:15;
  const prof=PH.profile(); const hasProfile=(prof.area!=null||prof.rebirths!=null);
  const pArea=Math.max(1,Math.min(38, prof.area!=null?prof.area:15));
  const income=playerIncome(prof);
  // accessible egg sources for THIS player
  const acc=SRC.sources.filter(s=>{
    if(s.group==="Area"){ const n=parseInt(s.name.replace(/\D/g,""))||99; return n<=pArea; }
    if(s.group==="Rebirth Egg") return false;  // rebirth eggs are for rebirthing/Big pets — not for beating leaders
    if(s.group==="Special Egg") return true;
    return false;  // skip leader-drop "source" as a farm target
  });
  const groups=[];
  acc.forEach(s=>{
    const egGold=parseNum(s.cost);
    const special = s.group==="Special Egg";
    // find the single STRONGEST useful pet you can efficiently get from this egg (quality, not cheapness)
    let best=null;
    s.drops.forEach(dr=>{
      const p=byName(dr.pet); if(!p) return;
      if((p.dps||0)<=1) return;                 // negligible damage (e.g. Chick) — never useful
      if(REWARD_LEADER[p.name]>=L.n) return;     // a reward from this/an earlier leader
      const eff=avgMult(p.type, L.types);        // type effectiveness vs this leader
      if(L.types.length<=1 && eff<1) return;     // only mono-type leaders skip pets weak vs the type
      const rel=releasedFromHP(p,targetHP);
      const hatches=Math.ceil((copies+rel)/(dr.pct/100));
      const goldCost=isFinite(egGold)?hatches*egGold:0;
      // total effort in HOURS: hatching (~9s each) + time to FARM the gold it costs. Gold matters a lot —
      // an egg costing many rebirths' worth of gold is absurd to hoard for, even if the pet is strong.
      const effort=hatches*9/3600 + ((isFinite(egGold)&&income>0)? goldCost/income : 0);
      const power=(p.dps||0)*(p.baseHP||0)*eff;  // pet strength (DPS×HP, type-adjusted)
      const value=power/Math.max(effort,0.001);  // strongest pet per unit of total effort (time + gold)
      if(!best || value>best.value) best={p, pct:dr.pct, rel, hatches, goldCost, power, value,
        forTypes:L.types.filter(T=>typeMult(p.type,T)===2)};
    });
    if(!best) return;
    const areaNum = s.group==="Area" ? (parseInt(s.name.replace(/\D/g,""))||0) : 0;
    // score = value of the strong pet; Special Event eggs are event-gated (~25min, random tier) → deprioritize
    const score=best.value*(special?0.08:1);
    groups.push({egg:s.name, cost:s.cost, hatches:best.hatches, goldCost:best.goldCost, egGold, special, areaNum, score,
      headline:best, tier:eggTier(best.hatches)});
  });
  // recommend the eggs that give the strongest useful pets (per hatch), not the cheapest
  const chosen=groups.sort((a,b)=>b.score-a.score).slice(0,3);
  return {targetHP, copies, elite:L.elite, groups:chosen, hasProfile, pArea, income};
}
// effective max HP of one copy of a pet given how many of it you've released (Verse formula)
function petMaxHP(pet, released){
  const base=pet.baseHP||0, b=pet.relHP||0, n=Math.max(0, released|0);
  let bonus;
  if(n<1000) bonus=n*b;
  else if(n<2500) bonus=1000*b + (n-1000)*(b/2);
  else if(n<5000) bonus=1000*b + 1500*(b/2) + (n-2500)*(b/5);
  else bonus=1000*b + 1500*(b/2) + 2500*(b/5) + (n-5000)*(b/10);
  return base+bonus;
}
// inverse: given a pet's current in-game HP, how many of it were released
function releasedFromHP(pet, hp){
  const base=pet.baseHP||0, b=pet.relHP||0;
  if(b<=0) return 0;
  let bonus=Math.max(0, hp-base);
  const t1=1000*b, t2=t1+1500*(b/2), t3=t2+2500*(b/5);
  if(bonus<=t1) return Math.round(bonus/b);
  if(bonus<=t2) return Math.round(1000 + (bonus-t1)/(b/2));
  if(bonus<=t3) return Math.round(2500 + (bonus-t2)/(b/5));
  return Math.round(5000 + (bonus-t3)/(b/10));
}

/* cross-ref: which sources drop each pet */
const dropIndex={};
SRC.sources.forEach(s=>s.drops.forEach(dr=>{
  (dropIndex[dr.pet]=dropIndex[dr.pet]||[]).push({src:dr.from?`${dr.from}`:s.name, pct:dr.pct, leader:s.group==="Pet Leader"});
}));

/* ---------------- ROUTER ---------------- */
const app=$("#app");
const views={home:renderHome,pets:renderPets,petdex:renderPetdex,eggs:renderEggs,
             leaders:renderLeaders,store:renderStore,calc:renderCalc,tips:renderTips,profile:renderProfile};
let curView="pets";
function go(view){
  curView=view;
  $$("#tabbar button").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  app.innerHTML=""; (views[view]||renderPets)(); window.scrollTo(0,0);
}
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
$("#tabbar").addEventListener("click",e=>{const b=e.target.closest("button"); if(b)go(b.dataset.view);});
// select-all on focus for numeric fields so typing overwrites the existing value (e.g. owned/released/HP)
document.addEventListener("focusin",e=>{
  const t=e.target;
  if(t&&t.matches&&t.matches('input[type=number],input[inputmode=numeric],input[inputmode=decimal]'))
    setTimeout(()=>{try{t.select();}catch(_){}} ,0);
});

/* ---------------- HOME ---------------- */
function renderHome(){
  const owned=PETS.filter(p=>PH.owned(p.petId)>0).length, total=PETS.length;
  const pct=total?Math.round(100*owned/total):0;
  const fav=PH.fav()?byId(PH.fav()):null;
  const playerName=(PH.profile().name||"").trim();

  // brand (only on Home now — no global header)
  const brand=el("div","home-brand");
  brand.innerHTML=`
    <img class="logoimg" src="images/logo.png" alt="Pet Heroes Adventure">
    <div class="brandtext">
      <h1 class="display"><span>${esc(T("brand_sub"))}</span></h1>
      <p class="ver"><b>app v${APP_VERSION}</b> · ${esc(T("ver_label",{n:PETS.length,v:META.version||""}))}</p>
    </div>
    <select id="langSel" class="langsel" aria-label="Language"></select>`;
  app.appendChild(brand);
  buildLangSel();

  // greeting row
  const greet=el("div","greet");
  greet.innerHTML=`
    <div class="greet-av">${fav&&fav.img?`<img src="images/pets/${esc(fav.img)}" alt="">`:`<span>🐾</span>`}</div>
    <div class="greet-txt">
      <p class="greet-hi">${esc(T("home_hi"))}</p>
      <h2 class="display greet-name">${esc(playerName||T("home_trainer"))}</h2>
    </div>
    <div class="greet-dex"><b>${pct}%</b><span>Dex</span></div>`;
  app.appendChild(greet);
  if(fav) greet.querySelector(".greet-av").onclick=()=>openPet(fav);

  // hero banner (game art + logo)
  const hero=el("div","hero");
  hero.innerHTML=`<img src="images/hero.png" alt="Pet Heroes Adventure" loading="eager">
    <div class="hero-sub">${esc(T("home_sub"))}</div>`;
  app.appendChild(hero);

  // highlight stat cards
  const today=shopToday();
  const todayPet=today?byName(today.pets[0]):null;
  const stats=el("div","statgrid");
  // card 1 — Pet Dex
  const c1=el("div","statcard sc-coral");
  c1.innerHTML=`
    <div class="sc-top"><svg class="sc-ic"><use href="#i-book"/></svg><span class="sc-big">${owned}</span></div>
    <div class="sc-l">${esc(T("nav_petdex"))} · ${pct}%</div>
    <button class="sc-btn">${esc(T("home_open"))}</button>`;
  c1.querySelector(".sc-btn").onclick=()=>go("petdex");
  stats.appendChild(c1);
  // card 2 — Today's shop
  const c2=el("div","statcard sc-blue");
  c2.innerHTML=`
    <div class="sc-top"><svg class="sc-ic"><use href="#i-bag"/></svg>${todayPet&&todayPet.img?`<img class="sc-thumb" src="images/pets/${esc(todayPet.img)}" alt="">`:`<span class="sc-big">${today?today.pets.length:0}</span>`}</div>
    <div class="sc-l">${esc(T("shop_today"))}${todayPet?` · ${esc(todayPet.name)}`:""}</div>
    <button class="sc-btn">${esc(T("home_open"))}</button>`;
  c2.querySelector(".sc-btn").onclick=()=>go("store");
  stats.appendChild(c2);
  app.appendChild(stats);

  // quick navigation
  app.appendChild(el("div","section-title",T("home_quick")));
  const links=[["pets","paw","nav_pets","#FFE2DB","#F9876F"],["petdex","book","nav_petdex","#E4ECFF","#6C8CF5"],["eggs","egg","nav_eggs","#FFF1D6","#D99A2B"],
               ["leaders","crown","nav_leaders","#F1E6FF","#9B6CF5"],["tips","bulb","nav_tips","#DDF3EC","#2FA98C"],["calc","calc","nav_calc","#FFE0EC","#F56CA0"]];
  const qn=el("div","quicknav");
  links.forEach(([v,ic,key,bg,col])=>{
    const c=el("button","qcard"); c.innerHTML=`<span class="qemoji" style="background:${bg}"><svg class="qic" style="color:${col}"><use href="#i-${ic}"/></svg></span><span>${esc(T(key))}</span>`;
    c.onclick=()=>go(v); qn.appendChild(c);
  });
  app.appendChild(qn);
}

/* ---------------- PETS ---------------- */
const INV_ORDER=(()=>{const m={}; (window.PET_INV_ORDER||[]).forEach((id,i)=>m[id]=i); return m;})();
let petFilter={q:"",type:"",rarity:"",sort:"dex",own:""}, filtersOpen=false;
function renderPets(){
  const types=[...new Set(PETS.map(p=>p.type))].sort();
  const rars=["Leader","Legendary","Crystal","Rainbow","Golden","Big","Event","Regular"].filter(r=>PETS.some(p=>p.rarity===r));
  const controls=el("div","controls");
  controls.innerHTML=`
    <div class="search"><input id="pq" type="search" placeholder="${T("pets_search",{n:PETS.length})}" value="${esc(petFilter.q)}"></div>
    <button id="pFiltersBtn" class="filterbtn"></button>
    <select id="psort">
      <option value="dex">${T("sort_dex")}</option>
      <option value="inv">${T("sort_inv")}</option>
      <option value="dps">${T("sort_dps")}</option>
      <option value="hp">${T("sort_hp")}</option>
      <option value="boost">${T("sort_boost")}</option>
      <option value="name">${T("sort_name")}</option>
    </select>`;
  app.appendChild(controls);
  const ownChips=el("div","chips ownchips"); ownChips.style.marginTop="10px"; app.appendChild(ownChips);
  const panel=el("div","filterpanel"+(filtersOpen?" open":""));
  const tchips=el("div","chips"); panel.appendChild(tchips);
  const rchips=el("div","chips"); rchips.style.marginTop="8px"; panel.appendChild(rchips);
  app.appendChild(panel);

  const countRow=el("div","controls"); countRow.style.margin="12px 0 0";
  countRow.innerHTML=`<span class="count" id="pcount"></span>`;
  app.appendChild(countRow);
  const grid=el("div","grid"); grid.id="pgrid"; app.appendChild(grid);

  const fbtn=$("#pFiltersBtn");
  const updFbtn=()=>{const n=(petFilter.type?1:0)+(petFilter.rarity?1:0);
    fbtn.innerHTML=`<span>⚙</span> ${n?T("filters_active",{n}):T("filters_btn")}`;
    fbtn.classList.toggle("on", n>0||filtersOpen);};
  fbtn.onclick=()=>{filtersOpen=!filtersOpen; panel.classList.toggle("open",filtersOpen); updFbtn();};

  $("#pq").addEventListener("input",e=>{petFilter.q=e.target.value;draw();});
  $("#psort").value=petFilter.sort;
  $("#psort").addEventListener("change",e=>{petFilter.sort=e.target.value;draw();});

  function buildChips(){
    ownChips.innerHTML="";
    [["","filter_all"],["owned","filter_owned"],["missing","filter_missing"]].forEach(([f,l])=>
      ownChips.appendChild(mkChip(T(l),petFilter.own===f,()=>{petFilter.own=f;draw();})));
    tchips.innerHTML=""; rchips.innerHTML="";
    tchips.appendChild(mkChip(T("chip_all"),petFilter.type==="",()=>{petFilter.type="";draw();}));
    types.forEach(t=>tchips.appendChild(mkChip(t,petFilter.type===t,()=>{petFilter.type=petFilter.type===t?"":t;draw();},typeColor(t))));
    rchips.appendChild(mkChip(T("chip_all_rarities"),petFilter.rarity==="",()=>{petFilter.rarity="";draw();}));
    rars.forEach(r=>rchips.appendChild(mkChip(r,petFilter.rarity===r,()=>{petFilter.rarity=petFilter.rarity===r?"":r;draw();},rarColor(r))));
  }
  function draw(){
    buildChips(); updFbtn();
    let list=PETS.filter(p=>{
      if(petFilter.own){const has=PH.owned(p.petId)>0;
        if(petFilter.own==="owned"&&!has)return false;
        if(petFilter.own==="missing"&&has)return false;}
      if(petFilter.type&&p.type!==petFilter.type)return false;
      if(petFilter.rarity&&p.rarity!==petFilter.rarity)return false;
      if(petFilter.q){const q=petFilter.q.toLowerCase();
        if(!(p.name.toLowerCase().includes(q)||p.type.toLowerCase().includes(q)||(p.category||"").toLowerCase().includes(q)))return false;}
      return true;
    });
    const s=petFilter.sort;
    list.sort((a,b)=> s==="name"?a.name.localeCompare(b.name)
      : s==="inv"?((INV_ORDER[a.petId]??9999)-(INV_ORDER[b.petId]??9999))
      : s==="dex"?(a.dex||999)-(b.dex||999)
      : s==="hp"?(b.baseHP||0)-(a.baseHP||0)
      : s==="boost"?(b.boostedHP||0)-(a.boostedHP||0)
      : (b.dps||0)-(a.dps||0));
    const g=$("#pgrid"); g.innerHTML="";
    $("#pcount").textContent=T("pets_count",{n:list.length});
    if(!list.length){g.innerHTML=`<div class="empty">${T("pets_empty")}</div>`;return;}
    const frag=document.createDocumentFragment();
    list.forEach(p=>frag.appendChild(petCard(p)));
    g.appendChild(frag);
  }
  draw();
}
function mkChip(label,on,onClick,color){
  const c=el("button","chip"+(on?" on":""),esc(label));
  if(on&&color)c.style.cssText=`background:${color};color:#0c0f22;border-color:transparent`;
  c.onclick=onClick; return c;
}
function petCard(p){
  const c=el("div","pcard");
  const bar=el("div","rbar"); bar.style.background=rarColor(p.rarity); c.appendChild(bar);
  const ownCount=PH.owned(p.petId);
  if(ownCount>0){c.classList.add("owned"); c.appendChild(el("span","ownbadge","✓ "+ownCount));}
  c.appendChild(petAvatar(p));
  c.appendChild(el("div","pname",esc(p.name)));
  const meta=el("div","pmeta");
  meta.appendChild(badge(p.type,typeColor(p.type)));
  meta.appendChild(badge(p.rarity,rarColor(p.rarity)));
  c.appendChild(meta);
  const st=el("div","pstats");
  st.appendChild(stat(fmtNum(p.dps),"DPS"));
  st.appendChild(stat(fmtNum(p.baseHP),"HP"));
  st.appendChild(stat(p.hitsPerSec!=null?p.hitsPerSec.toFixed(2):"—","hits/s"));
  c.appendChild(st);
  c.onclick=()=>openPet(p);
  return c;
}
function badge(txt,color){const b=el("span","badge",esc(txt)); b.style.cssText=`background:${color};color:#0c0f22`; return b;}
function stat(v,l){const s=el("div","pstat"); s.innerHTML=`<b>${esc(v)}</b><span>${esc(l)}</span>`; return s;}

function openPet(p){
  const card=$("#modalCard");
  card.innerHTML="";
  card.appendChild(Object.assign(el("button","modal-close","×"),{onclick:closeModal}));
  const favBtn=el("button","modal-fav");
  const isFav=()=>PH.fav()===p.petId;
  const syncFav=()=>{favBtn.textContent=isFav()?"★":"☆"; favBtn.classList.toggle("on",isFav());};
  favBtn.onclick=()=>{ PH.setFav(p.petId); SFX.fav(); syncFav(); };
  syncFav(); card.appendChild(favBtn);
  const head=el("div","mhead");
  head.appendChild(petAvatar(p));
  head.appendChild(el("div",null,`<h2>${esc(p.name)}</h2>
    <div class="pmeta" style="justify-content:flex-start;margin-top:6px">
      <span class="badge" style="background:${typeColor(p.type)};color:#0c0f22">${esc(p.type)}</span>
      <span class="badge" style="background:${rarColor(p.rarity)};color:#0c0f22">${esc(p.category||p.rarity)}</span>
      ${p.dex?`<span class="tag">${T("dex_num",{n:p.dex})}</span>`:""}
    </div>`));
  card.appendChild(head);
  const sg=el("div","statgrid");
  sg.innerHTML=`
    ${sb(T("st_dps"),fmtNum(p.dps))}${sb(T("st_dmg"),fmtNum(p.dmg))}
    ${sb(T("st_hits"),p.hitsPerSec!=null?p.hitsPerSec.toFixed(3):"—")}${sb(T("st_cd"),p.cd!=null?p.cd+"s":"—")}
    ${sb(T("st_basehp"),fmtNum(p.baseHP))}${sb(T("st_relhp"),p.releaseHP||"—")}`;
  card.appendChild(sg);

  // PERSONAL collection tracking
  const owned=PH.owned(p.petId), rel=PH.released(p.petId);
  const mine=el("div","mine");
  mine.innerHTML=`<h3>${T("your_collection")}</h3>
    <div class="minegrid">
      <label>${T("owned")} <input id="mOwned" type="number" min="0" inputmode="numeric" value="${owned}"></label>
      <label>${T("your_hp")} <input id="mHP" type="text" inputmode="decimal" value="${fmtNum(petMaxHP(p,rel))}"></label>
      <label>${T("released")} <input id="mRel" type="number" min="0" inputmode="numeric" value="${rel}"></label>
    </div>
    <div class="sub" id="mHPsub" style="margin-top:10px"></div>`;
  card.appendChild(mine);
  const setSub=(r)=>{const extra=petMaxHP(p,r)-p.baseHP;
    $("#mHPsub").innerHTML = r>0
      ? T("hp_sub_some",{base:fmtNum(p.baseHP),extra:`<b>${fmtNum(extra)}</b>`,n:r})
      : T("hp_sub_none");};
  setSub(rel);
  $("#mOwned").addEventListener("input",()=>{const o=Math.max(0,parseInt($("#mOwned").value||0)||0); PH.set(p.petId,{owned:o});});
  $("#mRel").addEventListener("input",()=>{const r=Math.max(0,parseInt($("#mRel").value||0)||0);
    PH.set(p.petId,{released:r}); $("#mHP").value=fmtNum(petMaxHP(p,r)); setSub(r);});
  $("#mHP").addEventListener("input",()=>{const v=parseNum($("#mHP").value); if(!isFinite(v))return;
    const r=releasedFromHP(p,v); PH.set(p.petId,{released:r}); $("#mRel").value=r; setSub(r);});

  // trades
  const tHTML=tradeFor(p.petId);
  if(tHTML){const tt=el("div","msrc"); tt.appendChild(el("h3",null,T("trades"))); const w=el("div"); w.innerHTML=tHTML; tt.appendChild(w); card.appendChild(tt);}

  // sources
  const drops=dropIndex[p.name];
  if(p.petId==="chick"){
    const ms=el("div","msrc"); ms.appendChild(el("h3",null,T("where_get")));
    ms.appendChild(el("p","mut",T("src_chick"))); card.appendChild(ms);
  } else if(drops&&drops.length){
    const ms=el("div","msrc"); ms.appendChild(el("h3",null,T("where_get")));
    const wrap=el("div");
    drops.forEach(d=>{
      const label = d.leader
        ? `🏆 ${esc(d.src)} · ${T("get_guaranteed")}${d.pct>0?` · ${T("get_repeat",{p:d.pct})}`:` · ${T("get_one")}`}`
        : `${esc(d.src)} <b>${d.pct}%</b>`;
      wrap.appendChild(el("span","srcpill"+(d.leader?" leaderpill":""),label));
    });
    ms.appendChild(wrap); card.appendChild(ms);
  } else if(!tHTML){  // only show "no source" if there's no trade path either
    const ms=el("div","msrc"); ms.appendChild(el("h3",null,T("where_get")));
    ms.appendChild(el("p","mut",T("no_source"))); card.appendChild(ms);
  }
  openModal();
}
const sb=(l,v)=>`<div class="statbox"><span>${l}</span><b>${esc(v)}</b></div>`;
function tradeFor(id){
  if(!id)return null;
  const out=[];
  const g=TRADES.toGold.find(t=>t.inputId===id);
  if(g) out.push(T("trade_to",{q:g.qty, x:`<b style="color:var(--r-Golden)">${esc(g.result)}</b>`}));
  const gi=TRADES.toGold.filter(t=>t.resultId===id);
  if(gi.length) out.push(T("trade_from_many",{q:gi[0].qty, list:gi.map(t=>esc(t.input)).join(", ")}));
  const c=TRADES.toCrystal.find(t=>t.inputId===id);
  if(c) out.push(T("trade_to",{q:c.qty, x:`<b style="color:var(--r-Crystal)">${esc(c.result)}</b>`}));
  const ci=TRADES.toCrystal.filter(t=>t.resultId===id);
  if(ci.length) out.push(T("trade_from_one",{q:ci[0].qty, x:`<b style="color:var(--r-Golden)">${esc(ci[0].input)}</b>`}));
  return out.length? out.map(o=>`<p class="desc" style="margin:4px 0">${o}</p>`).join("") : null;
}

/* ---------------- PETDEX ---------------- */
let petdexFilter="all";
function renderPetdex(){
  app.appendChild(el("p","section-sub",T("petdex_intro")));
  const rooms=PETDEX.rooms;
  const prog=el("div","dexprog");
  prog.innerHTML=`<div class="dexbar"><i id="dexFill"></i></div><span class="dexpct" id="dexPct"></span>`;
  app.appendChild(prog);
  const chips=el("div","chips"); chips.style.margin="0 0 12px";
  [["all","filter_all"],["missing","filter_missing"],["owned","filter_owned"]].forEach(([f,l])=>chips.appendChild(mkChip(T(l),petdexFilter===f,()=>{petdexFilter=f;go("petdex");})));
  app.appendChild(chips);

  const titleEls={};
  rooms.forEach(room=>{
    const title=el("div","section-title"); titleEls[room.room]=title; app.appendChild(title);
    const grid=el("div","dexgrid");
    room.pets.forEach(x=>{
      const has=PH.owned(x.id)>0;
      if(petdexFilter==="missing"&&has) return;
      if(petdexFilter==="owned"&&!has) return;
      grid.appendChild(dexTile(x,refresh));
    });
    if(!grid.children.length) grid.appendChild(el("div","mut",T("none")));
    app.appendChild(grid);
  });
  function refresh(){
    let have=0,total=0;
    rooms.forEach(room=>{
      const h=room.pets.filter(x=>PH.owned(x.id)>0).length;
      have+=h; total+=room.pets.length;
      if(titleEls[room.room]) titleEls[room.room].innerHTML=`${esc(room.room)} <span class="mut" style="font-weight:600">${h}/${room.pets.length}</span>`;
    });
    const pct=total?Math.round(100*have/total):0;
    const f=$("#dexFill"); if(f) f.style.width=pct+"%";
    const pe=$("#dexPct"); if(pe) pe.textContent=T("petdex_prog",{have,total,pct});
  }
  refresh();
}
function dexTile(x,refresh){
  const pet=byId(x.id);
  const t=el("div","dextile"+(PH.owned(x.id)>0?" has":""));
  const av=el("div","pavatar small");
  const src = (pet&&pet.img) ? "images/pets/"+pet.img : "images/pets/"+slug(x.name)+".png";  // fallback to slug image (e.g. Chick)
  {const im=el("img");im.loading="lazy";im.alt=x.name;im.src=src;im.onerror=()=>{im.remove();av.appendChild(placeholder({name:x.name,type:pet?pet.type:"Normal"}));};av.appendChild(im);}
  t.appendChild(av);
  t.appendChild(el("div","dexname",esc(x.name)));
  const chk=el("button","dexchk"); chk.textContent=PH.owned(x.id)>0?"✓":"+";
  chk.onclick=(e)=>{e.stopPropagation(); const cur=PH.owned(x.id); PH.set(x.id,{owned:cur>0?0:1});
    const has=PH.owned(x.id)>0; t.classList.toggle("has",has); chk.textContent=has?"✓":"+"; has?SFX.pop():SFX.unpop(); refresh&&refresh();};
  t.appendChild(chk);
  if(pet) t.onclick=()=>openPet(pet);
  return t;
}

/* ---------------- EGGS / ODDS ---------------- */
function renderEggs(){
  app.appendChild(el("p","section-sub",T("eggs_intro")));
  const groups=[...new Set(SRC.sources.map(s=>s.group))];
  groups.forEach(g=>{
    app.appendChild(el("div","section-title",g==="Area"?T("area_eggs"):g));
    SRC.sources.filter(s=>s.group===g).forEach(s=>app.appendChild(srcCard(s)));
  });
  // seasonal lists
  if(SRC.seasonalCommon){
    app.appendChild(el("div","section-title",T("eggs_seasonal")));
    const c=el("div","icard");
    c.innerHTML=`<div class="desc"><b>${T("common")} (0.10%):</b> ${SRC.seasonalCommon.map(esc).join(", ")}</div>
      <div class="desc" style="margin-top:8px"><b>${T("rare")} (0.05%):</b> ${SRC.seasonalRare.map(esc).join(", ")}</div>`;
    app.appendChild(c);
  }
}
function srcCard(s){
  const d=el("details","src");
  const sum=el("summary");
  const hasNew=s.drops.some(dr=>{const p=byName(dr.pet); return p && PH.owned(p.petId)===0;});
  sum.innerHTML=`<span class="arrow">▶</span> ${esc(s.name)} ${hasNew?`<span class="newbadge" title="Has pets you don't own yet">!</span>`:""}${s.note?`<span class="tag">${esc(s.note)}</span>`:""}<span class="cost">${esc(s.cost||"")}</span>`;
  d.appendChild(sum);
  s.drops.forEach(dr=>{
    const row=el("div","droprow");
    const pct=Math.min(100,dr.pct);
    row.innerHTML=`<span class="dpname">${esc(dr.pet)}${dr.from?` <span class="tag">${esc(dr.from)}</span>`:""}</span>
      <span class="bar"><i style="width:${pct}%"></i></span>
      <span class="dpct">${dr.pct}%</span>`;
    // clicking a drop opens the pet if known
    const pet=PETS.find(p=>p.name===dr.pet);
    if(pet){row.style.cursor="pointer"; row.onclick=()=>openPet(pet);}
    d.appendChild(row);
  });
  return d;
}

/* ---------------- AREAS ---------------- */
function renderAreas(){
  app.appendChild(el("p","section-sub",T("areas_intro")));
  const wrap=el("div","tablewrap");
  const inc=INCOME.areaBasePerHour||{};
  let rows=AREAS.map(a=>`<tr>
    <td><b>${a.area}</b></td><td>${esc(a.unlock)}</td>
    <td class="mut">${inc[a.area]?fmtNum(inc[a.area]):"—"}</td>
    <td>${a.rebirthsReq?a.rebirthsReq+"★":"<span class='mut'>—</span>"}</td>
    <td>${a.petSlots?`${a.petSlots}× <span class='mut'>(${esc(a.petSlotCost)})</span>`:(a.petSlotCost!=="-"?esc(a.petSlotCost):"<span class='mut'>—</span>")}</td>
    <td>${a.petCoins?`${a.petCoins} <span class='mut'>${a.petCoins>1?T("coins"):T("coin")}</span>`:"<span class='mut'>—</span>"}</td>
    <td class="num">${a.petPowerLvl}</td><td class="num">${a.petCritLvl}</td><td class="num">${a.playerCritLvl}</td>
  </tr>`).join("");
  wrap.innerHTML=`<table><thead><tr>
    <th>${T("th_area")}</th><th>${T("th_unlock")}</th><th>${T("th_income")}</th><th>${T("th_rebirths")}</th><th>${T("th_petslot")}</th><th>${T("th_petcoins")}</th>
    <th class="num">${T("th_petpwr")}</th><th class="num">${T("th_petcrit")}</th><th class="num">${T("th_plrcrit")}</th>
  </tr></thead><tbody>${rows}</tbody></table>`;
  app.appendChild(wrap);
  app.appendChild(el("p","section-sub",T("areas_foot")));
}

/* ---------------- REBIRTHS ---------------- */
function renderRebirths(){
  // lookup
  const calc=el("div","calc");
  calc.innerHTML=`<h3>${T("reb_next_title")}</h3><p class="desc">${T("reb_next_desc")}</p>
    <div class="field"><label>${T("reb_current")}</label><input id="rbIn" type="number" min="0" max="100" value="2"></div>
    <div class="result"><div class="lbl">${T("reb_next_lbl")}</div><div class="big" id="rbOut">—</div><div class="sub" id="rbSub"></div></div>`;
  app.appendChild(calc);
  const upd=()=>{
    let n=Math.max(0,Math.min(100,parseInt($("#rbIn").value||0)));
    const next=REBIRTHS[n+1]||REBIRTHS[REBIRTHS.length-1];
    const cur=REBIRTHS[n];
    $("#rbOut").textContent=next?next.cost:"—";
    $("#rbSub").innerHTML=T("reb_next_sub",{a:`<b>${n}</b>`,ab:cur?cur.bonusPct:0,b:`<b>${n+1}</b>`,bb:next?next.bonusPct:0});
  };
  $("#rbIn").addEventListener("input",upd); upd();
}

/* ---------------- LEADERS ---------------- */
function leaderPlan(L){
  const needed=L.elite?1:15;
  const targetHP=Math.max(0,...(L.recommended||[]).map(r=>r.hp||0));
  const cands=[];
  PETS.forEach(p=>{
    const owned=PH.owned(p.petId); if(!owned)return;
    const mults=L.types.map(t=>typeMult(p.type,t));
    // regular leaders: skip pets weak vs a leader type. Elite/Legend are multi-type (5-8 types) so
    // almost every pet is weak vs *something* — keep them all; HP/DPS carry those fights.
    if(L.types.length<=1 && Math.min(...mults)<1) return;  // only mono-type leaders drop weak pets
    const hp=petMaxHP(p, PH.released(p.petId));
    const dps=p.dps||0;
    const effDps=dps*avgMult(p.type, L.types);   // damage adjusted for type advantage vs this leader
    // balanced score: a pet must both DEAL damage and SURVIVE — rank by effective DPS × HP
    // (this is what the team's HP×DPS product needs), not HP alone.
    cands.push({p,owned,hp,dps,effDps,score:effDps*hp,strong:Math.max(...mults)>=2});
  });
  cands.sort((a,b)=>(b.score-a.score)||(b.hp-a.hp));
  // missing recommended pets to farm (skip leader-only drops per request)
  const farm=(L.recommended||[]).map(r=>r.pet)
    .filter((nm,i,a)=>a.indexOf(nm)===i)
    .map(byName).filter(Boolean)
    .filter(p=>PH.owned(p.petId)===0 && !isLeaderOnly(p.name))
    .map(p=>{const d=(dropIndex[p.name]||[]).find(s=>!/Leader|Legend/i.test(s.src)); return {p,src:d};})
    .filter(x=>x.src).slice(0,4);
  // Build the actual 15-SLOT team that maximizes the team's (ΣHP)×(Σeffective-DPS) — what the battle
  // verdict needs. Non-elite leaders let you stack the SAME pet (capped by how many you own); elite/
  // Legend take distinct pets (1 each). Greedy by marginal gain in the product → picks a COMPLEMENTARY
  // mix (e.g. a few high-DPS pets + many tanky ones) instead of naively stacking one pet.
  const pool=cands.map(c=>({c, left: L.elite?1:Math.max(1,c.owned||1)}));
  let sumHP=0, sumDps=0; const useMap=new Map();
  for(let i=0;i<15;i++){
    let best=null, bestGain=-1;
    for(const e of pool){
      if(e.left<=0) continue;
      const gain=(sumHP+e.c.hp)*(sumDps+e.c.effDps)-sumHP*sumDps;
      if(gain>bestGain){ bestGain=gain; best=e; }
    }
    if(!best) break;
    best.left--; sumHP+=best.c.hp; sumDps+=best.c.effDps;
    useMap.set(best.c,(useMap.get(best.c)||0)+1);
  }
  const team=[...useMap.entries()].map(([c,use])=>({p:c.p,use,hp:c.hp,dps:c.dps,owned:c.owned,strong:c.strong}))
    .sort((a,b)=>(INV_ORDER[a.p.petId]??9999)-(INV_ORDER[b.p.petId]??9999));  // same order as the in-game inventory
  const teamHP=sumHP, teamDPS=team.reduce((a,t)=>a+t.use*t.dps,0), teamSlots=team.reduce((a,t)=>a+t.use,0);
  return {needed,targetHP,cands,team,teamHP,teamDPS,teamSlots,farm};
}
function renderLeaders(){
  app.appendChild(el("p","section-sub",T("leaders_intro")));
  const list=el("div","cardlist");
  LEADERS.forEach(L=>{
    const c=el("div","icard");
    const desc=leaderT(L.n,"desc")||L.desc;
    const Ltips=leaderT(L.n,"tips")||L.tips||[];
    let team=(L.recommended||[]).filter(t=>!(REWARD_LEADER[t.pet]>=L.n)).map(t=>`<span class="teamitem"><span class="cnt">${t.count}×</span> ${esc(t.pet)} · <b>${fmtNum(t.hp)} HP</b>${t.priority?` <span class="tag">${esc(t.priority)}</span>`:""}</span>`).join("");
    let tips=Ltips.map(t=>`<li>${esc(t)}</li>`).join("");
    // personalized plan
    const plan=leaderPlan(L);
    let planHTML="";
    if(plan.team.length){
      planHTML=plan.team.map(x=>{
        const ready=x.hp>=plan.targetHP*0.8;  // enough HP to survive?
        return `<span class="teamitem"><span class="cnt">${x.use}×</span> ${esc(x.p.name)} · <b>${fmtNum(x.hp)} HP</b> · <b>${fmtNum(x.dps)} DPS</b> ${x.strong?`<span class="tag" style="background:var(--good);color:#0c0f22">${T("badge_strong")}</span>`:""}${ready?"":`<span class="tag" style="background:var(--bad);color:#0c0f22">${T("badge_low")}</span>`}</span>`;
      }).join("");
      planHTML+=`<div class="teamtotal">${T("team_total",{slots:plan.teamSlots,hp:`<b>${fmtNum(plan.teamHP)}</b>`,dps:`<b>${fmtNum(plan.teamDPS)}</b>`})}${plan.teamSlots<15?` <span class="mut">${T("team_short")}</span>`:""}</div>`;
    }
    let farmHTML=plan.farm.length? `<p class="desc" style="margin-top:8px">${T("farm_prompt")} ${plan.farm.map(x=>`<b>${esc(x.p.name)}</b> <span class="mut">(${esc(x.src.src)} ${x.src.pct}%)</span>`).join(" · ")}</p>` : "";
    // egg-centric plan: which eggs to farm (each gives a basket of useful pets)
    const eggPlan=buildLeaderPlan(L);
    const optHTML=eggPlan.groups.map(g=>{
      const goldStr=(isFinite(g.egGold)&&g.goldCost>0)?` <span class="tag">${T("opt_gold",{g:fmtNum(g.goldCost)})}</span>`:"";
      const h=g.headline;
      return `<div class="egggroup">
        <div class="egghead">🥚 <b>${esc(g.egg)}</b> <span class="grind g${g.tier}">${T("opt_hatches",{n:fmtNum(g.hatches)})}</span>${goldStr}${g.special?` <span class="tag warnspecial">⚠ ${T("opt_special_warn")}</span>`:""}</div>
        <div class="optmeta">→ <b>${esc(h.p.name)}</b> <span class="badge" style="background:${typeColor(h.p.type)};color:#0c0f22">${esc(h.p.type)}</span> · ${fmtNum(h.p.dps)} DPS · ${fmtNum(h.p.baseHP)} HP${h.forTypes.length?` <span class="tag" style="background:var(--good);color:#0c0f22">${T("badge_strong")}</span>`:""}</div>
      </div>`;}).join("");
    // Without a saved profile the recommendations would just be generic — show only the prompt.
    const optInner = !eggPlan.hasProfile
      ? `<p class="optprompt" data-goprofile>${T("opt_setprofile")}</p>`
      : `${optHTML||`<p class="optnote">${T("opt_none")}</p>`}<p class="optnote">${T("opt_note")}</p>`;
    c.innerHTML=`<h3>#${L.n} · ${esc(L.name)} ${L.boss?"👑":L.elite?"⭐":""}</h3>
      <div class="lead-types">${L.types.map(t=>`<span class="badge" style="background:${typeColor(t)};color:#0c0f22">${esc(t)}</span>`).join("")}</div>
      ${LEADER_PVE[L.n]?`<p class="desc" style="margin-top:6px">${T("leader_stats",{hp:`<b>${fmtNum(LEADER_PVE[L.n].effHP)}</b>`,dps:`<b>${fmtNum(LEADER_PVE[L.n].effDPS)}</b>`})}</p>`:""}
      <p class="desc" style="margin-top:8px">${esc(desc)}</p>
      <p class="desc" style="margin-top:6px">${T("reward")} <b style="color:var(--good)">${esc(L.reward)}</b> ${L.dropPct?`<span class="tag">${T("on_repeats",{p:L.dropPct})}</span>`:""}</p>
      ${(()=>{const b=LEADER_BENCH[L.n]; if(!b)return ""; const extra=b.afk?` · <span class="mut">${T("bench_afk",{hp:b.afk})}</span>`:b.typ?` · <span class="mut">${T("bench_typ",{hp:b.typ})}</span>`:""; return `<p class="benchnote">${T("bench_line",{hp:`<b>${esc(b.eff)}</b>`})}${extra}</p>`;})()}
      <div class="optbox"><h4>${T("opt_title")} <span class="tag">${L.elite?T("opt_each"):T("opt_15")}</span></h4>${optInner}</div>
      ${planHTML?`<div class="planbox"><h4>${T("your_best")}</h4><div class="team">${planHTML}</div>${farmHTML}</div>`:""}
      ${tips?`<ul class="tips">${tips}</ul>`:""}`;
    list.appendChild(c);
  });
  app.appendChild(list);
  $$("[data-goprofile]").forEach(e=>e.onclick=()=>go("profile"));
}

/* ---------------- PLAYER PROFILE ---------------- */
function exportData(){
  const data={};
  ["phData_v1","phProfile","phFav","phMute","phLang","phPresets","phBattleTeam","phBattleLeader","phStats"].forEach(k=>{const v=localStorage.getItem(k); if(v!=null)data[k]=v;});
  const blob=new Blob([JSON.stringify({app:"pet-heroes-companion",version:1,data})],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="pet-heroes-backup.json";
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),2000);
}
function importData(file, ok, err){
  const r=new FileReader();
  r.onload=()=>{ try{ const parsed=JSON.parse(r.result); const data=parsed.data||parsed;
      if(typeof data!=="object") throw 0;
      Object.entries(data).forEach(([k,v])=>{ if(/^ph/.test(k) && typeof v==="string") localStorage.setItem(k,v); });
      PH.load(); SFX.muted=localStorage.getItem("phMute")==="1"; I18N.initLang(); ok&&ok(); }
    catch(e){ err&&err(); } };
  r.onerror=()=>err&&err();
  r.readAsText(file);
}
// Petdex share code (generated in-game) → dex numbers. Mirror of petdex_share_code_device.verse (v2, dex-indexed).
const PETDEX_ALPHABET="0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const PETDEX_MAXDEX={1:250};  // version symbol → max dex covered (keep in lockstep with the game device)
function decodePetdexCode(input){
  // strip any separators (spaces, dashes, etc.) so chunked codes like "1ZZZZZ-ZZZZZ-…" paste fine
  let s=String(input||"").toUpperCase().replace(/[^A-Z0-9]/g,"").replace(/[IL]/g,"1").replace(/O/g,"0");
  if(s.length<3) return {ok:false,err:"generic"};
  const val=c=>PETDEX_ALPHABET.indexOf(c);
  if([...s].some(c=>val(c)<0)) return {ok:false,err:"generic"};
  const maxDex=PETDEX_MAXDEX[val(s[0])];
  if(maxDex==null) return {ok:false,err:"version"};
  const B=Math.ceil(maxDex/5);
  if(s.length!==1+B+2) return {ok:false,err:"generic"};
  const body=s.slice(1,1+B), checksum=s.slice(1+B);
  let sum=0; for(const c of body) sum+=val(c);
  const M=sum%1024;
  if(PETDEX_ALPHABET[Math.floor(M/32)]+PETDEX_ALPHABET[M%32]!==checksum) return {ok:false,err:"generic"};
  const dexes=[];
  for(let g=0;g<B;g++){ const V=val(body[g]);
    for(let k=0;k<5;k++){ const dex=5*g+1+k; if(dex>maxDex)break; if(V&(16>>k))dexes.push(dex); } }
  return {ok:true, dexes};
}
// mark the decoded pets as owned (>=1), never lowering an existing count
function applyPetdexImport(dexes){
  const byDex={}; PETS.forEach(p=>byDex[p.dex]=p);
  let added=0, matched=0;
  dexes.forEach(d=>{ const p=byDex[d]; if(!p) return; matched++;
    if(PH.owned(p.petId)<1){ PH.set(p.petId,{owned:1}); added++; } });
  return {added, matched};
}
function renderProfile(){
  const prof=PH.profile();
  const reb=prof.rebirths!=null?prof.rebirths:null, area=prof.area!=null?prof.area:null;
  const owned=PETS.filter(p=>PH.owned(p.petId)>0).length, total=PETS.length, pct=Math.round(100*owned/total);
  const favPet=PH.fav()?byId(PH.fav()):null;

  // hero profile card
  const hero=el("div","profcard");
  const av = favPet
    ? `<div class="profpet">${favPet.img?`<img src="images/pets/${favPet.img}" alt="${esc(favPet.name)}">`:`<span class="ph" style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;background:linear-gradient(135deg,${typeColor(favPet.type)},var(--bg2))">${esc(favPet.name[0])}</span>`}</div>`
    : `<div class="profpet empty">★</div>`;
  const playerName=(prof.name||"").trim();
  hero.innerHTML=`<div class="profhead">${av}
      <div class="profinfo">
        <h2 class="display" id="profName">${playerName?esc(playerName):T("home_trainer")}</h2>
        <p class="profsub">${favPet?`⭐ ${T("profile_fav")} · <span class="badge" style="background:${typeColor(favPet.type)};color:#0c0f22">${esc(favPet.type)}</span>`:T("profile_nofav")}</p>
      </div></div>
    <div class="profstats">
      <div><b id="psReb">${reb!=null?reb:"—"}</b><span>${T("profile_rebirths")}</span></div>
      <div><b id="psArea">${area!=null?area:"—"}</b><span>${T("profile_area")}</span></div>
      <div><b id="psInc">${fmtNum(playerIncome(prof))}</b><span id="psIncLbl">${(prof.incHr>0?T("profile_income"):T("profile_income_base"))}</span></div>
      <div><b>${owned}</b><span>${pct}% Pet Dex</span></div>
    </div>`;
  app.appendChild(hero);

  // edit progress card
  const ec=el("div","calc");
  ec.innerHTML=`<h3>${T("profile_title")}</h3><p class="desc">${T("profile_desc")}</p>
    <label style="display:block">${T("profile_name")} <input id="prName" type="text" maxlength="20" value="${esc(prof.name||"")}" placeholder="${esc(T("profile_name_ph"))}"></label>
    <div class="minegrid" style="margin-top:10px">
      <label>${T("profile_rebirths")} <input id="prReb" type="number" min="0" max="100" value="${reb!=null?reb:""}" placeholder="0"></label>
      <label>${T("profile_area")} <input id="prArea" type="number" min="1" max="38" value="${area!=null?area:""}" placeholder="1-38"></label>
    </div>
    <label style="display:block;margin-top:10px">${T("profile_income_in")} <input id="prInc" type="text" inputmode="decimal" value="${prof.incHr!=null?fmtNum(prof.incHr):""}" placeholder="${esc(T("profile_income_ph"))}"></label>
    <p class="desc" style="margin:6px 0 0">${T("profile_income_hint")}</p>
    <div class="sub" id="prSaved" style="margin-top:10px;color:var(--good);font-weight:700"></div>`;
  app.appendChild(ec);
  $("#prName").addEventListener("input",e=>{
    const nm=e.target.value.slice(0,20);
    PH.setProfile({name:nm});
    const pn=$("#profName"); if(pn) pn.textContent=nm.trim()||T("home_trainer");
    $("#prSaved").textContent=T("profile_saved"); clearTimeout(window._pnT); window._pnT=setTimeout(()=>{const s=$("#prSaved");if(s)s.textContent="";},1200);
  });
  const save=()=>{
    const r=$("#prReb").value===""?null:Math.max(0,Math.min(100,parseInt($("#prReb").value||0)));
    const a=$("#prArea").value===""?null:Math.max(1,Math.min(38,parseInt($("#prArea").value||1)));
    const iv=parseNum($("#prInc").value); const inc=($("#prInc").value.trim()===""||!isFinite(iv)||iv<=0)?null:iv;
    PH.setProfile({rebirths:r,area:a,incHr:inc});
    $("#psReb").textContent=r!=null?r:"—"; $("#psArea").textContent=a!=null?a:"—";
    $("#psInc").textContent=fmtNum(playerIncome(PH.profile()));
    { const lbl=$("#psIncLbl"); if(lbl) lbl.textContent=(inc>0?T("profile_income"):T("profile_income_base")); }
    $("#prSaved").textContent=T("profile_saved"); SFX.tap();
    clearTimeout(save._t); save._t=setTimeout(()=>{const e=$("#prSaved"); if(e)e.textContent="";},1400);
  };
  $("#prReb").addEventListener("input",save); $("#prArea").addEventListener("input",save); $("#prInc").addEventListener("input",save);

  // backup (export / import)
  const bk=el("div","calc");
  bk.innerHTML=`<h3>${T("profile_backup")}</h3><p class="desc">${T("profile_backup_desc")}</p>
    <div class="setrow"><button id="expBtn" class="filterbtn">${T("profile_export")}</button><button id="impBtn" class="filterbtn">${T("profile_import")}</button></div>
    <input id="impFile" type="file" accept="application/json,.json" style="display:none">
    <div class="sub" id="bkMsg" style="margin-top:10px;font-weight:700"></div>`;
  app.appendChild(bk);
  $("#expBtn").onclick=()=>{ exportData(); SFX.tap(); };
  $("#impBtn").onclick=()=>$("#impFile").click();
  $("#impFile").onchange=(e)=>{ const f=e.target.files[0]; if(!f)return;
    importData(f, ()=>{ const m=$("#bkMsg"); m.style.color="var(--good)"; m.textContent=T("profile_imported"); SFX.pop(); setTimeout(()=>go("profile"),700); },
                  ()=>{ const m=$("#bkMsg"); m.style.color="var(--bad)"; m.textContent=T("profile_import_err"); }); };

  // import petdex from the game (share code)
  const pdx=el("div","calc");
  pdx.innerHTML=`<h3>${T("petdex_title")}</h3><p class="desc">${T("petdex_desc")}</p>
    <input id="pdxCode" type="text" placeholder="${esc(T("petdex_placeholder"))}" autocapitalize="characters" autocomplete="off" spellcheck="false" style="width:100%;text-transform:uppercase;letter-spacing:1px">
    <button class="cta" id="pdxBtn" style="margin-top:10px">${T("petdex_btn")}</button>
    <div class="sub" id="pdxMsg" style="margin-top:10px;font-weight:700"></div>`;
  app.appendChild(pdx);
  $("#pdxBtn").onclick=()=>{
    const r=decodePetdexCode($("#pdxCode").value); const m=$("#pdxMsg");
    if(!r.ok){ m.style.color="var(--bad)"; m.textContent=r.err==="version"?T("petdex_err_version"):T("petdex_err"); SFX.unpop&&SFX.unpop(); return; }
    const res=applyPetdexImport(r.dexes);
    m.style.color="var(--good)"; m.textContent=T("petdex_ok",{n:res.added,total:res.matched}); SFX.pop&&SFX.pop();
    setTimeout(()=>go("profile"),1000);
  };

  // settings: sound + reset
  const set=el("div","calc");
  set.innerHTML=`<div class="setrow"><span>${T("profile_sound")}</span><button id="sndBtn" class="filterbtn"></button></div>
    <div class="setrow" style="margin-top:10px"><span>${T("profile_reset")}</span><button id="resetBtn" class="filterbtn">🗑</button></div>`;
  app.appendChild(set);
  const sndBtn=$("#sndBtn"); const updSnd=()=>{sndBtn.textContent=SFX.muted?"🔇 Off":"🔊 On"; sndBtn.classList.toggle("on",!SFX.muted);};
  sndBtn.onclick=()=>{SFX.setMuted(!SFX.muted); updSnd(); if(!SFX.muted)SFX.pop();}; updSnd();
  $("#resetBtn").onclick=()=>{ PH.reset(); go("profile"); };
}
/* ---------------- SHOP (V-Bucks) ---------------- */
function shopToday(){
  if(!SHOP_ROT) return null;
  const [y,m,d]=SHOP_ROT.anchorDate.split("-").map(Number);
  const anchor=Date.UTC(y,m-1,d), now=new Date();
  const today=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
  const days=Math.round((today-anchor)/86400000), mod=(a,n)=>((a%n)+n)%n;
  return { pets:SHOP_ROT.pets[mod(SHOP_ROT.petIndex0+days,SHOP_ROT.pets.length)],
           skins:SHOP_ROT.skins[mod(SHOP_ROT.skinIndex0+days,SHOP_ROT.skins.length)] };
}
function shopCountdown(){
  const now=new Date(), next=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()+1);
  const ms=next-now.getTime(), h=Math.floor(ms/3600000), mi=Math.floor(ms%3600000/60000);
  return `${h}h ${mi}m`;
}
const vbHTML=v=>`<span class="vbucks">${(v||0).toLocaleString("en-US")} <span>${T("vbucks")}</span></span>`;
function petOfferCard(name){
  const pet=byName(name), o=STORE.pets.find(x=>x.name===name);
  const c=el("div","pcard");
  if(pet){const bar=el("div","rbar");bar.style.background=rarColor(pet.rarity);c.appendChild(bar);}
  c.appendChild(petAvatar(pet||{name,type:"Mythical"}));
  c.appendChild(el("div","pname",esc(name)));
  if(o){const m=el("div","pmeta");m.style.marginTop="6px";m.innerHTML=vbHTML(o.vbucks);c.appendChild(m);}
  if(pet){c.style.cursor="pointer";c.onclick=()=>openPet(pet);}
  return c;
}
function skinOfferCard(name){
  const o=STORE.skins.find(x=>x.name===name);
  const c=el("div","pcard");
  const av=el("div","pavatar"); const im=el("img"); im.loading="lazy"; im.alt=name; im.src="images/skins/"+slug(name)+".png";
  im.onerror=()=>{im.remove(); av.appendChild(placeholder({name,type:"Mythical"}));};
  av.appendChild(im); c.appendChild(av);
  c.appendChild(el("div","pname",esc(name)));
  c.appendChild(el("div","pmeta","<span class='mut' style='font-size:11px'>"+T("skin_for",{pet:esc(o?o.pet:name)})+"</span>"));
  const m=el("div","pmeta"); m.style.marginTop="6px"; m.innerHTML=vbHTML(o?o.vbucks:0); c.appendChild(m);
  return c;
}
function renderStore(){
  // Today's rotating shop
  const today=shopToday();
  if(today){
    app.appendChild(el("div","section-title","🕛 "+T("shop_today")));
    app.appendChild(el("p","section-sub",T("shop_rotates",{t:shopCountdown()})));
    app.appendChild(el("div","minilabel",T("shop_pets")));
    const pg=el("div","grid"); today.pets.forEach(pid=>{const p=byId(pid); pg.appendChild(petOfferCard(p?p.name:pid));}); app.appendChild(pg);
    app.appendChild(el("div","minilabel",T("shop_skins")));
    const sg=el("div","grid"); today.skins.forEach(sid=>{const nm=(SHOP_ROT.skinMap||{})[sid]||sid; sg.appendChild(skinOfferCard(nm));}); app.appendChild(sg);
  }
  app.appendChild(el("p","section-sub",T("store_intro")));
  const vb=v=>`<span class="vbucks">${v.toLocaleString("en-US")} <span>${T("vbucks")}</span></span>`;
  // pets
  app.appendChild(el("div","section-title",T("shop_all_pets")));
  const pg=el("div","grid");
  [...STORE.pets].sort((a,b)=>b.vbucks-a.vbucks).forEach(o=>{
    const pet=PETS.find(p=>p.name===o.name);
    const c=el("div","pcard");
    if(pet){const bar=el("div","rbar");bar.style.background=rarColor(pet.rarity);c.appendChild(bar);}
    c.appendChild(petAvatar(pet||{name:o.name,type:"Mythical"}));
    c.appendChild(el("div","pname",esc(o.name)));
    const m=el("div","pmeta");m.appendChild(el("span",null,vb(o.vbucks)));c.appendChild(m);
    if(pet){c.style.cursor="pointer";c.onclick=()=>openPet(pet);}
    pg.appendChild(c);
  });
  app.appendChild(pg);
  // skins (with offer images)
  app.appendChild(el("div","section-title",T("shop_all_skins")));
  app.appendChild(el("p","section-sub",T("store_skins_desc")));
  const sg=el("div","grid");
  [...STORE.skins].sort((a,b)=>b.vbucks-a.vbucks).forEach(o=>{
    const c=el("div","pcard");
    const av=el("div","pavatar");
    const im=el("img"); im.loading="lazy"; im.alt=o.name; im.src="images/skins/"+slug(o.name)+".png";
    im.onerror=()=>{im.remove(); av.appendChild(placeholder({name:o.name,type:"Mythical"}));};
    av.appendChild(im); c.appendChild(av);
    c.appendChild(el("div","pname",esc(o.name)));
    c.appendChild(el("div","pmeta","<span class='mut' style='font-size:11px'>"+T("skin_for",{pet:esc(o.pet)})+"</span>"));
    const m=el("div","pmeta"); m.style.marginTop="6px"; m.innerHTML=vb(o.vbucks); c.appendChild(m);
    sg.appendChild(c);
  });
  app.appendChild(sg);
  // other
  app.appendChild(el("div","section-title",T("store_other")));
  const og=el("div","cardlist");
  STORE.other.forEach(o=>{
    const c=el("div","icard");
    const note=/Gold Pack/i.test(o.name) ? (o.note?o.note+" ":"")+T("shop_goldpack_note") : o.note;
    c.innerHTML=`<h3>${esc(o.name)}</h3>${note?`<p class="desc">${esc(note)}</p>`:""}<div style="margin-top:8px">${vb(o.vbucks)}</div>`;
    og.appendChild(c);
  });
  app.appendChild(og);
}

/* ---------------- CALCULATORS ---------------- */
function renderBattleCalc(){
  const loadJSON=(k,d)=>{ try{ return JSON.parse(localStorage.getItem(k))||d; }catch(e){ return d; } };
  const card=el("div","calc battlecalc");
  card.innerHTML=`<h3>${T("bc_title")}</h3><p class="desc">${T("bc_desc")}</p>
    <div class="bcrow">
      <select id="bcPreset" class="grow"></select>
      <button id="bcSave" class="minibtn">${T("bc_save")}</button>
      <button id="bcDel" class="minibtn" title="${esc(T("bc_delete"))}">🗑</button>
    </div>
    <div class="teamchips" id="bcTeam"></div>
    <select id="bcAdd"></select>
    <div class="teamstat" id="bcStat"></div>
    <div class="bclabel">${T("bc_leader")}</div>
    <select id="bcLeader"></select>
    <div class="result" id="bcVerdict"></div>`;
  app.appendChild(card);

  const allPets=PETS.slice().sort((a,b)=>(b.dps||0)-(a.dps||0));
  let team=loadJSON("phBattleTeam",[]).filter(id=>byId(id));
  let curLeader=parseInt(localStorage.getItem("phBattleLeader")||"1")||1;

  const addSel=$("#bcAdd");
  addSel.innerHTML=`<option value="">${esc(T("bc_addpet"))}</option>`+allPets.map(p=>`<option value="${esc(p.petId)}">${esc(p.name)} · ${fmtNum(p.dps)} DPS</option>`).join("");
  const ldrSel=$("#bcLeader");
  ldrSel.innerHTML=LEADERS.map(L=>`<option value="${L.n}"${L.n===curLeader?" selected":""}>#${L.n} · ${esc(L.name)}</option>`).join("");
  const presetSel=$("#bcPreset");
  const refreshPresets=(selId)=>{ const ps=loadJSON("phPresets",[]); presetSel.innerHTML=`<option value="">${esc(T("bc_working"))}</option>`+ps.map(p=>`<option value="${esc(p.id)}"${p.id===selId?" selected":""}>${esc(p.name)} (${p.pets.length})</option>`).join(""); };
  refreshPresets("");

  const saveTeam=()=>localStorage.setItem("phBattleTeam",JSON.stringify(team));
  const drawTeam=()=>{
    const box=$("#bcTeam"); box.innerHTML="";
    if(!team.length){ box.innerHTML=`<span class="teamempty">${esc(T("bc_emptyteam"))}</span>`; }
    team.forEach((id,i)=>{ const p=byId(id); if(!p)return;
      const chip=el("span","teamchip"); chip.innerHTML=`${esc(p.name)} <b aria-label="remove">×</b>`;
      chip.querySelector("b").onclick=()=>{ team.splice(i,1); saveTeam(); drawTeam(); drawVerdict(); };
      box.appendChild(chip);
    });
    let dps=0,hp=0; team.forEach(id=>{const p=byId(id); if(p){dps+=p.dps||0; hp+=petMaxHP(p,PH.released(id));}});
    $("#bcStat").innerHTML = team.length? T("bc_teamstat",{n:team.length,dps:`<b>${fmtNum(dps)}</b>`,hp:`<b>${fmtNum(hp)}</b>`}) : "";
  };
  const drawVerdict=()=>{
    const v=$("#bcVerdict");
    if(!team.length){ v.className="result"; v.innerHTML=`<div class="sub">${esc(T("bc_help"))}</div>`; return; }
    const L=LEADERS.find(x=>x.n===curLeader); const r=leaderBattle(team,L);
    if(!r){ v.className="result"; v.innerHTML=`<div class="sub">${esc(T("bc_nodata"))}</div>`; return; }
    v.className="result "+(r.win?"bcwin":"bclose");
    const head=r.win?`<div class="bcbig good">✅ ${T("bc_win",{leader:esc(L.name)})}</div>`
                    :`<div class="bcbig bad">❌ ${T("bc_lose",{leader:esc(L.name)})}</div>`;
    const detail=r.win?T("bc_margin",{x:r.margin.toFixed(2)}):T("bc_short",{x:r.needDPSx.toFixed(2)});
    v.innerHTML=`${head}<div class="sub">${detail}<br>${T("bc_ttk",{p:r.playerTTK.toFixed(1),l:r.leaderTTK.toFixed(1)})}</div>`;
  };

  addSel.onchange=()=>{ const id=addSel.value; addSel.value="";
    if(!id)return; if(team.length>=15){ $("#bcStat").innerHTML=`<span style="color:var(--warn)">${esc(T("bc_full"))}</span>`; return; }
    team.push(id); saveTeam(); drawTeam(); drawVerdict(); };
  ldrSel.onchange=()=>{ curLeader=parseInt(ldrSel.value)||1; localStorage.setItem("phBattleLeader",curLeader); drawVerdict(); };
  presetSel.onchange=()=>{ const id=presetSel.value; if(!id)return; const pr=loadJSON("phPresets",[]).find(x=>x.id===id);
    if(pr){ team=pr.pets.filter(x=>byId(x)); saveTeam(); drawTeam(); drawVerdict(); } };
  $("#bcSave").onclick=()=>{ if(!team.length)return; const name=(prompt(T("bc_savename"))||"").trim(); if(!name)return;
    const ps=loadJSON("phPresets",[]); const id="p"+(ps.reduce((m,x)=>Math.max(m,parseInt(x.id.slice(1))||0),0)+1);
    ps.push({id,name,pets:team.slice()}); localStorage.setItem("phPresets",JSON.stringify(ps)); refreshPresets(id); SFX.tap&&SFX.tap(); };
  $("#bcDel").onclick=()=>{ const id=presetSel.value; if(!id)return; if(!confirm(T("bc_delconfirm")))return;
    localStorage.setItem("phPresets",JSON.stringify(loadJSON("phPresets",[]).filter(x=>x.id!==id))); refreshPresets(""); };

  drawTeam(); drawVerdict();
}
// Stat formulas, exact from game stats_manager.verse (verified vs in-game Pet Stats panel):
// AttackPower(level) = (-113.15 + 116.1·1.004^mod) · (10 - 0.0001·cycle)^cycle · factor
//   mod = ((L-1) mod 50)+1, cycle = ceil(L/50)-1.  Player factor 1.0, Pet (Spirit) factor 0.4.
// CritRate% = level/10 (cap 100).  Rebirth gold multiplier = 1 + rebirths·0.2.
function powerFromLevel(L, factor){
  L=Math.max(1,Math.floor(L||1));
  const mod=((L-1)%50)+1, cycle=Math.ceil(L/50)-1;
  return (-113.15 + 116.1*Math.pow(1.004,mod)) * Math.pow(10-cycle*0.0001, cycle) * factor;
}
function critRatePct(L){ return Math.min(100, Math.max(0,(L||0))/10); }
// Active gold income. A broken object gives HP×0.1% gold, but the game RESPAWNS it after a fixed
// time (ManageRespawn → Sleep(RespawnTime), ~0.59s) — so once your DPS one-shots it you're
// RESPAWN-limited: income is capped by the area's object value, NOT your DPS. Model:
//   income/hr = min(effDPS×3.6, areaBasePerHour[area]) × rebirth × (+30% moving)
// The DPS term only wins while you're UNDER-powered for the area; otherwise income = the area rate.
const GOLD_PER_DPS_HR = 3.6;
function estimateIncome(teamIds, st, reb, moving, area){
  const petPow=powerFromLevel(st.sp,0.4);   // Pet Atk Power (global, from Pet Power level)
  const plPow=powerFromLevel(st.pp,1.0);     // player Attack Power (from Player Power level)
  let teamDps=0; teamIds.map(byId).filter(Boolean).forEach(p=>teamDps+=p.dps||0);
  const petCritMult=1+critRatePct(st.sc)/100, plCritMult=1+critRatePct(st.pc)/100;
  const petDPS=petPow*teamDps*petCritMult;   // pets do the bulk of farming damage
  const playerDPS=plPow*plCritMult;
  const effDPS=petDPS+playerDPS;
  const rebMult=1+Math.max(0,reb||0)*0.2;
  const dpsIncome=effDPS*GOLD_PER_DPS_HR;                 // uncapped, per-hour, pre-rebirth
  const areaCap=(area!=null)?(INCOME.areaBasePerHour[area]||0):Infinity;  // respawn cap = area object value
  const capped=dpsIncome>=areaCap;
  const income=Math.min(dpsIncome, areaCap)*rebMult*(moving?1.3:1);
  return {petPow, plPow, teamDps, petDPS, playerDPS, effDPS, rebMult, dpsIncome, areaCap, capped, income};
}
function renderIncomeCalc(){
  const loadJSON=(k,d)=>{ try{ return JSON.parse(localStorage.getItem(k))||d; }catch(e){ return d; } };
  const prof=PH.profile();
  const st=Object.assign({pp:1,pc:1,sp:1,sc:1,moving:false}, loadJSON("phStats",{}));
  const card=el("div","calc");
  card.innerHTML=`<h3>${T("inc_title")}</h3><p class="desc">${T("inc_desc")}</p>
    <div id="incTeamNote"></div>
    <div class="minegrid" style="margin-top:12px">
      <label>${T("inc_pp")} <input id="stPP" type="number" min="1" max="1600" value="${st.pp}"></label>
      <label>${T("inc_pc")} <input id="stPC" type="number" min="1" max="2000" value="${st.pc}"></label>
      <label>${T("inc_sp")} <input id="stSP" type="number" min="1" max="1600" value="${st.sp}"></label>
      <label>${T("inc_sc")} <input id="stSC" type="number" min="1" max="2000" value="${st.sc}"></label>
    </div>
    <label class="setrow" style="margin-top:12px"><span>${T("inc_moving")}</span>
      <input id="stMoving" type="checkbox" ${st.moving?"checked":""}></label>
    <div class="sub" id="incStats" style="margin-top:10px"></div>
    <p class="desc" style="margin-top:8px">${T("inc_hint")}</p>
    <div class="result"><div class="lbl">${T("inc_result")}</div><div class="big" id="incOut">—</div>
      <div class="sub" id="incSub"></div></div>
    <button class="cta" id="incUse" style="margin-top:12px">${T("inc_usebtn")}</button>`;
  app.appendChild(card);
  const readSt=()=>({ pp:Math.max(1,parseInt($("#stPP").value||1)||1), pc:Math.max(1,parseInt($("#stPC").value||1)||1),
    sp:Math.max(1,parseInt($("#stSP").value||1)||1), sc:Math.max(1,parseInt($("#stSC").value||1)||1), moving:$("#stMoving").checked });
  const upd=()=>{
    const t=loadJSON("phBattleTeam",[]).filter(id=>byId(id));
    $("#incTeamNote").innerHTML = t.length? `<p class="desc" style="margin:0">${T("inc_team",{n:t.length})}</p>` : `<p class="optprompt">${T("inc_noteam")}</p>`;
    const s=readSt(); localStorage.setItem("phStats", JSON.stringify(s));
    const r=estimateIncome(t, s, prof.rebirths||0, s.moving, prof.area);
    // show the converted stats so the player can sanity-check vs the game's Pet Stats panel
    $("#incStats").innerHTML=T("inc_computed",{atk:`<b>${fmtNum(r.plPow)}</b>`, pet:`<b>${fmtNum(r.petPow)}</b>`, pcrit:critRatePct(s.pc).toFixed(1), scrit:critRatePct(s.sc).toFixed(1)});
    $("#incOut").textContent = t.length? fmtNum(r.income)+"/hr" : "—";
    const tag = prof.area==null ? `<br><span style="color:var(--warn)">${T("inc_setarea")}</span>`
              : (r.capped ? `<br><span class="tag">${T("inc_capped",{a:prof.area})}</span>` : `<br><span class="tag" style="color:var(--warn)">${T("inc_underpowered",{a:prof.area})}</span>`);
    $("#incSub").innerHTML = t.length ? T("inc_breakdown",{dps:`<b>${fmtNum(r.effDPS)}</b>`, reb:`×${r.rebMult.toFixed(1)}`, mv:s.moving?" ×1.3":""})+tag : T("inc_noteam");
  };
  ["stPP","stPC","stSP","stSC"].forEach(id=>$("#"+id).addEventListener("input",upd));
  $("#stMoving").addEventListener("change",upd);
  $("#incUse").onclick=()=>{ const t=loadJSON("phBattleTeam",[]).filter(id=>byId(id)); if(!t.length)return;
    const s=readSt(); const r=estimateIncome(t, s, prof.rebirths||0, s.moving, prof.area);
    PH.setProfile({incHr:r.income}); SFX.tap&&SFX.tap();
    window._incSaved=true; go("calc"); };  // re-render so Hatch Goal farm-time uses the new income
  upd();
  if(window._incSaved){ window._incSaved=false; const s=$("#incSub"); if(s) s.innerHTML+=`<br><span style="color:var(--good)">${T("inc_used")}</span>`; }
}
function renderCalc(){
  renderBattleCalc();
  renderIncomeCalc();
  // Hatch goal — how long / how much to collect N of a pet
  const farmable=PETS.filter(p=>hatchSourceFor(p.name)).sort((a,b)=>(a.dex||999)-(b.dex||999));
  const prof=PH.profile();
  const hArea=prof.area!=null?Math.max(1,Math.min(38,prof.area)):null;
  const hReb=prof.rebirths!=null?Math.max(0,prof.rebirths):null;
  const ch=el("div","calc");
  const defPet=farmable.find(p=>/capybara/i.test(p.name))||farmable[0];
  ch.innerHTML=`<h3>${T("calc_hatch")}</h3><p class="desc">${T("calc_hatch_desc")}</p>
    <div class="field"><label>${T("lbl_hatch_pet")}</label>
      <select id="hgPet">${farmable.map(p=>`<option value="${esc(p.petId)}"${p===defPet?" selected":""}>${esc(p.name)}</option>`).join("")}</select></div>
    <div class="field"><label>${T("lbl_hatch_qty")}</label><input id="hgQty" type="number" min="1" max="1000000" value="100"></div>
    <div class="result"><div class="lbl">${T("res_hatch_hatches")}</div><div class="big" id="hgHatches">—</div>
      <div class="sub" id="hgSub"></div></div>`;
  app.appendChild(ch);
  const hgUpd=()=>{
    const pet=byId($("#hgPet").value); const qty=Math.max(1,parseInt($("#hgQty").value||1)||1);
    const src=pet&&hatchSourceFor(pet.name);
    if(!src){$("#hgHatches").textContent="—";$("#hgSub").textContent=T("hatch_noegg");return;}
    const hatches=Math.ceil(qty/(src.pct/100));
    const hatchHrs=hatches*9/3600;
    const gold=isFinite(src.gold)?hatches*src.gold:0;
    const income=hasIncomeBasis(prof)?playerIncome(prof):null;
    const farmHrs=(gold>0&&income)?gold/income:null;
    $("#hgHatches").textContent="~"+fmtNum(hatches);
    const lines=[`🥚 <b>${src.pct}%</b> ${T("hatch_from",{egg:esc(src.egg)})}`,
      `⏳ ${T("hatch_time",{h:fmtHrs(hatchHrs)})}`];
    if(gold>0) lines.push(`💰 ${T("hatch_gold",{g:`<b>${fmtNum(gold)}</b>`})}`);
    if(farmHrs!=null) lines.push(`🌾 ${T("hatch_farm",{h:fmtHrs(farmHrs),inc:fmtNum(income)})}`);
    else if(gold>0) lines.push(`<span class="optprompt" data-goprofile>${T("opt_setprofile")}</span>`);
    $("#hgSub").innerHTML=lines.join("<br>");
    $$("[data-goprofile]").forEach(e=>e.onclick=()=>go("profile"));
  };
  ["hgPet","hgQty"].forEach(id=>$("#"+id).addEventListener("input",hgUpd)); hgUpd();

  // Offline earnings
  const O=INCOME.offline||{};
  const c0=el("div","calc");
  c0.innerHTML=`<h3>${T("calc_offline")}</h3><p class="desc">${T("calc_offline_desc",{pct:Math.round((O.fraction||0.1)*100),h:O.capHours||24})}</p>
    <div class="field"><label>${T("lbl_area")}</label><input id="ofArea" type="number" min="1" max="38" value="20"></div>
    <div class="field"><label>${T("lbl_rebirths")}</label><input id="ofReb" type="number" min="0" max="100" value="2"></div>
    <div class="field"><label>${T("lbl_hours")}</label><input id="ofHrs" type="number" min="0" max="48" step="0.5" value="12"></div>
    <div class="result"><div class="lbl">${T("res_offline")}</div><div class="big" id="ofOut">—</div>
      <div class="sub" id="ofSub"></div></div>`;
  app.appendChild(c0);
  const ofUpd=()=>{
    let area=Math.max(1,Math.min(38,parseInt($("#ofArea").value||1)));
    let reb=Math.max(0,Math.min(100,parseInt($("#ofReb").value||0)));
    let hrs=Math.max(0,Math.min(48,parseFloat($("#ofHrs").value||0)));
    let base=(INCOME.areaBasePerHour||{})[area]||0;
    let cappedH=Math.min(hrs,O.capHours||24);
    let rebMult=1+reb*0.2;
    let payout=base*rebMult*cappedH*(O.fraction||0.1);
    // cap vs next rebirth cost
    let nextCost=Math.pow(10,O.rebirthBaseExp||33)*Math.pow(O.rebirthMult||1.15,Math.max(reb-2,0));
    let dayFrac=cappedH/(O.capHours||24);
    let capGold=nextCost*(O.maxRebirthFraction||0.2)*dayFrac;
    let capped=false;
    if(payout>capGold){payout=capGold;capped=true;}
    if(area>=(O.minRebirthFloorArea||31)){let floor=nextCost*(O.minRebirthFraction||0.01)*dayFrac; if(payout<floor)payout=floor;}
    $("#ofOut").textContent=fmtNum(payout);
    const status=(hrs>(O.capHours||24)?`<span style="color:var(--warn)">${T("offline_caphint",{h:O.capHours||24})}</span> · `:"")+(capped?`<span style="color:var(--warn)">${T("offline_capped")}</span>`:T("offline_within"));
    $("#ofSub").innerHTML=T("offline_sub",{inc:`<b>${fmtNum(base*rebMult)}</b>`,status});
  };
  ["ofArea","ofReb","ofHrs"].forEach(id=>$("#"+id).addEventListener("input",ofUpd)); ofUpd();

  // type effectiveness — interactive matchup + full chart
  const types=TYPES.list||[];
  const mult=(atk,def)=>{
    if((TYPES.strong[atk]||[]).includes(def))return 2.0;
    if((TYPES.weak[atk]||[]).includes(def))return 0.5;
    return 1.0;
  };
  const c4=el("div","calc");
  c4.innerHTML=`<h3>${T("calc_type")}</h3>
    <p class="desc">${T("calc_type_desc")}</p>
    <div class="field"><label>${T("lbl_attacker")}</label><select id="teA">${types.map(t=>`<option ${t==="Bug"?"selected":""}>${t}</option>`).join("")}</select>
      <label>${T("lbl_defender")}</label><select id="teD">${types.map(t=>`<option ${t==="Wild"?"selected":""}>${t}</option>`).join("")}</select></div>
    <div class="result"><div class="lbl">${T("res_typemult")}</div><div class="big" id="teOut">—</div><div class="sub" id="teSub"></div></div>`;
  app.appendChild(c4);
  const teUpd=()=>{
    let a=$("#teA").value,d=$("#teD").value,m=mult(a,d);
    let lbl=m===2?`<span style="color:var(--good)">${T("type_super")}</span>`:m===0.5?`<span style="color:var(--bad)">${T("type_notvery")}</span>`:T("type_neutral");
    $("#teOut").textContent="×"+m.toFixed(1);
    $("#teSub").innerHTML=`${esc(a)} → ${esc(d)}: ${lbl}`;
  };
  $("#teA").addEventListener("change",teUpd);$("#teD").addEventListener("change",teUpd);teUpd();

  // full chart
  const c5=el("div","calc");
  let head=`<th>${T("th_atkdef")}</th>`+types.map(t=>`<th class="num" title="${t}">${t.slice(0,3)}</th>`).join("");
  let rows=types.map(a=>`<tr><td><b>${esc(a)}</b></td>`+types.map(d=>{
    let m=mult(a,d);
    let bg=m===2?"rgba(58,210,159,.22)":m===0.5?"rgba(255,107,138,.22)":"transparent";
    let col=m===2?"var(--good)":m===0.5?"var(--bad)":"var(--mut)";
    return `<td class="num" style="background:${bg};color:${col};font-weight:${m!==1?800:400}">${m===1?"·":"×"+m}</td>`;
  }).join("")+`</tr>`).join("");
  c5.innerHTML=`<h3>${T("type_chart_title")}</h3><p class="desc">${T("type_chart_desc")}</p>
    <div class="tablewrap"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
  app.appendChild(c5);

  // folded-in: Rebirth cost lookup + Areas reference
  app.appendChild(el("div","section-title",T("calc_rebirth")));
  renderRebirths();
  app.appendChild(el("div","section-title",T("calc_areas")));
  renderAreas();
}

/* ---------------- TIPS ---------------- */
function renderTips(){
  app.appendChild(el("p","section-sub",T("tips_intro")));
  const list=el("div","cardlist");
  tips_data().forEach(t=>{
    const c=el("div","icard"); c.innerHTML=`<h3>${esc(t.t)}</h3><p class="desc">${esc(t.d)}</p>`; list.appendChild(c);
  });
  app.appendChild(list);
}

/* ---------------- MODAL ---------------- */
function openModal(){const m=$("#modal"); m.classList.remove("hidden"); m.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden";}
function closeModal(){const m=$("#modal"); m.classList.add("hidden"); m.setAttribute("aria-hidden","true"); document.body.style.overflow="";}
$("#modal").addEventListener("click",e=>{if(e.target.dataset.close!==undefined||e.target.classList.contains("modal-backdrop"))closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});

/* ---------------- EVENT BANNER ---------------- */
function renderBanner(){
  const box=$("#banner"); if(!box)return;
  const now=new Date();
  const parsed=EVENTS.map(e=>({...e,s:new Date(e.start),e2:new Date(e.end)}))
                     .filter(e=>!isNaN(e.s)&&!isNaN(e.e2));
  const active=parsed.filter(e=>now>=e.s&&now<=e.e2).sort((a,b)=>a.e2-b.e2)[0];
  const upcoming=parsed.filter(e=>e.s>now).sort((a,b)=>a.s-b.s)[0];
  const days=(d)=>Math.max(0,Math.ceil((d-now)/86400000));
  const dword=n=>n===1?T("day"):T("days");
  let html;
  if(active){
    const n=days(active.e2);
    html=`<div class="banner-card live"><span class="bemoji">${active.emoji||"🎉"}</span>
      <div class="btext"><b>${T("ban_live",{name:esc(active.name)})}</b><span>${T("ban_live_sub",{note:esc(active.note||""),n,d:dword(n)})}</span></div>
      <span class="bpill">${T("pill_active")}</span></div>`;
  } else if(upcoming){
    const n=days(upcoming.s);
    html=`<div class="banner-card next"><span class="bemoji">${upcoming.emoji||"🗓️"}</span>
      <div class="btext"><b>${T("ban_next",{name:esc(upcoming.name)})}</b><span>${T("ban_next_sub",{note:esc(upcoming.note||""),n,d:dword(n)})}</span></div>
      <span class="bpill">${T("pill_soon")}</span></div>`;
  } else {
    const strip=ALWAYS_ON.map(a=>`<span class="aon">${a.emoji} ${esc(a.name)}</span>`).join("");
    html=`<div class="banner-card idle"><span class="bemoji">🎮</span>
      <div class="btext"><b>${T("ban_idle")}</b><span>${T("ban_idle_sub")} ${strip}</span></div></div>`;
  }
  box.innerHTML=html;
}

/* ---------------- I18N STATIC + SWITCHER ---------------- */
function applyStatic(){
  const NAV={home:"nav_home",pets:"nav_pets",petdex:"nav_petdex",eggs:"nav_eggs",leaders:"nav_leaders",store:"nav_store",calc:"nav_calc",tips:"nav_tips",profile:"nav_profile"};
  $$("#tabbar button").forEach(b=>{const k=NAV[b.dataset.view]; const l=b.querySelector(".bl"); if(k&&l)l.textContent=T(k);});
  const bs=$("#brandSub"); if(bs)bs.textContent=T("brand_sub");
  const vl=$("#verLabel"); if(vl)vl.textContent=T("ver_label",{n:PETS.length,v:META.version||""});
  $("#verFoot").textContent=META.version||"";
  const foot=$(".app-footer p"); if(foot)foot.innerHTML=T("footer",{v:`<strong>${esc(META.version||"")}</strong>`});
  document.documentElement.lang=I18N.cur;
}
function buildLangSel(){
  const sel=$("#langSel"); if(!sel)return;
  sel.innerHTML=Object.entries(I18N.langs).map(([k,v])=>`<option value="${k}">${esc(v)}</option>`).join("");
  sel.value=I18N.cur;
  sel.onchange=()=>{ I18N.set(sel.value); applyStatic(); renderBanner(); go(curView); };
}

/* ---------------- INIT ---------------- */
buildLangSel();
applyStatic();
renderBanner();
go("home");
