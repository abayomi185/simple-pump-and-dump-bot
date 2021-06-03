import MTProto from "@mtproto/core";
import { sleep } from "@mtproto/core/src/utils/common/index.js";

import path from "path";

import dirname from "es-dirname";

import { importTelegramAPIDetails } from "./import.js";

export default class TelegramScraper {
  #mtproto;

  constructor() {
    this.selectedScraperConfig;
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
        path: path.join(dirname(), "./data/telegram.json"),
      },
    });

    // this.scrape("kucoin_pumps");
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
    const LIMIT_COUNT = 3;
    const messageResults = await this.call("messages.getHistory", {
      peer: inputPeer,
      limit: LIMIT_COUNT,
    });
    return messageResults.messages;
  }

  async parseMessages(messages) {
    // The regex ting here
    // look into asynchronous for loop
    // for message in messages, message.message is ...
  }

  // Main function to be called from bot
  async scrape(groupName) {
    const peer = await this.getPumpGroupDetails(groupName);

    const messages = await this.getMessages(peer);

    console.log(messages[0]);
  }
}
