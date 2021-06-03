// import { modifyScraper } from "../bot.js";
import { scraper } from "../bot.js";
import TelegramScraper from "./telegram.js";
import DiscordScraper from "./discord.js";

export const initScraperFromSelection = (selectedScrapers) => {
  let manualEntry = false;
  let isDiscordPresent = false;
  let isTelegramPresent = false;

  for (const element of selectedScrapers) {
    const re = new RegExp(/\w+(?=\s+\+\+)/);
    const match = element.match(re);

    try {
      if (match[0] == "telegram" && isTelegramPresent == false) {
        // eslint-disable-next-line no-import-assign
        // telegramScraper = new TelegramScraper()
        // modifyScraper(new TelegramScraper())
        scraper.telegramScraper = new TelegramScraper();
        isTelegramPresent = true;
      }

      if (match[0] == "discord" && isDiscordPresent == false) {
        // eslint-disable-next-line no-import-assign
        // scraper.discordScraper = new TelegramScraper()
        scraper.discordScraper = new DiscordScraper()
        isDiscordPresent = true;
      }
    } catch (error) {
      if (element == "manual coin entry") {
        // eslint-disable-next-line no-unused-vars
        manualEntry = true;
      }
    }
  }
};
