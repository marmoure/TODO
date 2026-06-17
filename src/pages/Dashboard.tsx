import type { Project } from '@/types'
import { ProjectCard } from '@/components/ProjectCard'
import { rollupCosts } from '@/lib/rollupCosts'
import { propagateDeadlines } from '@/lib/propagateDeadlines'
import { flattenTimeline } from '@/lib/flattenTimeline'
import { formatDate } from '@/lib/utils'
import { CalendarDays } from 'lucide-react'

interface DashboardProps {
  projects: Project[]
}

export function Dashboard({ projects }: DashboardProps) {
  const grandTotal = projects.reduce((sum, p) => sum + rollupCosts(p.tasks), 0)

  const nextDeadlineTask = flattenTimeline(projects)
    .filter((t) => t.status !== 'done' && new Date(t.deadline) >= new Date())
    .at(0)

  const delayedProjects = projects.filter((p) => {
    const { delayDays } = propagateDeadlines(p)
    return delayDays > 0
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-48 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Grand Total Cost</p>
          <p className="font-semibold tabular-nums">{grandTotal.toLocaleString('fr-DZ')} DZD</p>
        </div>
        {nextDeadlineTask && (
          <div className="flex-1 min-w-48 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">Next Deadline</p>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-semibold text-sm">{nextDeadlineTask.taskTitle}</p>
                <p className="text-xs text-muted-foreground">{nextDeadlineTask.projectTitle} · {formatDate(nextDeadlineTask.deadline)}</p>
              </div>
            </div>
          </div>
        )}
        {delayedProjects.length > 0 && (
          <div className="flex-1 min-w-48 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
            <p className="text-xs text-red-500 mb-1">Delayed Projects</p>
            <p className="font-semibold text-red-500">{delayedProjects.length}</p>
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        <p className="text-muted-foreground text-sm">No projects found. Make sure your data.json contains a valid array of projects.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
