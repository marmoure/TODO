import type { Task } from '@/types'

export function rollupCosts(tasks: Task[]): number {
  return tasks.reduce((sum, task) => {
    return sum + task.cost + rollupCosts(task.tasks)
  }, 0)
}
