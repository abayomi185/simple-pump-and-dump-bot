import json

conf_import = "./test.json"

with open(conf_import, "r") as conf_file:
    config = json.load(conf_file)

print(config['fills'][0]['price'])

counter = None

while True:
    if counter == None:
        counter = 1
    else:
        counter += 1
    
    if counter > 10:
        break

print(counter)