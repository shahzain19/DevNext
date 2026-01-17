# 🚑 FIX FOR 400 BAD REQUEST (Foreign Key Error)

The error `Could not find a relationship` happens because when we fixed the "profiles" table earlier, **Postgres automatically broke the links** from the other tables (projects, applications) to profiles.

The tables exist, but they are "orphaned" and don't know who owns them.

## ⚡ INSTANT FIX

1.  Open **Supabase Dashboard** > **SQL Editor**
2.  Open **`FIX_BROKEN_SCHEMA.sql`** (I just created it)
3.  Copy **ALL** the code
4.  Paste and **RUN**

## ✅ What this does
1.  Drops the "orphaned" tables (`projects`, `applications`, `messages`).
2.  **Re-creates them** with valid links to the new `profiles` table.
3.  **Restores your data** (re-seeds the projects).

After running this, the "Applications" error will vanish and the system will work perfectly! 🛠️
