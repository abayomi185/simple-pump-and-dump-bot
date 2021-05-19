import kucoin from "kucoin-node-sdk";
import { v4 as uuidv4 } from "uuid";
import chalk from "chalk"

import { inquirerImportUserDetails } from "./import.js";
import { inquirerSelectTradeConfig, inquirerInputCoin } from "./prompts.js";

const bot = "kucoin";
const directory = "./#kucoin/";

export default class KucoinBot {
  #userSecrets;
  #userConfig;

  constructor() {
    this.quoteCoinBalance;
    this.baseCoinBalance;
    this.tradingAmount;
    this.ticker;
    this.buyOrderId;
    this.buyOrder;
    this.sellOrderId;
    this.sellOrder;
    this.coinPair;
    this.selectedConfig;
    this.selectedCoin;
  }

  // getters and setter, get and set value of private object variables outside the class bounds

  async initialiseAPI() {
    kucoin.init(this.#userSecrets);
  }

  async getTicker() {
    this.ticker = await kucoin.rest.Market.Symbols.getTicker(this.coinPair);
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

  async getquoteCoinBalance() {
    this.quoteCoinBalance = await kucoin.rest.User.Account.getAccountsList({
      type: "trade",
      currency:
        this.#userConfig["trade_configs"][this.selectedConfig]["pairing"],
    });
    // console.log(this.quoteCoinBalance);
    console.log(`Your ${this.#userConfig['trade_configs'][this.selectedConfig]['pairing']} balance is ${this.quoteCoinBalance["data"][0]['available']}\n`);
    console.log(chalk.yellow("Please check your config before proceeding\n"));
  }

  async getTradingAmount() {
    this.tradingAmount = Math.floor(
      parseFloat(this.quoteCoinBalance["data"][0]["available"]) *
        this.#userConfig["trade_configs"][this.selectedConfig][
          "buy_qty_from_wallet"
        ]
    );
    // console.log(typeof this.tradingAmount);
  }

  async marketBuyOrder() {
    // current_price = client.get_ticker(symbol=selected_coin_pair)
    // buy_qty = math.floor(avail_trading_amount / float(current_price['price']))
    this.buyOrderId = await kucoin.rest.Trade.Orders.postOrder(
      {
        clientOid: uuidv4(),
        side: "buy",
        symbol: this.coinPair,
        type: "market",
      },
      {
        funds: this.tradingAmount,
      }
    );
  }

  async getBuyOrderDetails() {
    // Use orderId and get order details
    this.buyOrder = await kucoin.rest.Trade.Orders.getOrderByID(
      this.buyOrderId["data"]["orderId"]
    );
    console.log(this.buyOrder["data"]);
  }

  async getBaseCoinBalance() {
    this.baseCoinBalance = await kucoin.rest.User.Account.getAccountsList({
      currency: this.selectedCoin,
      type: "trade",
    });
  }

  async checkMargin() {
    const margin =
      this.#userConfig["trade_configs"][this.selectedConfig]["profit_margin"];
    const interval =
      this.#userConfig["trade_configs"][this.selectedConfig][
        "refresh_interval"
      ];

    this.fallbackAction();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      await this.getTicker();
      try {
        if (
          parseFloat(this.ticker["data"]["price"]) >=
          (parseFloat(this.buyOrder["data"]["dealFunds"]) /
            parseFloat(this.buyOrder["data"]["dealSize"])) *
            (1.0 + margin)
        ) {
          if (this.sellOrderId == null) {
            await this.marketSellOrder();
            break;
          }
        } else {
          await new Promise((r) => setTimeout(r, interval));
        }
      } catch {
        console.log("Buy order details not received yet");
      }
      if (this.sellOrderId) {
        break
      }
    }
  }

  async fallbackAction() {
    const sleepDuration =
      this.#userConfig["trade_configs"][this.selectedConfig][
        "sell_fallback_timeout_ms"
      ];

    // await setTimeout. A.K.A sleep
    await new Promise((r) => setTimeout(r, sleepDuration));

    if (this.sellOrderId == null) {
      await this.marketSellOrder();
    }
  }

  async marketSellOrder() {
    const sellQty = Math.floor(parseFloat(this.baseCoinBalance["data"][0]['available']) * this.#userConfig['trade_configs'][this.selectedConfig]['sell_qty_from_wallet'])
    
    // console.log(this.quoteCoinBalance["data"][0]['available']);
    // console.log(sellQty);

    this.sellOrderId = await kucoin.rest.Trade.Orders.postOrder(
      {
        clientOid: uuidv4(),
        side: "sell",
        symbol: this.coinPair,
        type: "market",
      },
      {
        size: sellQty,
      }
    );
  }

  async getSellOrderDetails() {
    console.log(this.sellOrderId);
    this.sellOrder = await kucoin.rest.Trade.Orders.getOrderByID(
      this.sellOrderId["data"]["orderId"]
    );
    console.log(this.sellOrder["data"]);
  }

  async timer() {}
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
    await this.getquoteCoinBalance();
    // console.log(this.quoteCoinBalance);
    await this.getTradingAmount();

    this.selectedCoin = await inquirerInputCoin();

    this.coinPair =
      (await this.selectedCoin.toUpperCase()) +
      "-" +
      this.#userConfig["trade_configs"][this.selectedConfig]["pairing"];

    // await this.getTicker();
    // console.log(await this.ticker);

    await this.marketBuyOrder();

    this.getBuyOrderDetails();
    // await this.getBuyOrderDetails();

    this.getBaseCoinBalance();
    // await this.getBaseCoinBalance();

    await this.checkMargin();
    await this.getSellOrderDetails();

    // Insert into db
    // Print Balance
    // Print time duration
  }
}
