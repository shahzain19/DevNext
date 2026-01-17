# 🔍 DIAGNOSIS: Why Signup Still Fails

## ❌ Problem Found: Wrong API Key!

Your `.env` file is using the **service_role** key instead of the **anon** key.

### 🔑 How to Get the Correct Key

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Settings** (gear icon in sidebar)
4. Click **API**
5. Look for **Project API keys** section

You'll see TWO keys:

### ✅ Use This One (anon/public):
```
anon public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlod2tyd3J1cHpwZHZwbWlhdGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MTk2NDUsImV4cCI6MjA4NDE5NTY0NX0.XXXXXXXX
```
**This key has `"role":"anon"` in it**

### ❌ Don't Use This One (service_role):
```
service_role secret
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlod2tyd3J1cHpwZHZwbWlhdGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODYxOTY0NSwiZXhwIjoyMDg0MTk1NjQ1fQ.XXXXXXXX
```
**This key has `"role":"service_role"` in it** ← You're using this one!

---

## 🛠️ Fix Your .env File

Replace the content of `.env` with:

```env
VITE_SUPABASE_URL=https://yhwkrwrupzpdvpmiatho.supabase.co
VITE_SUPABASE_ANON_KEY=<PASTE_YOUR_ANON_KEY_HERE>
```

**Get the anon key from Supabase Dashboard → Settings → API**

---

## ✅ After Fixing the Key

1. Save the `.env` file
2. **RESTART** the dev server (Ctrl+C, then `npm run dev`)
3. Refresh your browser
4. Try signup again

---

## 🔍 How to Verify the Database Setup

To check if the SQL ran successfully:

1. Go to Supabase Dashboard
2. Click **Table Editor**
3. You should see these tables:
   - ✅ profiles
   - ✅ projects (if you ran full schema)
   - ✅ applications (if you ran full schema)
   - ✅ messages (if you ran full schema)
   - ✅ reviews (if you ran full schema)

If you DON'T see the `profiles` table:
- The SQL didn't run successfully
- Go back to SQL Editor and run it again
- Check for error messages

---

## 🆘 Still Getting 500 Error?

If you still get the error AFTER:
1. ✅ Using the correct anon key
2. ✅ Restarting the dev server
3. ✅ Verifying the profiles table exists

Then check:
1. **Supabase Logs**: Dashboard → Logs → Auth
2. **Database Functions**: Database → Functions → Look for `handle_new_user`
3. **RLS Policies**: Table Editor → profiles → Policies tab

---

## 📝 Quick Checklist

- [ ] Get **anon** key from Supabase (not service_role)
- [ ] Update `.env` file with anon key
- [ ] Restart dev server (`npm run dev`)
- [ ] Verify `profiles` table exists in Table Editor
- [ ] Verify `handle_new_user` function exists
- [ ] Try signup again

---

**The anon key is safe to use in your frontend - it's meant to be public!**
