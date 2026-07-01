/* i18n framework + English master. Other languages are merged in below (translations.js-style blocks). */
window.I18N = {
  langs: { pt:"Português", en:"English", es:"Español", fr:"Français", de:"Deutsch", ja:"日本語" },
  fallback: "en",
  cur: "pt",
  strings: {},   // filled per language: { en:{...}, pt:{...}, ... }
  content: {},   // structured (tips, leader texts) per language
  initLang(){
    let stored=null; try{ stored=localStorage.getItem("phLang"); }catch(e){}
    if(stored && this.langs[stored]){ this.cur=stored; return; }
    const b=(navigator.language||"pt").slice(0,2).toLowerCase();
    this.cur = this.langs[b] ? b : "pt";
  },
  set(l){ this.cur = this.langs[l] ? l : "pt"; try{ localStorage.setItem("phLang", this.cur); }catch(e){} },
  t(key, vars){
    const s = (this.strings[this.cur]&&this.strings[this.cur][key]) ??
              (this.strings[this.fallback]&&this.strings[this.fallback][key]) ?? key;
    return vars ? s.replace(/\{(\w+)\}/g, (_,k)=> (vars[k]!=null?vars[k]:`{${k}}`)) : s;
  },
  c(key){
    return (this.content[this.cur]&&this.content[this.cur][key]) ??
           (this.content[this.fallback]&&this.content[this.fallback][key]);
  }
};

