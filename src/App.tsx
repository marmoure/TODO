import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import type { Project } from '@/types'
import { Calendar } from '@/pages/Calendar'
import { Dashboard } from '@/pages/Dashboard'
import { ProjectDetail } from '@/pages/ProjectDetail'
import { Timeline } from '@/pages/Timeline'
import { ThemeToggle } from '@/components/ThemeToggle'
import { PasswordGate } from '@/components/PasswordGate'
import { CalendarDays, LayoutDashboard, CalendarRange, Download } from 'lucide-react'
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

function AppShell({
  projects,
  onProjectsChange,
}: {
  projects: Project[]
  onProjectsChange: (updated: Project[]) => void
}) {
  function handleDownload() {
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lifetracker-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="font-bold text-base tracking-tight">LifeTracker</Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/"><CalendarDays className="w-3.5 h-3.5" />Calendar</NavLink>
            <NavLink to="/dashboard"><LayoutDashboard className="w-3.5 h-3.5" />Dashboard</NavLink>
            <NavLink to="/timeline"><CalendarRange className="w-3.5 h-3.5" />Timeline</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              title="Download data as JSON"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Save JSON
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Calendar projects={projects} />} />
          <Route path="/dashboard" element={<Dashboard projects={projects} onProjectsChange={onProjectsChange} />} />
          <Route path="/project/:id" element={<ProjectDetail projects={projects} onProjectsChange={onProjectsChange} />} />
          <Route path="/timeline" element={<Timeline projects={projects} />} />
        </Routes>
      </main>
    </div>
  )
}

function isAuthenticated(): boolean {
  return sessionStorage.getItem('lifetracker-auth') === '1'
}

export default function App() {
  const [authed, setAuthed] = useState<boolean>(isAuthenticated)
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (!authed || projects !== null) return
    fetch(import.meta.env.BASE_URL + 'data.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: Project[]) => {
        setProjects(data)
      })
      .catch(() => setFetchError('Could not load data.json. Make sure it exists on the server.'))
  }, [authed, projects])

  function handleProjectsChange(updated: Project[]) {
    setProjects(updated)
  }

  if (!authed) {
    return <PasswordGate onAuthenticated={() => setAuthed(true)} />
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="w-full max-w-sm px-6 py-8 rounded-xl border border-border bg-card shadow-sm text-center">
          <p className="text-sm text-red-500">{fetchError}</p>
        </div>
      </div>
    )
  }

  if (projects === null) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppShell projects={projects} onProjectsChange={handleProjectsChange} />
    </BrowserRouter>
  )
}
