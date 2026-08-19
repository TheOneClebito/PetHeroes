// V-Bucks store offers — from premium_store_*.verse, area/gold/preset offer settings.
// The daily store rotates 4 pets OR 4 skins per day (rotation index changes at 00:00 UTC,
// StartStoreDate 2026-01-24). Which 4 appear each day is set in the UEFN editor; these are the
// full offer pools with their prices.
window.STORE = {
  pets: [
    { name: "Dracula", vbucks: 2000 },
    { name: "Easter Chick", vbucks: 1500 }, { name: "Dark Paw", vbucks: 1500 },
    { name: "Doll", vbucks: 1500 }, { name: "Elf", vbucks: 1500 },
    { name: "Fuzzy Wuzzy", vbucks: 1500 }, { name: "Snowman", vbucks: 1500 },
    { name: "Ghost", vbucks: 1500 },
    { name: "Donut Cat", vbucks: 750 },
    { name: "Easter Bunny", vbucks: 500 }, { name: "Guard Pig", vbucks: 500 },
    { name: "P3-T", vbucks: 500 }, { name: "Polar Bear", vbucks: 500 },
    { name: "Professor Tree", vbucks: 500 }, { name: "Pumpkin", vbucks: 500 },
    { name: "Scaredog", vbucks: 500 }, { name: "Reindeer", vbucks: 500 },
    { name: "Halloween Pig", vbucks: 250 }, { name: "Santa Pig", vbucks: 250 },
    { name: "Rebel Pig", vbucks: 250 }, { name: "Easter Pig", vbucks: 250 },
    { name: "Player Pig", vbucks: 250 }
  ],
  skins: [
    { name: "Angel Dog Cupid", pet: "Angel Dog", vbucks: 1000 },
    { name: "Pig Hero Cyborg", pet: "Pig Hero", vbucks: 1000 },
    { name: "Bat Cyborg", pet: "Bat", vbucks: 500 },
    { name: "Carnival Lion", pet: "Lion", vbucks: 500 },
    { name: "Carnival Peacock", pet: "Peacock", vbucks: 500 },
    { name: "Carnival Cat", pet: "Cat", vbucks: 250 },
    { name: "Cyborg Bunny", pet: "Bunny", vbucks: 250 },
    { name: "Cat King Valentine", pet: "Cat King", vbucks: 200 },
    { name: "Shark Valentine", pet: "Shark", vbucks: 200 },
    { name: "Black Sheep", pet: "Sheep", vbucks: 200 }
  ],
  other: [
    { name: "Area Pass", vbucks: 50, note: "Instantly unlock an area (resets on rebirth)." },
    { name: "Gold Pack — 1 De", vbucks: 100, note: "Grants 1 De gold (resets on rebirth)." },
    { name: "Pet Slot", vbucks: 50, note: "+1 equipped pet slot." },
    { name: "Movement Speed", vbucks: 50, note: "+1 movement upgrade." },
    { name: "Preset Slot 4", vbucks: 500, note: "Unlock a 4th team preset (or buy with gold)." },
    { name: "Preset Slot 5", vbucks: 1000, note: "Unlock a 5th team preset." }
  ]
};
