# 🎯 Quick Start Guide - BuilderNet

## ⚠️ CRITICAL FIRST STEP: Set Up Database

**You MUST complete this before the app will work!**

### 📝 Step-by-Step Instructions

#### 1️⃣ Open Supabase Dashboard
- Go to: https://supabase.com/dashboard
- Select your project: `yhwkrwrupzpdvpmiatho`

#### 2️⃣ Run the SQL Schema
1. Click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open `supabase-schema.sql` from this project
4. Copy **ALL** the SQL code (286 lines)
5. Paste into Supabase SQL Editor
6. Click **RUN** button

**Wait for:** "Success. No rows returned"

#### 3️⃣ Verify Tables Created
Click **Table Editor** (left sidebar) and confirm you see:
- ✅ profiles
- ✅ projects
- ✅ applications
- ✅ messages
- ✅ reviews

#### 4️⃣ Create Storage Buckets
1. Click **Storage** (left sidebar)
2. Click **New Bucket**
3. Create 3 buckets:

**Bucket 1: avatars**
- Name: `avatars`
- Public: ✅ YES (check the box)
- Click Create

**Bucket 2: portfolios**
- Name: `portfolios`
- Public: ❌ NO
- Click Create

**Bucket 3: attachments**
- Name: `attachments`
- Public: ❌ NO
- Click Create

#### 5️⃣ Test the App!
1. Refresh your browser
2. Click "Get Started"
3. Fill out the signup form
4. You should now be able to create an account! 🎉

---

## 🚀 What You'll See After Setup

### Landing Page
- Premium dark theme with gradients
- Hero section with stats
- Feature cards
- Call-to-action buttons

### After Signup
- Onboarding flow to complete your profile
- Dashboard with stats and recent projects
- Profile management
- Project listing
- Builder directory

---

## 🔧 Troubleshooting

### Still getting 500 error?
1. Check Supabase logs: **Logs → Auth**
2. Verify the trigger exists: Look for `on_auth_user_created` in Functions
3. Make sure RLS is enabled on all tables

### Can't see tables?
- The SQL might have failed
- Check for error messages in the SQL Editor
- Try running the SQL again

### Storage issues?
- Make sure bucket names are exactly: `avatars`, `portfolios`, `attachments`
- Avatars must be public, others private

---

## 📁 Important Files

- `supabase-schema.sql` - Complete database schema
- `DATABASE_SETUP_REQUIRED.md` - Detailed setup instructions
- `SETUP.md` - Full application documentation
- `.env` - Your Supabase credentials (already configured)

---

## 🎨 Features Included

✅ User authentication (signup, login, logout)
✅ Role-based access (Builder, Client, Admin)
✅ Profile management with skills and portfolio
✅ Project creation and listing
✅ Builder directory with search
✅ Premium UI with animations
✅ Responsive design
✅ Type-safe database operations
✅ Row Level Security

---

**Need help?** Check the detailed guides in the project root!
