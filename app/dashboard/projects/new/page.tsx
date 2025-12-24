import { CreateProjectForm } from '@/components/projects/create-project-form'

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
        <p className="text-muted-foreground">
          Create a new tender project with NRM2 Bill of Quantities
        </p>
      </div>

      <CreateProjectForm />
    </div>
  )
}

