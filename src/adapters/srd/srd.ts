/**
 * @overview Bestiary scraper for d20pfsrd
 * @see {@link https://www.d20pfsrd.com}
 */

import axios from 'axios';
import cheerio from 'cheerio';

import Creature from '../../models/creature';
import Parsers from './parsers';

class SRD {
  static async import(entryURL: string) {
    const { data } = await axios.get(entryURL);
    const $ = cheerio.load(data);

    const statblock = $('.statblock');
    statblock.find('sup').remove();

    const lines = $('.statblock').text().trim().split('\n').slice(1);
    const [, alignment, size, type] = Parsers.alignmentSizeType(lines[0]);
    const creature = new Creature(Parsers.name($), Parsers.cr($));

    creature.attributes = {
      experiencePoints: Parsers.xp($, lines[0]),
      alignment,
      size,
      type,
      initiative: Parsers.initiative(lines[0]),
      senses: Parsers.senses(lines[0]),
      aura: Parsers.aura(lines[0]), // TODO: deep parse aura
    };

    lines.slice(1).forEach((line: string) => {
      line = line.trim();

      // Defense
      if (/^AC/.test(line)) {
        creature.defense = {
          ac: Parsers.ac(line),
          touchAC: Parsers.touchAC(line),
          flatFootedAC: Parsers.flatFootedAC(line),
          dodgeBonus: Parsers.dodgeBonus(line),
          naturalBonus: Parsers.naturalBonus(line),
          hp: Parsers.hp(line),
          hd: Parsers.hd(line),
          regeneration: Parsers.regeneration(line),
          fort: Parsers.fort(line),
          ref: Parsers.ref(line),
          will: Parsers.will(line),
          weaknesses: Parsers.weaknesses(line),
        };
      }

      // Offense
      if (/^Speed/.test(line)) {
        creature.offense = {
          speed: Parsers.speed(line),
          melee: Parsers.melee(line),
          specialAttacks: Parsers.specialAttacks(line),
        };
      }
      
      // // Spell-like Abilities (stats)
      // if (/Spell-Like Abilities/.test(line)) {
      //   Object.assign(creature.attributes, {
      //     spell_like_ability_stats: Parsers.spellLikeAbilityStats(line),
      //   });
      // }

      // // Spell-like Abilities (...)
      // if (/^Constant/.test(line)) {
      //   Object.assign(creature.attributes, {
      //     spell_like_abilities: Parsers.spellLikeAbilities(line),
      //   })
      // }
      
      // Statistics
      if (/^Str /.test(line)) {
        creature.statistics = {
          str: Parsers.str(line),
          dex: Parsers.dex(line),
          con: Parsers.con(line),
          int: Parsers.int(line),
          wis: Parsers.wis(line),
          cha: Parsers.cha(line),
          bab: Parsers.bab(line),
          cmb: Parsers.cmb(line),
          cmd: Parsers.cmd(line),
          feats: Parsers.feats(line),
          skills: Parsers.skills(line),
          languages: Parsers.languages(line),
          specialQualities: Parsers.specialQualities(line),
        };
      }
    });

    return creature;
  }
}

export default SRD;
