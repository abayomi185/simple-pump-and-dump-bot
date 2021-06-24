// Crypto Bot by abayomi185; github.com/abayomi185

import {
  header,
  inquirerSelectScraper,
  inquirerSelectExchange,
} from "./src/interface/prompts.js";
import {
  inquirerImportScraperConfig,
  importExchangeList,
} from "./src/io/import.js";
import { exchangeColors } from "./src/interface/lut.js";
import { connectToDB } from "./src/io/db.js";

import { initScraperFromSelection, getSelectedGroups } from "./src/scrapers/scraper.js"

import KeypressActions from "./src/io/keypress.js";

import BinanceBot from "./src/bots/bot-binance.js";
import KucoinBot from "./src/bots/bot-kucoin.js";

import { keyMap } from "./src/io/keymap.js"

header()
export const coin_scraper = inquirerImportScraperConfig();
export const crypto_exchange = importExchangeList();
export const exchange_color = exchangeColors;
export let inquirerSelectedScrapers;
export let selectedScraperGroups;

export let keypressActions = new KeypressActions()
export let scraper = {
  manual: null,
  telegramScraper: null,
  discordScraper: null
};

// export function modifyScraper( value ) { telegramScraper = value; }

async function main() {

  connectToDB();

  inquirerSelectedScrapers = await inquirerSelectScraper();

  initScraperFromSelection(inquirerSelectedScrapers)
  
  selectedScraperGroups = await getSelectedGroups()

  const selectedExchange = await inquirerSelectExchange();

  // console.log(scraper.telegramScraper);

  // let pumpBot = null

  switch (selectedExchange) {
    case "Binance": {
      // pumpBot = new BinanceBot().run()
      new BinanceBot().run();
      break;
    }
    case "Kucoin": {
      // pumpBot = new KucoinBot().run()
      new KucoinBot().run();
      break;
    }
  }
}

// console.log(process.env);
main();
