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
cur.execute("SELECT column_default, is_identity, identity_generation FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='id'")
print('id column:', cur.fetchone())
cur.execute("SELECT COALESCE(MAX(id),0) FROM orders")
print('max_order_id', cur.fetchone()[0])
cur.execute("SELECT last_value, is_called FROM orders_id_seq")
print('seq_state', cur.fetchone())
cur.execute("SELECT pg_get_serial_sequence('orders','id')")
print('serial_seq', cur.fetchone())
conn.close()