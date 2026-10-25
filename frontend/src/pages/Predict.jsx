import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const numericFields = [
  { name: 'age', step: '1' },
  { name: 'bp', step: '1' },
  { name: 'sg', step: '0.01' },
  { name: 'al', step: '1' },
  { name: 'su', step: '1' },
  { name: 'bgr', step: '0.1' },
  { name: 'bu', step: '0.1' },
  { name: 'sc', step: '0.1' },
  { name: 'sod', step: '0.1' },
  { name: 'pot', step: '0.1' },
  { name: 'hemo', step: '0.1' },
  { name: 'pcv', step: '0.1' },
  { name: 'wc', step: '1' },
  { name: 'rc', step: '0.1' },
]

const categoricalFields = [
  { name: 'rbc', options: ['normal', 'abnormal'] },
  { name: 'pc', options: ['normal', 'abnormal'] },
  { name: 'pcc', options: ['present', 'notpresent'] },
  { name: 'ba', options: ['present', 'notpresent'] },
  { name: 'htn', options: ['yes', 'no'] },
  { name: 'dm', options: ['yes', 'no'] },
  { name: 'cad', options: ['yes', 'no'] },
  { name: 'appet', options: ['good', 'poor'] },
  { name: 'pe', options: ['yes', 'no'] },
  { name: 'ane', options: ['yes', 'no'] },
]

const fields = [...numericFields, ...categoricalFields]
const initial = Object.fromEntries(fields.map(({ name }) => [name, '']))

export default function Predict() {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const submit = async (event) => {
    event.preventDefault()
    try { const { data } = await api.post('/predict', form); navigate('/result', { state: data }) }
    catch (err) { setError(err.response?.data?.error || 'Prediction service is unavailable') }
  }
  return <section className="card"><h1>Kidney health prediction</h1><p className="muted">Enter available patient values. All fields are optional; missing values are handled automatically.</p>
    <form onSubmit={submit}><div className="grid">
      {numericFields.map(({ name, step }) => <label key={name}>{name.toUpperCase()}
        <input type="number" step={step} inputMode="decimal" value={form[name]} placeholder="Optional" onChange={e => setForm({ ...form, [name]: e.target.value })} />
      </label>)}
      {categoricalFields.map(({ name, options }) => <label key={name}>{name.toUpperCase()}
        <select value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })}>
          <option value="">Optional</option>
          {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>)}
    </div>
      {error && <p className="error">{error}</p>}<button>Run prediction</button>
    </form>
  </section>
}
