import binance from "binance-api-node";

import fs from "fs";
import yaml from "js-yaml";
import inquirer from "inquirer"; // Nice menus

const bot = 'binance'
const directory = './#binance/'

export default class BinanceBot {

  #user_secrets
  #user_config

  constructor() {
    this.balance;
    this.buyOrder;
    this.buyInfo;
    this.sellOrder;
    this.sellInfo;
    this.coinPair;
    this.selectedConfig;
  }

  // getters and setter, get and set value of private iobject variable outside the class bounds

  async inquirerImportUserDetails() {
    try {
      
      const conf_import = directory + "conf-" + bot + ".yaml";
      this.#user_config = yaml.load(fs.readFileSync(conf_import, "utf-8"));

      const secrets_import = directory + "secrets-" + bot + ".yaml";
      this.#user_secrets = yaml.load(fs.readFileSync(secrets_import, "utf-8"));

    } catch (error) {
      console.log(error);
      console.log("\n");
      console.log("There has been an error loading your config file");
    }
  }

  async inquirerSelectTradeConfig() {
    let answer;
    await inquirer
      .prompt([
        {
          type: "list",
          name: "trade_conf",
          message: "Please select trade configuration?",
          choices: Object.keys(this.#user_config["trade_configs"]),
        },
      ])
      .then((answers) => {
        console.log("\n");
        console.log(this.#user_config["trade_configs"][answers.trade_conf]);
        console.log("\n");
        answer = answers.trade_conf;
      })
      .catch((error) => {
        if (error.isTtyError) {
          // Prompt couldn't be rendered in the current environment
        } else {
          // Something else went wrong
        }
      });
    return answer;
  };

  inquirer() {}

  async run() {
    await this.inquirerImportUserDetails()
    this.selectedConfig = this.inquirerSelectTradeConfig()
  }
}
