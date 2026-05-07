
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

sql = """
-- Create activity_messages table
create table if not exists activity_messages (
    id          uuid primary key default uuid_generate_v4(),
    activity_id uuid not null references activities(id) on delete cascade,
    user_id     uuid not null references users(id)  on delete cascade,
    message     text not null,
    created_at  timestamptz not null default now()
);

-- Enable RLS
alter table activity_messages enable row level security;

-- Policies
create policy "Allow all for activity_messages" on activity_messages for all using (true) with check (true);

-- Add XP column to users if not exists
do $$ 
begin 
    if not exists (select 1 from information_schema.columns where table_name='users' and column_name='xp') then
        alter table users add column xp int not null default 0;
    end if;
end $$;
"""

# Supabase python client doesn't have a direct .sql() method in some versions
# But we can try using the rpc or just assume we can run it if we have a custom tool
# Since I don't have a direct SQL tool, I'll use the REST API to check if it works 
# or just tell the user to run it if I can't.
# Actually, I can try to use a simple insert to a non-existent table to see if it fails, 
# but that doesn't help create it.

print("Please run the following SQL in Supabase SQL Editor to enable Group Chat:")
print(sql)
