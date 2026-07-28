import os
from backend.config import Config
from backend.extensions import db
from backend.app import app

print('SQLALCHEMY_DATABASE_URI', app.config['SQLALCHEMY_DATABASE_URI'])
with app.app_context():
    conn = db.engine.connect()
    result = conn.execute("SELECT COALESCE(MAX(id), 0) FROM orders")
    print('max_order_id', result.scalar())
    result = conn.execute("SELECT last_value, is_called FROM orders_id_seq")
    print('seq_state', result.fetchone())
    result = conn.execute("SELECT pg_get_serial_sequence('orders','id')")
    print('serial_seq', result.fetchone())
    conn.close()