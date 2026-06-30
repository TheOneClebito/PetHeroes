// Leader PvE combat totals, extracted from tracker v6.01 "PvE Calculator" tab.
// effHP = Σ(roster base HP) × leader HP-multiplier;  effDPS = Σ(roster DPS) × leader DPS-multiplier (crit-free).
// Victory model (per the sheet): player wins if  leaderHP/(playerDPS×playerTypeMult) < playerHP/(leaderDPS×leaderTypeMult).
// The Critical Level (default 339 → ×1.339) scales both sides equally, so it cancels in the win/lose verdict.
// Source: the game owner's own leader-creation table (authoritative). effHP = Σ(roster base HP)×HPmult
// (Legend's 70K special pet HP is NOT multiplied), effDPS = Σ(roster DPS)×DPSmult. Replaces the
// community-tracker values, which had wrong rosters for Bug/Pirate/Dark/Elite1/Elite2/Legend.
window.LEADER_PVE = {
  1:  { effHP: 18000,  effDPS: 259.0 },   // Cat Leader   (mult 1.5/2.0)
  2:  { effHP: 28125,  effDPS: 468.8 },   // Dog Leader   (2.0/2.5)
  3:  { effHP: 39487,  effDPS: 860.0 },   // Bug Leader   (3.0/3.25)
  4:  { effHP: 53600,  effDPS: 924.0 },   // Farm Leader  (5.0/4.0)
  5:  { effHP: 76000,  effDPS: 1145.5 },  // Bird Leader  (5.0/8.0)
  6:  { effHP: 83970,  effDPS: 1352.9 },  // Pirate Leader(5.25/9.0)
  7:  { effHP: 88500,  effDPS: 1469.0 },  // King Leader  (6.5/10.0)
  8:  { effHP: 97200,  effDPS: 1687.9 },  // Dark Leader  (6.5/12.0)
  9:  { effHP: 119700, effDPS: 1807.5 },  // Elite Leader 1 (8.5/18.0)
  10: { effHP: 157500, effDPS: 1931.6 },  // Elite Leader 2 (8.5/18.0)
  11: { effHP: 191250, effDPS: 2304.6 },  // Elite Leader 3 (9.0/25.0)
  12: { effHP: 286800, effDPS: 4183.2 },  // Elite Leader 4 (18.0/40.0)
  13: { effHP: 284500, effDPS: 7500.0 }   // Legend       (12.0/11.0)
};

// Real-world "team HP to win" benchmarks from experienced players/mods (Discord). eff = with
// type-effective pets & active play; afk = HP to clear AFK with no ability; typ = typical seen.
window.LEADER_BENCH = {
  9:  { eff: "~500K" },
  10: { eff: "~500K" },
  11: { eff: "~500K" },
  12: { eff: "~750K", afk: "~1.5–2M" },
  13: { eff: "~877K", typ: "~2–3M" }
};
