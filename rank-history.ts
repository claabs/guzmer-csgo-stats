/* eslint-disable no-await-in-loop, no-continue, no-restricted-syntax, no-console */
import * as fs from 'fs';
import { outputJsonSync } from 'fs-extra';
import * as path from 'path';
import { CSGOStatsGGScraper, MatchType } from 'csgostatsgg-scraper';
import { parse, differenceInDays } from 'date-fns';
import { DemoJson } from './json-types';

const GUZMER_PLAYERS = [
  '76561198000253201', // Charlie L
  '76561198020996622', // Cory
  '76561197972455847', // Tristan
  '76561198092244665', // Carly
  '76561198077588258', // Travis
  '76561197998305024', // Matthew
  '76561198143832972', // Brendan
  '76561198041643113', // Charlie M
  '76561198155085307', // Katie
  '76561198150706831', // Hutno
  '76561198382666964', // Josh
  '76561198347325486', // Scoop Life
  '76561198025465711', // Phil
  '76561198020954283', // John Madden
];

const SCRIMMAGE_MAPS = [
  'de_chlorine',
  'de_breach',
  'de_ruby',
  'de_studio',
  'de_seaside',
  'de_engage',
  'cs_apollo',
  'de_grind',
  'de_mocha',
];

const DEMOS_AFTER = new Date('2021-01-01T00:00:00-05:00');

const DEMOS_PATH = '/mnt/e/CSGO Demos/json';

export interface RankHistoryPoint {
  daysFromMatch: number;
  rank: number;
}

export type PlayersRankHistory = Record<string, RankHistoryPoint[]>;

const playerRankHistories: PlayersRankHistory = {};

const isScrimmage = (demo: DemoJson): boolean => {
  const date = new Date(demo.date);
  if (demo.id.includes('scrimmagemap')) return true;
  if (SCRIMMAGE_MAPS.includes(demo.map_name)) return true;
  if (
    demo.map_name === 'de_cache' &&
    date > new Date('2019-10-02T00:00:00Z') &&
    date < new Date('2019-11-18T00:00:00Z')
  )
    return true;
  if (
    demo.map_name === 'de_anubis' &&
    date > new Date('2020-03-31T00:00:00Z') &&
    date < new Date('2020-04-10T00:00:00Z')
  )
    return true;
  if (demo.map_name === 'de_ancient' && date < new Date('2021-05-04T00:00:00Z')) return true;
  return false;
};

const main = async (): Promise<void> => {
  const csgostats = new CSGOStatsGGScraper();

  const dataFiles = fs
    .readdirSync(DEMOS_PATH)
    .filter((file) => file.endsWith('.json'))
    .sort();

  console.log(`found ${dataFiles.length} demos`);

  for (const dataFile of dataFiles) {
    const demo: DemoJson = JSON.parse(fs.readFileSync(path.join(DEMOS_PATH, dataFile), 'utf8'));
    const { players } = demo;

    const demoDate = new Date(demo.date);
    if (demoDate < DEMOS_AFTER) continue;
    console.log('parsing', dataFile);

    if (isScrimmage(demo)) {
      continue;
    }

    // Parse player stats
    for (const p of players) {
      const steamId = p.steamid; // steamid64
      if (!(steamId in playerRankHistories || GUZMER_PLAYERS.includes(steamId))) {
        console.log('Parsing', steamId);
        try {
          const rawData = await csgostats.getPlayer(steamId, { matchType: MatchType.COMPETITIVE });
          if (rawData.graphs) {
            const rankHistory: RankHistoryPoint[] = rawData.graphs.rawData
              .map((r) => {
                const pointDate = parse(r.date, 'yyyy-MM-dd HH:mm:ss', new Date());
                const daysDiff = differenceInDays(pointDate, demoDate);
                return {
                  rank: r.rank,
                  daysFromMatch: daysDiff,
                };
              })
              .filter((d) => d.rank !== 0);
            playerRankHistories[steamId] = rankHistory;
          }
        } catch {
          console.log('eating error. continuing...');
        }
      }
    }
    outputJsonSync('_rankHistories.json', playerRankHistories, {
      spaces: 2,
    });
  }
  console.log('Complete');
};

main();
