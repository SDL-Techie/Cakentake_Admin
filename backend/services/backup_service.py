# import os
# import json
# import base64
# import datetime
# import decimal
# import uuid

# import psycopg2
# from psycopg2.extras import (
#     RealDictCursor,
#     execute_batch,
#     Json
# )

# from config import Config


# # ==========================================================
# # Backup Directory
# # ==========================================================

# BACKUP_DIR = os.path.join(os.getcwd(), "backups")
# os.makedirs(BACKUP_DIR, exist_ok=True)


# # ==========================================================
# # Database Connection
# # ==========================================================

# def _get_connection():
#     return psycopg2.connect(
#         host=Config.DB_HOST,
#         port=Config.DB_PORT,
#         user=Config.DB_USER,
#         password=Config.DB_PASSWORD,
#         dbname=Config.DB_NAME,
#     )


# # ==========================================================
# # JSON Encoder
# # ==========================================================

# class _JSONEncoder(json.JSONEncoder):

#     def default(self, obj):

#         if isinstance(obj, (datetime.datetime,
#                             datetime.date,
#                             datetime.time)):
#             return obj.isoformat()

#         if isinstance(obj, decimal.Decimal):
#             return float(obj)

#         if isinstance(obj, uuid.UUID):
#             return str(obj)

#         if isinstance(obj, (bytes, memoryview)):
#             return base64.b64encode(bytes(obj)).decode("ascii")

#         return super().default(obj)


# # ==========================================================
# # Get All Tables
# # ==========================================================

# def _get_all_tables(cursor):

#     cursor.execute("""
#         SELECT table_name
#         FROM information_schema.tables
#         WHERE table_schema='public'
#         AND table_type='BASE TABLE'
#         ORDER BY table_name;
#     """)

#     rows = cursor.fetchall()
#     if not rows:
#         return []

#     first_row = rows[0]
#     if isinstance(first_row, dict):
#         return [row["table_name"] for row in rows]

#     return [row[0] for row in rows]


# def _get_table_columns(cursor, table_name):

#     cursor.execute(
#         """
#         SELECT column_name
#         FROM information_schema.columns
#         WHERE table_schema='public'
#           AND table_name=%s
#         ORDER BY ordinal_position;
#         """,
#         (table_name,)
#     )

#     rows = cursor.fetchall()
#     if not rows:
#         return []

#     first_row = rows[0]
#     if isinstance(first_row, dict):
#         return [row["column_name"] for row in rows]

#     return [row[0] for row in rows]

# def _parse_decimal(value):
#     if value is None:
#         return None

#     try:
#         return float(value)
#     except (TypeError, ValueError):
#         try:
#             return float(str(value).replace(',', '').strip())
#         except (TypeError, ValueError):
#             return None


# def _normalize_legacy_user(row):
#     name = row.get("name", "") or ""
#     parts = name.strip().split()
#     first_name = parts[0] if parts else ""
#     last_name = " ".join(parts[1:]) if len(parts) > 1 else ""

#     phone_no = row.get("phoneno") or row.get("phone_no") or ""
#     email = row.get("email") or f"legacy_{phone_no or row.get('_id', 'user')}@legacy.local"
#     if email == "@legacy.local":
#         email = f"legacy_{row.get('_id', 'user')}@legacy.local"

#     return {
#         "first_name": first_name,
#         "last_name": last_name,
#         "phone_no": phone_no,
#         "email": email,
#         "password": row.get("password") or "",
#         "role": row.get("role") or "USER",
#         "currency_code": "INR",
#         "loyalty_points": int(row.get("loyaltyPoints") or 0),
#         "availability_status": "OFFLINE",
#         "rating": float(row.get("rating") or 0),
#         "created_at": row.get("createdAt") or None,
#     }


# def _normalize_legacy_category(row):
#     return {
#         "name": row.get("name"),
#         "image": row.get("image"),
#         "status": row.get("status"),
#         "created_at": row.get("createdAt") or None,
#     }


