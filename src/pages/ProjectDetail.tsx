import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus } from 'lucide-react'
import type { Project, Task } from '@/types'
import { rollupCosts } from '@/lib/rollupCosts'
import { propagateDeadlines } from '@/lib/propagateDeadlines'
import { updateTaskById, deleteTaskById, addSubtaskById } from '@/lib/utils'
import { DeadlineStatus } from '@/components/DeadlineStatus'
import { CostSummary } from '@/components/CostSummary'
import { TaskTree } from '@/components/TaskTree'
import { NotesPanel } from '@/components/NotesPanel'
import { ProjectFormModal } from '@/components/ProjectFormModal'
import { TaskFormModal } from '@/components/TaskFormModal'

interface ProjectDetailProps {
  projects: Project[]
  onProjectsChange: (projects: Project[]) => void
}

interface ContentProps {
  project: Project
  projects: Project[]
  onProjectsChange: (projects: Project[]) => void
}

function ProjectContent({ project, projects, onProjectsChange }: ContentProps) {
  const navigate = useNavigate()
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [addTaskOpen, setAddTaskOpen] = useState(false)

  const total = rollupCosts(project.tasks)
  const deadlines = propagateDeadlines(project)

  function handleTasksChange(tasks: Task[]) {
    onProjectsChange(projects.map(p => p.id === project.id ? { ...p, tasks } : p))
  }

  function onUpdateTask(updated: Task) {
    handleTasksChange(updateTaskById(project.tasks, updated))
  }

  function onDeleteTask(taskId: string) {
    handleTasksChange(deleteTaskById(project.tasks, taskId))
  }

  function onAddSubtask(parentId: string, newTask: Task) {
    handleTasksChange(addSubtaskById(project.tasks, parentId, newTask))
  }

  function handleProjectSave(updated: Project) {
    onProjectsChange(projects.map(p => p.id === updated.id ? updated : p))
    setProjectModalOpen(false)
  }

  function handleProjectDelete() {
    navigate('/dashboard')
    onProjectsChange(projects.filter(p => p.id !== project.id))
  }

  function handleAddTopLevelTask(task: Task) {
    handleTasksChange([...project.tasks, task])
    setAddTaskOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <button
          onClick={() => setProjectModalOpen(true)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Edit project"
        >
          <Pencil className="w-4 h-4" />
        </button>
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tasks</h2>
          <button
            onClick={() => setAddTaskOpen(true)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        </div>
        <TaskTree
          tasks={project.tasks}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onAddSubtask={onAddSubtask}
        />
      </div>

      {projectModalOpen && (
        <ProjectFormModal
          initial={project}
          onSave={handleProjectSave}
          onDelete={handleProjectDelete}
          onClose={() => setProjectModalOpen(false)}
        />
      )}

      {addTaskOpen && (
        <TaskFormModal
          onSave={handleAddTopLevelTask}
          onClose={() => setAddTaskOpen(false)}
        />
      )}
    </div>
  )
}

export function ProjectDetail({ projects, onProjectsChange }: ProjectDetailProps) {
  const { id } = useParams<{ id: string }>()
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Project not found.</p>
        <Link to="/dashboard" className="text-primary text-sm underline mt-2 inline-block">Back to dashboard</Link>
      </div>
    )
  }

  return <ProjectContent project={project} projects={projects} onProjectsChange={onProjectsChange} />
}
