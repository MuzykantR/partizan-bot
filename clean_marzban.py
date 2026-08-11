import sqlite3

conn = sqlite3.connect("/var/lib/marzban/db.sqlite3")
cur = conn.cursor()
cur.execute("DELETE FROM users WHERE username LIKE 'partizan_%'")
conn.commit()
print("Deleted partizan users from Marzban:", cur.rowcount)
conn.close()
