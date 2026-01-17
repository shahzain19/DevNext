# 🚨 Fix: Login Redirecting to Localhost

The "This site can't be reached" error on `localhost:3000` happens because **Supabase is still configured to redirect users to your local machine after login**, even though you are using the Vercel site.

## 1. Update Supabase URL Configuration

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project.
3.  Go to **Authentication** (in the sidebar) -> **URL Configuration**.
4.  **Site URL**: Change this from `http://localhost:3000` to your **Vercel Deployment URL** (e.g., `https://your-project.vercel.app`).
5.  **Redirect URLs**:
    *   Add your Vercel URL: `https://your-project.vercel.app/**` (The `/**` allows deep linking).
    *   (Optional) Keep `http://localhost:3000/**` if you still want to test locally.
6.  Click **Save**.

## 2. Update Google OAuth (If using Google)

If you are using Google Login, you also need to update the **Allowed Redirect URIs** in the Google Cloud Console:

1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Go to **APIs & Services** -> **Credentials**.
3.  Edit your **OAuth 2.0 Client ID**.
4.  Under **Authorized redirect URIs**, add:
    *   `https://<your-project-ref>.supabase.co/auth/v1/callback`
    *   (This typically doesn't change, but it's good to double-check).

## 3. Check Vercel Environment Variables

Ensure your Vercel project has the environment variables set:

1.  Go to your project on Vercel.
2.  **Settings** -> **Environment Variables**.
3.  Add:
    *   `VITE_SUPABASE_URL`: (Your Supabase URL)
    *   `VITE_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)

**After these changes, try logging in again on your Vercel app!**
