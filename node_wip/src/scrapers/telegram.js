import MTProto from "@mtproto/core";
import { sleep } from "@mtproto/core/src/utils/common/index.js";

import path from "path";

import dirname from "es-dirname";

import {
  importDefaultScraperDelay,
  importMessageHistoryCount,
  importTelegramAPIDetails,
  importTimeOfPump,
} from "../io/import.js";
import chalk from "chalk";

// For Testing
import fs from "fs";

export default class TelegramScraper {
  #mtproto;

  constructor() {
    this.selectedScraperConfigs;
    this.apiId;
    this.apiHash;
    this.init();
  }

  async init() {
    [this.apiId, this.apiHash] = await importTelegramAPIDetails();
    this.#mtproto = new MTProto({
      api_id: this.apiId,
      api_hash: this.apiHash,

      storageOptions: {
        path: path.join(dirname(), "../data/telegram.json"),
      },
    });

    // For testing
    // const test_config = {
    //   bot: "Kucoin",
    //   group_name: "kucoin_pumps",
    //   prefix: "Coin is: ",
    //   alt_prefix: "https://trade.kucoin.com/",
    //   special_character: "",
    //   suffix_to_split: "-",
    // };

    // const allTickers = JSON.parse(fs.readFileSync("./test.json"));

    // this.scrape(null, "kucoin_pumps", test_config, "USDT", allTickers);
  }

  // Error handling code from Mproto-core documentation
  async call(method, params, options = {}) {
    try {
      const result = await this.#mtproto.call(method, params, options);
      return result;
    } catch (error) {
      console.log(`${method} error:`, error);
      const { error_code, error_message } = error;
      if (error_code === 420) {
        const seconds = Number(error_message.split("FLOOD_WAIT_")[1]);
        const ms = seconds * 1000;
        await sleep(ms);
        return this.call(method, params, options);
      }
      if (error_code === 303) {
        const [type, dcIdAsString] = error_message.split("_MIGRATE_");
        const dcId = Number(dcIdAsString);
        // If auth.sendCode call on incorrect DC need change default DC, because
        // call auth.signIn on incorrect DC return PHONE_CODE_EXPIRED error
        if (type === "PHONE") {
          await this.#mtproto.setDefaultDc(dcId);
        } else {
          Object.assign(options, { dcId });
        }
        return this.call(method, params, options);
      }
      return Promise.reject(error);
    }
  }

  // async getSelectedGroups() {}

  async getPumpGroupDetails(groupName) {
    const resolvedPeer = await this.call("contacts.resolveUsername", {
      username: groupName,
    });
    const channel = await resolvedPeer.chats.find(
      (chat) => chat.id === resolvedPeer.peer.channel_id
    );
    const inputPeer = {
      _: "inputPeerChannel",
      channel_id: channel.id,
      access_hash: channel.access_hash,
    };
    return inputPeer;
  }

  async getMessages(inputPeer) {
    // Message count limit, lower would generally be faster
    const LIMIT_COUNT = importMessageHistoryCount();
    const messageResults = await this.call("messages.getHistory", {
      peer: inputPeer,
      limit: LIMIT_COUNT,
    });
    return messageResults.messages;
  }

  /**
   * @param  {object[]} messages
   * @param  {object} groupConfigs
   * @param  {string} coinPair
   * @param  {object} coinList
   */
  async parseMessages(messages, groupConfigs, coinPair, coinList) {
    // The regex ting here
    // look into asynchronous for loop
    // for message in messages, message.message is ...

    const prefix = groupConfigs.prefix != "" && groupConfigs.prefix;
    const alt_prefix = groupConfigs.alt_prefix != "" && groupConfigs.alt_prefix;
    const special =
      groupConfigs.special_character != "" && groupConfigs.special_character;
    const suffix_split =
      groupConfigs.suffix_to_split != "" && groupConfigs.suffix_to_split;

    const matches = [];
    const counts = {};
    var matchLengthTracker;

    let coinPairOutput;
    let output;

    for (const messageObject of messages) {
      const re1 = prefix && new RegExp("(?<=(" + prefix + "))\\w+");
      const re2 = alt_prefix && new RegExp("(?<=(" + alt_prefix + "))\\w+");
      const re3 = special && new RegExp("(?<=(" + special + "))\\w+");
      const re4 =
        suffix_split && new RegExp("\\b\\w+(?=(" + suffix_split + "))");
      // const re1 = new RegExp(/\b\w[A-Z]+/);

      const match1 = re1 && messageObject["message"].match(re1);
      const match2 = re2 && messageObject["message"].match(re2);
      const match3 = re3 && messageObject["message"].match(re3);
      const match4 = re4 && messageObject["message"].match(re4);

      matchLengthTracker = matches.length;

      if (match1) {
        matches.push(match1[0]);
      }
      if (match2) {
        matches.push(match2[0]);
      }
      if (match3) {
        matches.push(match3[0]);
      }
      if (match4) {
        matches.push(match4[0]);
      }

      // Matches is a variable outside this loop so this gets called more than
      // it needs to be called
      if (matches.length > matchLengthTracker) {
        matches.forEach((x) => {
          if (x < matchLengthTracker) {
            return;
          }
          counts[x] = (counts[x] || 0) + 1;
        });
      }
    }

    // Get the string (key) that has the highest count
    if (Object.entries(counts).length !== 0) {
      output = Object.keys(counts).reduce((a, b) =>
        counts[a] > counts[b] ? a : b
      );
    }

    // Sort something out for breaking out of loop when coin name is found
    // Perhaps a configurable number of past messages
    // Also a way to configure how many times to request messages from telegram
    // Perhaps a way to sync with time of pump to prevent too many requests

    // let specificTicker = allTickers.ticker.find((o) => o.symbol === "HYVE-USDT");

    try {
      coinPairOutput = output.toUpperCase() + "-" + coinPair.toUpperCase();
      if (coinList.ticker.find((o) => o.symbol === coinPairOutput)) {
        return output;
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Main function to be called from bot
  /**
   * @param  {string} bot
   * @param  {string} groupName
   * @param  {object} groupConfigs
   * @param  {string} coinPair
   * @param  {object} coinList
   */
  async scrape(bot, groupName, groupConfigs, coinPair, coinList) {
    // This is for one instance of the scraper

    // TODO
    // Conditional check for bot and scraper in correlation with groupconfig
    // To ensure scraper doesn't scrape on different exchange

    if (bot !== groupConfigs["bot"].toLowerCase()) {
      console.log(
        chalk.red(
          `The bot input in your scraping config (${groupName}) does not tally with the currently selected exchange bot (${bot}).\n`
        ) +
          chalk.redBright(
            `The Telegram scraper will not proceed. Please check your config file.\n`
          )
      );
    }

    // Remove groupName in favour of getting the details from config file and performing an async loop
    let coinName;

    // const shortDelay = 1000;
    const shortDelay = 500;
    const timeOffset = 500;
    let firstPass = true;
    const pumpTime = importTimeOfPump();
    const defaultRequestDelay = importDefaultScraperDelay();
    const peer = await this.getPumpGroupDetails(groupName);
    
    // console.log(messages);
    
    // Loop the loop here; break if output is assigned
    // Condition to ensure it is a coin name that was retrieved
    
    // This could be a while true
    while (coinName == null) {
      // Put timeout here for API requests
      if (pumpTime) {
        const currentTime = Date.now();
        if (currentTime >= pumpTime - timeOffset) {
          firstPass
          ? (firstPass = false)
          : await new Promise((r) => setTimeout(r, shortDelay));
        } else {
          // Wait until timeOffset seconds before the pump
          let timeDiff = pumpTime - currentTime - timeOffset;
          if (timeDiff < 0) {
            timeDiff = shortDelay;
          }
          await new Promise((r) => setTimeout(r, timeDiff));
        }
      }
      
      const messages = await this.getMessages(peer);
      coinName = await this.parseMessages(
        messages,
        groupConfigs,
        coinPair,
        coinList
      );

      if (coinName) {
        break;
      }

      if (!pumpTime) {
        await new Promise((r) => setTimeout(r, defaultRequestDelay));
      }
    }

    return coinName;
  }
}
