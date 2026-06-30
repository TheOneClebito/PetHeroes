// App metadata, formula constants and tips. Verified against the game's Verse source.
window.META = {
  version: "v6.01 (Area 38)",
  petTypes: ["Cat","Dog","Bird","Farm","Bug","Wild","Water","Mythical"],

  // Attack power (stats_manager.verse GetPlayerAttackPowerValue):
  //   mod  = ((L-1) mod 50) + 1
  //   ceil = ceil(L/50) - 1
  //   AP   = (A + B*C^mod) * (factorCicle - ceil*factorDecay)^ceil * factor
  attackFormula: { A: -113.15, B: 116.1, C: 1.004, factorCicle: 10.0, factorDecay: 0.0001, npcFactor: 0.4 },

  suffixes: [
    {name:"Thousand",suffix:"K",exp:3},{name:"Million",suffix:"M",exp:6},{name:"Billion",suffix:"B",exp:9},
    {name:"Trillion",suffix:"T",exp:12},{name:"Quadrillion",suffix:"Qa",exp:15},{name:"Quintillion",suffix:"Qi",exp:18},
    {name:"Sextillion",suffix:"Sx",exp:21},{name:"Septillion",suffix:"Sp",exp:24},{name:"Octillion",suffix:"Oc",exp:27},
    {name:"Nonillion",suffix:"No",exp:30},{name:"Decillion",suffix:"De",exp:33},{name:"Undecillion",suffix:"UnD",exp:36}
  ],

  tips: [
    {t:"Focus Pet Power & Pet Crit", d:"Most income comes from pets breaking objects. Don't waste gold on Player Power after your first few pets."},
    {t:"Offline earnings (10%/hr, 24h cap)", d:"While logged off you earn 10% of your area's hourly income, scaled by rebirths, for up to 24 hours — granted on your next login. Use the Offline Earnings calculator."},
    {t:"Keep moving for +30% gold", d:"Moving your character applies a ×1.3 gold bonus; it decays to ×1.0 after ~60s idle. Critical pickaxe hits also give +10% gold."},
    {t:"Player Crit for Special Events", d:"Each player crit doubles your damage in Special Events. Crit chance = Crit Level ÷ 10, capped at 100% (max level 1000)."},
    {t:"Seasonal event pets = 5× currency", d:"Seasonal pets earn 5× currency per hit in seasonal areas. All pets do equal damage to seasonal objects, so faster attackers earn more."},
    {t:"Faster hatching trick", d:"Press interact then quickly open the map during the timer to keep auto-opening eggs (~7.125s each, 505/hr) vs 9s with auto-hatch (400/hr) — 26% faster."},
    {t:"Rainbow / Luck mechanic", d:"Luck is your % chance to hatch the Rainbow variant of a pet (rolled after the pet is chosen). Base 0.1%, +0.02% per Pet Coin, plus a bonus per rebirth. Collect all Pet Coins by Area 26."},
    {t:"Rebirth Coin eggs need 3 rebirths", d:"The big (Rebirth Coin) egg unlocks at 3 rebirths and costs 1 Rebirth Coin per hatch. You earn +1 Rebirth Coin per rebirth from rebirth 3 onward."},
    {t:"Team Presets", d:"You get 3 team presets free. A 4th costs gold or 500 V-Bucks; a 5th costs 1000 V-Bucks. Save loadouts for farming vs leaders vs events."},
    {t:"Special Event damage", d:"Small pets do 1 dmg, big pets do 2 dmg to the event crystal; a crit adds +1. High attack-speed pets clear events faster."},
    {t:"Pet release HP falloff", d:"Release HP bonus drops as you release more pets: 100% (0-1000), 50% (1001-2500), 20% (2501-5000), 10% (5001+)."},
    {t:"Daily Reward", d:"7-day streak reward that resets once per day (10:00 UTC). Day 7 is the big one; the streak loops back to Day 1 after."}
  ]
};
