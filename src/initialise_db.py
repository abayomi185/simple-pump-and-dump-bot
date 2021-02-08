import sqlite3

conn = sqlite3.connect('records.db')
c = conn.cursor()

c.execute("""CREATE TABLE Orders
            (
                client_order_id TEXT,
                order_id TEXT,
                trade_id REAL,
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
            )""")

conn.commit()

conn.close()