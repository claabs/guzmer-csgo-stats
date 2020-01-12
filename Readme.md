# guzmer-csgo-stats

I could have done this with a proper data science language, but I'm more comfortable in Javascript.
This just parses some stats from my demos that [CSGO Demos Manager](https://github.com/akiver/csgo-demos-manager) couldn't provide for me.
As a bonus, this also has types for the General, Players, and Rounds sheets that export from CSGO Demos Manager.

## Setup

1. In CSGO Demos Manager, select the matches you want to export.
1. Click "Export as XLS", and export as multiple files.
1. Save files to a directory above the project directory ('../')
1. `npm i`
1. `npm run start:ts`

## Output

```json
{
  "statsForMap": "de_mirage",
  "minGuzmerPlayers": 4,
  "clanMatches": 233,
  "totalPistolRounds": 464,
  "totalPistolRoundsWon": 203,
  "totalTSideRounds": 2832,
  "totalTSideRoundsWon": 1381,
  "totalCTSideRounds": 3070,
  "totalCTSideRoundsWon": 1731,
  "pistolRoundWinRate": 0.4375,
  "tSideWinRate": 0.4876412429378531,
  "ctSideWinRate": 0.5638436482084691
}
```

## To Do

As I was writing this readme, I realized you can export matches as JSON in the right click menu. Probably should just use that instead of converting XLSX to JSON (lol).

Also, I should relocate the demos location to a subdirectory, instead of the parent.
