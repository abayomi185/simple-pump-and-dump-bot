from __future__ import print_function, unicode_literals
from time import sleep, time
import PyInquirer as Inquirer
from pprint import pprint
from pyfiglet import Figlet
from colorama import Fore, Back, Style
from timeit import default_timer as timer
import threading
import concurrent.futures
import asyncio
import os
import json
import yaml
import math
import time

# Binance API Helper - https://github.com/sammchardy/python-binance.git
from binance.client import Client

# SQLite3 to save local records of trades
import sqlite3

# Connect to records.db database
conn = sqlite3.connect('records.db')
c = conn.cursor()

# Import user config and instantiate variables
conf_import = "./conf-binance.yaml"
secrets = "./secrets-binance.yaml"
coin = None
config = None

# Switched to .yaml as it offers commenting and other features
#It shouldn't be an issue for speed as dict is loaded into memory
with open(conf_import, "r") as conf_file:
    config = yaml.safe_load(conf_file)

# Open secret.json, retrieve keys and place in config dictionary
with open(secrets, "r") as secrets_file:
    api_keys = yaml.safe_load(secrets_file)

config['api_key'] = api_keys['api_key']
config['api_secret'] = api_keys['api_secret']

#print(config)

# Command Line interface prompts for PyInquirer
question1 = [
    {
        'type': 'list',
        'name': 'trade_conf',
        'message': 'Please select trade configuration?',
        'choices': list(config["trade_configs"].keys()),
    }
]
question2 = [
    {
        'type': 'input',
        'name': 'coin',
        'message': 'Please enter coin for Pump?',
    }
]
question3 = [
    {
        'type': 'confirm',
        'name': 'continue',
        'message': 'Do you wish to proceed?',
        'default': True,
    }
]

# Show crypto-bot banner
def show_header():
    fig = Figlet(font='slant')
    print(fig.renderText('crypto-bot'))

# Binance API Helper Debug mode
def debug_mode(client):
    # client.ping()
    time_res = client.get_server_time()
    print("Server Time: {}".format(time_res["serverTime"]))
    
    status = client.get_system_status()
    print("System Status: {}".format(status["msg"]))

# Get account balance for "pairing" in config before trade
def acct_balance(send_output=False):
    acct_balance = client.get_asset_balance(asset=config['trade_configs']
                                                [selected_config]['pairing'])
        
    print('\nYour {} balance is {}\n'.format(config['trade_configs'][selected_config]['pairing'], acct_balance['free']))
    print(Fore.YELLOW + 'Please ensure Config is correct before proceeding\n' + Fore.RESET)

    if config['trade_configs'][selected_config]['pairing'] == 'BTC':
        if float(acct_balance['free']) < 0.001:
            print(Fore.RED + 'Binance requires min balance of 0.001 BTC for trade\n' + Fore.RESET)
    else:
        print(Fore.RED + 'A min balance is often required for trade on Binance\n' + Fore.RESET)

    return acct_balance

# Get account balance for "pairing" in config after trade
def acct_balance2(send_output=False):
    acct_balance = client.get_asset_balance(asset=config['trade_configs']
                                                [selected_config]['pairing'])
        
    print('\nYour {} balance after trading is {}\n'.format(config['trade_configs'][selected_config]['pairing'], acct_balance['free']))

    difference = acct_balance['free'] - balance['free']
    percentage = (difference/balance) * 100

    if float(acct_balance['free']) < balance:
        
        print(Fore.YELLOW + 'A {:.2f}% loss\n'.format(percentage) + Fore.RESET)

    if float(acct_balance['free']) > balance:
        
        print(Fore.GREEN + 'A {:.2f}% gain\n'.format(percentage) + Fore.RESET)

    return acct_balance

def pump_duration(start_time, end_time):
    time_delta = end_time - start_time
    time_delta = round(time_delta, 2)
    print(f"Time elapsed for pump is {time_delta}s\n")

# Get available trading amount with user config
def trading_amount():
    avail_trading_amount = float(balance['free']) * config['trade_configs'][selected_config]['buy_qty_from_wallet']
    return avail_trading_amount

