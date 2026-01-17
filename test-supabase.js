// Test script to verify Supabase connection and database setup
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://yhwkrwrupzpdvpmiatho.supabase.co";
const supabaseAnonKey = "sb_publishable_PevYcqKIcM9sf40Y_krvCA_TtI6nPyW";

console.log('🔍 Testing Supabase Connection...\n');

// Test 1: Check environment variables
console.log('1️⃣ Environment Variables:');
console.log('   URL:', supabaseUrl);
console.log('   Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');

// Decode the key to check the format
if (supabaseAnonKey) {
    if (supabaseAnonKey.startsWith('sb_')) {
        console.log('   ✅ Correct key format (Publishable Key)');
    } else if (supabaseAnonKey.includes('.')) {
        try {
            const payload = JSON.parse(atob(supabaseAnonKey.split('.')[1]));
            console.log('   Role:', payload.role);
        } catch (e) {
            console.log('   ❌ Invalid JWT format (but might be a new opaque key type?)');
        }
    } else {
        console.log('   ⚠️ Unknown key format, assuming valid for now.');
    }
}

// Test 2: Create client
const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('\n2️⃣ Supabase Client Created ✅\n');

// Test 3: Check if profiles table exists
console.log('3️⃣ Checking Database Tables...');
const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('count')
    .limit(1);

if (profilesError) {
    console.log('   ❌ profiles table:', profilesError.message);
    console.log('   → You need to run the SQL schema in Supabase!');
} else {
    console.log('   ✅ profiles table exists');
}

// Test 4: Check if trigger exists (try to query pg_trigger)
console.log('\n4️⃣ Checking Database Trigger...');
const { data: functions, error: functionsError } = await supabase.rpc('handle_new_user');
if (functionsError) {
    if (functionsError.message.includes('does not exist')) {
        console.log('   ❌ handle_new_user function not found');
        console.log('   → Run the SQL schema to create the trigger');
    }
}

// Test 5: Try a test signup
console.log('\n5️⃣ Testing Signup...');
const testEmail = `test-${Date.now()}@example.com`;
const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: testEmail,
    password: 'test123456',
    options: {
        data: {
            name: 'Test User',
            role: 'client'
        }
    }
});

if (signupError) {
    console.log('   ❌ Signup failed:', signupError.message);
    console.log('   Status:', signupError.status);
    console.log('\n📋 DIAGNOSIS:');
    if (signupError.status === 500) {
        console.log('   The database trigger is failing.');
        console.log('   This means either:');
        console.log('   1. The profiles table does not exist');
        console.log('   2. The handle_new_user trigger does not exist');
        console.log('   3. The trigger has an error');
        console.log('\n   ✅ SOLUTION: Run the SQL schema in Supabase SQL Editor');
    }
} else {
    console.log('   ✅ Signup successful!');
    console.log('   User ID:', signupData.user?.id);
}

console.log('\n' + '='.repeat(60));
console.log('🎯 SUMMARY:');
console.log('='.repeat(60));
console.log('If you see ❌ errors above, follow the instructions to fix them.');
console.log('Most common issue: SQL schema not run in Supabase.');
console.log('='.repeat(60));
