> Please don't use Node version yet. Tests are still being done
# Pump and Dump Bot
## For Binance and Kucoin

> USE THIS BOT AT YOUR OWN RISK. This script offers no guarantee. I assume no risk from your use of this software. No part of this repo constitutes financial advice.

Simple to use, configurable Pump and Dump Bot for [Binance](https://binance.com) and [Kucoin](https://www.kucoin.com) Cryptocurrency Exchange

## Installation

Install Python3 and pip

Clone repo:
```
git clone https://github.com/abayomi185/simple-pump-and-dump-bot.git
cd simple-pump-and-dump-bot
```

Install pip packages:

```pip3 install -r requirements.txt``` 

Edit config and create a new file named ```secrets-binance.yaml``` or ```secrets-kucoin.yaml``` in the ```src``` directory:

```
   cd src
   touch secrets-binance.yaml
   echo "api_key: '<your_binance_api_key>'" >> secrets-binance.yaml
   echo "api_secret: '<your_binance_secret_key>'" >> secrets-binance.yaml
```
For Kucoin, replace ```secrets-binance``` with ```secrets-kucoin``` and add the following:
```
   echo "api_passphrase: '<your_kucoin_api_passphrase>'" >> secrets-kucoin.yaml
```

> You will need to get your ```api_key``` and ```api_secret``` from your Binance or Kucoin account.
> For Kucoin, you would also need your ```api_passphrase```

Edit conf.yaml as desired; comments are written as a guide in the .yaml file.  
<br/>

Run ```python3 initialise_db.py``` to initialise the local records database.  
<br/>

Run ```python3 bot-binance.py``` or ```python3 bot-kucoin.py``` and follow the prompts until the coin name input.  
<br/>

Input the coin name at the right time for pump (pump signal) and wait for earnings!

Good Luck!  

## Upcoming Features
- Discord Integration
- Button press to exit trade
- Stop-loss config option
- UI with Electron or React

## Update Log
- 16-05-21
  - Porting the bot to NodeJS (see node_wip folder)
  - Merging the bots into a single app
  - Improving software structure; OOP and modules
- 20-05-21
  - Node kucoin bot is functional with local database support
  - Kucoin introduced price protection strategy which gives unexpected results in pumps causing the bot not to sell. Potential workaround is implemented but requires testing.
  - Python version will soon reach end-of-life
<br/>
<br/>
<a href="https://www.buymeacoffee.com/abayomi185" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Fly me to the moon" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;"></a><br/>
BTC: bc1q9urpzxnq0rkcvdagf2wzm0yfj49mqpf75z7xpg<br/>
ETH (ERC20): 0x6297299b003302A1c2290ee613c2B828b3E13b24<br/>
XMR: 44AxGyJGqaSFQGfwd6atoB4v8M1dfjw9Kfayw4hs9BKQYR9vMQe2J3tfvMumBwN7LkYcK5x186iZXDVWXD2ctT9ZHvCP3yp
