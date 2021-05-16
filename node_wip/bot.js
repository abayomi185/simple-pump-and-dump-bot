// imports

// import iohook from "iohook"; // Listen for Keypress
import chalk from "chalk"; // Coloured Text
import keypress from "keypress"; // Listen for Keypress

import {
  header,
  selectExchange,
} from "./src/prompts.js";

import BinanceBot from "./src/binance-bot.js"
import KucoinBot from "./src/kucoin-bot.js"

async function main() {
  // askQuestions();
  header();

  const selectedExchange = await selectExchange();

  let pumpBot = null

  switch (selectedExchange) {
    
    case 'Binance': {
      pumpBot = new BinanceBot().run()
      break;
    }
    case 'Kucoin': {
      // Do setup to import right config
      pumpBot = new KucoinBot().run()
      break;
    }
  }

  // const selectedTradeConfig = await selectTradeConfig();
  // const selectedCoin = await inputCoin();

}

main()