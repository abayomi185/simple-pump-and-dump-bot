import MTProto from "@mtproto/core";
import { sleep } from "@mtproto/core/src/utils/common/index.js";

import path from "path";

import dirname from "es-dirname";

import { importTelegramAPIDetails } from "./import.js";

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

    const test_config = {
      bot: "Kucoin",
      group_name: "kucoin_pumps",
      prefix: "Coin is: ",
      alt_prefix: "https://trade.kucoin.com/",
      special_character: "",
      suffix_to_split: "-",
    };

    this.scrape(null, null, "kucoin_pumps", test_config);
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

  async getSelectedGroups() {}

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
    const LIMIT_COUNT = 5;
    const messageResults = await this.call("messages.getHistory", {
      peer: inputPeer,
      limit: LIMIT_COUNT,
    });
    return messageResults.messages;
  }

  async parseMessages(messages, groupConfigs) {
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

    let output;

    for (const messageObject of messages) {
      const re1 = prefix && new RegExp("(?<=(" + prefix + "))\\w+");
      const re2 = alt_prefix && new RegExp("(?<=(" + alt_prefix + "))\\w+");
      const re3 = special && new RegExp("(?<=(" + special + "))\\w+");
      const re4 =
        suffix_split && new RegExp("\\b\\w+(?=(" + suffix_split + "\\w+))");

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
        matches.forEach(function (x) {
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

    return output;
  }

  // Main function to be called from bot
  async scrape(bot, scraper, groupName, groupConfigs) {
    // This is for one instance of the scraper

    // Remove groupName in favour of getting the details from config file and performing an async loop

    const peer = await this.getPumpGroupDetails(groupName);

    const messages = await this.getMessages(peer);

    // console.log(messages);

    this.parseMessages(messages, groupConfigs);
  }
}
