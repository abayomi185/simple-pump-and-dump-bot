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

```pip install -r requirements.txt``` 

Edit config and create a new file named secrets-binance.yaml or secrets-kucoin.yaml in the ```src``` directory:

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

Edit conf.yaml as desired; comments are writtens as a guide in the .yaml file.  
<br/>

Run ```python3 initialise_db.py``` to initialise the local records database.  
<br/>

Run ```python3 bot-binance.py``` or ```python3 bot-kucoin.py``` and follow the prompts until the coin name input.  
<br/>

Input the coin name at the right time for pump (pump signal) and wait for earnings!

Good Luck!
