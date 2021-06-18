import * as readline from "readline";
import { keyMap } from "./keymap.js";

// For Testing
// import inquirer from "inquirer"; // Nice menus

export default class KeypressActions {
  constructor() {
    this.init();
  }

  init() {
    readline.emitKeypressEvents(process.stdin);
  }

  enableKeypress() {
    process.stdin.setRawMode(true);
    // process.stdin.resume();
  }
  disableKeypress() {
    process.stdin.setRawMode(false);
  }

  async startKeypressListen() {
    this.enableKeypress()
    process.stdin.on("keypress", function (ch, key) {

      if (key && key.ctrl && key.name == "c") {
        // process.stdin.pause();
        process.exit()
      }

      if (key && keyMap[key.name]) {
        // console.log(keyMap[key.name]);
        return keyMap[key.name]
      }
    });
    // process.stdin.resume();
  }

  async stopKeypressListen() {
    this.disableKeypress()
  }
}

// For Testing
// // if (import.meta.main) {

// async function main() {
//   const coin_scraper = [1, 2];

//   const keyActions = new KeypressActions();

//   const inquirerSelectScraper = async () => {
//     let answer;
//     if (coin_scraper.length > 1) {
//       await inquirer
//         .prompt([
//           {
//             type: "checkbox",
//             name: "scraper",
//             message: "Please select a coin scraper",
//             choices: coin_scraper,
//           },
//         ])
//         .then((answers) => {
//           answer = answers.scraper;
//         })
//         .catch((error) => {
//           if (error.isTtyError) {
//             // Prompt couldn't be rendered in the current environment
//           } else {
//             // Something else went wrong
//           }
//         });
//       console.log(answer);
//       return answer;
//     }
//   };

//   await inquirerSelectScraper();

//   keyActions.startKeypressListen()

//   process.stdin.resume();
//   // }
// }

// main();
