import type { Project, Task } from '@/types'
import { addDays } from '@/lib/utils'

function maxDelay(tasks: Task[]): number {
  return tasks.reduce((max, task) => {
    const childMax = maxDelay(task.tasks)
    return Math.max(max, task.delayedBy, childMax)
  }, 0)
}

export function propagateDeadlines(project: Project): { original: string; current: string; delayDays: number } {
  const delayDays = maxDelay(project.tasks)
  return {
    original: project.deadline,
    current: delayDays > 0 ? addDays(project.deadline, delayDays) : project.deadline,
    delayDays,
  }
}
