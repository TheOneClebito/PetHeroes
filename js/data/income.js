// Income & offline earnings — from game_rules.verse (GetAreaBasePerHour :1065-1105, offline :383-1044).
// areaBasePerHour = base gold/hour for the area BEFORE the rebirth multiplier.
// Offline payout = areaBasePerHour[area] * (1 + Rebirths*0.2) * min(hoursOffline, 24) * 0.10,
//   then capped to (nextRebirthCost * 0.20 * hours/24); floored to 1% only at area >= 31.
window.INCOME = {
  areaBasePerHour: {
    1:2.34e4, 2:4.19e4, 3:3.85e5, 4:3.85e5, 5:3.83e7, 6:3.64e8, 7:3.64e9, 8:3.45e10,
    9:3.45e11, 10:3.28e12, 11:3.28e13, 12:3.11e14, 13:3.11e15, 14:3.0e16, 15:2.96e17,
    16:2.07e18, 17:2.07e19, 18:1.86e20, 19:1.86e21, 20:1.68e22, 21:1.68e23, 22:1.51e24,
    23:1.51e25, 24:1.35e26, 25:1.35e27, 26:9.51e27, 27:6.66e28, 28:4.67e29, 29:3.27e30,
    30:2.26e31, 31:1.6e32, 32:1.76e32, 33:1.92e32, 34:2.08e32, 35:2.24e32, 36:2.4e32,
    37:3.99e32, 38:4.22e32
  },
  offline: {
    fraction: 0.10,            // earn 10% of active hourly income while offline
    capHours: 24,              // max 24h credited per return
    maxRebirthFraction: 0.20,  // payout capped at 20% of next rebirth cost * (hours/24)
    minRebirthFraction: 0.01,  // floor at 1% * (hours/24), area >= 31 only
    minRebirthFloorArea: 31,
    rebirthBaseValue: 1.0, rebirthBaseExp: 33,  // next rebirth cost = 1e33 * 1.15^(rebirths-2)
    rebirthMult: 1.15,
    minSeconds: 60
  }
};
