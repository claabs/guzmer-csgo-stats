/* eslint-disable no-console */
/* eslint-disable import/extensions */
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { SheetNames, PlayersRow, RoundsRow, RoundType, GeneralRow, Side } from './demo-xls';

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
];

const MIN_GUZMER_PLAYERS = 4;

const MAP_FILTER = 'de_mirage';

const outData = {
  statsForMap: MAP_FILTER,
  minGuzmerPlayers: MIN_GUZMER_PLAYERS,
  clanMatches: 0,
  totalPistolRounds: 0,
  totalPistolRoundsWon: 0,
  totalTSideRounds: 0,
  totalTSideRoundsWon: 0,
  totalCTSideRounds: 0,
  totalCTSideRoundsWon: 0,
  pistolRoundWinRate: 0,
  tSideWinRate: 0,
  ctSideWinRate: 0,
};

const isTeamOnSide = (side: Side, teamName: string, round: RoundsRow): boolean => {
  if (round['Winner Clan Name'] === teamName) {
    return round.Winner === side;
  }
  return round.Winner !== side;
};

const main = (): void => {
  const dataFiles = fs.readdirSync('../').filter(file => file.endsWith('.xlsx'));

  dataFiles.forEach(dataFile => {
    const workbook = xlsx.readFile(path.join('..', dataFile));
    const players = xlsx.utils.sheet_to_json<PlayersRow>(workbook.Sheets[SheetNames.Players]);
    const rounds = xlsx.utils.sheet_to_json<RoundsRow>(workbook.Sheets[SheetNames.Rounds]);
    const general = xlsx.utils.sheet_to_json<GeneralRow>(workbook.Sheets[SheetNames.General]);

    const guzmerPlayers = players.filter(player => GUZMER_PLAYERS.includes(player.SteamID));

    // Must have enough Guzmer players
    if (guzmerPlayers.length < MIN_GUZMER_PLAYERS) return;
    // Filter on a map
    if (general[0].Map !== MAP_FILTER) return;

    // Now we are a clan match
    outData.clanMatches += 1;

    // Find which team Guzmer is
    const guzmerTeamName = guzmerPlayers[0].Team;

    const pistolRounds = rounds.filter(round => round.Type === RoundType.PISTOL_ROUND);
    const tSideRounds = rounds.filter(round => isTeamOnSide(Side.T, guzmerTeamName, round));
    const ctSideRounds = rounds.filter(round => isTeamOnSide(Side.CT, guzmerTeamName, round));

    const pistolRoundsWon = pistolRounds.filter(
      round => round['Winner Clan Name'] === guzmerTeamName
    );
    const tSideRoundsWon = tSideRounds.filter(
      round => round['Winner Clan Name'] === guzmerTeamName
    );
    const ctSideRoundsWon = ctSideRounds.filter(
      round => round['Winner Clan Name'] === guzmerTeamName
    );

    outData.totalPistolRounds += pistolRounds.length;
    outData.totalPistolRoundsWon += pistolRoundsWon.length;
    outData.totalTSideRounds += tSideRounds.length;
    outData.totalTSideRoundsWon += tSideRoundsWon.length;
    outData.totalCTSideRounds += ctSideRounds.length;
    outData.totalCTSideRoundsWon += ctSideRoundsWon.length;
  });
  outData.pistolRoundWinRate = outData.totalPistolRoundsWon / outData.totalPistolRounds;
  outData.tSideWinRate = outData.totalTSideRoundsWon / outData.totalTSideRounds;
  outData.ctSideWinRate = outData.totalCTSideRoundsWon / outData.totalCTSideRounds;
  console.log(JSON.stringify(outData, null, 2));
};

main();
