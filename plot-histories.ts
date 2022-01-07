/* eslint-disable no-console */
import { readJsonSync } from 'fs-extra';
import { Plot, plot } from 'nodeplotlib';
import * as ss from 'simple-statistics';
import * as TinyGradient from 'tinygradient';
import { PlayersRankHistory } from './rank-history';

const MIN_SLOPE = -0.9;
const MAX_SLOPE = 0.9;
const SLOPE_RANGE = Math.abs(MIN_SLOPE) + Math.abs(MAX_SLOPE);
const ZERO_POS = 0.5;

const colorGradient = new TinyGradient([
  { color: 'red', pos: 0.49 },
  { color: 'yellow', pos: ZERO_POS },
  { color: 'green', pos: 0.51 },
]);

export const generateCharts = async (): Promise<void> => {
  const playerRankHistories: PlayersRankHistory = readJsonSync('_rankHistories.json');

  let negativeSlopes = 0;
  let positiveSlopes = 0;
  let maxSlope = 0;
  let minSlope = 0;

  const plots: Plot[] = Object.entries(playerRankHistories).map(([steamId, data]) => {
    // Remove bugged 0 rank, and only check last 2 years
    // eslint-disable-next-line no-param-reassign
    data = data.filter((d) => d.rank !== 0 && d.daysFromMatch > -2 * 365);

    // Get the slope
    const linRegRes = ss.linearRegression(data.map((d) => [d.daysFromMatch, d.rank]));
    let slope = linRegRes.m;

    if (Number.isFinite(slope) && !Number.isNaN(slope)) {
      maxSlope = Math.max(maxSlope, slope);
      minSlope = Math.min(minSlope, slope);
    } else {
      slope = 0;
    }

    let color: string;
    // const colorPos = slope / SLOPE_RANGE + ZERO_POS;
    // color = colorGradient.hsvAt(colorPos).toHexString();
    // Gradient color is tough since everything is so close to colorPos ~ 0.5. Everything just tends to be yellow
    if (slope >= 0) {
      positiveSlopes += 1;
      color = 'green';
    } else {
      negativeSlopes += 1;
      color = 'red';
    }
    return {
      type: 'scatter',
      x: data.map((d) => d.daysFromMatch),
      y: data.map((d) => d.rank),
      opacity: 0.25,
      line: {
        color,
      },
      name: steamId,
    };
  });

  console.log('positives:', positiveSlopes);
  console.log('negatives:', negativeSlopes);
  console.log('maxSlope:', maxSlope);
  console.log('minSlope:', minSlope);

  plot(plots, {
    'yaxis.range': [0, 18],
    width: 2500,
    height: 1000,
    xaxis: { title: 'Days from match' },
    yaxis: { title: `Player's CSGO Rank` },
    title: 'CSGO rank history of my opponents (via csgostats.gg)',
    // showlegend: false,
  });
};

generateCharts();
