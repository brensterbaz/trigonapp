import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Plus, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BQTable } from '@/components/projects/bq-table'
import { AddBQItemDialog } from '@/components/projects/add-bq-item-dialog'
import { ExportButton } from '@/components/projects/export-button'
import { CostDashboard } from '@/components/projects/cost-dashboard'
import { StatusUpdater } from '@/components/projects/status-updater'
import { EditProjectDialog } from '@/components/projects/edit-project-dialog'
import { DeleteProjectButton } from '@/components/projects/delete-project-button'
import { SectionManager } from '@/components/projects/section-manager'
import { SectionSummaryView } from '@/components/projects/section-summary-view'
import { ProjectSectionsWrapper } from '@/components/projects/project-sections-wrapper'
import type { Project } from '@/types/database'

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Fetch project
  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (projectError || !projectData) {
    notFound()
  }

  const project = projectData as Project

  // Fetch project sections
  const { data: sectionsData } = await supabase
    .from('project_sections')
    .select('*')
    .eq('project_id', params.id)
    .order('sort_order', { ascending: true })

  const sections = sectionsData || []

  // Fetch BQ items with NRM rule details and project sections
  const { data: bqItems } = await supabase
    .from('bill_of_quantities')
    .select(`
      *,
      nrm_rules!inner(
        id,
        path,
        content,
        unit,
        coverage_rules,
        section_id,
        nrm_sections!inner(
          code,
          title
        )
      ),
      project_sections(
        id,
        name,
        code,
        color_hex
      )
    `)
    .eq('project_id', params.id)
    .order('sort_order', { ascending: true })

  const statusColors = {
    draft: 'bg-gray-500',
    ready: 'bg-blue-500',
    in_progress: 'bg-orange-500',
    done: 'bg-green-500',
    active: 'bg-orange-500', // Legacy
    tendered: 'bg-green-500', // Legacy
    archived: 'bg-gray-400', // Legacy
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return '£0.00'
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(value)
  }

  // Calculate totals
  const totalQuantity = bqItems?.reduce((sum, item: any) => sum + (item.quantity || 0), 0) || 0
  const totalAmount = bqItems?.reduce((sum, item: any) => sum + (item.amount || 0), 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/projects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                <Badge className={statusColors[project.status as keyof typeof statusColors] || statusColors.draft}>
                  {project.status}
                </Badge>
              </div>
              {project.code && (
                <p className="text-sm text-muted-foreground">{project.code}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <EditProjectDialog project={project} />
          <ExportButton projectId={project.id} projectCode={project.code || 'project'} />
          <DeleteProjectButton 
            projectId={project.id} 
            projectName={project.name}
            variant="destructive"
            size="default"
          />
        </div>
      </div>

      {/* Status Updater */}
      <Card>
        <CardContent className="pt-6">
          <StatusUpdater 
            projectId={project.id} 
            currentStatus={project.status as 'draft' | 'ready' | 'in_progress' | 'done'} 
          />
        </CardContent>
      </Card>

      {/* Project Details Card */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {project.client_name && (
              <div>
                <p className="text-muted-foreground">Client</p>
                <p className="font-medium">{project.client_name}</p>
              </div>
            )}
            {project.location && (
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">{project.location}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Breakdown</p>
              <p className="font-medium capitalize">{project.breakdown_structure.replace('_', ' ')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">BQ Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{bqItems?.length || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Estimated Value</p>
              <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {project.tender_deadline && (
              <div>
                <p className="text-muted-foreground">Tender Deadline</p>
                <p className="font-medium">
                  {new Date(project.tender_deadline).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">
                {new Date(project.created_at).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Dashboard */}
      {bqItems && bqItems.length > 0 && (
        <CostDashboard items={bqItems as any} sections={sections} />
      )}

      {/* Project Sections */}
      <ProjectSectionsWrapper projectId={project.id} initialSections={sections as any} />

      {/* Bill of Quantities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bill of Quantities</CardTitle>
              <CardDescription>
                Measured items grouped by NRM2 work sections
              </CardDescription>
            </div>
            <AddBQItemDialog projectId={project.id} />
          </div>
        </CardHeader>
        <CardContent>
          {!bqItems || bqItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No items yet</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Add your first measured item from the NRM2 rules
              </p>
              <AddBQItemDialog projectId={project.id} />
            </div>
          ) : (
            <BQTable items={bqItems} projectId={project.id} sections={sections} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

