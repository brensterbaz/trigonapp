/**
 * Diagnostic script to check database setup
 * Run with: npx tsx scripts/check-database.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkDatabase() {
  console.log('🔍 Checking database setup...\n')

  // Check if tables exist
  console.log('1. Checking if tables exist...')
  try {
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('count')
      .limit(1)

    if (orgError) {
      console.error('   ❌ organizations table error:', orgError.message)
      if (orgError.code === 'PGRST116') {
        console.error('   ⚠️  Table does not exist! Run the migration first.')
      }
    } else {
      console.log('   ✅ organizations table exists')
    }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (profileError) {
      console.error('   ❌ profiles table error:', profileError.message)
      if (profileError.code === 'PGRST116') {
        console.error('   ⚠️  Table does not exist! Run the migration first.')
      }
    } else {
      console.log('   ✅ profiles table exists')
    }
  } catch (err) {
    console.error('   ❌ Error checking tables:', err)
  }

  // Check users
  console.log('\n2. Checking authentication users...')
  try {
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('   ❌ Error fetching users:', usersError.message)
      console.log('   ⚠️  Note: This requires service_role key. Using anon key, checking differently...')
      
      // Try to get current user instead
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.log('   ℹ️  No authenticated user (this is expected if not logged in)')
      } else {
        console.log(`   ✅ Found authenticated user: ${user.email}`)
      }
    } else {
      console.log(`   ✅ Found ${users.length} user(s)`)
      users.forEach((user, i) => {
        console.log(`      ${i + 1}. ${user.email} (${user.email_confirmed_at ? 'confirmed' : 'unconfirmed'})`)
      })
    }
  } catch (err) {
    console.error('   ❌ Error:', err)
  }

  // Check data in tables
  console.log('\n3. Checking data in tables...')
  try {
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')

    if (orgError) {
      console.error('   ❌ Error fetching organizations:', orgError.message)
    } else {
      console.log(`   ✅ Found ${orgs?.length || 0} organization(s)`)
      orgs?.forEach((org, i) => {
        console.log(`      ${i + 1}. ${org.name} (${org.subscription_tier})`)
      })
    }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')

    if (profileError) {
      console.error('   ❌ Error fetching profiles:', profileError.message)
    } else {
      console.log(`   ✅ Found ${profiles?.length || 0} profile(s)`)
      profiles?.forEach((profile, i) => {
        console.log(`      ${i + 1}. User ID: ${profile.user_id}, Org ID: ${profile.organization_id}`)
      })
    }
  } catch (err) {
    console.error('   ❌ Error:', err)
  }

  console.log('\n📝 Next steps:')
  console.log('1. If tables don\'t exist, run the migration in Supabase SQL Editor')
  console.log('2. If tables exist but are empty, check:')
  console.log('   - Is email confirmation required? (Check Supabase Auth settings)')
  console.log('   - Does the trigger exist? (Check Database → Functions)')
  console.log('   - Are there any errors in Supabase logs?')
}

checkDatabase()

