// Type effectiveness — extracted from custom_npc_pet_settings.verse (GetAttackFactor, lines 1700-1788).
// Game's "Aquatic" type is shown here as "Water" to match the pet data.
// 2.0x = super effective, 0.5x = not very effective, otherwise 1.0x. Attacker -> defenders.
window.TYPES = {
  list: ["Cat","Dog","Bird","Farm","Bug","Wild","Water","Mythical"],
  strong: {
    Normal: [],
    Cat:      ["Bird","Water"],
    Dog:      ["Cat","Farm"],
    Bird:     ["Bug","Water"],
    Farm:     ["Bug","Mythical"],
    Bug:      ["Wild","Mythical"],
    Wild:     ["Cat","Dog","Farm"],
    Water:    ["Farm","Wild","Mythical"],
    Mythical: ["Dog","Wild"]
  },
  weak: {
    Normal: [],
    Cat:      ["Dog","Wild"],
    Dog:      ["Wild","Mythical"],
    Bird:     ["Cat","Dog"],
    Farm:     ["Dog","Wild","Water"],
    Bug:      ["Bird","Farm"],
    Wild:     ["Bug","Water","Mythical"],
    Water:    ["Cat","Bird"],
    Mythical: ["Farm","Water"]
  }
};