# def _normalize_legacy_product(row):
#     return {
#         "name": row.get("name"),
#         "description": row.get("description"),
#         "category_id": None,
#         "subcategory_id": None,
#         "price": _parse_decimal(row.get("price")) or 0,
#         "original_price": _parse_decimal(row.get("oldprice")) or None,
#         "stock": 0,
#         "unit": "pcs",
#         "image_url": row.get("productimage"),
#         "ingredients": row.get("ingredients"),
#         "is_active": row.get("status", "Active").lower() == "active",
#         "created_at": row.get("createdAt") or None,
#         "updated_at": row.get("updatedAt") or row.get("createdAt") or None,
#     }


# def _normalize_legacy_pincode(row):
#     return {
#         "country": "India",
#         "state": row.get("state") or "Unknown",
#         "city": row.get("city") or "Unknown",
#         "postal_code": row.get("pincode"),
#         "delivery_amount": _parse_decimal(row.get("deliveryCharge")) or 0,
#         "created_at": row.get("createdAt") or None,
#         "updated_at": row.get("updatedAt") or row.get("createdAt") or None,
#     }


# def _normalize_legacy_point_settings(row):
#     return {
#         "min_purchase": _parse_decimal(row.get("minOrderAmount")) or 0,
#         "points_earned": int(row.get("pointsEarnedPerOrder") or 0),
#         "points_needed": int(row.get("pointsRequiredForDiscount") or 0),
#         "reward_percentage": _parse_decimal(row.get("discountPercentage")) or 0,
#         "coupon_validity_days": int(row.get("couponValidityDays") or 0),
#     }


# def _normalize_legacy_backup(backup):
#     if "tables" in backup:
#         return backup, False

#     legacy_mapping = {
#         "users": ("users", _normalize_legacy_user),
#         "categories": ("categories", _normalize_legacy_category),
#         "products": ("products", _normalize_legacy_product),
#         "pincodes": ("pincodes", _normalize_legacy_pincode),
#         "pointSettings": ("point_settings", _normalize_legacy_point_settings),
#     }

#     tables = {}
#     for key, value in backup.items():
#         if not isinstance(value, list):
#             continue

#         mapping = legacy_mapping.get(key)
#         if not mapping:
#             continue

#         target_name, normalizer = mapping
#         normalized_rows = [normalizer(row) for row in value if isinstance(row, dict)]
#         if normalized_rows:
#             tables[target_name] = normalized_rows

#     if not tables:
#         return backup, False

#     return {"tables": tables}, True

# # ==========================================================
# # Backup
# # ==========================================================

# def create_backup():

#     timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

#     filename = f"cakentake_{timestamp}.json"

#     backup_path = os.path.join(BACKUP_DIR, filename)

#     conn = None

#     try:

#         conn = _get_connection()

#         cursor = conn.cursor(cursor_factory=RealDictCursor)

#         tables = _get_all_tables(cursor)

#         backup = {
#             "created_at": datetime.datetime.now().isoformat(),
#             "database": Config.DB_NAME,
#             "tables": {}
#         }

#         for table in tables:

#             cursor.execute(f'SELECT * FROM "{table}"')

#             rows = cursor.fetchall()

#             backup["tables"][table] = [dict(r) for r in rows]

#         with open(backup_path, "w", encoding="utf-8") as f:

#             json.dump(
#                 backup,
#                 f,
#                 cls=_JSONEncoder,
#                 indent=2
#             )

#         return {
#             "success": True,
#             "message": "Backup created successfully.",
#             "filename": filename,
#             "path": backup_path
#         }

#     except Exception as e:

#         import traceback
#         traceback.print_exc()

#         if os.path.exists(backup_path):
#             os.remove(backup_path)

#         return {
#             "success": False,
#             "message": "Backup failed.",
#             "error": str(e)
#         }

#     finally:

#         if conn:
#             conn.close()


# # ==========================================================
# # List Backups
# # ==========================================================

# def list_backups():

#     backups = []

#     if not os.path.exists(BACKUP_DIR):
#         return backups

#     for file in os.listdir(BACKUP_DIR):

