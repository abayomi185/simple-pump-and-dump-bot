import fs from "fs";
import yaml from "js-yaml";

const config_import = "./conf.yaml";
const config = yaml.load(fs.readFileSync(config_import, "utf-8"));

export const importExchangeList = () => {
  return config.exchange;
};

export const inquirerImportScraperConfig = () => {
  // dir: ../conf.yaml
  // use two hyphens
  let options = [];
  options.push("manual coin entry");
  try {
    const discordConfigs = Object.keys(config.discord);
    for (const entry in discordConfigs) {
      const optionName = "Discord++" + entry;
      options.push(optionName);
    }
  } catch (error) {
    console.log("No Scraper config for Discord");
  }
  try {
    const telegramConfigs = Object.keys(config.telegram);
    for (const entry in telegramConfigs) {
      const optionName = "Telegram ++ " + telegramConfigs[entry];
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
