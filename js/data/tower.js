// Infinite Tower — token economy + boss pets. Values from infinite_tower_device.verse
// (FloorTokenReward / BossBonusTokens / MilestoneReward) and the boss-pet copy costs.
window.TOWER = {
  bossInterval: 10,
  // tokens for clearing a NORMAL floor, by floor number bracket
  floorReward: [{max:10,t:3},{max:20,t:6},{max:30,t:10},{max:40,t:16},{max:1e9,t:24}],
  // EXTRA tokens for clearing a BOSS floor (every 10th)
  bossBonus:   [{max:10,t:15},{max:20,t:30},{max:30,t:50},{max:40,t:80},{max:1e9,t:120}],
  // once-per-account bonus for FIRST reaching a milestone floor
  milestones:  [{f:10,t:25},{f:25,t:75},{f:50,t:200},{f:75,t:400},{f:100,t:800}],
  cofrePerLevel: 0.08, cofreMaxLevel: 8,   // Vault (Cofre) permanent perk: +8%/lvl, +64% max
  greedTiers: [0, 0.25, 0.45, 0.80],        // Greed chain I/II/III run-token bonus
  pocketChange: 0.30,                       // Pocket Change card run-token bonus
  // Exclusive boss pets — token cost per EXTRA copy (1st copy is free on first boss kill)
  bossPets: [
    {floor:10, name:"Cactus", cost:2000},
    {floor:20, name:"Slime",  cost:4000},
    {floor:30, name:"Knight", cost:6000},
    {floor:40, name:"Frog",   cost:8000},
    {floor:50, name:"Dino",   cost:10000},
    {floor:60, name:"M3CH",   cost:12000},
  ],
  // Leader pets buyable with Tower Tokens (must beat the Leader first to unlock it in the shop)
  leaderPets: [
    {name:"Tiger",    cost:10000},
    {name:"Wolf",     cost:15000},
    {name:"Scorpion", cost:20000},
  ],
};
