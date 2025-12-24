import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, FolderOpen, Clock, TrendingUp, FileText, MapPin, Calendar, PoundSterling } from 'lucide-react'
import Link from 'next/link'
import type { Project } from '@/types/database'

export default async function DashboardPage() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error in dashboard page:', authError)
      redirect('/sign-in')
    }

    if (!user) {
      redirect('/sign-in')
    }

    // Fetch user's organization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, full_name')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
    }

    const organizationId = (profile as any)?.organization_id

    const { data: organization } = organizationId
      ? await supabase
          .from('organizations')
          .select('name, subscription_tier')
          .eq('id', organizationId)
          .maybeSingle()
      : { data: null }

    // Fetch projects
    const { data: projects, error: projectsError } = organizationId
      ? await supabase
          .from('projects')
          .select('*')
          .eq('organization_id', organizationId)
          .order('updated_at', { ascending: false })
          .limit(5)
      : { data: null, error: null }

    if (projectsError) {
      console.error('Projects fetch error:', projectsError)
    }

    // Fetch project stats
    const { data: allProjects, error: statsError } = organizationId
      ? await supabase
          .from('projects')
          .select('status')
          .eq('organization_id', organizationId)
      : { data: null, error: null }

    if (statsError) {
      console.error('Project stats fetch error:', statsError)
    }

  const inProgressProjects = allProjects?.filter(p => p.status === 'in_progress').length || 0
  const draftProjects = allProjects?.filter(p => p.status === 'draft').length || 0
  const readyProjects = allProjects?.filter(p => p.status === 'ready').length || 0
  const doneProjects = allProjects?.filter(p => p.status === 'done').length || 0

  const statusColors = {
    draft: 'bg-gray-500',
    ready: 'bg-blue-500',
    in_progress: 'bg-orange-500',
    done: 'bg-green-500',
    active: 'bg-orange-500', // Legacy
    tendered: 'bg-green-500', // Legacy
    archived: 'bg-gray-400', // Legacy
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return null
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      notation: 'compact',
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="text-muted-foreground">
          Manage your NRM2-compliant construction tender reports
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allProjects?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all statuses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{inProgressProjects}</div>
            <p className="text-xs text-muted-foreground">
              Currently working on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Start</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{readyProjects}</div>
            <p className="text-xs text-muted-foreground">
              Prepared for work
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{(organization as any)?.name || 'N/A'}</div>
            <p className="text-xs text-muted-foreground capitalize">
              {(organization as any)?.subscription_tier || 'free'} plan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Start working on your tenders</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/dashboard/projects/new">
              <Plus className="mr-2 h-5 w-5" />
              Create New Project
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard/nrm2-rules">
              <FileText className="mr-2 h-5 w-5" />
              Browse NRM2 Rules
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard/projects">
              <FolderOpen className="mr-2 h-5 w-5" />
              View All Projects
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      {projects && projects.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Your most recently updated projects</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/projects">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projects.map((project: Project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="block rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <Badge className={statusColors[project.status as keyof typeof statusColors] || statusColors.draft}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {project.code && (
                        <p className="text-xs text-muted-foreground font-mono">{project.code}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-muted-foreground ml-4">
                      <p>Updated</p>
                      <p className="font-medium">{formatDate(project.updated_at)}</p>
                    </div>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {/* Client */}
                    {project.client_name && (
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground truncate" title={project.client_name}>
                          {project.client_name}
                        </span>
                      </div>
                    )}

                    {/* Location */}
                    {project.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground truncate" title={project.location}>
                          {project.location}
                        </span>
                      </div>
                    )}

                    {/* Contract Value */}
                    {project.contract_value && (
                      <div className="flex items-center gap-1.5">
                        <PoundSterling className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground font-medium">
                          {formatCurrency(project.contract_value)}
                        </span>
                      </div>
                    )}

                    {/* Tender Deadline */}
                    {project.tender_deadline && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {formatDate(project.tender_deadline)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Breakdown Structure Badge */}
                  <div className="mt-3 pt-3 border-t">
                    <Badge variant="outline" className="text-xs">
                      {project.breakdown_structure === 'work_sectional' ? 'Work Sectional (NRM2)' : 'Elemental (NRM1)'}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
  } catch (error) {
    console.error('Dashboard page error:', error)
    // Return a simple error message
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Error</h1>
          <p className="text-muted-foreground">
            An error occurred while loading the dashboard. Please try refreshing the page.
          </p>
        </div>
      </div>
    )
  }
}
