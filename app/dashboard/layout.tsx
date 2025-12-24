import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error in dashboard layout:', authError)
      redirect('/sign-in')
    }

    if (!user) {
      redirect('/sign-in')
    }

    // Fetch user profile to get name
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
    }

    // If profile doesn't exist, try to create it (trigger might have failed)
    // This is a fallback in case the database trigger didn't fire
    if (!profile && !profileError) {
      try {
        // Create organization first
        const orgName = user.user_metadata?.organization_name || 'My Organization'
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: orgName,
            subscription_tier: 'free',
          } as any)
          .select('id')
          .single()

        // Create profile if organization was created
        if (!orgError && newOrg) {
          await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              organization_id: (newOrg as any).id,
              full_name: user.user_metadata?.full_name || null,
            } as any)
        }
      } catch (createError) {
        console.error('Error creating profile/organization:', createError)
        // Continue rendering even if profile creation fails
      }
    }

    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden lg:ml-0">
          <Header userEmail={user.email} userName={(profile as any)?.full_name || undefined} />
          <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6 pt-16 lg:pt-6">
            {children}
          </main>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Dashboard layout error:', error)
    // Redirect to sign-in on error
    redirect('/sign-in')
  }
}

