/**
 * @overview Bestiary scraper for d20pfsrd
 * @see {@link https://www.d20pfsrd.com}
 */

const axios = require('axios');
const cheerio = require('cheerio');

const Creature = require('../../models/creature');
const Parsers =  require('./parsers');

class SRD {
  static async import(entryURL) {
    const { data } = await axios.get(entryURL);
    const $ = cheerio.load(data);

    const statblock = $('.statblock');
    statblock.find('sup').remove();

    const lines = $('.statblock').text().trim().split('\n').slice(1);
    const creature = new Creature();
    
    Object.assign(creature.attributes, {
      name: Parsers.name($),
      challenge_rating: Parsers.cr($),
    });

    const [, alignment, size, type] = Parsers.alignmentSizeType(lines[0]);

    Object.assign(creature.attributes, {
      experience_points: Parsers.xp($, lines[0]),
      initiative: Parsers.initiative(lines[0]),
      senses: Parsers.senses(lines[0]),
      aura: Parsers.aura(lines[0]), // TODO: deep parse aura
      alignment,
      size,
      type // TODO: subtype
    });

    lines.slice(1).forEach(line => {
      line = line.trim();

      // Defense
      if (/^AC/.test(line)) {
        Object.assign(creature.attributes, {
          ac: Parsers.ac(line),
          touch_ac: Parsers.touchAC(line),
          flat_footed_ac: Parsers.flatFootedAC(line),
          dodge_bonus: Parsers.dodgeBonus(line),
          natural_bonus: Parsers.naturalBonus(line),
          hp: Parsers.hp(line),
          hd: Parsers.hd(line),
          regeneration: Parsers.regeneration(line),
          fort: Parsers.fort(line),
          ref: Parsers.ref(line),
          will: Parsers.ref(line),
          weaknesses: Parsers.weaknesses(line),
        });
      }

      // Offense
      if (/^Speed/.test(line)) {
        Object.assign(creature.attributes, {
          speed: Parsers.speed(line),
          melee: Parsers.melee(line),
          special_attacks: Parsers.specialAttacks(line),
        });
      }
      
      // Spell-like Abilities (stats)
      if (/Spell-Like Abilities/.test(line)) {
        Object.assign(creature.attributes, {
          spell_like_ability_stats: Parsers.spellLikeAbilityStats(line),
        });
      }

      // Spell-like Abilities (...)
      if (/^Constant/.test(line)) {
        Object.assign(creature.attributes, {
          spell_like_abilities: Parsers.spellLikeAbilities(line),
        })
      }
      
      // Statistics
      if (/^Str/.test(line)) {
        Object.assign(creature.attributes, {
          str: Parsers.str(line),
          dex: Parsers.str(line),
          con: Parsers.str(line),
          int: Parsers.str(line),
          wis: Parsers.str(line),
          con: Parsers.str(line),
          bab: Parsers.bab(line),
          cmb: Parsers.cmb(line),
          cmd: Parsers.cmd(line),
          feats: Parsers.feats(line),
          skills: Parsers.skills(line),
          languages: Parsers.languages(line),
          special_qualities: Parsers.specialQualities(line),
        });
      }
    });

    return creature;
  }
}

module.exports = SRD;
