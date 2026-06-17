export type TaskStatus = 'pending' | 'in-progress' | 'done' | 'delayed'

export interface Task {
  id: string
  title: string
  deadline: string
  estimatedDays: number
  cost: number
  status: TaskStatus
  notes: string
  delayedBy: number
  tasks: Task[]
}

export interface Project {
  id: string
  title: string
  deadline: string
  notes: string
  tasks: Task[]
}

export interface FlatTask {
  projectId: string
  projectTitle: string
  taskId: string
  taskTitle: string
  deadline: string
  estimatedDays: number
  cost: number
  status: TaskStatus
  delayedBy: number
}
