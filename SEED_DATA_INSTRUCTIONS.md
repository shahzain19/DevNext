# 🚀 Final Step: Add Real Data & Fix 400 Errors

You're getting a 400 error because the simplified profile table is missing columns like `verification` and `skills` that the app fetches.

## 📝 Instructions

1.  Open **Supabase Dashboard** > **SQL Editor**
2.  Open **`UPDATE_AND_SEED.sql`** (I just created this)
3.  Copy **ALL** the code
4.  Paste and **RUN**

## ✨ What This Does
1.  **Fixes Schema**: Adds `bio`, `skills`, `location`, `verification`, `hourly_rate` to profiles.
2.  **Seeds Users**: Adds 3 verified builders (Alex, Sarah, James) and 1 Client.
3.  **Seeds Projects**: Adds 2 realistic open projects.

## ✅ After Running
*   **Refresh the app**: The "Builders" page will show real profiles.
*   **Projects**: The "Projects" page will show active projects.
*   **CSS Fix**: I also auto-corrected the CSS margin/padding issue in `index.css`.

Your app should now be fully functional with real-looking data! 🚀
