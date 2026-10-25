import { useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import './App.css'
import api from './api'
import { LanguageProvider, useLanguage } from './i18n.jsx'
import { ThemeProvider, useTheme } from './Theme.jsx'
import Login from './pages/Login'
import Register from './pages/Register'
import Predict from './pages/Predict'
import Result from './pages/Result'
import History from './pages/History'
import Dashboard from './pages/Dashboard'
import Insights from './pages/Insights'
import Education from './pages/Education'
import Settings from './pages/Settings'

function Avatar({ profile, className = '' }) {
  return <span className={`profile-avatar ${className}`}>{profile?.name?.charAt(0).toUpperCase() || '?'}</span>
}

function Layout() {
  const [profile, setProfile] = useState(null)
  const { language, setLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const loadProfile = () => api.get('/auth/me').then(({ data }) => setProfile(data.user)).catch(() => {})
    loadProfile()
    return undefined
  }, [])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink className="brand" to="/dashboard"><span className="brand-mark">+</span><span>Renal<span>Care</span></span></NavLink>
        <p className="sidebar-label">Workspace</p>
        <nav className="side-nav">
          <NavLink to="/dashboard"><span className="nav-icon">◈</span> Dashboard</NavLink>
          <NavLink to="/predict"><span className="nav-icon">⌁</span> New screening</NavLink>
          <NavLink to="/history"><span className="nav-icon">◷</span> My history</NavLink>
          <NavLink to="/insights"><span className="nav-icon">⌁</span> Health insights</NavLink>
          <NavLink to="/education"><span className="nav-icon">?</span> Kidney education</NavLink>
        </nav>
        <div className="sidebar-bottom">
          <NavLink to="/settings"><Avatar profile={profile} /> Profile & settings</NavLink>
          <button type="button" className="logout-button" onClick={() => {
            localStorage.removeItem('token')
            window.location.href = '/login'
          }}>Sign out</button>
        </div>
      </aside>
      <div className="content-shell">
        <header className="topbar">
          <div><span className="eyebrow">PERSONAL HEALTH WORKSPACE</span><strong>Kidney health screening</strong></div>
          <div className="header-controls"><label className="language-switcher">Language<select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="en">English</option><option value="te">తెలుగు</option></select></label><button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>{theme === 'light' ? '☾ Dark' : '☀ Light'}</button></div>
        </header>
        <main><Outlet /></main>
      </div>
    </div>
  )
}

function ProtectedApp() {
  const token = localStorage.getItem('token')
  return token ? <Layout /> : <Navigate to="/login" replace />
}

function App() {
  return (
    <ThemeProvider><LanguageProvider><BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedApp />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/education" element={<Education />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/result" element={<Result />} />
          <Route path="/history" element={<History />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter></LanguageProvider></ThemeProvider>
  )
}

export default App
