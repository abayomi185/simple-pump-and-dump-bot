import sqlite3 from "sqlite3";
import fs from "fs";

export let db;

export const connectToDB = async () => {
  // https://attacomsian.com/blog/how-to-check-if-a-file-exists-in-nodejs
  const filePresent = fs.existsSync("./records.db");
  db = new sqlite3.Database("./records.db");
  if (!filePresent) {
    // If local database is not present
    db.run(`CREATE TABLE Orders
    (
        platform TEXT,
        client_order_id TEXT PRIMARY KEY,
        order_id TEXT,
        trade_id TEXT,
        symbol TEXT,
        order_type TEXT,
        order_side TEXT,
        time_in_force TEXT,
        transac_time INT,
        asset TEXT,
        price REAL,
        commision REAL,
        qty REAL,
        cummulative_qty REAL
    )`);
  }
};

export const insertIntoDB = async (exchange, order, order_id) => {
  // Insert data into db

  let symbol = order["symbol"];
  symbol = symbol.split("-", 1)[0];

  const price = parseFloat(order["dealFunds"]) / parseFloat(order["dealSize"]);

  db.run(
    "INSERT INTO Orders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      exchange,
      order["clientOid"],
      order_id,
      order["id"],
      order["symbol"],
      order["type"],
      order["side"],
      order["timeInForce"],
      order["createdAt"],
      symbol,
      price,
      order["fee"],
      order["size"],
      order["dealFunds"],
    ]
  );
};

export const closeDB = async () => {
    db.close()
}
