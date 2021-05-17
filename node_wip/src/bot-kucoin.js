import kucoin from "kucoin-node-sdk";

import fs from "fs";
import yaml from "js-yaml";
import inquirer from "inquirer"; // Nice menus

const bot = "kucoin";
const directory = "./#kucoin/";

export default class KucoinBot {
  #user_secrets;
  #user_config;

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

  async initialiseAPI() {
    kucoin.init(this.#user_secrets)
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
  }

  // changing a this.value value in an arrow function doesn't change it outside the scope
  async inquirerInputCoin() {
    let answer;
    await inquirer
      .prompt([
        {
          type: "input",
          name: "coin",
          message: "Please enter coin for Pump?",
        },
      ])
      .then((answers) => {
        answer = answers.coin;
      });
    return answer;
  }


  async run() {
    await this.inquirerImportUserDetails();

    await this.initialiseAPI()

    this.selectedConfig = await this.inquirerSelectTradeConfig();
    this.selectedCoin = await this.inquirerInputCoin();

    this.coinPair =
      this.selectedCoin.toUpperCase() +
      "-" +
      this.#user_config["trade_configs"][this.selectedConfig]["pairing"];


  }
}
