import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import type { Project } from '@/types'
import { Dashboard } from '@/pages/Dashboard'
import { ProjectDetail } from '@/pages/ProjectDetail'
import { Timeline } from '@/pages/Timeline'
import { ThemeToggle } from '@/components/ThemeToggle'
import { FileLoader } from '@/components/FileLoader'
import { LayoutDashboard, CalendarRange, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const { pathname } = useLocation()
  const active = pathname === to || (to !== '/' && pathname.startsWith(to))
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors',
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
      )}
    >
      {children}
    </Link>
  )
}

function AppShell({ projects, onChangeFile }: { projects: Project[]; onChangeFile: () => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="font-bold text-base tracking-tight">LifeTracker</Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/"><LayoutDashboard className="w-3.5 h-3.5" />Dashboard</NavLink>
            <NavLink to="/timeline"><CalendarRange className="w-3.5 h-3.5" />Timeline</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={onChangeFile}
              title="Load a different file"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Change file
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard projects={projects} />} />
          <Route path="/project/:id" element={<ProjectDetail projects={projects} />} />
          <Route path="/timeline" element={<Timeline projects={projects} />} />
        </Routes>
      </main>
    </div>
  )
}

function loadCached(): Project[] | null {
  try {
    const raw = sessionStorage.getItem('lifetracker-data')
    return raw ? (JSON.parse(raw) as Project[]) : null
  } catch {
    return null
  }
}

export default function App() {
  const [projects, setProjects] = useState<Project[] | null>(loadCached)

  function handleLoad(data: Project[]) {
    sessionStorage.setItem('lifetracker-data', JSON.stringify(data))
    setProjects(data)
  }

  function handleChangeFile() {
    sessionStorage.removeItem('lifetracker-data')
    setProjects(null)
  }

  if (projects === null) {
    return <FileLoader onLoad={handleLoad} />
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppShell projects={projects} onChangeFile={handleChangeFile} />
    </BrowserRouter>
  )
}
