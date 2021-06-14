// import { modifyScraper } from "../../bot.js";
import { scraper } from "../../bot.js";
import TelegramScraper from "./telegram.js";
import DiscordScraper from "./discord.js";

import { importScraperGroupDetails } from "../io/import.js";

// Seems jank but it's the best method I can think of to
// remove dependence on imports in scraper class
let localisedSelectedScrapers;

export const initScraperFromSelection = (selectedScrapers) => {
  localisedSelectedScrapers = selectedScrapers;

  let manualEntry = false;
  let isDiscordPresent = false;
  let isTelegramPresent = false;

  for (const element of selectedScrapers) {
    const re = new RegExp(/\w+(?=\s+\+\+)/);
    const match = element.match(re);

    try {
      if (match[0] == "discord" && isDiscordPresent == false) {
        // eslint-disable-next-line no-import-assign
        // scraper.discordScraper = new TelegramScraper()
        scraper.discordScraper = new DiscordScraper();
        isDiscordPresent = true;
      }
      if (match[0] == "telegram" && isTelegramPresent == false) {
        // eslint-disable-next-line no-import-assign
        // telegramScraper = new TelegramScraper()
        // modifyScraper(new TelegramScraper())
        scraper.telegramScraper = new TelegramScraper();
        isTelegramPresent = true;
      }
    } catch (error) {
      if (element == "manual coin entry") {
        // eslint-disable-next-line no-unused-vars
        manualEntry = true;
        scraper.manual = true
      }
    }
  }
};

export const getSelectedGroups = async () => {
  // use localisedSelectedScrapers

  // Rather than use arrays, pass entire object into the selected groups with all info
  // So no need to fetch again
  const selectedGroups = {
    discord: {},
    telegram: {},
  };

  for (const element of localisedSelectedScrapers) {
    const re1 = new RegExp(/\w+(?=\s+\+\+)/);
    const re2 = new RegExp(/(?<=\+\++\s)\w+/);
    const match1 = element.match(re1);
    const match2 = element.match(re2);

    try {
      if (match1[0] == "discord") {
        // selectedGroups.discord.push(
        //   importScraperGroupDetails(match1[0], match2[0])
        // ); // For use with object of arrays
        selectedGroups.discord[match2[0]] = importScraperGroupDetails(
          match1[0],
          match2[0]
        ); // pump_group object here; object of objects
      }
      if (match1[0] == "telegram") {
        // selectedGroups.telegram.push(
        //   importScraperGroupDetails(match1[0], match2[0])
        // ); // For use with object of arrays
        selectedGroups.telegram[match2[0]] = importScraperGroupDetails(
          match1[0],
          match2[0]
        ); // pump_group object here
      }
    } catch (error) {
      if (element == "manual coin entry") {
        // Basically just don't crash
      }
    }
  }

  // console.log(selectedGroups);
  
  return selectedGroups;
};
