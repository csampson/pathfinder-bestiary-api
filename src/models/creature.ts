enum Alignment {
  LG = 'lawful_good',
  NG = 'neutral_good',
  CG = 'chaotic_good',
  LN = 'lawful_neutral',
  N = 'neutral',
  CN = 'chaotic_neutral',
  LE = 'lawful_evil',
  NE = 'netural_evil',
  CE = 'chaotic_evil'
}

interface Skills {
  acrobatics?: number;
}

interface Attributes {
  alignment: string; // TODO: enum
  size: string; // TODO: enum
  type: string; // TODO: enum
  initiative: number;
  experiencePoints: number;
  senses: Array<string>;
  aura: string | null;
}

interface Statistics {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  bab: number;
  cmb: number;
  cmd: number;
  feats: Array<string>;
  skills: Skills;
  languages: Array<string>;
  specialQualities: Array<string>;
}

interface Defense {
  ac: number;
  touchAC: number;
  flatFootedAC: number;
  dodgeBonus: number;
  naturalBonus: number;
  hp: number;
  hd: number;
  regeneration: string | null;
  fort: number;
  ref: number;
  will: number;
  weaknesses: Array<string>;
}

interface Speed {
  land: number;
  fly: number | null;
  swim?: number | null;
  burrow?: number | null;
}

interface Attack {
  type: string;
  attacks: number,
  attackBonus: number,
  damage: string,
  damageModifier?: number;
  critRange: string | null;
  effect: string | null;
}

interface Offense {
  speed?: Speed,
  melee: Attack | null,
  ranged?: Attack,
  specialAttacks: Array<string>;
}

class Creature {
  name: string;
  challengeRating: number;
  attributes?: Attributes;
  offense?: Offense;
  defense?: Defense;
  statistics?: Statistics;

  constructor(name: string, challengeRating: number) {
    this.name = name;
    this.challengeRating = challengeRating;
  }
}

export default Creature;
