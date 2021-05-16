// import { crypto_exchange, exchange_color } from "./bot.js";

import { config } from "../bot.js";

const crypto_exchange = ["Binance", "Kucoin"];
const exchange_color = {
  Binance: "yellow",
  Kucoin: "green",
};

// import chalk from "chalk"; // Coloured Text
import inquirer from "inquirer"; // Nice menus
import figlet from "figlet"; // ASCII in terminal
import boxen from "boxen"; // Boxes in terminal

export const header = () => {
  console.log(
    figlet.textSync("crypto-bot", {
      //   font: "Big Money-ne",
      //   font: 'Larry 3D',
      font: "Slant",
      horizontalLayout: "default",
      verticalLayout: "default",
      width: 120,
      whitespaceBreak: true,
    }) + "\n\n"
  );
};

export const selectExchange = async () => {
  let answer;
  await inquirer
    .prompt([
      {
        type: "list",
        name: "crypto_exchange",
        message: "Please select a Crypto Exchange",
        choices: crypto_exchange,
      },
    ])
    .then((answers) => {
      console.log(
        boxen(answers.crypto_exchange, {
          padding: {
            left: 17,
            right: 17,
          },
          borderColor: exchange_color[answers.crypto_exchange],
          borderStyle: "bold",
        })
      );
      answer = answers.crypto_exchange;
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

export const selectTradeConfig = async () => {
  let answer;
  await inquirer
    .prompt([
      {
        type: "list",
        name: "trade_conf",
        message: "Please select trade configuration?",
        choices: Object.keys(config["trade_configs"]),
      },
    ])
    .then((answers) => {
      console.log("\n");
      console.log(config["trade_configs"][answers.trade_conf]);
      console.log("\n");
      // let jsonString = JSON.stringify(config["trade_configs"][answers.trade_conf], null, 1)
      // jsonString = jsonString.replace(/[{}]/g, "");
      // console.log(
      //   boxen(jsonString, {
      //     padding: {
      //       left: 4,
      //       right: 3.5,
      //     },
      //     // borderColor: exchange_color[answers.crypto_exchange],
      //     // borderStyle: "bold",
      //   })
      // );
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

export const inputCoin = async () => {
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
