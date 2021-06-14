import fs from "fs";
const allTickers = JSON.parse(fs.readFileSync("./test.json"));

const testString = "Telegram ++ pump_group_1";

const re = new RegExp(/\w+(?=\s+\+\+)/);
const match = testString.match(re);

console.log(match[0]);

const time = "2021-06-12T16:00:00";
const datetime = Date.parse(time);

console.log(datetime);

let specificTicker = allTickers.ticker.find((o) => o.symbol === "HYVE-USDT");

console.log(specificTicker);

const testAffirmative = async (condition) => {
    if (condition){
        return "yes"
    }
}

const affirmative = async () => {
    console.log(await testAffirmative(false));
}

affirmative()