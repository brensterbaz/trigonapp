'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200, 'Name too long'),
  code: z.string().max(50, 'Code too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  breakdown_structure: z.enum(['elemental', 'work_sectional']),
  status: z.enum(['draft', 'ready', 'in_progress', 'done']),
  client_name: z.string().max(200, 'Client name too long').optional(),
  location: z.string().max(500, 'Location too long').optional(),
  contract_value: z.string().optional(),
  tender_deadline: z.string().optional(),
})

type ProjectFormData = z.infer<typeof projectSchema>

export function CreateProjectForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      breakdown_structure: 'work_sectional',
      status: 'draft',
      client_name: '',
      location: '',
      contract_value: '',
      tender_deadline: '',
    },
  })

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Convert contract_value to number if provided
      const payload = {
        ...data,
        contract_value: data.contract_value ? parseFloat(data.contract_value) : null,
        tender_deadline: data.tender_deadline || null,
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project')
      }

      // Redirect to the new project page
      router.push(`/dashboard/projects/${result.project.id}`)
      router.refresh()
    } catch (err) {
      console.error('Create project error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>
          Set up a new tender project with NRM2 Bill of Quantities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Project Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Office Block Refurbishment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PRJ-2024-001" {...field} />
                    </FormControl>
                    <FormDescription>Optional reference code</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief project description..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              {/* Breakdown Structure */}
              <FormField
                control={form.control}
                name="breakdown_structure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breakdown Structure *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="work_sectional">
                          Work Sectional (NRM2 Trade Sections)
                        </SelectItem>
                        <SelectItem value="elemental">
                          Elemental (NRM1 Building Elements)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Work Sectional groups by trade (Masonry, Carpentry, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">
                          📝 Draft - Just started
                        </SelectItem>
                        <SelectItem value="ready">
                          ✅ Ready - Prepared for work
                        </SelectItem>
                        <SelectItem value="in_progress">
                          🚧 In Progress - Actively working
                        </SelectItem>
                        <SelectItem value="done">
                          ✔️ Done - Completed
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      You can change this later
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Client Name */}
              <FormField
                control={form.control}
                name="client_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Client or contractor name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Site address or region" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Contract Value */}
              <FormField
                control={form.control}
                name="contract_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Contract Value (£)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 250000.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tender Deadline */}
              <FormField
                control={form.control}
                name="tender_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tender Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

