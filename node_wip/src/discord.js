import { Client } from "discord.js"

import path from "path";
import dirname from "es-dirname";

import { importDiscordAPIDetails } from "./import.js";

export default class DiscordScraper {
  #discord;

  constructor() {
    this.selectedScraperConfig;
    this.apiId;
    this.apiHash;
    this.init();
  }

  async init() {
    [this.apiId, this.apiHash] = await importDiscordAPIDetails();

    // Client init here
  }

  async test1() {
    // console.log(await this.#mtproto.call("channels.getInactiveChannels"));
  }


  // Get last three messages or something
  async scrape() {}
}
