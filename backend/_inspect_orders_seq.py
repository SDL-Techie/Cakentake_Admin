import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
conn = psycopg2.connect(
    host=os.getenv('DB_HOST'),
    port=os.getenv('DB_PORT'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    dbname=os.getenv('DB_NAME')
)
cur = conn.cursor()
print('--- orders row stats ---')
cur.execute("SELECT COUNT(*), MIN(id), MAX(id) FROM orders")
print(cur.fetchone())
print('--- orders id default ---')
cur.execute("SELECT column_name, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='id'")
print(cur.fetchone())
print('--- seq ownership ---')
cur.execute("SELECT seq.relname, ns.nspname, dep.deptype FROM pg_class seq JOIN pg_depend dep ON dep.objid = seq.oid JOIN pg_class tbl ON dep.refobjid = tbl.oid JOIN pg_attribute att ON att.attrelid = tbl.oid AND att.attnum = dep.refobjsubid JOIN pg_namespace ns ON seq.relnamespace = ns.oid WHERE seq.relkind='S' AND tbl.relname='orders' AND att.attname='id'")
for row in cur.fetchall():
    print(row)
print('--- sequences named orders_id_seq ---')
cur.execute("SELECT sequence_schema, sequence_name, start_value, last_value, increment_by, is_called FROM information_schema.sequences WHERE sequence_name='orders_id_seq'")
print(cur.fetchall())
print('--- sequence relation info ---')
cur.execute("SELECT c.relname, n.nspname, pg_get_userbyid(c.relowner), c.relkind FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE c.relname='orders_id_seq'")
print(cur.fetchall())
print('--- sequence raw state ---')
cur.execute("SELECT last_value, is_called, increment_by, cache_value FROM orders_id_seq")
print(cur.fetchone())
print('--- serial sequence via pg_get_serial_sequence ---')
cur.execute("SELECT pg_get_serial_sequence('orders','id')")
print(cur.fetchone())
cur.close(); conn.close()