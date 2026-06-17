import type { Project, Task, FlatTask } from '@/types'

function collectTasks(projectId: string, projectTitle: string, tasks: Task[]): FlatTask[] {
  return tasks.flatMap((task) => [
    {
      projectId,
      projectTitle,
      taskId: task.id,
      taskTitle: task.title,
      deadline: task.deadline,
      estimatedDays: task.estimatedDays,
      cost: task.cost,
      status: task.status,
      delayedBy: task.delayedBy,
    },
    ...collectTasks(projectId, projectTitle, task.tasks),
  ])
}

export function flattenTimeline(projects: Project[]): FlatTask[] {
  return projects
    .flatMap((p) => collectTasks(p.id, p.title, p.tasks))
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
}