#         path = os.path.join(BACKUP_DIR, file)

#         backups.append({

#             "filename": file,

#             "size": round(
#                 os.path.getsize(path) / (1024 * 1024),
#                 2
#             ),

#             "created_at":
#             datetime.datetime.fromtimestamp(
#                 os.path.getctime(path)
#             ).strftime("%Y-%m-%d %H:%M:%S")
#         })

#     backups.sort(
#         key=lambda x: x["created_at"],
#         reverse=True
#     )

#     return backups


# # ==========================================================
# # Delete Backup
# # ==========================================================

# def delete_backup(filename):

#     path = os.path.join(BACKUP_DIR, filename)

#     if not os.path.exists(path):

#         return {
#             "success": False,
#             "message": "Backup file not found."
#         }

#     os.remove(path)

#     return {
#         "success": True,
#         "message": "Backup deleted successfully."
#     }


# # ==========================================================
# # Restore Backup
# # ==========================================================

# def restore_backup(filename):

#     backup_path = os.path.join(BACKUP_DIR, filename)

#     if not os.path.exists(backup_path):

#         return {
#             "success": False,
#             "message": "Backup file not found."
#         }

#     conn = None

#     try:

#         with open(
#             backup_path,
#             "r",
#             encoding="utf-8"
#         ) as f:

#             backup = json.load(f)

#         backup, was_legacy = _normalize_legacy_backup(backup)
#         tables = backup.get("tables", {})

#         table_names = list(tables.keys())

#         if not table_names:

#             return {
#                 "success": False,
#                 "message": "Backup file contains no tables."
#             }

#         conn = _get_connection()

#         conn.autocommit = False

#         cursor = conn.cursor()

#         existing_tables = [t for t in table_names if t in _get_all_tables(cursor)]
#         skipped_tables = [t for t in table_names if t not in existing_tables]

#         if not existing_tables:
#             return {
#                 "success": False,
#                 "message": "Backup file contains no tables matching the current database schema.",
#                 "skipped_tables": skipped_tables
#             }

#         quoted_tables = ", ".join(
#             f'"{t}"' for t in existing_tables
#         )

#         cursor.execute(
#             f"""
#             TRUNCATE TABLE
#             {quoted_tables}
#             RESTART IDENTITY CASCADE;
#             """
#         )

#         cursor.execute(
#             "SET session_replication_role='replica';"
#         )

#         for table in existing_tables:

#             rows = tables[table]

#             if not rows:
#                 continue

#             existing_columns = _get_table_columns(cursor, table)
#             if not existing_columns:
#                 continue

#             columns = [col for col in rows[0].keys() if col in existing_columns]
#             if not columns:
#                 continue

#             quoted_columns = ", ".join(
#                 f'"{c}"' for c in columns
#             )

#             placeholders = ", ".join(
#                 ["%s"] * len(columns)
#             )

#             sql = f"""
#             INSERT INTO "{table}"
#             ({quoted_columns})
#             VALUES ({placeholders})
#             """

#             values = []

#             for row in rows:

#                 record = []

#                 for col in columns:

#                     value = row.get(col)

#                     if isinstance(value, (dict, list)):
#                         value = Json(value)

#                     record.append(value)

#                 values.append(tuple(record))

#             execute_batch(
#                 cursor,
#                 sql,
#                 values,
#                 page_size=500
#             )

#         cursor.execute(
#             "SET session_replication_role='origin';"
#         )

#         conn.commit()

#         return {
#             "success": True,
#             "message": "Database restored successfully."
#         }

#     except Exception as e:

#         if conn:
#             conn.rollback()

#         import traceback
#         traceback.print_exc()

#         return {
#             "success": False,
#             "message": "Restore failed.",
#             "error": str(e)
#         }

#     finally:

#         if conn:
#             conn.close()


import os
import json
import base64
import datetime
import decimal
import uuid

import psycopg2
import re
from psycopg2 import sql
from psycopg2.extras import (
    RealDictCursor,
    execute_batch,
    Json
)

from config import Config


# ==========================================================
# Backup Directory
# ==========================================================

