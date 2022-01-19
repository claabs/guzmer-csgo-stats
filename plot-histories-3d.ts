/* eslint-disable no-console */
import { readJsonSync } from 'fs-extra';
import { plot } from 'nodeplotlib';
import { PlayersRankHistory } from './rank-history';

export const generateCharts = async (): Promise<void> => {
  const playerRankHistories: PlayersRankHistory = readJsonSync('_rankHistories.json');

  // week/rank/count
  const weeksData: Record<number, Record<number, Set<string>>> = {};

  Object.entries(playerRankHistories).forEach(([steamId, rawData]) => {
    // Remove bugged 0 rank, and only check last 2 years
    const data = rawData.filter((d) => d.rank !== 0 && d.daysFromMatch > -2 * 365);

    data.forEach(({ daysFromMatch, rank }) => {
      const week = Math.floor(daysFromMatch / 7);
      const players = weeksData[week]?.[rank];
      if (players) {
        players.add(steamId);
      } else if (weeksData[week]) {
        weeksData[week][rank] = new Set([steamId]);
      } else {
        weeksData[week] = { [rank]: new Set([steamId]) };
      }
    });
  });

  const ranksCount = 18;
  const weeksCount = Object.keys(weeksData).length;

  // week/rank/count
  const z: number[][] = Array.from(Array(weeksCount), () => Array.from(Array(ranksCount), () => 0));

  const sortedWeeks = Object.entries(weeksData).sort(
    ([weekA], [weekB]) => parseInt(weekA, 10) - parseInt(weekB, 10)
  );

  sortedWeeks.forEach(([, ranks], weekIdx) => {
    console.log(ranks);
    Object.entries(ranks).forEach(([rank, players]) => {
      const rankNum = parseInt(rank, 10);
      const count = players.size;
      z[weekIdx][rankNum - 1] += count;
    });
  });

  plot(
    [
      {
        type: 'surface',
        z,
      },
    ],
    {
      // 'xaxis.range': [0, 18],
      width: 2500,
      height: 1000,
      yaxis: { title: 'Days from match' },
      xaxis: { title: `Player's CSGO Rank` },
      title: 'CSGO rank history of my opponents (via csgostats.gg)',
      // showlegend: false,
    }
  );
};

generateCharts();
