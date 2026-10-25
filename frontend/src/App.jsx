import { BrowserRouter, NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Predict from './pages/Predict'
import Result from './pages/Result'
import History from './pages/History'
import Dashboard from './pages/Dashboard'
import Insights from './pages/Insights'

function Layout() {
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
        </nav>
        <div className="sidebar-bottom">
          <div className="secure-note"><span className="secure-dot" /> Secure session</div>
          <button type="button" className="logout-button" onClick={() => {
            localStorage.removeItem('token')
            window.location.href = '/login'
          }}>Sign out</button>
        </div>
      </aside>
      <div className="content-shell">
        <header className="topbar">
          <div><span className="eyebrow">PERSONAL HEALTH WORKSPACE</span><strong>Kidney health screening</strong></div>
          <div className="topbar-status"><span className="status-pulse" /> Model ready</div>
        </header>
        <main><Outlet /></main>
      </div>
      <footer className="disclaimer" role="note">
        This tool is a screening aid for educational purposes and not a medical diagnosis.
        Please consult a qualified healthcare professional for medical advice.
      </footer>
    </div>
  )
}

function ProtectedApp() {
  const token = localStorage.getItem('token')
  return token ? <Layout /> : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedApp />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/result" element={<Result />} />
          <Route path="/history" element={<History />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
