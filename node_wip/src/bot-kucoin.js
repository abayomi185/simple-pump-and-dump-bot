import kucoin from "kucoin-node-sdk";
import { v4 as uuidv4 } from "uuid";

import { inquirerImportUserDetails } from "./import.js";
import { inquirerSelectTradeConfig, inquirerInputCoin } from "./prompts.js";

const bot = "kucoin";
const directory = "./#kucoin/";

export default class KucoinBot {
  #userSecrets;
  #userConfig;

  constructor() {
    this.balance;
    this.tradingAmount;
    this.buyOrderId;
    this.buyOrder;
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

  getTicker() {
    return kucoin.rest.Market.Symbols.getTicker(this.coinPair);
  }

  getAccountUsers() {
    return kucoin.rest.User.UserInfo.getSubUsers();
  }

  async validateAPIConnection() {
    const acctInfo = await this.getAccountUsers();
    if (acctInfo.code !== "200000") {
      throw "API secrets cannot be validated";
    }
  }

  getBalance() {
    this.balance = kucoin.rest.User.Account.getAccountsList({
      type: "trade",
      currency:
        this.#userConfig["trade_configs"][this.selectedConfig]["pairing"],
    }).data;
  }

  getTradingAmount() {
    this.tradingAmount =
      parseFloat(this.balance["data"][0]["available"]) *
      this.#userConfig["trade_configs"][this.selectedConfig][
        "buy_qty_from_wallet"
      ];
  }

  marketBuyOrder() {
    this.buyOrderId = kucoin.rest.Trade.Orders.postOrder(
      {
        clientOid: uuidv4(),
        side: "buy",
        symbol: this.coinPair,
        type: "market",
      },
      {
        size: "",
      }
    );
    // Use orderId and get order details
  }

  // changing a this.value value in an arrow function doesn't change it outside the scope
  // For Arrow functions

  async run() {
    [this.#userConfig, this.#userSecrets] = await inquirerImportUserDetails(
      bot,
      directory
    );

    await this.initialiseAPI();
    await this.validateAPIConnection();

    this.selectedConfig = await inquirerSelectTradeConfig(this.#userConfig);

    // store balance
    this.getBalance();
    console.log(await this.balance);
    // this.getTradingAmount()
    // console.log(await this.tradingAmount);

    this.selectedCoin = await inquirerInputCoin();

    this.coinPair =
      this.selectedCoin.toUpperCase() +
      "-" +
      this.#userConfig["trade_configs"][this.selectedConfig]["pairing"];
  }
}
