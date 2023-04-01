const startCase = require('lodash/startCase');

function trim(str) {
  return str.trim();
}

function split(str) {
  return str.split(/(?![^(]*\)),/);
}

const ALIGNMENT_PATTERN = 'LG|NG|CG|LN|N|CN|LE|NE|CE';
const SIZE_PATTERN = 'Fine|Diminutive|Tiny|Small|Medium|Large|Huge|Gargantuan|Colossal';
const TYPE_PATTERN = 'aberration|animal|construct|dragon|fey|humanoid|magical beast|monstrous humanoid|ooze|outsider|plant|undead|vermin';
const ALIGNMENT_SIZE_TYPE_PATTERN = RegExp(`(${ALIGNMENT_PATTERN}) (${SIZE_PATTERN}) (${TYPE_PATTERN})`);

const Parsers = {
  name: $ => $('h1').text(),
  cr: $ => (
    Number($('.level').text().match(/\d+/g)[0])
  ),
  xp: ($, line) => {
    const xpLine = $('.level').text().match(/(XP )(\d+(,\d+)*)/);
    let xp;

    if (xpLine) {
      xp = Number(xpLine[2].replace(/,/g, ''));
    } else {
      xp = line.match(/(XP )(\d+(,\d+)*)/)[2].replace(',', '');
    }

    return xp;
  },
  alignmentSizeType: line => (
    line.match(ALIGNMENT_SIZE_TYPE_PATTERN)
  ),
  subtype: line => (
    null
  ),
  initiative: line => {
    const match = line.match(/Init ([+-–]\d+)/)[1];
    return Number(match.replace('–', '-'));
  },
  senses: line => (
    split(line.match(/(Senses) (.*);/)[2]).map(trim)
  ),
  aura: line => {
    const match = line.match(/(Aura) (.*);/);
    return match ? match[2] : null;
  },
  ac: line => (
    Number(line.match(/(AC) (\d+)/)[2])
  ),
  touchAC: line => (
    Number(line.match(/(touch) (\d+)/)[2])
  ),
  flatFootedAC: line => (
    Number(line.match(/(flat-footed) (\d+)/)[2])
  ),
  dodgeBonus: line => (
    Number(line.match(/([+|-])(\d+) dodge/)&[2])
  ),
  naturalBonus: line => (
    Number(line.match(/([+|-])(\d+) natural/)&[2])
  ),
  hp: line => (
    Number(line.match(/(hp) (\d+)/)[2])
  ),
  hd: line => (
    Number(line.match(/(d)(\d+)/)[2])
  ),
  regeneration: line => {
    const match = line.match(/(regeneration) \d+ \(.*\);/);
    return match ? match[2] : null;
  },
  fort: line => (
    Number(line.match(/Fort ([+-]\d+)/)[1])
  ),
  ref: line => (
    Number(line.match(/Ref ([+-]\d+)/)[1])
  ),
  will: line => (
    Number(line.match(/Will ([+|-]\d+)/)[1])
  ),
  weaknesses: line => {
    const match = line.match(/(Weaknesses) (.*)/);
    return match ? split(match[2]) : null;
  },
  speed: line => {
    const landSpeed = line.match(/Speed (\d+)/);
    const flySpeed = line.match(/fly (\d+)/);
    const swimSpeed = line.match(/swim (\d+)/);
    const burrowSpeed = line.match(/burrow (\d+)/);

    return {
      land: Number(landSpeed[1]),
      fly: flySpeed ? Number(flySpeed[1]) : null,
      swim: swimSpeed ? Number(swimSpeed[1]) : null,
      burrow: burrowSpeed ? Number(burrowSpeed[1]) : null,
    };
  },
  melee: line => {
    const match = line.match(/Melee .* ([+-]\d+) \((\d+d\d+)([+-]\d+)(\/\d+-\d+)?( plus.*\))/)

    return match ? {
      attack: Number(match[1]),
      damage: match[2],
      modifier: Number(match[3]),
      crit: match[4]?.replace('/', ''),
      effect: line.match(/Melee .* plus ([\w\s]+)/)[1]
    } : null;
  },
  specialAttacks: line => {
    const match = line.match(/Special Attacks\s(.*?)(Spell-Like Abilities|$)/);
    return match ? split(match[1]).map(trim) : null;
  },
  spellLikeAbilityStats: line => {
    const match = line.match(/Spell-Like Abilities \(CL (\d+)\w+; concentration [+-](\d+)/);

    return {
      caster_level: match[1],
      concentration: match[2],
    }
  },
  spellLikeAbilities: line => {
    const constant = line.match(/Constant—(.*?)(?=(At will|\d+\/day—|$))/);
    const atWill = line.match(/At will—(.*?)(?=(\d+\/day—|$))/);
    const onePerDay = line.match(/1\/day—(.*?)(?=(\d+\/day—|$))/);
    const twoPerDay = line.match(/2\/day—(.*?)(?=(\d+\/day—|$))/);
    const threePerDay = line.match(/3\/day—(.*?)(?=(\d+\/day—|$))/);

    return JSON.stringify({
      constant: constant ? split(constant[1]).map(trim) : null,
      at_will : atWill ? split(atWill[1]).map(trim) : null,
      one_per_day: onePerDay ? split(onePerDay[1]).map(trim) : null,
      two_per_day: twoPerDay ? split(twoPerDay[1]).map(trim) : null,
      three_per_day: threePerDay ? split(threePerDay[1]).map(trim) : null,
    });
  },
  str: line => (
    Number(line.match(/(Str) (\d+)/)[2])
  ),
  dex: line => (
    Number(line.match(/(Dex) (\d+)/)[2])
  ),
  con: line => (
    Number(line.match(/(Con) (\d+)/)[2])
  ),
  int: line => (
    Number(line.match(/(Int) (\d+)/)[2])
  ),
  wis: line => (
    Number(line.match(/(Wis) (\d+)/)[2])
  ),
  cha: line => (
    Number(line.match(/(Cha) (\d+)/)[2])
  ),
  bab: line => (
    Number(line.match(/(Base Atk [+|-])(\d+)/)[2])
  ),
  cmb: line => (
    Number(line.match(/(CMB [+|-])(\d+)/)[2])
  ),
  cmd: line => (
    Number(line.match(/(CMD) (\d+)/)[2])
  ),
  feats: line => {
    const match = line.match(/(Feats) (.*)\s?(Skills)/)[2];
    return match ? split(match).map(trim) : null;
  },
  skills: line => {
    const skills = [
      'acrobatics',
      'appraise',
      'bluff',
      'climb',
      // TODO: craft
      'diplomacy',
      'disable_device',
      'disguise',
      'escape_artist',
      'fly',
      'handle_animal',
      'heal',
      'intimidate',
      // TODO: knowledge
      'linguistics',
      'perception',
      'perform',
      'profession',
      'ride',
      'sense_motive',
      'sleight_of_hand',
      'spellcraft',
      'stealth',
      'survival',
      'swim',
      'use_magic_device',
    ];

    const skillBonuses = skills.reduce((bonuses, skill) => {
      const skillName = startCase(skill);
      const match = line.match(RegExp(`${skillName} [+-](\\d+)`));

      return {
        ...bonuses,
        [skill]: match ? Number(match[1]) : null,
      };
    }, {});

    return skillBonuses;
  },
  languages: line => {
    const match = line.match(/Languages (.*?)(?=(SQ|$))/);
    return match[1].split(';').map(trim);
  },
  specialQualities: line => {
    const match = line.match(/SQ (.*)/)
    return match ? split(match[1]).map(trim) : null;
  },
};

module.exports = Parsers;
