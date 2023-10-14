import { Cheerio, Element, CheerioAPI } from 'cheerio';
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

namespace Parsers {
  export function name ($: CheerioAPI) {
    return $('.title').text().match(/(.*)(CR)/)![1].trim();
  }

  export function cr($: CheerioAPI) {
    const match = $('.level').text().match(/\d+/);
    return Number(match);
  }

  export function xp ($: CheerioAPI, $attributes: Cheerio<Element>) {
    const xpLine = $('.level').text().match(/(XP )(\d+(,\d+)*)/);
    let xp;

    if (xpLine) {
      xp = Number(xpLine[2].replace(/,/g, ''));
    } else {
      xp = Number($attributes.text().match(/(XP )(\d+(,\d+)*)/)![2].replace(',', ''));
    }

    return xp;
  }

  export function alignment ($attributes: Cheerio<Element>) {
    return $attributes.text().match(ALIGNMENT_PATTERN)![0];
  }

  export function size ($attributes: Cheerio<Element>) {
    return $attributes.text().match(SIZE_PATTERN)![0];
  }

  export function type ($attributes: Cheerio<Element>) {
    return $attributes.text().match(TYPE_PATTERN)![0];
  }

  export function initiative($attributes: Cheerio<Element>) {
    const match = $attributes.text().match(/Init ([+-–]\d+)/)![1];
    return Number(match.replace('–', '-'));
  }

  export function senses($attributes: Cheerio<Element>) {
    const match = $attributes.text().match(/Senses (.+?)(?:;|$)/);
    return split(match![1]).map(trim);
  }

  export function ac($defense: Cheerio<Element>) {
    const text = $defense.text();
    const deflectionBonus = text.match(/([+|-]\d+) deflection/);
    const dodgeBonus = text.match(/([+|-]\d+) dodge/);
    const insightBonus = text.match(/([+|-]\d+) insight/);
    const naturalBonus = text.match(/([+|-]\d+) natural/);
    const sacredBonus = text.match(/([+|-]\d+) sacred/);
    const profaneBonus = text.match(/([+|-]\d+) profane/);
    
    return {
      total: Number(text.match(/AC (\d+)/)![1]),
      touch: Number(text.match(/touch (\d+)/)![1]),
      flatFooted: Number(text.match(/flat-footed (\d+)/)![1]),
      deflectionBonus: deflectionBonus ? Number(deflectionBonus[1]) : 0,
      dodgeBonus: dodgeBonus ? Number(dodgeBonus[1]) : 0,
      insightBonus: insightBonus ? Number(insightBonus[1]) : 0,
      naturalBonus: naturalBonus ? Number(naturalBonus[1]) : 0,
      sacredBonus: sacredBonus ? Number(sacredBonus[1]) : 0,
      profaneBonus: profaneBonus ? Number(profaneBonus[1]) : 0
    };
  }

  export function hp($defense: Cheerio<Element>) {
    return Number($defense.text().match(/hp (\d+)/)![1])
  }

  export function hd($defense: Cheerio<Element>) {
    return Number($defense.text().match(/d(\d+)/)![1])
  }

  export function regeneration($defense: Cheerio<Element>) {
    const match = $defense.text().match(/regeneration (\d+ \(.*\)(?:;|\s))/);
    return match ? trim(match[1]) : null;
  }

  export function fort($defense: Cheerio<Element>) {
    const match = $defense.text().match(/Fort ([+-–]\d+)/);
    return Number(match![1].replace('–', '-'));
  }

  export function ref($defense: Cheerio<Element>) {
    const match = $defense.text().match(/Ref ([+-–]\d+)/);
    return Number(match![1].replace('–', '-'));
  }

  export function will($defense: Cheerio<Element>) {
    const match = $defense.text().match(/Will ([+-–]\d+)/);
    return Number(match![1].replace('–', '-'));
  }

  export function defensiveAbilities($defense: Cheerio<Element>) {
    const match = $defense.text().match(/Defensive Abilities (.+?);/);
    return match ? match![1].split(',') : [];
  }

  // export function dr($defense: Cheerio<Element>) {
  //   const match = $defense.text().match(/DR (\d+\/.*?)(?:;|$)/);

  //   if (!match) {
  //     return null;
  //   }
  // }

  export function sr($defense: Cheerio<Element>) {
    const match = $defense.text().match(/SR (\d+)(?:;|$)/);
    return match ? Number(match![1]) : null;
  }

