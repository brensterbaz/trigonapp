'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type SectionType = 'preliminary' | 'pre_work' | 'demolition' | 'main_work' | 'after_care'

interface ProjectSection {
  id: string
  name: string
  description: string | null
  code: string | null
  color_hex: string | null
  sort_order: number
  project_id: string
  section_type: SectionType | null
  created_at: string | null
  updated_at: string | null
}

interface SectionManagerProps {
  projectId: string
  sections: ProjectSection[]
  onSectionsChange: () => void
}

export function SectionManager({ projectId, sections, onSectionsChange }: SectionManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sectionType, setSectionType] = useState<SectionType>('main_work')
  const { toast } = useToast()

  const sectionTypeOptions: { value: SectionType; label: string; description: string }[] = [
    { value: 'preliminary', label: 'Preliminaries', description: 'Pre-project costs and setup' },
    { value: 'pre_work', label: 'Pre-Work', description: 'Work before main construction' },
    { value: 'demolition', label: 'Demolition', description: 'Demolition and site clearance' },
    { value: 'main_work', label: 'Main Work', description: 'Primary construction work' },
    { value: 'after_care', label: 'After Care', description: 'Post-construction maintenance' },
  ]

  const getSectionTypeLabel = (type: SectionType | null): string => {
    return sectionTypeOptions.find((opt) => opt.value === type)?.label || 'Main Work'
  }

  const getSectionTypeColor = (type: SectionType | null): string => {
    switch (type) {
      case 'preliminary':
      case 'pre_work':
        return 'bg-blue-100 text-blue-800'
      case 'demolition':
        return 'bg-red-100 text-red-800'
      case 'after_care':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateSection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const selectedSectionType = sectionType || 'main_work' // Ensure we always have a valid type
    
    // Validate section type is in allowed list
    const validTypes: SectionType[] = ['preliminary', 'pre_work', 'demolition', 'main_work', 'after_care']
    if (!validTypes.includes(selectedSectionType)) {
      toast({
        title: 'Error',
        description: `Invalid section type selected. Please select a valid type.`,
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }
    
    const data = {
      projectId,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      code: formData.get('code') as string,
      colorHex: (formData.get('colorHex') as string) || '#3B82F6', // Default to blue if not selected
      sectionType: selectedSectionType,
    }

    console.log('Creating section with data:', data) // Debug log

    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to create section')
      }

      toast({
        title: 'Section created',
        description: `${data.name} has been added to the project.`,
      })

      // Reset form
      setIsCreateOpen(false)
      setSectionType('main_work') // Reset to default
      if (e.currentTarget) {
        e.currentTarget.reset()
      }
      onSectionsChange()
    } catch (error) {
      console.error('Create section error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create section. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSection = async (sectionId: string, sectionName: string) => {
    if (!confirm(`Are you sure you want to delete "${sectionName}"? Items in this section will become unsectioned.`)) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/sections?sectionId=${sectionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete section')
      }

      toast({
        title: 'Section deleted',
        description: `${sectionName} has been removed.`,
      })

      onSectionsChange()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete section. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Indigo', value: '#6366F1' },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Project Sections</CardTitle>
            <CardDescription>
              Organize your project into sections like rooms or areas
            </CardDescription>
          </div>
          <Dialog 
            open={isCreateOpen} 
            onOpenChange={(open) => {
              setIsCreateOpen(open)
              if (!open) {
                // Reset form when dialog closes
                setSectionType('main_work')
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateSection}>
                <DialogHeader>
                  <DialogTitle>Create New Section</DialogTitle>
                  <DialogDescription>
                    Add a new section to organize your bill of quantities
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="sectionType">Section Type *</Label>
                    <Select value={sectionType} onValueChange={(value) => setSectionType(value as SectionType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select section type" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectionTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">{option.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Section Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., Bathroom, Pre-Work Setup, Demolition Phase 1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Section Code</Label>
                    <Input
                      id="code"
                      name="code"
                      placeholder="e.g., BTH-01, PRE-01, DEM-01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Optional description..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colorHex">Color</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {colorOptions.map((color) => (
                        <label
                          key={color.value}
                          className="relative flex cursor-pointer items-center gap-2 rounded-md border p-3 transition-all hover:border-primary hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-accent has-[:checked]:ring-2 has-[:checked]:ring-primary has-[:checked]:ring-offset-2"
                        >
                          <input
                            type="radio"
                            name="colorHex"
                            value={color.value}
                            defaultChecked={color.value === '#3B82F6'}
                            className="absolute h-0 w-0 opacity-0"
                          />
                          <div
                            className="h-8 w-8 rounded-full border-2 border-gray-200 shadow-sm"
                            style={{ backgroundColor: color.value }}
                          />
                          <span className="flex-1 text-sm font-medium">{color.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Section'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-semibold">No sections yet</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              Create sections to organize your bill of quantities by area
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Group sections by type */}
            {(['preliminary', 'pre_work', 'demolition', 'main_work', 'after_care'] as SectionType[]).map((type) => {
              const sectionsOfType = sections.filter((s) => (s.section_type || 'main_work') === type)
              if (sectionsOfType.length === 0) return null

              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <span>{getSectionTypeLabel(type)}</span>
                    <Badge variant="outline" className="text-xs">
                      {sectionsOfType.length}
                    </Badge>
                  </div>
                  {sectionsOfType
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div
                      className="h-8 w-8 rounded-full"
                      style={{ backgroundColor: section.color_hex || '#3B82F6' }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{section.name}</p>
                        <Badge className={`text-xs ${getSectionTypeColor(section.section_type)}`}>
                          {getSectionTypeLabel(section.section_type)}
                        </Badge>
                        {section.code && (
                          <Badge variant="outline" className="text-xs">
                            {section.code}
                          </Badge>
                        )}
                      </div>
                      {section.description && (
                        <p className="text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleDeleteSection(section.id, section.name)
                      }
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                    ))}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

