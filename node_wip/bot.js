// Crypto Bot by abayomi185; github.com/abayomi185
// import iohook from "iohook"; // Listen for Keypress
// import chalk from "chalk"; // Coloured Text
// import keypress from "keypress"; // Listen for Keypress

import {
  header,
  inquirerSelectExchange,
} from "./src/prompts.js";

import BinanceBot from "./src/bot-binance.js"
import KucoinBot from "./src/bot-kucoin.js"

export const crypto_exchange = ["Binance", "Kucoin"];
export const exchange_color = {
  Binance: "yellow",
  Kucoin: "green",
};

async function main() {

  header();

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