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

    const creature = new Creature(Parsers.name($), Parsers.cr($));
    const $attributes = $('.title + p');
    const $defense = $('.divider:contains("DEFENSE") + p');
    const $offense = $('.divider:contains("OFFENSE") + p');
    const $statistics = $('.divider:contains("STATISTICS") + p');

    creature.attributes = {
      experiencePoints: Parsers.xp($, $attributes),
      alignment: Parsers.alignment($attributes),
      size: Parsers.size($attributes),
      type: Parsers.type($attributes),
      initiative: Parsers.initiative($attributes),
      senses: Parsers.senses($attributes),
    };

    creature.defense = {
      ac: Parsers.ac($defense),
      hp: Parsers.hp($defense),
      hd: Parsers.hd($defense),
      regeneration: Parsers.regeneration($defense),
      fort: Parsers.fort($defense),
      ref: Parsers.ref($defense),
      will: Parsers.will($defense),
      sr: Parsers.sr($defense),
      immunities: Parsers.immunities($defense),
      resistances: Parsers.resistances($defense),
      weaknesses: Parsers.weaknesses($defense),
    };

    creature.offense = {
      speed: Parsers.speed($offense),
      melee: Parsers.attack('Melee', $offense),
      ranged: Parsers.attack('Ranged', $offense),
    };
       
    creature.statistics = {
      str: Parsers.str($statistics),
      dex: Parsers.dex($statistics),
      con: Parsers.con($statistics),
      int: Parsers.int($statistics),
      wis: Parsers.wis($statistics),
      cha: Parsers.cha($statistics),
      bab: Parsers.bab($statistics),
      cmb: Parsers.cmb($statistics),
      cmd: Parsers.cmd($statistics),
    };

    return creature;
  }
}

export default SRD;
