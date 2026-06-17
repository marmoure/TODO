import { CalendarClock, CalendarX2, AlertTriangle } from 'lucide-react'
import { cn, formatDate, daysUntil } from '@/lib/utils'

interface DeadlineStatusProps {
  original: string
  current: string
  delayDays: number
}

export function DeadlineStatus({ original, current, delayDays }: DeadlineStatusProps) {
  const days = daysUntil(current)
  const isDelayed = delayDays > 0
  const isOverdue = days < 0
  const isDueSoon = days >= 0 && days <= 7

  return (
    <div className={cn(
      'flex flex-wrap items-center gap-4 rounded-lg border px-4 py-3 text-sm',
      isOverdue && 'border-red-500/40 bg-red-500/10',
      isDueSoon && !isOverdue && 'border-yellow-500/40 bg-yellow-500/10',
      !isOverdue && !isDueSoon && 'border-border bg-muted/30',
    )}>
      <div className="flex items-center gap-2">
        <CalendarClock className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">Original:</span>
        <span className="font-medium">{formatDate(original)}</span>
      </div>

      {isDelayed && (
        <div className="flex items-center gap-2">
          <CalendarX2 className={cn('w-4 h-4', isOverdue ? 'text-red-500' : 'text-yellow-500')} />
          <span className="text-muted-foreground">Current:</span>
          <span className={cn('font-medium', isOverdue ? 'text-red-500' : 'text-yellow-500')}>
            {formatDate(current)}
          </span>
          <span className="text-xs text-muted-foreground">(+{delayDays}d)</span>
        </div>
      )}

      {isOverdue && (
        <div className="flex items-center gap-1 text-red-500 text-xs font-medium">
          <AlertTriangle className="w-3 h-3" />
          Overdue by {Math.abs(days)} days
        </div>
      )}
      {isDueSoon && !isOverdue && (
        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 text-xs font-medium">
          <AlertTriangle className="w-3 h-3" />
          Due in {days} day{days !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