# Execute market order - buy and/or sell
def market_order(client, selected_coin_pair, order_type, coin_pair_info, balance):

    if order_type == 'buy':
        avail_trading_amount = trading_amount()
        current_price = client.get_symbol_ticker(symbol=selected_coin_pair)
        buy_qty = math.floor(avail_trading_amount / float(current_price['price']))
        order = client.order_market_buy(symbol=selected_coin_pair, quantity=buy_qty)
        return order

    elif order_type == 'sell':
        #This here is a potential bottle neck and may introduce delays
        coin_balance = client.get_asset_balance(asset=selected_coin.upper())
        # print(coin_balance)
        # current_price = client.get_symbol_ticker(symbol=selected_coin_pair)
        # print(current_price)
        # sell_qty = math.floor(coin_balance * float(current_price['price']))
        sell_qty = math.floor(float(coin_balance['free']) * config['trade_configs'][selected_config]['sell_qty_from_wallet'])
        order = client.order_market_sell(symbol=selected_coin_pair, quantity=sell_qty)
        return order

# Displays order details asynchronously - see 'main' block
def display_order_details(order):
    return json.dumps(order, sort_keys=True, indent=4)

# Check user configs margin in to sell order
async def check_margin():

    global pending_sell_order
    margin = config['trade_configs'][selected_config]['profit_margin']

    fallback_task = asyncio.create_task(fallback_action())

    while True:
        # avg_price = client.get_avg_price(symbol=selected_coin_pair)
        current_price = client.get_symbol_ticker(symbol=selected_coin_pair)
        # print(current_price)
        # print(current_price['price'])

        if float(current_price['price']) >= (buy_order['fills'][0]['price'] * (1.0 + margin)):
            if pending_sell_order == None:
                pending_sell_order = market_order(client, selected_coin_pair, 'sell', coin_pair_info, balance)
                break
        else:
            await asyncio.sleep((config['trade_configs'][selected_config]['refresh_interval']/1000))

        if pending_sell_order:
            break

    return pending_sell_order

async def fallback_action():

    global pending_sell_order

    await asyncio.sleep((config['trade_configs'][selected_config]['sell_fallback_timeout_ms']/1000))
    
    if pending_sell_order == None:
        pending_sell_order = market_order(client, selected_coin_pair, 'sell', coin_pair_info, balance)

# Save orders to local db asynchronously
def insert_into_db(order):
    
    c.execute("INSERT INTO Orders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
            ("Binance", order['clientOrderId'], order['orderId'], order['fills'][0]['tradeId'], 
                order['symbol'], order['type'], order['side'], order['timeInForce'],
                order['transactTime'], order['fills'][0]['commissionAsset'],
                order['fills'][0]['price'], order['fills'][0]['commission'],
                order['fills'][0]['qty'], order['cummulativeQuoteQty']))
    
    conn.commit()

async def main():

    coin_pair_info = client.get_symbol_info(selected_coin_pair)

    start_time = time.time()

    buy_order = market_order(client, selected_coin_pair, 'buy', coin_pair_info, balance)
    
    # Execution using threading
    with concurrent.futures.ThreadPoolExecutor() as executor:
        
        #Print buy order details
        buy_order_details = executor.submit(display_order_details, buy_order)
        print('\n' + buy_order_details.result() + '\n')

        sell_order = await check_margin()

    end_time = time.time()
    sell_order_details = display_order_details(sell_order)
    print('\n' + sell_order_details + '\n')

    insert_into_db(order=buy_order)
    insert_into_db(order=sell_order)

    conn.close()

    balance2 = acct_balance2()
    pump_duration(start_time, end_time)


if __name__ == '__main__':

    show_header()
    client = Client(config["api_key"], config["api_secret"])
    if config['debug_mode']:
        debug_mode(client=client)
        print('\n')

    print(Fore.YELLOW + '-- Binance Edition --\n' + Fore.RESET)

    #Question1
    answer1 = Inquirer.prompt(question1)
    selected_config = answer1['trade_conf']

    #Retrieve current coin balance here
    balance = acct_balance()

    #Question2
    answer2 = Inquirer.prompt(question2)
    selected_coin = answer2['coin']

    #Coin Pair
    selected_coin_pair = selected_coin.upper() + \
                            config['trade_configs'][selected_config]['pairing']

    buy_order = None
    coin_pair_info = None
    pending_sell_order = None

    asyncio.run(main())