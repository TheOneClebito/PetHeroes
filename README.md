# Pet Heroes Companion

A fan-made companion web app for **Pet Heroes Adventure** (Fortnite/UEFN). Plain static PWA —
no build step, no Node. Open `index.html` in a browser, or drag the folder onto Netlify.

Data is sourced from the community tracker **v6.01 (Area 38)**.

## Features
- **Event banner** — shows the active timed event (or next upcoming), else the always-on systems.
- **Pets** — searchable/filterable index of all 225 pets (type, rarity, sort by DPS/HP), tap for full stats + where it drops.
- **Eggs & Odds** — drop tables for every area egg, rebirth egg, special egg and pet leader.
- **Areas** — unlock cost, **income/hour**, rebirth requirement, pet slots/coins and suggested upgrade levels (Areas 1–38).
- **Rebirths** — next-rebirth-cost lookup + full 0–100 table.
- **Leaders** — PvE pet-leader guide with recommended teams and HP targets.
- **Store** — V-Bucks pet/skin/other offers with prices.
- **Calculators** — **offline earnings**, attack power, critical chance, **type effectiveness** (full 9×9 chart + matchup), rebirth cost, number formatter.
- **Tips** — progression tips and mechanics (offline earnings, presets, Infinite Tower, rebirth-coin eggs, etc.).

Much of v2's data (type chart, offline-earnings formula, income/hour, V-Bucks prices, event dates, Infinite
Tower) was extracted directly from the game's Verse source at
`...\PetSimulatorClicker\Plugins\PetSimulatorClicker\Content`, so it reflects the actual game, not just the tracker.

## Project structure
```
pet-heroes-app/
  index.html            app shell
  css/styles.css        theme
  js/app.js             all app logic (vanilla JS)
  js/data/              <-- EDIT THESE to update game data
    pets.js   areas.js   rebirths.js   sources.js   leaders.js   meta.js
    types.js (type chart)   income.js (offline/income)   events.js (banner)   store.js (V-Bucks)
  images/pets/          pet images (slug.png)
  icons/                app icons
  manifest.webmanifest  sw.js   PWA files
```

## Updating game data (no coding needed)
All game data lives in `js/data/*.js` as plain arrays. Open one in a text editor and edit the values.
- **Add Areas 39/40:** append objects to `window.AREAS` in `areas.js`.
- **Fix a pet stat:** find it in `pets.js` (`window.PETS`) and edit the number.
- **Add an egg's odds:** add to `window.SOURCES.sources` in `sources.js`.

## Pet images — 222/225 (99%)
Images were matched precisely using the game's own PetID → name → texture map (from
`custom_npc_pet_settings.verse`), so they're the correct in-game art.

The app shows a colored placeholder (pet's first letter) for any pet without an image. To add one:
drop a PNG into `images/pets/` named after the pet's slug (lowercase, spaces → `-`, e.g.
`spider-pig.png`), then set `"img":"spider-pig.png"` on that pet in `pets.js`.

**The only 3 without images** — their source PNGs aren't in the
`MAPAS_FORTNITE\2. PET_SIMULATOR\Pets` folder (the game references `T_TurkeyCandy` / `T_PandaCandy`
but the files don't exist there), and "Caramelo" has no matching art:
**Turkey Candy, Panda Candy, Caramelo.**

## Deploy to Netlify
1. Go to https://app.netlify.com/drop
2. Drag the whole `pet-heroes-app` folder onto the page.
3. Done — you get a public URL. To update later, drag the folder again (or set up a site + redeploy).

No account/dev setup required. The app also works offline once loaded (PWA) and can be "Added to
Home Screen" on phones.

## Events banner
`events.js` holds dated events. Only **Easter 2026** (Mar 29 – Apr 30) is hardcoded in the game
source; Carnival / Double-Stats / timed events are configured in the UEFN editor and have **no dates
in the game code**. Add upcoming events to `events.js` (with real start/end dates) as they're
announced and the banner will pick them up automatically.

## Notes / source discrepancies
- **Type chart, offline earnings, income/hour, V-Bucks prices** come from the Verse source — authoritative.
- **Daily reward:** the game code uses a fixed daily reset (10:00 UTC), not the "22h cooldown" some
  community notes mention. The app follows the code.
- **Rainbow/Luck:** the code implements Luck as a direct % chance to hatch the Rainbow variant
  (base 0.1%, +0.02% per Pet Coin, plus a per-rebirth bonus), with **no hard cap in code** — the
  tracker's "1% cap / +0.15% per rebirth" reflects the editor-configured/observed values.
- Tracker data reflects **v6.01 (Area 38)** — your live game may be slightly ahead (e.g. Areas 39–40).
