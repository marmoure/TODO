import { DollarSign } from 'lucide-react'

interface CostSummaryProps {
  total: number
  label?: string
}

export function CostSummary({ total, label = 'Total Cost' }: CostSummaryProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3">
      <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="font-semibold tabular-nums">
        {total.toLocaleString('fr-DZ')} DZD
      </span>
    </div>
  )
}
