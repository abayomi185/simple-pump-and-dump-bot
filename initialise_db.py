import sqlite3

conn = sqlite3.connect('records.db')
c = conn.cursor()

c.execute("""CREATE TABLE BUY
            (
                
            )""")