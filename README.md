# Simple Binance Pump and Dump Bot

> USE THIS BOT AT YOUR OWN RISK. This script offers no guarantee. I assume no risk from your use of this software. No part of this repo constitutes financial advice.

Simple to use, configurable Pump and Dump Bot for [Binance](https://binance.com) Cryptocurrency Exchange

## Installation

Install Python3 and pip

Install pip packages:

```pip install -r requirements.txt``` 

Edit config and create a new file named secrets.yaml in the ```src``` directory:

```
   cd src
   touch secrets.yaml
   echo "api_key: <your_binance_api_key>" >> secrets.yaml
   echo "api_secret: <your_binance_secret_key>" >> secrets.yaml
```
> You will need to get your ```api_key``` and ```api_secret``` from your Binance account.

Edit conf.yaml as desired; comments are writtens as a guide in the .yaml file.  
<br/>

Run ```python3 initialise_db.py``` to initialise the local records database.  
<br/>

Run ```python3 bot.py``` and follow prompts until the coin name input.  
<br/>

Input the coin name at the right time for pump (pump signal) and wait for earnings!

Good Luck!
