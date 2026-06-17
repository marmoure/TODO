import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { Project } from '@/types'
import { rollupCosts } from '@/lib/rollupCosts'
import { propagateDeadlines } from '@/lib/propagateDeadlines'
import { DeadlineStatus } from '@/components/DeadlineStatus'
import { CostSummary } from '@/components/CostSummary'
import { TaskTree } from '@/components/TaskTree'
import { NotesPanel } from '@/components/NotesPanel'

interface ProjectDetailProps {
  projects: Project[]
}

export function ProjectDetail({ projects }: ProjectDetailProps) {
  const { id } = useParams<{ id: string }>()
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Project not found.</p>
        <Link to="/" className="text-primary text-sm underline mt-2 inline-block">Back to dashboard</Link>
      </div>
    )
  }

  const total = rollupCosts(project.tasks)
  const deadlines = propagateDeadlines(project)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold">{project.title}</h1>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-64">
          <DeadlineStatus
            original={deadlines.original}
            current={deadlines.current}
            delayDays={deadlines.delayDays}
          />
        </div>
        <div className="shrink-0">
          <CostSummary total={total} />
        </div>
      </div>

      {project.notes && <NotesPanel notes={project.notes} />}

      <div className="rounded-xl border border-border p-4 bg-card">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Tasks</h2>
        <TaskTree tasks={project.tasks} />
      </div>
    </div>
  )
}
