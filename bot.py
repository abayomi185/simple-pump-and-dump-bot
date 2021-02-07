from __future__ import print_function, unicode_literals
from time import sleep, time
import PyInquirer as Inquirer
from pprint import pprint
from pyfiglet import Figlet
from colorama import Fore, Back, Style
from timeit import default_timer as timer
import threading
import concurrent.futures
import os
import json
import yaml
import math

from binance.client import Client

from binance.enums import *

# import requests
# response = requests.get('https://google.com/')
# print(response)

conf_import = "./conf.yaml"
secrets = "./secrets.yaml"
coin = None
config = None

#Switched to .yaml it offers commenting and other features
#It shouldn't be an issue for speed as dict is loaded into memory
with open(conf_import, "r") as conf_file:
    config = yaml.safe_load(conf_file)

#Open secret.json, retrieve keys and place in retrieved config dict
with open(secrets, "r") as secrets_file:
    api_keys = yaml.safe_load(secrets_file)

config['api_key'] = api_keys['api_key']
config['api_secret'] = api_keys['api_secret']

#print(config)

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

def show_header():
    fig = Figlet(font='slant')
    print(fig.renderText('crypto-bot'))

def debug_mode(client):
    # client.ping()
    time_res = client.get_server_time()
    print("Server Time: {}".format(time_res["serverTime"]))
    
    status = client.get_system_status()
    print("System Status: {}".format(status["msg"]))

def acct_balance(send_output=False):
    acct_balance = client.get_asset_balance(asset=config['trade_configs']
                                                [selected_config]['pairing'])
        
    print('\nYour {} balance is {}\n'.format(config['trade_configs'][selected_config]['pairing'], acct_balance['free']))
    print(Fore.YELLOW + 'Please ensure Config is correct before proceeding\n' + Fore.RESET)

    if float(acct_balance['free']) < 0.001:
        print(Fore.RED + 'Binance requires min balance of 0.001 BTC for trade\n' + Fore.RESET)

    return acct_balance
    
def trading_amount():
    avail_trading_amount = float(balance['free']) * config['trade_configs'][selected_config]['buy_qty_from_wallet']
    return avail_trading_amount

def market_order(client, selected_coin_pair, order_type, coin_pair_info, balance):

    if order_type == 'buy':
        avail_trading_amount = trading_amount()
        current_price = client.get_symbol_ticker(symbol=selected_coin_pair)
        buy_qty = math.floor(avail_trading_amount / float(current_price['price']))
        order = client.order_market_buy(symbol=selected_coin_pair, quantity=buy_qty)
        return order

    elif order_type == 'sell':
        coin_balance = client.get_asset_balance(asset=selected_coin.upper())
        # print(coin_balance)
        # current_price = client.get_symbol_ticker(symbol=selected_coin_pair)
        # print(current_price)
        # sell_qty = math.floor(coin_balance * float(current_price['price']))
        sell_qty = math.floor(float(coin_balance['free']) * config['trade_configs'][selected_config]['sell_qty_from_wallet'])
        order = client.order_market_sell(symbol=selected_coin_pair, quantity=sell_qty)
        return order


def display_order_details(order):
    return json.dumps(order, sort_keys=True, indent=4)

def check_margin():

    sell_order = None

    with concurrent.futures.ThreadPoolExecutor() as executor:
        sleep((config['trade_configs'][selected_config]['sell_fallback_timeout_ms']/1000))
        
        if sell_order == None:
            sell_order = market_order(client, selected_coin_pair, 'sell', coin_pair_info, balance)
            return sell_order

    while True:
        # avg_price = client.get_avg_price(symbol=selected_coin_pair)
        current_price = client.get_symbol_ticker(symbol=selected_coin_pair)
        margin = config['trade_configs'][selected_config]['profit_margin']
        
        # print(current_price)

        if float(current_price['price']) >= (buy_order['price'] * margin):
            sell_order = market_order(client, selected_coin_pair, 'sell', coin_pair_info, balance)
            break
        else:
            sleep(0.1)

if __name__ == '__main__':

    show_header()
    client = Client(config["api_key"], config["api_secret"])    
    if config['debug_mode']:
        debug_mode(client=client)
        print('\n')

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

    # answer3 = Inquirer.prompt(question3)
    # info_for_all_exchange = client.get_exchange_info()

    coin_pair_info = client.get_symbol_info(selected_coin_pair)
    # coin_info_analysis(coin_pair_info=coin_pair_info, balance=balance)
    #Time t get info is under 0.3secs. Factor this into trades

    #Example of this in excerpt
    # print(coin_pair_info)

    #TODO: Uncomment below after testing

    buy_order = market_order(client, selected_coin_pair, 'buy', coin_pair_info, balance)
    # buy_order = market_order(client, selected_coin_pair, 'test', coin_pair_info, balance)

    with concurrent.futures.ThreadPoolExecutor() as executor:
        
        #Print buy order details
        buy_order_details = executor.submit(display_order_details, buy_order)
        print('\n' + buy_order_details.result() + '\n')

        sell_order = check_margin()

    sell_order_details = display_order_details(sell_order)
    print('\n' + sell_order_details + '\n')
