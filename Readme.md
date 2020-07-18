# guzmer-csgo-stats

I could have done this with a proper data science language, but I'm more comfortable in Javascript.
This just parses some stats from my demos that [CSGO Demos Manager](https://github.com/akiver/csgo-demos-manager) couldn't provide for me.
As a bonus, this also has types for the JSON that exports from CSGO Demos Manager.

## Setup

1. In CSGO Demos Manager, select the matches you want to export.
1. Right click, "Export JSON", and export as multiple files.
1. Save files to a directory above the project directory ('../')
1. `npm i`
1. `npm run start:ts`

## Output

```json
{
  "statsForMap": [
    "de_mirage",
    "de_chlorine"
  ],
  "since": "2020-06-10T05:00:00.000Z",
  "minGuzmerPlayers": 4,
  "mapsParsed": 36,
  "scrimmageMaps": 34,
  "mapsWon": 13,
  "totalPistolRounds": 71,
  "totalPistolRoundsWon": 24,
  "totalTSideRounds": 503,
  "totalTSideRoundsWon": 178,
  "totalCTSideRounds": 320,
  "totalCTSideRoundsWon": 183,
  "mapWinRate": 0.3611111111111111,
  "pistolRoundWinRate": 0.3380281690140845,
  "tSideWinRate": 0.3538767395626243,
  "ctSideWinRate": 0.571875,
  "tSideStart": 31,
  "ctSideStart": 5,
  "tSideStartRate": 0.8611111111111112
}
```

## To Do

I should relocate the demos location to a subdirectory, instead of the parent.