  export function resistances($defense: Cheerio<Element>) {
    const match = $defense.text().match(/Resist (.+?);/);
    return match ? match![1].split(',').map(trim) : [];
  }

  export function immunities($defense: Cheerio<Element>) {
    const match = $defense.text().match(/Immune (.+?);/);
    return match ? match![1].split(',').map(trim) : [];
  }

  export function weaknesses($defense: Cheerio<Element>) {
    const match = $defense.text().match(/Weaknesses (.*)/);
    return match ? split(match[1]) : [];
  }

  export function speed($offense: Cheerio<Element>) {
    const text = $offense.text();
    const landSpeed = text.match(/Speed (\d+)/);
    const flySpeed = text.match(/fly (\d+)/);
    const swimSpeed = text.match(/swim (\d+)/);
    const burrowSpeed = text.match(/burrow (\d+)/);

    return {
      land: Number(landSpeed![1]),
      fly: flySpeed ? Number(flySpeed[1]) : null,
      swim: swimSpeed ? Number(swimSpeed[1]) : null,
      burrow: burrowSpeed ? Number(burrowSpeed[1]) : null,
    };
  }

  export function attack(type: string, $offense: Cheerio<Element>) {
    const pattern = new RegExp(`${type} (.*?) ([+-]\\d+\\/?)+ \\((\\d+d\\d+)([+-]\\d+)\\/?(\\d+–\\d+)?(x\\d)?( plus .*?\\))?`);
    const match = $offense.text().match(pattern);

    return match ? {
      type: match[1],
      attackBonus: match[2].split('/').map(Number),
      damage: match[3],
      damageModifier: Number(match[4]),
      critRange: match[5] ? match[5].replace('/', '') : '20',
      critModifier: match[6] ? match[6] : null,
      effect: match[7] ? trim(match[7]).replace(')', '').replace('plus ', '') : null
    } : null;
  }

  export function specialAttacks(line: string) {
    const match = line.match(/Special Attacks\s(.*?)(Clierc|Sorceror|Wizard|Domain|Spell-Like Abilities|$)/);
    return match ? split(match[1]).map(trim) : [];
  }

  export function str($statistics: Cheerio<Element>) {
    return Number($statistics.text().match(/Str (\d+)/)![1]);
  }

  export function dex($statistics: Cheerio<Element>) {
    return Number($statistics.text().match(/Dex (\d+)/)![1]);
  }

  export function con($statistics: Cheerio<Element>) {
    return Number($statistics.text().match(/Con (\d+)/)![1]);
  }

  export function int($statistics: Cheerio<Element>) {
    return Number($statistics.text().match(/Int (\d+)/)![1]);
  }

  export function wis($statistics: Cheerio<Element>) {
    return Number($statistics.text().match(/Wis (\d+)/)![1]);
  }

  export function cha($statistics: Cheerio<Element>) {
    return Number($statistics.text().match(/Cha (\d+)/)![1]);
  }

  export function bab($statistics: Cheerio<Element>) {
    return Number($statistics.text().match(/Base Atk ([+|-]\d+)/)![1]);
  }

  export function cmb($statistics: Cheerio<Element>) {
    return Number($statistics.text().match(/CMB ([+|-]\d+)/)![1]);
  }

  export function cmd($statistics: Cheerio<Element>) {
    return Number($statistics.text().match(/CMD (\d+)/)![1]);
  }

  export function feats($statistics: Cheerio<Element>) {
    const match = $statistics.text().match(/Feats (.*)\s?(Skills)/)![1];
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
      'disableDevice',
      'disguise',
      'escapeArtist',
      'fly',
      'handleAnimal',
      'heal',
      'intimidate',
      // TODO: knowledge
      'linguistics',
      'perception',
      'perform',
      'profession',
      'ride',
      'senseMotive',
      'sleightOfHand',
      'spellcraft',
      'stealth',
      'survival',
      'swim',
      'useMagicDevice',
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
    const match = line.match(/Languages (.*?)(?:(Gear|SQ|$))/);
    return match ? match![1].split(/,|;/).map(trim) : [];
  }

  export function specialQualities(line: string) {
    const match = line.match(/SQ (.*)/)
    return match ? split(match[1]).map(trim) : [];
  }

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
}

export default Parsers;

