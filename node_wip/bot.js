// Crypto Bot by abayomi185; github.com/abayomi185

import {
  header,
  inquirerSelectExchange,
} from "./src/prompts.js";
import { importGlobalConfig } from "./src/import.js"
import { connectToDB } from "./src/db.js"

import BinanceBot from "./src/bot-binance.js"
import KucoinBot from "./src/bot-kucoin.js"

export const crypto_exchange = importGlobalConfig().Exchange
export const exchange_color = {
  Binance: "yellow",
  Kucoin: "green",
};

async function main() {

  header();

  connectToDB()

  const selectedExchange = await inquirerSelectExchange();

  // let pumpBot = null

  switch (selectedExchange) {
    
    case 'Binance': {
      // pumpBot = new BinanceBot().run()
      new BinanceBot().run()
      break;
    }
    case 'Kucoin': {
      // Do setup to import right config
      // pumpBot = new KucoinBot().run()
      new KucoinBot().run()
      break;
    }
  }

}

// console.log(process.env);
main()