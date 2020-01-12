export enum SheetNames {
  General = 'General',
  Players = 'Players',
  Rounds = 'Rounds',
}

export enum RoundType {
  PISTOL_ROUND = 'Pistol round',
  ECO = 'Eco',
  NORMAL = 'Normal',
  FORCE_BUY = 'Force buy',
  SEMN_ECO = 'Semi-Eco',
}

export enum Side {
  T = 'T',
  CT = 'CT',
}
export interface GeneralRow {
  Filename: string;
  ID: string;
  Date: string;
  Type: string;
  Source: string;
  Map: string;
  Hostname: string;
  Client: string;
  'Server Tickrate': number;
  Framerate: number;
  Duration: number;
  Ticks: number;
  'Name team 1': string;
  'Name team 2': string;
  'Score team 1': number;
  'Score team 2': number;
  'Score 1st half team 1': number;
  'Score 1st half team 2': number;
  'Score 2nd half team 1': number;
  'Score 2nd half team 2': number;
  Winner: string;
  Kills: number;
  Assists: number;
  '5K': number;
  '4K': number;
  '3K': number;
  '2K': number;
  '1K': number;
  'Trade kill': number;
  'Average Damage Per Round': number;
  'Total Damage Health': number;
  'Total Damage Armor': number;
  Clutch: number;
  'Bomb Defused': number;
  'Bomb Exploded': number;
  'Bomb Planted': number;
  Flashbang: number;
  Smoke: number;
  HE: number;
  Decoy: number;
  Molotov: number;
  Incendiary: number;
  Shots: number;
  Hits: number;
  Round: number;
  Comment: number;
  Cheater: number;
}

export interface PlayersRow {
  Name: string;
  SteamID: string;
  Rank: number;
  Team: string;
  Kills: number;
  Assists: number;
  Deaths: number;
  'K/D': number;
  HS: number;
  'HS%': number;
  'Team kill': number;
  'Entry kill': number;
  'Bomb planted': number;
  'Bomb defused': number;
  MVP: number;
  Score: number;
  RWS: number;
  Rating: number;
  'ATD (s)': number;
  KPR: number;
  APR: number;
  DPR: number;
  ADR: number;
  TDH: number;
  TDA: number;
  '5K': number;
  '4K': number;
  '3K': number;
  '2K': number;
  '1K': number;
  'Trade kill': number;
  'Trade death': number;
  'Crouch kill': number;
  'Jump kill': number;
  '1v1': number;
  '1v1 won': number;
  '1v1 loss': number;
  '1v1 won %': number;
  '1v2': number;
  '1v2 won': number;
  '1v2 loss': number;
  '1v2 won %': number;
  '1v3': number;
  '1v3 won': number;
  '1v3 loss': number;
  '1v3 won %': number;
  '1v4': number;
  '1v4 won': number;
  '1v4 loss': number;
  '1v4 won %': number;
  '1v5': number;
  '1v5 won': number;
  '1v5 loss': number;
  '1v5 won %': number;
  Flashbang: number;
  Smoke: number;
  HE: number;
  Decoy: number;
  Molotov: number;
  Incendiary: number;
  VAC: number;
  OW: number;
}

export interface RoundsRow {
  Number: number;
  Tick: number;
  'Duration (s)': number;
  'Winner Clan Name': string;
  Winner: Side;
  'End reason': string;
  Type: RoundType;
  Side: number;
  Team: number;
  Kills: number;
  '1K': number;
  '2K': number;
  '3K': number;
  '4K': number;
  '5K': number;
  'Trade kill': number;
  'Jump kills': number;
  ADP: number;
  TDH: number;
  TDA: number;
  'Bomb Exploded': number;
  'Bomb planted': number;
  'Bomb defused': number;
  'Start money team 1': number;
  'Start money team 2': number;
  'Equipement value team 1': number;
  'Equipement value team 2': number;
  Flashbang: number;
  Smoke: number;
  HE: number;
  Decoy: number;
  Molotov: number;
  Incendiary: number;
}
