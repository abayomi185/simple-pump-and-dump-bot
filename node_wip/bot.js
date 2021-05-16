// imports
import fs from "fs";
import yaml from "js-yaml";

// import iohook from "iohook"; // Listen for Keypress
import chalk from "chalk"; // Coloured Text
import keypress from "keypress"; // Listen for Keypress

import {
  header,
  inputCoin,
  selectExchange,
  selectTradeConfig,
} from "./src/prompts.js";

// const conf_import = "./conf-kucoin.yaml";
// const secrets_import = "./secrets-kucoin.yaml";

// export const config = yaml.load(fs.readFileSync(conf_import, "utf8"));
// const secrets = yaml.load(fs.readFileSync(secrets_import, "utf-8"));

async function main() {
  // askQuestions();
  header();

  const selectedExchange = await selectExchange();
  
  let pumpBot = null

  switch (selectedExchange) {
    
    case 'Binance': {
      pumpBot = new KucoinBot()
      break;
    }
    case 'Kucoin': {
      // Do setup to import right config
      pumpBot = new BinanceBot()
      break;
    }
  }

  console.log(pumpBot)

  const selectedTradeConfig = await selectTradeConfig();
  const selectedCoin = await inputCoin();

}

main();
