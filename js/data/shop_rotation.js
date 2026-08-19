// Daily shop rotation. Advances one step every day at 00:00 UTC (21:00 GMT-3).
// Anchor: on UTC date 2026-06-28 the pet shop = index 5, skin shop = index 2 (confirmed by player).
window.SHOP_ROTATION = {
  anchorDate: "2026-06-28", petIndex0: 5, skinIndex0: 2,
  pets: [
    ["ChickEaster","Ghost","BunnyEaster","30"],
    ["DarkPaw","29","Reindeer","Pumpkin"],
    ["Doll","DS","31","P3T"],
    ["Drac","FW","GPig","Snowman"],
    ["DC","ChickEaster","Reindeer","P3T"],
    ["PigEaster","DarkPaw","30","31"],
    ["PPig","Doll","45","29"],
    ["RebelPig","Drac","DS","BunnyEaster"],
    ["PigSanta","FW","Pumpkin","GPig"],
    ["PigHalloween","Snowman","ChickEaster","31"],
    ["DarkPaw","45","Reindeer","GPig"],
    ["Ghost","Drac","30","P3T"],
    ["29","FW","DS","PigHalloween"],
    ["BunnyEaster","Pumpkin","Snowman","PigSanta"],
    ["DC","PigEaster","PPig","RebelPig"]
  ],
  skins: [
    ["Bunny01_1","Bat01_1","Pig03_1","39_1"],
    ["Cat01_1","Lion01_1","Peacock01_1","Bat01_1"],
    ["DogSpecial_1","Shark01_1","Bunny01_1","Pig03_1"]
  ],
  // skin id (PetID_SkinID) -> the offer name in STORE.skins
  skinMap: {
    "Bunny01_1":"Cyborg Bunny", "Bat01_1":"Bat Cyborg", "Pig03_1":"Pig Hero Cyborg",
    "39_1":"Black Sheep", "Cat01_1":"Carnival Cat", "Lion01_1":"Carnival Lion",
    "Peacock01_1":"Carnival Peacock", "DogSpecial_1":"Angel Dog Cupid", "Shark01_1":"Shark Valentine"
  }
};
