import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight } from 'lucide-react'
import type { Project } from '@/types'
import { rollupCosts } from '@/lib/rollupCosts'
import { propagateDeadlines } from '@/lib/propagateDeadlines'
import { cn, formatDate, daysUntil } from '@/lib/utils'

interface ProjectCardProps {
  project: Project
}

function countTasks(tasks: Project['tasks']): { total: number; done: number } {
  return tasks.reduce(
    (acc, t) => {
      const child = countTasks(t.tasks)
      return {
        total: acc.total + 1 + child.total,
        done: acc.done + (t.status === 'done' ? 1 : 0) + child.done,
      }
    },
    { total: 0, done: 0 },
  )
}

export function ProjectCard({ project }: ProjectCardProps) {
  const total = rollupCosts(project.tasks)
  const { original, current, delayDays } = propagateDeadlines(project)
  const { total: taskCount, done: doneCount } = countTasks(project.tasks)
  const progress = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0
  const days = daysUntil(current)
  const isOverdue = days < 0
  const isDueSoon = days >= 0 && days <= 7

  return (
    <Link
      to={`/project/${project.id}`}
      className={cn(
        'block rounded-xl border p-5 hover:shadow-md transition-shadow bg-card',
        isOverdue && 'border-red-500/40',
        isDueSoon && !isOverdue && 'border-yellow-500/40',
        !isOverdue && !isDueSoon && 'border-border',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h2 className="font-semibold text-base leading-tight">{project.title}</h2>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <CalendarDays className="w-3.5 h-3.5" />
        <span className={cn(isOverdue ? 'text-red-500' : isDueSoon ? 'text-yellow-600 dark:text-yellow-400' : '')}>
          {formatDate(current)}
        </span>
        {delayDays > 0 && (
          <span className="text-xs text-muted-foreground line-through">{formatDate(original)}</span>
        )}
        {delayDays > 0 && (
          <span className="text-xs text-red-400">+{delayDays}d delayed</span>
        )}
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{doneCount}/{taskCount} tasks done</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="text-xs text-muted-foreground tabular-nums">
        {total.toLocaleString('fr-DZ')} DZD
      </div>
    </Link>
  )
}
