import { Link } from 'react-router-dom'
import { CalendarDays, Clock, ArrowLeft } from 'lucide-react'
import type { Project } from '@/types'
import { flattenTimeline } from '@/lib/flattenTimeline'
import { cn, formatDate, daysUntil } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  delayed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

interface TimelineProps {
  projects: Project[]
}

export function Timeline({ projects }: TimelineProps) {
  const tasks = flattenTimeline(projects)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold">Timeline</h1>
      </div>

      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-sm">No tasks found.</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const days = daysUntil(task.deadline)
            const isOverdue = days < 0 && task.status !== 'done'
            const isDueSoon = days >= 0 && days <= 7 && task.status !== 'done'

            return (
              <Link
                key={`${task.projectId}-${task.taskId}`}
                to={`/project/${task.projectId}`}
                className={cn(
                  'flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 hover:shadow-sm transition-shadow bg-card text-sm',
                  isOverdue && 'border-red-500/40',
                  isDueSoon && !isOverdue && 'border-yellow-500/40',
                  !isOverdue && !isDueSoon && 'border-border',
                  task.status === 'done' && 'opacity-50',
                )}
              >
                <div className="flex-1 min-w-0">
                  <span className={cn('font-medium', task.status === 'done' && 'line-through')}>
                    {task.taskTitle}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">— {task.projectTitle}</span>
                </div>

                <span className={cn('text-xs rounded-full px-2 py-0.5 font-medium shrink-0', STATUS_STYLES[task.status])}>
                  {task.status}
                </span>

                <div className={cn(
                  'flex items-center gap-1 text-xs shrink-0',
                  isOverdue ? 'text-red-500' : isDueSoon ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground',
                )}>
                  <CalendarDays className="w-3 h-3" />
                  {formatDate(task.deadline)}
                  {task.delayedBy > 0 && <span className="text-red-400 ml-1">+{task.delayedBy}d</span>}
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock className="w-3 h-3" />
                  {task.estimatedDays}d
                </div>

                {task.cost > 0 && (
                  <div className="text-xs text-muted-foreground shrink-0 tabular-nums">
                    {task.cost.toLocaleString('fr-DZ')} DZD
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
