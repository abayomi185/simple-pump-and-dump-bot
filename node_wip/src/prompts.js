// import chalk from "chalk"; // Coloured Text
import inquirer from "inquirer"; // Nice menus
import figlet from "figlet"; // ASCII in terminal
import boxen from "boxen"; // Boxes in terminal

import { coin_scraper, crypto_exchange } from "../bot.js";
import { exchangeColors } from "./lut.js";

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

export const inquirerSelectScraper = async () => {
  let answer;
  if (coin_scraper.length > 1) {
    await inquirer
      .prompt([
        {
          type: "checkbox",
          name: "scraper",
          message: "Please select a coin scraper",
          choices: coin_scraper,
        },
      ])
      .then((answers) => {
        answer = answers.scraper;
      })
      .catch((error) => {
        if (error.isTtyError) {
          // Prompt couldn't be rendered in the current environment
        } else {
          // Something else went wrong
        }
      });
    console.log(answer);
    return answer;
  }
};

export const inquirerSelectExchange = async () => {
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
          borderColor: exchangeColors[answers.crypto_exchange],
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

export const inquirerSelectTradeConfig = async (userConfig) => {
  let answer;
  await inquirer
    .prompt([
      {
        type: "list",
        name: "trade_conf",
        message: "Please select trade configuration?",
        choices: Object.keys(userConfig["trade_configs"]),
      },
    ])
    .then((answers) => {
      console.log("\n");
      console.log(userConfig["trade_configs"][answers.trade_conf]);
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

export const inquirerInputCoin = async () => {
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
