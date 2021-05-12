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
import uuid
import time

# Kucoin API Helper - https://github.com/Kucoin/kucoin-python-sdk.git
from kucoin.client import Market
from kucoin.client import Trade
from kucoin.client import User

# SQLite3 to save local records of trades
import sqlite3

# Connect to records.db database
conn = sqlite3.connect('records.db')
c = conn.cursor()

# Import user config and instantiate variables
conf_import = "./conf-kucoin.yaml"
secrets = "./secrets-kucoin.yaml"
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
config['api_passphrase'] = api_keys['api_passphrase']

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
    time_res = client.get_server_timestamp()
    print(f"Server Time: {time_res}")
    
    # There is an error for this function in the kucoin library
    status = client.get_server_status()
    print(f"Server Status: {status['status']}")

# Get account balance for "pairing" in config before trade
def acct_balance():
    # acct_balance = user_client.get_withdrawal_quota(config['trade_configs']
    #                                             [selected_config]['pairing'])

    acct_balance = user_client.get_account_list(config['trade_configs'][selected_config]['pairing'], 'trade')

    print('\nYour {} balance is {}\n'.format(config['trade_configs'][selected_config]['pairing'], acct_balance[0]['available']))
    print(Fore.YELLOW + 'Please ensure Config is correct before proceeding\n' + Fore.RESET)

    if float(acct_balance[0]['available']) < 0.001:
        print(Fore.RED + 'A minimum balance may be required for trade on Kucoin\n' + Fore.RESET)

    return acct_balance

# Get account balance for "pairing" in config after trade
def acct_balance2():
    # acct_balance = client.get_asset_balance(asset=config['trade_configs']
    #                                             [selected_config]['pairing'])

    acct_balance = user_client.get_account_list(config['trade_configs'][selected_config]['pairing'], 'trade')
        
    print('\nYour {} balance after trading is {}\n'.format(config['trade_configs'][selected_config]['pairing'], acct_balance[0]['available']))

    float_acct_balance = float(acct_balance[0]['available'])
    float_balance = float(balance[0]['available'])

    difference = float_acct_balance - float_balance
    percentage = (difference/float_balance) * 100

    if float_acct_balance < float_balance:
        
        print(Fore.YELLOW + 'A {:.2f}% loss\n'.format(percentage) + Fore.RESET)

    if float_acct_balance > float_balance:
        
        print(Fore.GREEN + 'A {:.2f}% gain\n'.format(percentage) + Fore.RESET)

    return acct_balance

def pump_duration(start_time, end_time):
    time_delta = end_time - start_time
    time_delta = round(time_delta, 2)
    print(f"Time elapsed for pump is {time_delta}s\n")

# Get available trading amount with user config
def trading_amount():
    avail_trading_amount = float(balance[0]['available']) * config['trade_configs'][selected_config]['buy_qty_from_wallet']
    return avail_trading_amount

# Execute market order - buy and/or sell
def market_order(selected_coin_pair, order_type):

    if order_type == 'buy':
        avail_trading_amount = trading_amount()
        current_price = client.get_ticker(symbol=selected_coin_pair)
        buy_qty = math.floor(avail_trading_amount / float(current_price['price']))
        # order = client.order_market_buy(symbol=selected_coin_pair, quantity=buy_qty)
        # print(f"buy_qty: {str(buy_qty)}")
        order_id = trade.create_market_order(selected_coin_pair, 'buy', clientOid=str(uuid.uuid4()), size=str(buy_qty))
        return order_id

    elif order_type == 'sell':
        # coin_balance = user_client.get_withdrawal_quota(selected_coin.upper())
        coin_balance = user_client.get_account_list(selected_coin.upper(), 'trade')
        # current_price = client.get_symbol_ticker(symbol=selected_coin_pair)
        # sell_qty = math.floor(coin_balance * float(current_price['price']))
        sell_qty = math.floor(float(coin_balance[0]['available']) * config['trade_configs'][selected_config]['sell_qty_from_wallet'])
        # order = client.order_market_sell(symbol=selected_coin_pair, quantity=sell_qty)
        order_id = trade.create_market_order(selected_coin_pair, 'sell', str(uuid.uuid4()), size=str(sell_qty))
        return order_id

# Displays order details asynchronously - see 'main' block
def display_order_details(order):
    return json.dumps(order, sort_keys=True, indent=4)

