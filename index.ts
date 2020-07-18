/* eslint-disable no-console */
/* eslint-disable import/extensions */
import * as fs from 'fs';
import * as path from 'path';
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
];

const MIN_GUZMER_PLAYERS = 4;

const MAP_FILTER = ['de_mirage'];

// const DEMOS_AFTER = new Date('2020-06-10T00:00:00-05:00');
const DEMOS_AFTER = new Date('2020-06-27T00:00:00-05:00');

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
  mapWinRate: 0,
  pistolRoundWinRate: 0,
  tSideWinRate: 0,
  ctSideWinRate: 0,
  tSideStart: 0,
  ctSideStart: 0,
  tSideStartRate: 0,
};

const isTeamOnSide = (side: Side, teamName: string, round: Round): boolean => {
  if (round.winner_name === teamName) {
    return round.winner_side === side;
  }
  return round.winner_side !== side;
};

const isScrimmage = (demo: DemoJson): boolean => {
  return demo.id.includes('scrimmagemap');
};

const main = (): void => {
  const dataFiles = fs.readdirSync('../').filter(file => file.endsWith('.json'));

  dataFiles.forEach(dataFile => {
    const demo: DemoJson = JSON.parse(fs.readFileSync(path.join('..', dataFile), 'utf8'));
    const { players, rounds } = demo;

    const guzmerPlayers = players.filter(player => GUZMER_PLAYERS.includes(player.steamid));

    if (new Date(demo.date) < DEMOS_AFTER) return;
    // Must have enough Guzmer players
    if (guzmerPlayers.length < MIN_GUZMER_PLAYERS) return;
    // Filter on a map
    if (!MAP_FILTER.includes(demo.map_name)) return;

    // Now we are a clan match
    outData.mapsParsed += 1;

    if (isScrimmage(demo)) outData.scrimmageMaps += 1;

    // Find which team Guzmer is
    const guzmerTeamName = guzmerPlayers[0].team_name;

    const pistolRounds = rounds.filter(round => round.type === RoundType.PISTOL_ROUND);
    const tSideRounds = rounds.filter(round => isTeamOnSide(Side.T, guzmerTeamName, round));
    const ctSideRounds = rounds.filter(round => isTeamOnSide(Side.CT, guzmerTeamName, round));

    const pistolRoundsWon = pistolRounds.filter(round => round.winner_name === guzmerTeamName);
    const tSideRoundsWon = tSideRounds.filter(round => round.winner_name === guzmerTeamName);
    const ctSideRoundsWon = ctSideRounds.filter(round => round.winner_name === guzmerTeamName);

    outData.totalPistolRounds += pistolRounds.length;
    outData.totalPistolRoundsWon += pistolRoundsWon.length;
    outData.totalTSideRounds += tSideRounds.length;
    outData.totalTSideRoundsWon += tSideRoundsWon.length;
    outData.totalCTSideRounds += ctSideRounds.length;
    outData.totalCTSideRoundsWon += ctSideRoundsWon.length;

    if (demo.team_winner && demo.team_winner.team_name === guzmerTeamName) outData.mapsWon += 1;

    if (demo.team_t.team_name === guzmerTeamName) {
      outData.tSideStart += 1;
    } else {
      // console.log('Started CT on:', demo.date);
      outData.ctSideStart += 1;
    }
  });
  outData.mapWinRate = outData.mapsWon / outData.mapsParsed;
  outData.pistolRoundWinRate = outData.totalPistolRoundsWon / outData.totalPistolRounds;
  outData.tSideWinRate = outData.totalTSideRoundsWon / outData.totalTSideRounds;
  outData.ctSideWinRate = outData.totalCTSideRoundsWon / outData.totalCTSideRounds;
  outData.tSideStartRate = outData.tSideStart / outData.mapsParsed;
  console.log(JSON.stringify(outData, null, 2));
};

main();
