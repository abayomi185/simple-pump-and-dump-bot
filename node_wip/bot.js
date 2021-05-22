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

import TelegramScraper from "./src/telegram.js";

import BinanceBot from "./src/bot-binance.js";
import KucoinBot from "./src/bot-kucoin.js";

header()
export const coin_scraper = inquirerImportScraperConfig();
export const crypto_exchange = importExchangeList();
export const exchange_color = exchangeColors;
export let selectedScraperConfig;

async function main() {

  connectToDB();

  selectedScraperConfig = await inquirerSelectScraper();

  new TelegramScraper().run();

  const selectedExchange = await inquirerSelectExchange();

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
