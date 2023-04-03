import { CheerioAPI } from 'cheerio';
import startCase from 'lodash/startCase';

function trim(str: string) {
  return str.trim();
}

function split(str: string) {
  return str.split(/(?![^(]*\)),/);
}

const ALIGNMENT_PATTERN = 'LG|NG|CG|LN|N|CN|LE|NE|CE';
const SIZE_PATTERN = 'Fine|Diminutive|Tiny|Small|Medium|Large|Huge|Gargantuan|Colossal';
const TYPE_PATTERN = 'aberration|animal|construct|dragon|fey|humanoid|magical beast|monstrous humanoid|ooze|outsider|plant|undead|vermin';
const ALIGNMENT_SIZE_TYPE_PATTERN = RegExp(`(${ALIGNMENT_PATTERN}) (${SIZE_PATTERN}) (${TYPE_PATTERN})`);

namespace Parsers {
  export function name ($: CheerioAPI) {
    return $('h1').text();
  }

  export function cr($: CheerioAPI) {
    const match = $('.level').text().match(/\d+/g);
    return Number(match);
  }

  export function xp ($: CheerioAPI, line: string) {
    const xpLine = $('.level').text().match(/(XP )(\d+(,\d+)*)/);
    let xp;

    if (xpLine) {
      xp = Number(xpLine[2].replace(/,/g, ''));
    } else {
      xp = Number(line.match(/(XP )(\d+(,\d+)*)/)![2].replace(',', ''));
    }

    return xp;
  }

  export function alignmentSizeType(line: string) {
    return line.match(ALIGNMENT_SIZE_TYPE_PATTERN)!;
  }

  export function initiative(line: string) {
    const match = line.match(/Init ([+-–]\d+)/)![1];
    return Number(match.replace('–', '-'));
  }

  export function senses(line: string) {
    return split(line.match(/Senses (.*);/)![1]).map(trim)
  }

  export function aura(line: string) {
    const match = line.match(/Aura (.*);/);
    return match ? match[1] : null;
  }

  export function ac(line: string) {
    return Number(line.match(/AC (\d+)/)![1]);
  }

  export function touchAC(line: string) {
    return Number(line.match(/touch (\d+)/)![1]);
  }

  export function flatFootedAC(line: string) {
    return Number(line.match(/flat-footed (\d+)/)![1])
  }

  export function dodgeBonus(line: string) {
    const match = line.match(/([+|-]\d+) dodge/);
    return match ? Number(match[1]) : 0;
  }

  export function naturalBonus(line: string) {
    const match = line.match(/([+|-]\d+) natural/);
    return match ? Number(match[1]) : 0;
  }

  export function hp(line: string) {
    return Number(line.match(/hp (\d+)/)![1])
  }

  export function hd(line: string) {
    return Number(line.match(/d(\d+)/)![1])
  }

  export function regeneration(line: string) {
    const match = line.match(/regeneration \d+ \(.*\);/);
    return match ? match[1] : null;
  }

  export function fort(line: string) {
    const match = line.match(/Fort ([+-–]\d+)/);
    return Number(match![1].replace('–', '-'));
  }

  export function ref(line: string) {
    const match = line.match(/Ref ([+-–]\d+)/);
    return Number(match![1].replace('–', '-'));
  }

  export function will(line: string) {
    const match = line.match(/Will ([+-–]\d+)/);
    return Number(match![1].replace('–', '-'));
  }

  export function weaknesses(line: string) {
    const match = line.match(/Weaknesses (.*)/);
    return match ? split(match[1]) : [];
  }

  export function speed(line: string) {
    const landSpeed = line.match(/Speed (\d+)/);
    const flySpeed = line.match(/fly (\d+)/);
    const swimSpeed = line.match(/swim (\d+)/);
    const burrowSpeed = line.match(/burrow (\d+)/);

    return {
      land: Number(landSpeed![1]),
      fly: flySpeed ? Number(flySpeed[1]) : null,
      swim: swimSpeed ? Number(swimSpeed[1]) : null,
      burrow: burrowSpeed ? Number(burrowSpeed[1]) : null,
    };
  }

