// EVENTS — drives the banner. Easter2026 dates are HARDCODED in game_rules.verse:503-507 (UTC).
// Carnival / Double-Stats / timed events are configured in the UEFN editor and have NO dates in the
// game code — add them here (with real dates) as they're announced. The banner shows the currently
// active event, else the next upcoming one, else the most recent past one.
window.EVENTS = [
  {
    id: "Capybara2026", name: "Capybara Event", emoji: "🐹", type: "Seasonal",
    start: "2026-07-02T00:00:00Z", end: "2026-07-16T23:59:59Z",
    banner: "images/events/capy-banner.png",
    note: "Get a Free Capybara and limited-time country skins!"
  },
  {
    id: "Easter2026", name: "Easter Event", emoji: "🥚", type: "Seasonal",
    start: "2026-03-29T01:00:00Z", end: "2026-04-30T22:00:00Z",
    note: "Seasonal areas + Easter currency & egg pets. Seasonal pets earn 5× currency."
  },
  // --- Add upcoming events below (copy this template, set real start/end) ---
  // Optional promo art: banner:"images/events/<file>.png" (1200×400) renders a full-width card.
  // { id:"Carnival2026", name:"Carnival", emoji:"🎭", type:"Live",
  //   start:"2026-00-00T00:00:00Z", end:"2026-00-00T00:00:00Z",
  //   note:"Carnival shop — collect pieces, redeem pet skins." },
];

// Always-available systems (shown as a strip when no dated event is active).
window.ALWAYS_ON = [
  { name: "Daily Reward",      emoji: "🎁", note: "7-day streak, resets once daily (10:00 UTC)." }
];
