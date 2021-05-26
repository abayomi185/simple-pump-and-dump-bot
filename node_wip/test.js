

const testString = "Telegram ++ pump_group_1"

const re = new RegExp(/\w+(?=\s+\+\+)/)
const match = testString.match(re)

console.log(match[0]);