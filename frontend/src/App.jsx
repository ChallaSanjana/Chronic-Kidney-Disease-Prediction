import { BrowserRouter, NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Predict from './pages/Predict'
import Result from './pages/Result'
import History from './pages/History'

function Layout() {
  return (
    <div className="app-shell">
      <header>
        <NavLink className="brand" to="/predict">RenalCare</NavLink>
        <nav>
          <NavLink to="/predict">Predict</NavLink>
          <NavLink to="/history">History</NavLink>
          <button type="button" className="link-button" onClick={() => {
            localStorage.removeItem('token')
            window.location.href = '/login'
          }}>Log out</button>
        </nav>
      </header>
      <main><Outlet /></main>
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
          <Route path="/predict" element={<Predict />} />
          <Route path="/result" element={<Result />} />
          <Route path="/history" element={<History />} />
        </Route>
        <Route path="*" element={<Navigate to="/predict" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
