/* eslint-disable no-console */
/* eslint-disable import/extensions */
import * as fs from 'fs';
import { outputJsonSync } from 'fs-extra';
import * as path from 'path';
import * as stats from 'fast-stats';
import { DemoJson, RoundType, Side, Round } from './json-types';

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

const LOW_SKILL_PLAYERS = [
  '76561198041643113', // Charlie M
  '76561198155085307', // Katie
  '76561198150706831', // Hutno
  '76561198025465711', // Phil
];

const MIN_GUZMER_PLAYERS = 4;

const MAP_FILTER = ['de_mirage', 'de_inferno'];

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

const DEMOS_AFTER = new Date('2020-01-01T00:00:00-05:00');
// const DEMOS_AFTER = new Date('1900-06-27T00:00:00-05:00');

const DEMOS_PATH = '/mnt/e/CSGO Demos/json';

const baseTimeGroupData = {
  wins: 0,
  losses: 0,
  winrate: 0,
};

const timeGroups: Record<number, typeof baseTimeGroupData> = Object.fromEntries(
  Array.from(Array(24).keys()).map(key => [key, baseTimeGroupData])
);

const playerStats = Object.fromEntries(
  GUZMER_PLAYERS.map(id => [
    id,
    {
      ratings: new stats.Stats(),
      name: '',
      stddev: -1,
      median: -1,
      count: -1,
    },
  ])
);

const outData = {
  statsForMap: MAP_FILTER,
  since: DEMOS_AFTER,
  minGuzmerPlayers: MIN_GUZMER_PLAYERS,
  mapsParsed: 0,
  scrimmageMaps: 0,
  mapsWon: 0,
  totalPistolRounds: 0,
  totalPistolRoundsWon: 0,
  totalTSideRounds: 0,
  totalTSideRoundsWon: 0,
  totalCTSideRounds: 0,
  totalCTSideRoundsWon: 0,
  totalRankAdvantage: 0,
  totalMatchesVsBetterTeam: 0,
  totalMatchesVsWorseTeam: 0,
  totalWinsVsBetterTeam: 0,
  totalWinsVsWorseTeam: 0,
  mapWinRate: 0,
  pistolRoundWinRate: 0,
  tSideWinRate: 0,
  ctSideWinRate: 0,
  tSideStart: 0,
  ctSideStart: 0,
  tSideStartRate: 0,
  averageRankAdvantage: 0,
  winrateVsBetterTeam: 0,
  winrateVsWorseTeam: 0,
  matchesWonTSideStart: 0,
  matchesWonCTSideStart: 0,
  matchWonTSideStartRate: 0,
  matchWonCTSideStartRate: 0,
  timeGroups,
  playerStats,
};

const isTeamOnSide = (side: Side, teamName: string, round: Round): boolean => {
  if (round.winner_name === teamName) {
    return round.winner_side === side;
  }
  return round.winner_side !== side;
};

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

