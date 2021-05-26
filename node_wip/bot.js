// Crypto Bot by abayomi185; github.com/abayomi185

import {
  header,
  inquirerSelectScraper,
  inquirerSelectExchange,
} from "./src/prompts.js";
import {
  inquirerImportScraperConfig,
  importExchangeList,
} from "./src/import.js";
import { exchangeColors } from "./src/lut.js";
import { connectToDB } from "./src/db.js";

import { initScraperFromSelection } from "./src/scraper.js"

import BinanceBot from "./src/bot-binance.js";
import KucoinBot from "./src/bot-kucoin.js";

header()
export const coin_scraper = inquirerImportScraperConfig();
export const crypto_exchange = importExchangeList();
export const exchange_color = exchangeColors;
export let selectedScrapers;

export let manualEntry; // Option to disable manual entry; future use
export let scraper = {
  manual: null,
  telegramScraper: null,
  discordScraper: null
};

// export function modifyScraper( value ) { telegramScraper = value; }

async function main() {

  connectToDB();

  selectedScrapers = await inquirerSelectScraper();
  
  initScraperFromSelection(selectedScrapers)

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
