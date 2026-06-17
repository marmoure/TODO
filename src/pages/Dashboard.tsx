import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Project } from '@/types'
import { ProjectCard } from '@/components/ProjectCard'
import { ProjectFormModal } from '@/components/ProjectFormModal'
import { rollupCosts } from '@/lib/rollupCosts'
import { propagateDeadlines } from '@/lib/propagateDeadlines'
import { flattenTimeline } from '@/lib/flattenTimeline'
import { formatDate } from '@/lib/utils'
import { CalendarDays } from 'lucide-react'

type ModalState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; project: Project }

interface DashboardProps {
  projects: Project[]
  onProjectsChange: (projects: Project[]) => void
}

export function Dashboard({ projects, onProjectsChange }: DashboardProps) {
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })

  const grandTotal = projects.reduce((sum, p) => sum + rollupCosts(p.tasks), 0)

  const nextDeadlineTask = flattenTimeline(projects)
    .filter((t) => t.status !== 'done' && new Date(t.deadline) >= new Date())
    .at(0)

  const delayedProjects = projects.filter((p) => {
    const { delayDays } = propagateDeadlines(p)
    return delayDays > 0
  })

  function handleSave(project: Project) {
    onProjectsChange(
      modal.mode === 'create'
        ? [...projects, project]
        : projects.map(p => p.id === project.id ? project : p),
    )
    setModal({ mode: 'closed' })
  }

  function handleDelete() {
    if (modal.mode !== 'edit') return
    onProjectsChange(projects.filter(p => p.id !== modal.project.id))
    setModal({ mode: 'closed' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <button
          onClick={() => setModal({ mode: 'create' })}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

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
        <p className="text-muted-foreground text-sm">No projects yet. Create one to get started.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => setModal({ mode: 'edit', project })}
            />
          ))}
        </div>
      )}

      {modal.mode !== 'closed' && (
        <ProjectFormModal
          initial={modal.mode === 'edit' ? modal.project : undefined}
          onSave={handleSave}
          onDelete={modal.mode === 'edit' ? handleDelete : undefined}
          onClose={() => setModal({ mode: 'closed' })}
        />
      )}
    </div>
  )
}
