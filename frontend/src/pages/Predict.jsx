import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { extractReport } from '../reportExtraction'

const numericFields = [
  { name: 'age', label: 'Age', step: '1' }, { name: 'bp', label: 'Blood pressure', step: '1' },
  { name: 'sg', label: 'Specific gravity', step: '0.01' }, { name: 'al', label: 'Albumin', step: '1' },
  { name: 'su', label: 'Sugar', step: '1' }, { name: 'bgr', label: 'Blood glucose', step: '0.1' },
  { name: 'bu', label: 'Blood urea', step: '0.1' }, { name: 'sc', label: 'Serum creatinine', step: '0.1' },
  { name: 'sod', label: 'Sodium', step: '0.1' }, { name: 'pot', label: 'Potassium', step: '0.1' },
  { name: 'hemo', label: 'Hemoglobin', step: '0.1' }, { name: 'pcv', label: 'Packed cell volume', step: '0.1' },
  { name: 'wc', label: 'White cell count', step: '1' }, { name: 'rc', label: 'Red cell count', step: '0.1' },
]

const categoricalFields = [
  { name: 'rbc', label: 'Red blood cells', options: ['normal', 'abnormal'] },
  { name: 'pc', label: 'Pus cell', options: ['normal', 'abnormal'] },
  { name: 'pcc', label: 'Pus cell clumps', options: ['present', 'notpresent'] },
  { name: 'ba', label: 'Bacteria', options: ['present', 'notpresent'] },
  { name: 'htn', label: 'Hypertension', options: ['yes', 'no'] },
  { name: 'dm', label: 'Diabetes mellitus', options: ['yes', 'no'] },
  { name: 'cad', label: 'Coronary artery disease', options: ['yes', 'no'] },
  { name: 'appet', label: 'Appetite', options: ['good', 'poor'] },
  { name: 'pe', label: 'Pedal edema', options: ['yes', 'no'] },
  { name: 'ane', label: 'Anemia', options: ['yes', 'no'] },
]

const allFields = [...numericFields, ...categoricalFields]
const initial = Object.fromEntries(allFields.map(({ name }) => [name, '']))

function Field({ definition, value, onChange }) {
  const { label, step, options } = definition
  return <label>{label}
    {options ? <select value={value} onChange={onChange}>
      <option value="">Not provided</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select> : <input type="number" step={step} inputMode="decimal" value={value} placeholder="Not provided" onChange={onChange} />}
  </label>
}

export default function Predict() {
  const [form, setForm] = useState(initial)
  const [mode, setMode] = useState('manual')
  const [reportName, setReportName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ocrStatus, setOcrStatus] = useState('')
  const [extractedText, setExtractedText] = useState('')
  const navigate = useNavigate()

  const update = (name) => (event) => setForm({ ...form, [name]: event.target.value })
  const handleReport = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const isPdf = file.type === 'application/pdf' && file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setReportName('')
      setError('Please upload a PDF lab report. Images and other file formats are not supported.')
      setOcrStatus('')
      event.target.value = ''
      return
    }
    setReportName(file.name)
    setError('')
    setOcrStatus('Preparing OCR…')
    try {
      const result = await extractReport(file, (status, progress) => {
        setOcrStatus(`${status} ${progress ? `${Math.round(progress * 100)}%` : ''}`.trim())
      })
      setForm((current) => ({ ...current, ...result.values }))
      setExtractedText(result.text)
      setOcrStatus('Values extracted — review them below before running the screening.')
      setMode('manual')
    } catch (err) {
      setError(err.message || 'Unable to read this report. You can enter values manually.')
      setOcrStatus('')
    }
  }
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/predict', form)
      navigate('/result', { state: data })
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction service is unavailable')
    } finally {
      setLoading(false)
    }
  }

  return <div>
    <div className="page-title">
      <span className="eyebrow">NEW SCREENING</span>
      <h1>Let’s understand your kidney health.</h1>
      <p className="muted">Add the values you have from a recent report. Every field is optional, and your results are generated using the CKD screening model.</p>
    </div>
    <section className="card form-card">
      <div className="mode-switch">
        <button type="button" className={mode === 'manual' ? 'active' : ''} onClick={() => setMode('manual')}>Manual entry</button>
        <button type="button" className={mode === 'report' ? 'active' : ''} onClick={() => setMode('report')}>Upload report</button>
      </div>
      {mode === 'report' ? <div className="form-body">
        <div className="upload-panel">
          <div className="upload-icon">↑</div>
          <h3>Upload a lab report</h3>
          <p>Upload a PDF lab report. OCR will identify available CKD values and place them into the editable form for your review.</p>
          <label className="upload-label">Choose PDF report<input type="file" accept="application/pdf,.pdf" onChange={handleReport} /></label>
          {reportName && <p className="success">{reportName} attached</p>}
          {ocrStatus && <p className="ocr-status">{ocrStatus}</p>}
        </div>
        <div className="form-actions"><span className="muted">You can also enter values without a report.</span><button type="button" onClick={() => setMode('manual')}>Continue manually</button></div>
      </div> : <form className="form-body" onSubmit={submit}>
        <div className="section-heading"><span className="section-number">01</span><h2>Basic measurements</h2><p>Numbers from your lab report</p></div>
        <div className="grid">{numericFields.slice(0, 5).map((field) => <Field key={field.name} definition={field} value={form[field.name]} onChange={update(field.name)} />)}</div>
        <div className="section-heading"><span className="section-number">02</span><h2>Blood and urine results</h2><p>Optional</p></div>
        <div className="grid">{numericFields.slice(5).map((field) => <Field key={field.name} definition={field} value={form[field.name]} onChange={update(field.name)} />)}</div>
        <div className="section-heading"><span className="section-number">03</span><h2>Clinical indicators</h2><p>Choose if known</p></div>
        <div className="grid">{categoricalFields.map((field) => <Field key={field.name} definition={field} value={form[field.name]} onChange={update(field.name)} />)}</div>
        {error && <p className="error">{error}</p>}
        {extractedText && <details className="ocr-details"><summary>View extracted report text</summary><pre>{extractedText}</pre></details>}
        <div className="form-actions"><span className="muted">Review extracted values before submitting. Blank fields use model defaults.</span><button className="primary-button" disabled={loading}>{loading ? 'Analyzing…' : 'Run screening →'}</button></div>
      </form>}
    </section>
  </div>
}
