import fs from "fs";
import yaml from "js-yaml";
import path from "path"

import dirname from 'es-dirname'

const config_import = path.join(dirname(), "../conf.yaml")
const config = yaml.load(fs.readFileSync(config_import, "utf-8"));

export const importExchangeList = () => {
  return config.exchange;
};

export const scraperDelay = () => {
  return config.scraper_delay
}

export const importDiscordAPIDetails = async () => {
  if (!config.discord.api_id && !config.discord.api_hash) {
    console.log("Discord API details incomplete or not found");
  } else {
    return [config.discord.api_id, config.discord.api_hash];
  }
};

export const importTelegramAPIDetails = async () => {
  if (!config.telegram.api_id && !config.telegram.api_hash) {
    console.log("Telegram API details incomplete or not found");
  } else {
    return [config.telegram.api_id, config.telegram.api_hash];
  }
};

export const inquirerImportScraperConfig = () => {
  // dir: ../conf.yaml
  // use two hyphens
  let options = [];
  options.push("manual coin entry");
  try {
    const discordConfigs = Object.keys(config.discord.groups);
    for (const entry in discordConfigs) {
      const optionName = "discord++" + entry;
      options.push(optionName);
    }
  } catch (error) {
    console.log("No Scraper config for Discord");
  }
  try {
    const telegramConfigs = Object.keys(config.telegram.groups);
    for (const entry in telegramConfigs) {
      const optionName = "telegram ++ " + telegramConfigs[entry];
      options.push(optionName);
    }
  } catch (error) {
    console.log("No Scraper config for Telegram");
  }
  console.log("\n");
  return options;
};

export const inquirerImportUserDetails = async (bot, directory) => {
  let userConfig;
  let userSecrets;

  try {
    const conf_import = directory + "conf-" + bot + ".yaml";
    userConfig = yaml.load(fs.readFileSync(conf_import, "utf-8"));

    const secrets_import = directory + "secrets-" + bot + ".yaml";
    userSecrets = yaml.load(fs.readFileSync(secrets_import, "utf-8"));
  } catch (error) {
    console.log(error);
    console.log("\n");
    console.log("There has been an error loading your config file");
  }
  return [userConfig, userSecrets];
};
