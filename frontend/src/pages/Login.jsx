import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault()
    try {
      const { data } = await api.post('/auth/login', form)
      localStorage.setItem('token', data.token)
      navigate('/predict')
    } catch (err) { setError(err.response?.data?.error || 'Unable to log in') }
  }
  return <div className="auth-page"><section className="card narrow"><a className="auth-brand" href="/login"><span className="brand-mark">+</span> RenalCare</a><h1>Welcome back</h1><p className="muted">Sign in to continue your health screening.</p>
    <form onSubmit={submit}><label>Email<input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
      <label>Password<input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label>
      {error && <p className="error">{error}</p>}<button>Log in</button>
    </form><p className="muted">New here? <Link to="/register">Create an account</Link></p>
  </section></div>
}