  export function melee(line: string) {
    const match = line.match(/Melee (\d+)?(\w+\s\w+)? ([+-]\d+) \((\d+d\d+)([+-]\d+)\/?(\d+–\d+)?/);
    console.log(match)

    return match ? {
      type: match[2],
      attacks: match[1] ? Number(match[1]) : 1,
      attackBonus: Number(match[3]),
      damage: match[4],
      modifier: Number(match[5]),
      critRange: match[6] ? match[6].replace('/', '') : '20',
      effect: null//line.match(/Melee .* plus ([\w\s]+)/)![1]
    } : null;
  }

  export function specialAttacks(line: string) {
    const match = line.match(/Special Attacks\s(.*?)(Clierc|Sorceror|Wizard|Domain|Spell-Like Abilities|$)/);
    return match ? split(match[1]).map(trim) : [];
  }

  export function str(line: string) {
    return Number(line.match(/Str (\d+)/)![1]);
  }

  export function dex(line: string) {
    return Number(line.match(/Dex (\d+)/)![1]);
  }

  export function con(line: string) {
    return Number(line.match(/Con (\d+)/)![1]);
  }

  export function int(line: string) {
    return Number(line.match(/Int (\d+)/)![1]);
  }

  export function wis(line: string) {
    return Number(line.match(/Wis (\d+)/)![1]);
  }

  export function cha(line: string) {
    return Number(line.match(/Cha (\d+)/)![1]);
  }

  export function bab(line: string) {
    return Number(line.match(/Base Atk ([+|-]\d+)/)![1]);
  }

  export function cmb(line: string) {
    return Number(line.match(/CMB ([+|-]\d+)/)![1]);
  }

  export function cmd(line: string) {
    return Number(line.match(/CMD (\d+)/)![1]);
  }

  export function feats(line:string) {
    const match = line.match(/Feats (.*)\s?(Skills)/)![1];
    return match ? split(match).map(trim) : [];
  }
  export function skills(line: string) {
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

      return match ? {
        ...bonuses,
        [skill]: Number(match[1]),
      } : bonuses;
    }, {});

    return skillBonuses;
  }

  export function languages(line: string) {
    const match = line.match(/Languages (.*?)(?=(SQ|$))/);
    return match![1].split(';').map(trim);
  }

  export function specialQualities(line: string) {
    const match = line.match(/SQ (.*)/)
    return match ? split(match[1]).map(trim) : [];
  }
}

export default Parsers;

//   spellLikeAbilityStats: line => {
//     const match = line.match(/Spell-Like Abilities \(CL (\d+)\w+; concentration [+-](\d+)/);

//     return {
//       caster_level: match[1],
//       concentration: match[2],
//     }
//   },
//   spellLikeAbilities: line => {
//     const constant = line.match(/Constant—(.*?)(?=(At will|\d+\/day—|$))/);
//     const atWill = line.match(/At will—(.*?)(?=(\d+\/day—|$))/);
//     const onePerDay = line.match(/1\/day—(.*?)(?=(\d+\/day—|$))/);
//     const twoPerDay = line.match(/2\/day—(.*?)(?=(\d+\/day—|$))/);
//     const threePerDay = line.match(/3\/day—(.*?)(?=(\d+\/day—|$))/);

//     return JSON.stringify({
//       constant: constant ? split(constant[1]).map(trim) : null,
//       at_will : atWill ? split(atWill[1]).map(trim) : null,
//       one_per_day: onePerDay ? split(onePerDay[1]).map(trim) : null,
//       two_per_day: twoPerDay ? split(twoPerDay[1]).map(trim) : null,
//       three_per_day: threePerDay ? split(threePerDay[1]).map(trim) : null,
//     });
//   },
// };

// module.exports = Parsers;
