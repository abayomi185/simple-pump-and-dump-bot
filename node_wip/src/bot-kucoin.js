import kucoin from "kucoin-node-sdk";

import { inquirerImportUserDetails } from "./import.js";
import { inquirerSelectTradeConfig, inquirerInputCoin } from "./prompts.js";

const bot = "kucoin";
const directory = "./#kucoin/";

export default class KucoinBot {
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
    kucoin.init(this.#userSecrets);
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
