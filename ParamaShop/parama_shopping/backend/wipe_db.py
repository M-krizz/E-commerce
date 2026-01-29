import psycopg2
from urllib.parse import urlparse
import os

# Get database URL from environment or use default
db_url = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost/parama_shopping_db")
result = urlparse(db_url)
username = result.username
password = result.password
database = result.path[1:]
hostname = result.hostname
port = result.port

print(f"Connecting to database: {database} on {hostname}")

try:
    conn = psycopg2.connect(
        database=database,
        user=username,
        password=password,
        host=hostname,
        port=port
    )
    conn.autocommit = True
    cursor = conn.cursor()

    # Drop the public schema and recreate it
    # This deletes ALL tables and data
    print("Dropping public schema...")
    cursor.execute("DROP SCHEMA public CASCADE;")
    print("Recreating public schema...")
    cursor.execute("CREATE SCHEMA public;")

    # Restore default permissions (optional but recommended)
    cursor.execute("GRANT ALL ON SCHEMA public TO public;")

    print("Database wiped successfully.")

    cursor.close()
    conn.close()

except Exception as e:
    print(f"Error: {e}")
