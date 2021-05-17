import fs from "fs";
import yaml from "js-yaml";

export const importGlobalConfig = () => {
  const config_import = "./conf.yaml";
  const config = yaml.load(fs.readFileSync(config_import, "utf-8"));
  return config;
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
