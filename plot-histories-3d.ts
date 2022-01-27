/* eslint-disable no-console */
import { outputJSONSync, readJsonSync } from 'fs-extra';
import { plot } from 'nodeplotlib';
import { PlayersRankHistory } from './rank-history';

const rankNames = {
  0: 'S1',
  1: 'S2',
  2: 'S3',
  3: 'S4',
  4: 'SE',
  5: 'SEM',
  6: 'GN1',
  7: 'GN2',
  8: 'GN3',
  9: 'GNM',
  10: 'MG1',
  11: 'MG2',
  12: 'MGE',
  13: 'DMG',
  14: 'LE',
  15: 'LEM',
  16: 'Supreme',
  17: 'Global',
};

export const generateCharts = async (): Promise<void> => {
  const playerRankHistories: PlayersRankHistory = readJsonSync('_rankHistories.json');

  // week/rank/count
  const weeksData: Record<number, Record<number, Set<string>>> = {};

  Object.entries(playerRankHistories).forEach(([steamId, rawData]) => {
    // Remove bugged 0 rank, and only check last 3 years
    const data = rawData.filter((d) => d.rank !== 0 && d.daysFromMatch > -3 * 365);

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

  let maxCount = 0;
  let maxCountWeek = 0;
  sortedWeeks.forEach(([, ranks], weekIdx) => {
    Object.entries(ranks).forEach(([rank, players]) => {
      const rankNum = parseInt(rank, 10);
      const count = players.size;
      if (count > maxCount) {
        maxCount = count;
        maxCountWeek = weekIdx;
      }
      z[weekIdx][rankNum - 1] += count;
    });
  });

  const weekList = Array.from(Array(sortedWeeks.length).keys());
  const weekTickInterval = 10;
  const weekTickText = weekList.map((w) => {
    const offsetWeek = w - maxCountWeek;
    if (offsetWeek % weekTickInterval === 0) {
      return offsetWeek.toString();
    }
    return '';
  });

  const plotParams: Parameters<typeof plot> = [
    [
      {
        type: 'surface',
        z,
        colorscale: [
          [0, 'darkblue'],
          [2 / maxCount, 'purple'],
          [50 / maxCount, 'red'],
          [100 / maxCount, 'orange'],
          [1, 'yellow'],
        ],
      },
    ],
    {
      scene: {
        xaxis: {
          title: `Player's CSGO Rank`,
          ticktext: Object.values(rankNames),
          tickvals: Object.keys(rankNames),
          tickmode: 'array',
          ticks: 'outside',
        },
        yaxis: {
          title: `Weeks from match`,
          ticktext: weekTickText,
          tickvals: weekList,
          tickmode: 'array',
          showgrid: false,
        },
        zaxis: { title: 'Number of players' },
      },
      title: 'Histogram of CSGO rank history of my opponents (via csgostats.gg)',
    },
  ];

  outputJSONSync('docs/3d-rank-hist.json', plotParams);

  plot(...plotParams);
};

generateCharts();
