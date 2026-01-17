# 🔐 Google Auth & Database Fix Instructions

## 1️⃣ Fix the Database Error (Infinite Recursion)

You create the "Infinite Recursion" error when a policy queries the same table it's protecting. I've written a fix.

1.  Open **Supabase Dashboard** > **SQL Editor**
2.  Open the file `FIX_RECURSION.sql` from your project.
3.  Copy all code.
4.  Paste and Run.
5.  **Success check:** Ensure it says "Success. No rows returned" or returns the count.

## 2️⃣ Enable Google Auth in Supabase

Code alone cannot enable Google Auth. You must configure it in the dashboard.

1.  Go to **Authentication** > **Providers** > **Google**.
2.  **Enable** the toggle.
3.  You need a **Client ID** and **Client Secret** from Google Cloud Console.
    *   *If you don't have these, you can skip this for now and just use Email/Password, but the button will fail.*
4.  If you assume it's already set up, just ensure the toggle is ON.
5.  **Redirect URL**: Ensure `https://yhwkrwrupzpdvpmiatho.supabase.co/auth/v1/callback` is allowed in your Google Cloud Console.

## 3️⃣ Verify It Works

Run the test script again after applying the SQL fix:

```bash
node test-supabase.js
```

It should now pass the table check!
