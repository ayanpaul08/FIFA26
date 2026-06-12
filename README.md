# ⚽ FIFA World Cup 2026 — Indian Fans Hub

A fast, beautiful, static fan page for the FIFA World Cup 2026 — built for Indian football fans, with all times in **IST (UTC+5:30)**.

## 🚀 Features

- **Live Countdown Timers** — counts down to every match in IST
- **Today's Matches** — auto-shows matches on your IST date, or the next upcoming
- **All 12 Group Standings** — auto-computed from results, with qualification zones highlighted
- **Full Schedule** — all 72 group stage matches + 32 knockout placeholders, filterable by group or team name
- **Country Profiles** — for all 48 nations: demographics, football history, World Cup trivia, fixtures, and full squad tables
- **Squad Scores** — every squad rated 0–100 based on average EA Sports FC player ratings
- **Gorgeous dark design** — stadium-night palette, FIFA gold accents, flag-colored match cards

## 📁 File Structure

```
FIFA26/
├── index.html          ← Home: today's matches + all group standings
├── schedule.html       ← Full match calendar (Group + Knockout tabs)
├── team.html           ← Country profile (?team=argentina, ?team=india etc.)
├── css/
│   └── style.css       ← All styling
└── js/
    ├── data.js         ← All 48 teams, 104 matches, player squads, trivia
    └── app.js          ← Shared utilities (IST, countdowns, standings)
```

## 🌐 Deploying to GitHub Pages

1. Push all files to your **FIFA26** repository on GitHub
2. Go to **Settings → Pages**
3. Under **Source**, select `main` branch → `/ (root)` folder
4. Click **Save**
5. Your site will be live at: `https://YOUR_USERNAME.github.io/FIFA26/`

```bash
# Quick push from terminal
cd /path/to/FIFA26
git add .
git commit -m "🚀 Launch FIFA World Cup 2026 fan page"
git push origin main
```

## 🔧 Updating Results

When match results come in, update `js/data.js`:

```js
// Find the match by id and update:
{ id:"A1", grp:"A", home:"mexico", away:"south_africa",
  utc:"2026-06-11T19:00:00Z", venue:"Mexico City Stadium",
  hs:2,    // ← home score
  as:0,    // ← away score
  st:"FT"  // ← "NS" (not started) | "LIVE" | "FT" (full time)
}
```

Standings update automatically — no other changes needed!

## 🎮 Team URL Examples

- Argentina: `team.html?team=argentina`
- Brazil: `team.html?team=brazil`
- France: `team.html?team=france`
- South Korea: `team.html?team=south_korea`
- Morocco: `team.html?team=morocco`
- USA: `team.html?team=usa`

All 48 team IDs: `mexico`, `south_africa`, `south_korea`, `czechia`, `canada`, `bosnia`, `qatar`, `switzerland`, `brazil`, `morocco`, `haiti`, `scotland`, `usa`, `paraguay`, `australia`, `turkiye`, `germany`, `curacao`, `ivory_coast`, `ecuador`, `netherlands`, `japan`, `sweden`, `tunisia`, `belgium`, `egypt`, `iran`, `new_zealand`, `spain`, `cape_verde`, `saudi_arabia`, `uruguay`, `france`, `senegal`, `iraq`, `norway`, `argentina`, `algeria`, `austria`, `jordan`, `portugal`, `dr_congo`, `uzbekistan`, `colombia`, `england`, `croatia`, `ghana`, `panama`

## 📊 Squad Score Formula

`score = clamp(round((avgRating - 65) / 25 × 100), 0, 100)`

- 100 = avg rating of 90 (elite, e.g. Brazil/France)
- 80 = avg rating of 85 (strong, e.g. England)
- 60 = avg rating of 80 (competitive)
- 40 = avg rating of 75 (developing)

## 🏆 Tournament Quick Facts

| Detail | Info |
|--------|------|
| Teams | 48 |
| Matches | 104 |
| Venues | 16 (11 USA + 3 Mexico + 2 Canada) |
| Group Stage | Jun 11 – Jun 27 |
| Round of 32 | Jun 28 – Jul 3 |
| Round of 16 | Jul 4 – Jul 7 |
| Quarter-Finals | Jul 9 – Jul 11 |
| Semi-Finals | Jul 14 – Jul 15 |
| 3rd Place | Jul 18, Miami |
| **THE FINAL** | **Jul 19, MetLife Stadium, New York/NJ** |

---

Made with ❤️ for the Indian football community. No frameworks, no build step — pure HTML/CSS/JS.