/* ---------------- ENGLISH (master) ---------------- */
I18N.strings.en = {
  brand_sub:"Companion",
  ver_label:"{n} pets · data {v}",
  footer:"Data from community tracker. Thanks to Orchan and Joey for keeping it updated.",
  // nav
  nav_home:"Home", nav_pets:"Pets", nav_petdex:"PetDex", nav_eggs:"Eggs", nav_areas:"Areas",
  nav_rebirths:"Rebirths", nav_leaders:"Leaders", nav_store:"Shop", nav_calc:"Calculators", nav_tips:"Tips",
  nav_profile:"Profile",
  // home
  home_sub:"Your Pet Heroes Adventure companion", home_dex_title:"Your Pet Dex",
  home_collected:"{have} / {total} pets collected", home_explore:"Explore",
  home_hi:"Hi there! 👋", home_trainer:"Trainer", home_search:"Search pets, eggs, leaders…",
  home_open:"Open", home_quick:"Quick access",
  // pets
  pets_search:"Search {n} pets…",
  sort_dps:"Sort: DPS ▼", sort_hp:"Sort: Base HP ▼", sort_boost:"Sort: Boosted HP ▼", sort_name:"Sort: Name A-Z", sort_dex:"Sort: Dex #", sort_inv:"Sort: Pet Inventory",
  chip_all:"All", chip_all_rarities:"All rarities",
  pets_count:"{n} pets", pets_empty:"No pets match your filters.",
  // pet modal
  st_dps:"DPS", st_dmg:"Damage / hit", st_hits:"Hits / sec", st_cd:"Cooldown", st_basehp:"Base HP", st_relhp:"Release HP / pet",
  dex_num:"Dex #{n}",
  your_collection:"Your collection", owned:"Owned", released:"Released", your_hp:"Your HP (in-game)",
  hp_per_pet:"HP per pet (with your releases)",
  hp_sub_some:"Base {base} + {extra} from releasing {n} of this pet.",
  hp_sub_none:"Base HP. Release (sacrifice) duplicate copies to permanently boost every copy you keep.",
  trades:"Trades",
  trade_to:"Trade {q}× of this → {x}",
  trade_from_many:"Made by trading {q}× of: {list}",
  trade_from_one:"Made by trading {q}× {x}",
  where_get:"Where to get it",
  no_source:"No drop source listed in the tracker (may come from a trade, event, leader or upgrade).",
  src_chick:"🥚 Only obtainable by failing a Special Event — its damage is forever capped at 1.",
  // petdex
  petdex_intro:"Track your Pet Dex by room, like the in-game museum. Tap ✓ to mark what you own; tap a pet to see its stats and which eggs drop it.",
  filter_all:"All", filter_missing:"Missing", filter_owned:"Owned",
  petdex_prog:"{have} / {total} pets ({pct}%)", none:"— none —",
  // eggs
  eggs_intro:"Drop odds for every area egg, rebirth egg, special egg and pet leader. Tap to expand.",
  eggs_seasonal:"Seasonal Pets (from Free Egg)", common:"Common", rare:"Rare", area_eggs:"Area Eggs",
  // areas
  areas_intro:"Unlock cost, income/hour, rebirth requirement and <b>suggested</b> upgrade levels for each area.",
  areas_foot:"★ = rebirths required to unlock. Suggested levels are the tracker's recommended max for that area. Pet Slot shows total party size unlocked there.",
  th_area:"Area", th_unlock:"Unlock", th_income:"Income/hr", th_rebirths:"Rebirths", th_petslot:"Pet Slot",
  th_petcoins:"Pet Coins", th_petpwr:"Pet Pwr", th_petcrit:"Pet Crit", th_plrcrit:"Plr Crit",
  coins:"coins", coin:"coin",
  // rebirths
  reb_next_title:"Next rebirth cost", reb_next_desc:"Enter your current rebirth count to see the cost of your next one.",
  reb_current:"Current rebirths", reb_next_lbl:"Next rebirth cost",
  reb_next_sub:"Going from rebirth {a} (bonus +{ab}%) → {b} (bonus +{bb}%).",
  reb_table_title:"Full rebirth table",
  reb_table_desc:"Cost = 1 De × 1.15^(r−2) after rebirth 2. Each rebirth adds +20% gold bonus.",
  th_rebirth:"Rebirth", th_cost:"Cost", th_goldbonus:"Gold Bonus",
  // leaders
  leaders_intro:"Pet Leaders (PvE). Recommended teams assume 15× of a pet at the listed HP — go lower if you hit the skill remote well. Mark which pets you own (on the Pets/PetDex pages) to get a personalized plan per leader.",
  reward:"Reward:", on_repeats:"{p}% on repeats",
  leader_stats:"⚔️ Leader power: {hp} HP · {dps} DPS (total)",
  bench_line:"💪 Real players win with {hp} team HP (type-effective pets)",
  bench_afk:"or {hp} to AFK with no ability", bench_typ:"typically {hp}",
  your_best:"📋 Your 15-slot team (from pets you own)",
  team_total:"Team {slots}/15 · {hp} HP · {dps} DPS", team_short:"— you don't have 15 yet; farm more below",
  badge_need:"need {n}", badge_low:"low HP", badge_ready:"✓", badge_strong:"strong",
  farm_prompt:"Don't own a good option? Farm:",
  rec_team:"Recommended team (general)",
  opt_title:"🥚 Easiest eggs to farm",
  opt_note:"Eggs ranked by the strongest useful pet they drop, per hatch — time is the real cost, so a stronger pet beats a cheap-but-weak one.",
  opt_release:"release ~{n} → {hp} HP", opt_norelease:"base HP is enough",
  opt_eggs:"~{n} eggs", opt_coins:"~{n} Rebirth Coins", opt_uses:"{n} leaders", opt_useful:"{p}% useful",
  opt_each:"1× of each", opt_15:"15× of one pet",
  opt_setprofile:"⚙️ Set your rebirths & last area in Profile to match recommendations to your progress.",
  opt_hatches:"~{n} hatches", opt_gold:"~{g} gold", opt_none:"No accessible egg covers this type yet — progress further.",
  opt_special_warn:"event only (~25min, random tier)",
  // leader-drop clarity
  get_guaranteed:"guaranteed on 1st kill", get_repeat:"{p}% on repeats", get_one:"only 1 obtainable",
  // shop
  shop_goldpack_note:"V-Bucks price drops with rebirths (500 → 50).",
  // pets filters
  filters_btn:"Filters", filters_clear:"Clear", filters_active:"Filters ({n})",
  // profile
  profile_title:"Your Profile", profile_desc:"Tell us your progress so leader egg recommendations match where you are.",
  profile_rebirths:"Rebirths", profile_area:"Last area unlocked", profile_saved:"Saved ✓",
  profile_name:"Your name", profile_name_ph:"Type your name",
  petdex_title:"📥 Import from game", petdex_desc:"In the game, press the Petdex Code button to get a code, then type it here to mark every pet you've unlocked as owned.",
  petdex_placeholder:"Paste your Petdex code", petdex_btn:"Import petdex",
  petdex_ok:"Imported ✓ — {n} new pets marked owned ({total} in the code).",
  petdex_err:"Invalid code — check it and re-type.", petdex_err_version:"This code is from a newer game version — update the app.",
  profile_income_in:"Your income / hr", profile_income_ph:"e.g. 13 De",
  profile_income_hint:"Optional. Your real in-game gold/hour while farming. If set, it's used for income estimates instead of the passive area formula (which is much lower).",
  profile_income:"Income / hr", profile_income_base:"Base income / hr", profile_reset:"Reset my data",
  profile_fav:"Favorite pet", profile_nofav:"Tap the ★ on any pet to set your favorite", profile_collected:"collected", profile_sound:"Sounds",
  profile_backup:"Backup", profile_backup_desc:"Save a file with all your data (owned pets, favorite, profile) so you never lose it.",
  profile_export:"⬇ Export", profile_import:"⬆ Import", profile_imported:"Imported ✓", profile_import_err:"Invalid backup file",
  // shop rotation
  shop_today:"Today's Shop", shop_pets:"Pets", shop_skins:"Skins", shop_rotates:"Rotates in {t}",
  shop_all_pets:"All pet offers", shop_all_skins:"All skin offers",
  // calculators sections
  calc_rebirth:"💠 Rebirth cost", calc_areas:"🗺️ Areas & income",
  // store
  store_intro:"V-Bucks offers from the premium store. The daily shop rotates 4 pets or 4 skins (resets 00:00 UTC) — these are the full offer pools with prices.",
  store_pets:"Pet Offers", store_skins:"Pet Skin Offers", store_skins_desc:"Skins change a pet's look — they do not grant the pet itself.",
  store_other:"Other Offers", vbucks:"V-Bucks", skin_for:"Skin for {pet}",
  // calculators
  bc_title:"🛡️ Leader Battle Calculator",
  bc_desc:"Build a team (or load a preset) and check if it can beat a leader. Uses each pet's DPS, your released-count HP, and type advantage.",
  bc_save:"💾 Save", bc_delete:"Delete preset", bc_working:"— working team —",
  bc_addpet:"+ Add a pet to your team…", bc_leader:"Leader to fight",
  bc_teamstat:"{n} pets · DPS {dps} · HP {hp}", bc_emptyteam:"No pets yet — add some below.",
  bc_help:"Add pets to your team to test a matchup.", bc_nodata:"No combat data for this leader.",
  bc_win:"Your team beats {leader}!", bc_lose:"Not enough for {leader} yet.",
  bc_margin:"Winning with a {x}× time margin.", bc_short:"You need about {x}× more DPS or HP.",
  bc_ttk:"Your kill time ~{p}s · leader's ~{l}s",
  bc_savename:"Name this preset (e.g. Gold Farm, PvE, Special Event):",
  bc_delconfirm:"Delete this preset?", bc_full:"Team is full (15 pets).",
  inc_title:"💰 Income Estimator",
  inc_desc:"Enter your Upgrade LEVELS (from the in-game Upgrades menu, not the Attack Power value) — the app converts them with the game's own formula. Uses your battle team + profile area/rebirth.",
  inc_noteam:"Build a team in the Battle Calculator above first.",
  inc_team:"Using your battle team ({n} pets).",
  inc_pp:"Player Power lvl", inc_pc:"Player Crit lvl", inc_sp:"Pet Power lvl", inc_sc:"Pet Crit lvl",
  inc_moving:"Moving while farming (+30%)",
  inc_computed:"→ Attack Power {atk} · Pet Atk Power {pet} · crit {pcrit}% / pet {scrit}%",
  inc_hint:"Tip: the computed Attack/Pet Power should match your in-game Pet Stats panel. Income is approximate — it'll get calibrated with community data.",
  inc_result:"Estimated income", inc_breakdown:"Effective DPS {dps} · rebirth {reb}{mv}",
  inc_capped:"✓ capped at Area {a} rate (you out-DPS the respawn — normal)",
  inc_underpowered:"⚠ DPS-limited — too weak for Area {a}, income below the area rate",
  inc_setarea:"⚠ Set your area in Profile for an accurate estimate",
  inc_usebtn:"Use as my income", inc_used:"Saved as your income ✓",
  calc_hatch:"🥚 Hatch Goal", calc_hatch_desc:"Pick a pet and how many you want — get the eggs, gold and time it takes (uses your profile area/rebirths for income).",
  lbl_hatch_pet:"Pet", lbl_hatch_qty:"How many do you want?",
  res_hatch_hatches:"Hatches needed", hatch_noegg:"No farmable egg source for this pet.",
  hatch_from:"from {egg}", hatch_time:"Hatching: ~{h} (base auto-hatch)",
  hatch_gold:"Gold to spend: ~{g}", hatch_farm:"Farming that gold: ~{h} (at {inc}/hr)",
  calc_offline:"💤 Offline Earnings",
  calc_offline_desc:"Estimate the gold waiting for you on login. You earn {pct}% of your area's hourly income, scaled by rebirths, for up to {h}h — then capped against your next rebirth cost.",
  lbl_area:"Highest area", lbl_rebirths:"Rebirths", lbl_hours:"Hours offline",
  res_offline:"Estimated offline gold",
  offline_sub:"Active income: {inc}/hr · {status}",
  offline_capped:"limited by next-rebirth cap", offline_within:"within cap", offline_caphint:"capped at {h}h",
  calc_attack:"⚔️ Attack Power",
  calc_attack_desc:"Damage from a given Power Level, using the in-game formula (A + B·Cᵐ)·10ᶜ.",
  lbl_power:"Power Level", res_attack:"Attack Power", attack_sub:"NPC/pet attack (×{f}): {v}",
  calc_crit:"🎯 Critical Chance", calc_crit_desc:"Critical rate = Level ÷ 10, capped at 100% (max level 1000).",
  lbl_crit:"Crit Level", res_crit:"Critical chance",
  calc_num:"🔢 Number Formatter", calc_num_desc:"Convert between raw numbers and the game's suffixes (K, M, B … De, UnD). Type either form.",
  lbl_value:"Value", res_num:"Formatted", num_hint:"Enter a number like 5000000 or '5 Qa'.", num_exact:"Exact: {v}",
  calc_type:"⚖️ Pet Type Effectiveness",
  calc_type_desc:"Pick an attacker and defender, or read the full chart below.",
  lbl_attacker:"Attacker", lbl_defender:"vs", res_typemult:"Damage multiplier",
  type_super:"Super effective", type_notvery:"Not very effective", type_neutral:"Neutral",
  type_chart_title:"Full type chart",
  type_chart_desc:"×2 super effective · ×0.5 weak · · neutral. Rows attack columns.",
  th_atkdef:"ATK ＼ DEF",
  // tips
  tips_intro:"Progression tips and mechanics, verified against the game's code.",
  // banner
  ban_live:"{name} is LIVE", ban_live_sub:"{note} · ends in {n} {d}",
  ban_next:"Next: {name}", ban_next_sub:"{note} · starts in {n} {d}",
  ban_idle:"No timed event running", ban_idle_sub:"Always available:",
  pill_active:"Active", pill_soon:"Soon", day:"day", days:"days"
};

/* ---------------- ENGLISH content (tips + leader texts) ---------------- */
I18N.content.en = {
  tips: (window.META&&window.META.tips) || [],
  leaders: {}  // {n: {desc, tips:[]}} — English comes from LEADERS data directly (merged at load)
};
