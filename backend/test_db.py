# test_db.py
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load .env
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Loaded .env from: {env_path}")
else:
    print(f"❌ .env not found at: {env_path}")
    sys.exit(1)

# Print environment variables (masked for security)
print("\n📋 Environment Variables:")
print("-" * 50)
print(f"   SECRET_KEY: {os.getenv('SECRET_KEY', 'MISSING')[:15]}...")
print(f"   DB_NAME: {os.getenv('DB_NAME', 'MISSING')}")
print(f"   DB_USER: {os.getenv('DB_USER', 'MISSING')}")
print(f"   DB_PASSWORD: {'*' * len(os.getenv('DB_PASSWORD', ''))}")
print(f"   DB_HOST: {os.getenv('DB_HOST', 'MISSING')}")
print(f"   DB_PORT: {os.getenv('DB_PORT', 'MISSING')}")
print("-" * 50)

# Test Django database connection
print("\n🔍 Testing database connection...")

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

try:
    import django
    django.setup()
    from django.db import connection
    
    with connection.cursor() as cursor:
        cursor.execute("SELECT version();")
        row = cursor.fetchone()
        print(f"✅ Connected to: {row[0][:50]}...")
        print("✅ Database connection successful!")
        sys.exit(0)
        
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    print("\nTroubleshooting steps:")
    print("1. Make sure PostgreSQL is running")
    print("2. Check if database 'kajob_db' exists")
    print("3. Verify credentials in .env")
    print("4. Check if user has proper permissions")
    sys.exit(1)
