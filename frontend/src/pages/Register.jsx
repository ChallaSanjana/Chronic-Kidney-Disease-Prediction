import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault()
    try {
      const { data } = await api.post('/auth/register', form)
      localStorage.setItem('token', data.token)
      navigate('/predict')
    } catch (err) { setError(err.response?.data?.error || 'Unable to register') }
  }
  return <div className="auth-page"><section className="card narrow"><a className="auth-brand" href="/login"><span className="brand-mark">+</span> RenalCare</a><h1>Create your account</h1><p className="muted">Start monitoring your kidney health.</p>
    <form onSubmit={submit}><label>Name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
      <label>Email<input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
      <label>Password<input type="password" minLength="8" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label>
      {error && <p className="error">{error}</p>}<button>Create account</button>
    </form><p className="muted">Already registered? <Link to="/login">Log in</Link></p>
  </section></div>
}
