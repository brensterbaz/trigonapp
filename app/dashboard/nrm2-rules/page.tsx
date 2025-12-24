import { RuleSelector } from '@/components/nrm2/rule-selector'

export default function NRM2RulesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">NRM2 Rules</h1>
        <p className="text-muted-foreground">
          Browse and select NRM2 measurement rules for your Bill of Quantities
        </p>
      </div>

      <RuleSelector />
    </div>
  )
}