BACKUP_DIR = os.path.join(os.getcwd(), "backups")
os.makedirs(BACKUP_DIR, exist_ok=True)


# ==========================================================
# Database Connection
# ==========================================================

def _get_connection():
    return psycopg2.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        dbname=Config.DB_NAME,
    )


# ==========================================================
# JSON Encoder
# ==========================================================

class _JSONEncoder(json.JSONEncoder):

    def default(self, obj):

        if isinstance(obj, (datetime.datetime,
                            datetime.date,
                            datetime.time)):
            return obj.isoformat()

        if isinstance(obj, decimal.Decimal):
            return float(obj)

        if isinstance(obj, uuid.UUID):
            return str(obj)

        if isinstance(obj, (bytes, memoryview)):
            return base64.b64encode(bytes(obj)).decode("ascii")

        return super().default(obj)


# ==========================================================
# Get All Tables
# ==========================================================

def _get_all_tables(cursor):

    cursor.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema='public'
        AND table_type='BASE TABLE'
        ORDER BY table_name;
    """)

    rows = cursor.fetchall()
    if not rows:
        return []

    first_row = rows[0]
    if isinstance(first_row, dict):
        return [row["table_name"] for row in rows]

    return [row[0] for row in rows]


def _get_table_columns(cursor, table_name):

    cursor.execute(
        """
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema='public'
          AND table_name=%s
        ORDER BY ordinal_position;
        """,
        (table_name,)
    )

    rows = cursor.fetchall()
    if not rows:
        return []

    first_row = rows[0]
    if isinstance(first_row, dict):
        return [row["column_name"] for row in rows]

    return [row[0] for row in rows]


def _reset_serial_sequences(cursor, table_names):
    for table_name in table_names:
        cursor.execute(
            """
            SELECT column_name, column_default
            FROM information_schema.columns
            WHERE table_schema='public'
              AND table_name=%s
            """,
            (table_name,)
        )

        columns = cursor.fetchall()
        if not columns:
            continue

        for row in columns:
            if isinstance(row, dict):
                column_name = row['column_name']
                column_default = row['column_default']
            else:
                column_name, column_default = row

            if not column_default:
                continue

            sequence_name = None
            match = re.search(r"nextval\('([^']+)'::regclass\)", str(column_default))
            if match:
                sequence_name = match.group(1)

            if not sequence_name:
                cursor.execute(
                    """
                    SELECT quote_ident(ns.nspname) || '.' || quote_ident(seq.relname)
                    FROM pg_class seq
                    JOIN pg_depend dep ON dep.objid = seq.oid
                    JOIN pg_class tbl ON dep.refobjid = tbl.oid
                    JOIN pg_attribute att ON att.attrelid = tbl.oid AND att.attnum = dep.refobjsubid
                    JOIN pg_namespace ns ON seq.relnamespace = ns.oid
                    WHERE seq.relkind = 'S'
                      AND tbl.relname = %s
                      AND att.attname = %s
                    """,
                    (table_name, column_name)
                )
                seq_row = cursor.fetchone()
                if seq_row:
                    sequence_name = seq_row[0] if isinstance(seq_row, (list, tuple)) else seq_row

            if not sequence_name:
                continue

            cursor.execute(
                sql.SQL(
                    "SELECT setval(%s, COALESCE((SELECT MAX({col}) FROM {table}), 0) + 1, false)"
                ).format(
                    col=sql.Identifier(column_name),
                    table=sql.Identifier(table_name)
                ),
                [sequence_name]
            )


def _parse_decimal(value):
    if value is None:
        return None

    try:
        return float(value)
    except (TypeError, ValueError):
        try:
            return float(str(value).replace(',', '').strip())
        except (TypeError, ValueError):
            return None


def _normalize_legacy_user(row):
    name = row.get("name", "") or ""
    parts = name.strip().split()
    first_name = parts[0] if parts else ""
    last_name = " ".join(parts[1:]) if len(parts) > 1 else ""

    phone_no = row.get("phoneno") or row.get("phone_no") or ""
    email = row.get("email") or f"legacy_{phone_no or row.get('_id', 'user')}@legacy.local"
    if email == "@legacy.local":
        email = f"legacy_{row.get('_id', 'user')}@legacy.local"

    return {
        "first_name": first_name,
        "last_name": last_name,
        "phone_no": phone_no,
        "email": email,
        "password": row.get("password") or "",
        "role": row.get("role") or "USER",
        "currency_code": "INR",
        "loyalty_points": int(row.get("loyaltyPoints") or 0),
        "availability_status": "OFFLINE",
        "rating": float(row.get("rating") or 0),
        "created_at": row.get("createdAt") or None,
    }


def _normalize_legacy_category(row):
    return {
        "name": row.get("name"),
        "image": row.get("image"),
        "status": row.get("status"),
        "created_at": row.get("createdAt") or None,
    }


def _normalize_legacy_product(row):
    return {
        "name": row.get("name"),
        "description": row.get("description"),
        "category_id": None,
        "subcategory_id": None,
        "price": _parse_decimal(row.get("price")) or 0,
        "original_price": _parse_decimal(row.get("oldprice")) or None,
        "stock": 0,
        "unit": "pcs",
        "image_url": row.get("productimage"),
        "ingredients": row.get("ingredients"),
        "is_active": row.get("status", "Active").lower() == "active",
        "created_at": row.get("createdAt") or None,
        "updated_at": row.get("updatedAt") or row.get("createdAt") or None,
    }


def _normalize_legacy_pincode(row):
    return {
        "country": "India",
        "state": row.get("state") or "Unknown",
        "city": row.get("city") or "Unknown",
        "postal_code": row.get("pincode"),
        "delivery_amount": _parse_decimal(row.get("deliveryCharge")) or 0,
        "created_at": row.get("createdAt") or None,
        "updated_at": row.get("updatedAt") or row.get("createdAt") or None,
    }


def _normalize_legacy_point_settings(row):
    return {
        "min_purchase": _parse_decimal(row.get("minOrderAmount")) or 0,
        "points_earned": int(row.get("pointsEarnedPerOrder") or 0),
        "points_needed": int(row.get("pointsRequiredForDiscount") or 0),
        "reward_percentage": _parse_decimal(row.get("discountPercentage")) or 0,
        "coupon_validity_days": int(row.get("couponValidityDays") or 0),
    }


def _normalize_legacy_backup(backup):
    if "tables" in backup:
        return backup, False

    legacy_mapping = {
        "users": ("users", _normalize_legacy_user),
        "categories": ("categories", _normalize_legacy_category),
        "products": ("products", _normalize_legacy_product),
        "pincodes": ("pincodes", _normalize_legacy_pincode),
        "pointSettings": ("point_settings", _normalize_legacy_point_settings),
    }

    tables = {}
    for key, value in backup.items():
        if not isinstance(value, list):
            continue

        mapping = legacy_mapping.get(key)
        if not mapping:
            continue

        target_name, normalizer = mapping
        normalized_rows = [normalizer(row) for row in value if isinstance(row, dict)]
        if normalized_rows:
            tables[target_name] = normalized_rows

    if not tables:
        return backup, False

    return {"tables": tables}, True

# ==========================================================
# Backup
# ==========================================================

def create_backup():

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

    filename = f"cakentake_{timestamp}.json"

    backup_path = os.path.join(BACKUP_DIR, filename)

    conn = None

    try:

        conn = _get_connection()

        cursor = conn.cursor(cursor_factory=RealDictCursor)

        tables = _get_all_tables(cursor)

        backup = {
            "created_at": datetime.datetime.now().isoformat(),
            "database": Config.DB_NAME,
            "tables": {}
        }

        for table in tables:

            cursor.execute(f'SELECT * FROM "{table}"')

            rows = cursor.fetchall()

            backup["tables"][table] = [dict(r) for r in rows]

        with open(backup_path, "w", encoding="utf-8") as f:

            json.dump(
                backup,
                f,
                cls=_JSONEncoder,
                indent=2
            )

        return {
            "success": True,
            "message": "Backup created successfully.",
            "filename": filename,
            "path": backup_path
        }

    except Exception as e:

        import traceback
        traceback.print_exc()

        if os.path.exists(backup_path):
            os.remove(backup_path)

        return {
            "success": False,
            "message": "Backup failed.",
            "error": str(e)
        }

    finally:

        if conn:
            conn.close()


# ==========================================================
# List Backups
# ==========================================================

def list_backups():

    backups = []

    if not os.path.exists(BACKUP_DIR):
        return backups

    for file in os.listdir(BACKUP_DIR):

        path = os.path.join(BACKUP_DIR, file)

        backups.append({

            "filename": file,

            "size": round(
                os.path.getsize(path) / (1024 * 1024),
                2
            ),

            "created_at":
            datetime.datetime.fromtimestamp(
                os.path.getctime(path)
            ).strftime("%Y-%m-%d %H:%M:%S")
        })

    backups.sort(
        key=lambda x: x["created_at"],
        reverse=True
    )

    return backups


# ==========================================================
# Delete Backup
# ==========================================================

def delete_backup(filename):

    path = os.path.join(BACKUP_DIR, filename)

    if not os.path.exists(path):

        return {
            "success": False,
            "message": "Backup file not found."
        }

    os.remove(path)

    return {
        "success": True,
        "message": "Backup deleted successfully."
    }


# ==========================================================
# Restore Backup
# ==========================================================

def restore_backup(filename):

    backup_path = os.path.join(BACKUP_DIR, filename)

    if not os.path.exists(backup_path):

        return {
            "success": False,
            "message": "Backup file not found."
        }

    conn = None

    try:

        with open(
            backup_path,
            "r",
            encoding="utf-8"
        ) as f:

            backup = json.load(f)

        backup, was_legacy = _normalize_legacy_backup(backup)
        tables = backup.get("tables", {})

        table_names = list(tables.keys())

        if not table_names:

            return {
                "success": False,
                "message": "Backup file contains no tables."
            }

        conn = _get_connection()

        conn.autocommit = False

        cursor = conn.cursor()

        existing_tables = [t for t in table_names if t in _get_all_tables(cursor)]
        skipped_tables = [t for t in table_names if t not in existing_tables]

        if not existing_tables:
            return {
                "success": False,
                "message": "Backup file contains no tables matching the current database schema.",
                "skipped_tables": skipped_tables
            }

        quoted_tables = ", ".join(
            f'"{t}"' for t in existing_tables
        )

        cursor.execute(
            f"""
            TRUNCATE TABLE
            {quoted_tables}
            RESTART IDENTITY CASCADE;
            """
        )

        cursor.execute(
            "SET session_replication_role='replica';"
        )

        for table in existing_tables:

            rows = tables[table]

            if not rows:
                continue

            existing_columns = _get_table_columns(cursor, table)
            if not existing_columns:
                continue

            columns = [col for col in rows[0].keys() if col in existing_columns]
            if not columns:
                continue

            quoted_columns = ", ".join(
                f'"{c}"' for c in columns
            )

            placeholders = ", ".join(
                ["%s"] * len(columns)
            )

            sql = f"""
            INSERT INTO "{table}"
            ({quoted_columns})
            VALUES ({placeholders})
            """

            values = []

            for row in rows:

                record = []

                for col in columns:

                    value = row.get(col)

                    if isinstance(value, (dict, list)):
                        value = Json(value)

                    record.append(value)

                values.append(tuple(record))

            execute_batch(
                cursor,
                sql,
                values,
                page_size=500
            )

        _reset_serial_sequences(cursor, existing_tables)

        cursor.execute(
            "SET session_replication_role='origin';"
        )

        conn.commit()

        return {
            "success": True,
            "message": "Database restored successfully."
        }

    except Exception as e:

        if conn:
            conn.rollback()

        import traceback
        traceback.print_exc()

        return {
            "success": False,
            "message": "Restore failed.",
            "error": str(e)
        }

    finally:

        if conn:
            conn.close()