const main = (): void => {
  const dataFiles = fs
    .readdirSync(DEMOS_PATH)
    .filter(file => file.endsWith('.json'))
    .sort();

  dataFiles.forEach(dataFile => {
    const demo: DemoJson = JSON.parse(fs.readFileSync(path.join(DEMOS_PATH, dataFile), 'utf8'));
    const { players, rounds } = demo;

    const guzmerPlayers = players.filter(player => GUZMER_PLAYERS.includes(player.steamid));

    if (new Date(demo.date) < DEMOS_AFTER) return;
    // Must have enough Guzmer players
    if (guzmerPlayers.length < MIN_GUZMER_PLAYERS) return;
    // Filter on a map
    if (!MAP_FILTER.includes(demo.map_name)) return;
    // Only games with bad players
    // if (!guzmerPlayers.filter(value => LOW_SKILL_PLAYERS.includes(value.steamid)).length) return;
    // if (!guzmerPlayers.find(player => player.steamid === '76561198025465711')) return; // Has Phil
    // if (guzmerPlayers.find(player => player.steamid === '76561198382666964')) return; // Has Baguette

    if (isScrimmage(demo)) {
      return;
      // outData.scrimmageMaps += 1;
    }
    // else {
    //   return;
    // }

    // Now we are a clan match
    outData.mapsParsed += 1;

    // Parse player stats
    guzmerPlayers.forEach(p => {
      const impact = 2.13 * p.kill_per_round + 0.42 * p.assist_per_round - 0.41;
      let kastRounds = 0;
      demo.rounds.forEach(round => {
        if (
          p.kills.some(k => k.round_number === round.number) ||
          p.assits.some(a => a.round_number === round.number) ||
          p.deaths.some(d => d.round_number === round.number && d.is_trade_kill) ||
          !p.deaths.some(d => d.round_number === round.number)
        ) {
          kastRounds += 1;
        }
      });
      const kast = (kastRounds / demo.rounds.length) * 100;
      const hltv2 =
        0.0073 * kast +
        0.3591 * p.kill_per_round +
        -0.5329 * p.death_per_round +
        0.2372 * impact +
        0.0032 * p.average_health_damage +
        0.1587;
      outData.playerStats[p.steamid].ratings.push(hltv2);
      outData.playerStats[p.steamid].name = p.name;
    });

    // Find which team Guzmer is
    const guzmerTeamName = guzmerPlayers[0].team_name;

    const pistolRounds = rounds.filter(round => round.type === RoundType.PISTOL_ROUND);
    const tSideRounds = rounds.filter(round => isTeamOnSide(Side.T, guzmerTeamName, round));
    const ctSideRounds = rounds.filter(round => isTeamOnSide(Side.CT, guzmerTeamName, round));

    const pistolRoundsWon = pistolRounds.filter(round => round.winner_name === guzmerTeamName);
    const tSideRoundsWon = tSideRounds.filter(round => round.winner_name === guzmerTeamName);
    const ctSideRoundsWon = ctSideRounds.filter(round => round.winner_name === guzmerTeamName);

    const guzmerTeamPlayers = players.filter(player => player.team_name === guzmerTeamName);
    const enemyTeamPlayers = players.filter(player => player.team_name !== guzmerTeamName);

    const guzmerTotalRank = guzmerTeamPlayers.reduce((prev, curr) => prev + curr.rank_old, 0);
    const enemyTotalRank = enemyTeamPlayers.reduce((prev, curr) => prev + curr.rank_old, 0);
    const rankAdvantage = guzmerTotalRank - enemyTotalRank;
    outData.totalRankAdvantage += rankAdvantage;
    if (rankAdvantage > 0) outData.totalMatchesVsWorseTeam += 1;
    if (rankAdvantage < 0) outData.totalMatchesVsBetterTeam += 1;

    outData.totalPistolRounds += pistolRounds.length;
    outData.totalPistolRoundsWon += pistolRoundsWon.length;
    outData.totalTSideRounds += tSideRounds.length;
    outData.totalTSideRoundsWon += tSideRoundsWon.length;
    outData.totalCTSideRounds += ctSideRounds.length;
    outData.totalCTSideRoundsWon += ctSideRoundsWon.length;

    // console.log(demo.date);

    if (demo.team_winner?.team_name === guzmerTeamName) {
      outData.mapsWon += 1;
      const hour = new Date(demo.date).getHours();
      outData.timeGroups[hour].wins += 1;
      if (rankAdvantage > 0) outData.totalWinsVsWorseTeam += 1;
      if (rankAdvantage < 0) outData.totalWinsVsBetterTeam += 1;
      // console.log('WIN');
    } else {
      const hour = new Date(demo.date).getHours();
      outData.timeGroups[hour].losses += 1;
      // console.log('LOSE/TIE');
    }

    if (demo.team_t.team_name === guzmerTeamName) {
      outData.tSideStart += 1;
      if (demo.team_winner?.team_name === guzmerTeamName) outData.matchesWonTSideStart += 1;
    } else {
      outData.ctSideStart += 1;
      if (demo.team_winner?.team_name === guzmerTeamName) outData.matchesWonCTSideStart += 1;
      // console.log('Started CT on:', demo.date);
    }
  });
  outData.mapWinRate = outData.mapsWon / outData.mapsParsed;
  outData.pistolRoundWinRate = outData.totalPistolRoundsWon / outData.totalPistolRounds;
  outData.averageRankAdvantage = outData.totalRankAdvantage / outData.mapsParsed;
  outData.winrateVsBetterTeam = outData.totalWinsVsBetterTeam / outData.totalMatchesVsBetterTeam;
  outData.winrateVsWorseTeam = outData.totalWinsVsWorseTeam / outData.totalMatchesVsWorseTeam;
  outData.tSideWinRate = outData.totalTSideRoundsWon / outData.totalTSideRounds;
  outData.ctSideWinRate = outData.totalCTSideRoundsWon / outData.totalCTSideRounds;
  outData.tSideStartRate = outData.tSideStart / outData.mapsParsed;
  outData.matchWonTSideStartRate = outData.matchesWonTSideStart / outData.tSideStart;
  outData.matchWonCTSideStartRate = outData.matchesWonCTSideStart / outData.ctSideStart;
  // eslint-disable-next-line no-restricted-syntax
  for (let i = 0; i < 24; i += 1) {
    outData.timeGroups[i].winrate =
      outData.timeGroups[i].wins / (outData.timeGroups[i].wins + outData.timeGroups[i].losses);
  }
  Object.keys(outData.playerStats).forEach(id => {
    outData.playerStats[id].stddev = outData.playerStats[id].ratings.stddev();
    outData.playerStats[id].median = outData.playerStats[id].ratings.median();
    outData.playerStats[id].count = outData.playerStats[id].ratings.length;
    outData.playerStats[id].ratings = (undefined as unknown) as stats.Stats;
  });
  // console.log(JSON.stringify(outData, null, 2));
  outputJsonSync('_output.json', outData, {
    spaces: 2,
  });
  console.log('Complete');
};

main();