# Check user configs margin in to sell order
async def check_margin():

    global pending_sell_order_id
    # pending_sell_order_id = None
    margin = config['trade_configs'][selected_config]['profit_margin']

    fallback_task = asyncio.create_task(fallback_action())
    # count = 0

    while True:
        # avg_price = client.get_avg_price(symbol=selected_coin_pair)
        current_price = client.get_ticker(symbol=selected_coin_pair)
        # print(float(buy_order_data['dealFunds'])/float(buy_order_data['dealSize']))
        # count+=1
        
        if float(current_price['price']) >= ((float(buy_order_data['dealFunds'])/float(buy_order_data['dealSize'])) * (1.0 + margin)):
            if pending_sell_order_id == None:
                pending_sell_order_id = market_order(selected_coin_pair, 'sell')
                break
        else:
            # sleep((config['trade_configs'][selected_config]['refresh_interval']/1000))
            await asyncio.sleep(config['trade_configs'][selected_config]['refresh_interval']/1000)
        
        if pending_sell_order_id:
            break

    # print(count)
    return pending_sell_order_id

async def fallback_action():
    
    global pending_sell_order_id
    # sleep((config['trade_configs'][selected_config]['sell_fallback_timeout_ms']/1000))
    await asyncio.sleep((config['trade_configs'][selected_config]['sell_fallback_timeout_ms']/1000))
        
    if pending_sell_order_id == None:
        pending_sell_order_id = market_order(selected_coin_pair, 'sell')

# Save orders to local db asynchronously
def insert_into_db(order, order_id):

    # trade.get_order_details(order_id)

    symbol = order['symbol']
    symbol = symbol.split("-", 1)[0]

    price = float(order['dealFunds']) / float(order['dealSize'])
    
    c.execute("INSERT INTO Orders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
            ("Kucoin", order['clientOid'], order_id, order['id'],
                order['symbol'], order['type'], order['side'], order['timeInForce'],
                order['createdAt'], symbol, 
                price, order['fee'],
                order['size'], order['dealFunds']))
    
    conn.commit()

async def main():

    global buy_order_data

    # coin_pair_info = client.get_symbol_info(selected_coin_pair)
    coin_pair_info = client.get_ticker(selected_coin_pair)
    
    start_time = time.time()

    buy_order = market_order(selected_coin_pair, 'buy')
    # print(f"buy_order: {buy_order}")
    buy_order_data = trade.get_order_details(buy_order['orderId'])
    
    # Execution using threading
    with concurrent.futures.ThreadPoolExecutor() as executor:
        
        #Print buy order details
        buy_order_details = executor.submit(display_order_details, buy_order_data)
        print('\n' + buy_order_details.result() + '\n')

        sell_order = await check_margin()

    end_time = time.time()
    sell_order_data = trade.get_order_details(sell_order['orderId'])
    sell_order_details = display_order_details(sell_order_data)
    print('\n' + sell_order_details + '\n')

    # insert_into_db(order=buy_order_data, order_id=buy_order['orderId'])
    # insert_into_db(order=sell_order_data, order_id=sell_order['orderId'])

    conn.close()

    balance2 = acct_balance2()
    pump_duration(start_time, end_time)


if __name__ == '__main__':

    show_header()

    client = Market(url='https://api.kucoin.com')
    trade = Trade(key=config['api_key'], secret=config['api_secret'],
                    passphrase=config['api_passphrase'], is_sandbox=False, url='')
    user_client = User(config['api_key'], config['api_secret'], config['api_passphrase'])

    if config['debug_mode']:
        debug_mode(client=client)
        print('\n')

    print(Fore.GREEN + '-- Kucoin Edition --\n' + Fore.RESET)

    #Question1
    answer1 = Inquirer.prompt(question1)
    selected_config = answer1['trade_conf']

    #Retrieve current coin balance here
    balance = acct_balance()

    # print(f"buy_qty: {str(balance)}")
    # print(f"{user_client.get_account_list(config['trade_configs'][selected_config]['pairing'], 'trade')}")

    #Question2
    answer2 = Inquirer.prompt(question2)
    selected_coin = answer2['coin']

    #Coin Pair
    selected_coin_pair = selected_coin.upper() + "-" +\
                            config['trade_configs'][selected_config]['pairing']

    buy_order_data = None
    pending_sell_order_id = None

    asyncio.run(main())