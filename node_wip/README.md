## Node JS Edition

> This version is still in development; Kucoin bot is functional

Install [node](https://nodejs.org/en/download/)

Install yarn
```npm install --global yarn```

clone repo and change directory to ```node_wip```

```
  git clone https://github.com/abayomi185/simple-pump-and-dump-bot.git
  cd simple-pump-and-dump-bot/node_wip
```

Install the Node modules: ```yarn install```

Rename ```conf-template.yaml``` to ```conf.yaml```

To use/test the Telegram coin name scraper, fill in your api details and group configs into the conf.yaml file

Go to the bot config file, starting with "#" (e.g #Kucoin) and change the ```template-secrets-xxxx.yaml``` file to ```secrets-xxxx.yaml``` then fill in your api details into your secrets file.

To use the telegram scraper, run ```node ./src/scrapers/telegram-register.js``` and follow the prompt to login. This saves json data about your login into /src/data as per the telegram API library.

run ```npm start``` to start the bot.

Follow the prompts and wait for earnings!

Good luck!
