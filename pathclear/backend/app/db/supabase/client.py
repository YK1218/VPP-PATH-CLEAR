import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://xyzcompany.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "public-anon-key")

def get_supabase_client() -> Client:
    # In a real app this would connect, here we provide a mock or the real deal
    return create_client(SUPABASE_URL, SUPABASE_KEY)
