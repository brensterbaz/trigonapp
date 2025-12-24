import { NRM2CMSManager } from '@/components/admin/nrm2-cms-manager'

export default function AdminNRM2Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">NRM2 CMS</h1>
        <p className="text-muted-foreground">
          Manage NRM2 rules - add subcategories and detail sections
        </p>
      </div>

      <NRM2CMSManager />
    </div>
  )
}
