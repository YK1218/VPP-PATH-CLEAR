import os
import sys
from dotenv import load_dotenv
from neo4j import GraphDatabase
from supabase import create_client

# Load from .env file in the same directory as this script's parent (backend)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

def test_supabase():
    print("\n--- Testing Supabase Connection ---")
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        print("❌ Error: SUPABASE_URL or SUPABASE_KEY is missing from .env")
        return False
        
    try:
        supabase = create_client(url, key)
        # Attempt a simple query to verify auth
        supabase.table("users").select("id").limit(1).execute()
        print("✅ Supabase connected successfully!")
        return True
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

def test_neo4j():
    print("\n--- Testing Neo4j Connection ---")
    uri = os.environ.get("NEO4J_URI")
    user = os.environ.get("NEO4J_USER")
    password = os.environ.get("NEO4J_PASSWORD")
    
    if not uri or not user or not password:
        print("❌ Error: NEO4J_URI, NEO4J_USER, or NEO4J_PASSWORD is missing from .env")
        return False
        
    try:
        driver = GraphDatabase.driver(uri, auth=(user, password))
        driver.verify_connectivity()
        print("✅ Neo4j connected successfully!")
        return True
    except Exception as e:
        print(f"❌ Neo4j connection failed: {e}")
        return False

if __name__ == "__main__":
    supabase_ok = test_supabase()
    neo4j_ok = test_neo4j()
    
    print("\n==================================")
    if supabase_ok and neo4j_ok:
        print("🎉 Both databases are connected!")
    else:
        print("⚠️ Please check your .env file and fix the connection issues above.")
    print("==================================\n")
