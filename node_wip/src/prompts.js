// import chalk from "chalk"; // Coloured Text
import inquirer from "inquirer"; // Nice menus
import figlet from "figlet"; // ASCII in terminal
import boxen from "boxen"; // Boxes in terminal

import { crypto_exchange, exchange_color } from "../bot.js"

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