import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def test_conn():
    db_name = os.getenv('DB_NAME', 'postgres')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_ssl = os.getenv('DB_SSL', 'false').lower() == 'true'
    
    if not db_password:
        print("ERROR: DB_PASSWORD environment variable must be set")
        print("For local development, create a .env file with this variable")
        return
    
    try:
        conn = psycopg2.connect(
            dbname=db_name,
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port,
            sslmode="require" if db_ssl else "disable"
        )
        print("Connected successfully")
        cur = conn.cursor()
        cur.execute("SELECT NOW()")
        print("Query result:", cur.fetchone())
        cur.close()
        conn.close()
    except Exception as e:
        print("Connection error:", e)

if __name__ == "__main__":
    test_conn()
