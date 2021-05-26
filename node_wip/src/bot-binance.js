import binance from "binance-api-node";

import { inquirerImportUserDetails } from "./import.js";
import { inquirerSelectTradeConfig, inquirerInputCoin } from "./prompts.js";

import path from "path"
import dirname from 'es-dirname'

const bot = "binance";
const directory = path.join(dirname(), "../#binance/")

export default class BinanceBot {
  #userSecrets;
  #userConfig;

  constructor() {
    this.balance;
    this.buyOrder;
    this.buyInfo;
    this.sellOrder;
    this.sellInfo;
    this.coinPair;
    this.selectedConfig;
    this.selectedCoin;
  }

  // getters and setter, get and set value of private object variables outside the class bounds

  async initialiseAPI() {
    // kucoin.init(this.#user_secrets)
  }

  // changing a this.value value in an arrow function doesn't change it outside the scope
  // For Arrow functions

  async run() {
    [this.#userConfig, this.#userSecrets] = await inquirerImportUserDetails(
      bot,
      directory
    );

    await this.initialiseAPI();

    this.selectedConfig = await inquirerSelectTradeConfig(this.#userConfig);
    this.selectedCoin = await inquirerInputCoin();

    this.coinPair =
      this.selectedCoin.toUpperCase() +
      "-" +
      this.#userConfig["trade_configs"][this.selectedConfig]["pairing"];
  }
}
