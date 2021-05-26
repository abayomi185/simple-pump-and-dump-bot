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
    this.firstRun();
  }

  async init() {
    this.#mtproto = new MTProto({
      api_id: this.apiId,
      api_hash: this.apiHash,

      storageOptions: {
        path: path.join(dirname(), "./data/telegram.json"),
      },
    });
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

  async test1() {
    console.log(await this.#mtproto.call("channels.getInactiveChannels"));
  }

  async test2() {
    console.log("1");
    const resolvedPeer = await this.call("contacts.resolveUsername", {
      username: "Kucoin Pumps",
    });

    console.log("2");
    const channel = resolvedPeer.chats.find(
      (chat) => chat.id === resolvedPeer.peer.channel_id
    );

    console.log("3");
    const inputPeer = {
      _: "inputPeerChannel",
      channel_id: channel.id,
      access_hash: channel.access_hash,
    };

    const LIMIT_COUNT = 10;
    // const messages = [];

    console.log("4");
    const messageResults = this.call("messages.getMessage", {
      peer: inputPeer,
      limit: LIMIT_COUNT,
    });

    console.log(messageResults.count());
    console.log(messageResults);
  }

  // First run function to retrieve api details
  async firstRun() {
    [this.apiId, this.apiHash] = await importTelegramAPIDetails();
    await this.init();

    // await this.check2()
  }

  // Get last three messages or something
  async scrape() {}
}
