import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from '../api'

const metrics = [
  { key: 'sc', label: 'Creatinine', unit: 'mg/dL', color: '#168c79' },
  { key: 'bu', label: 'Blood urea', unit: 'mg/dL', color: '#dc9560' },
  { key: 'hemo', label: 'Hemoglobin', unit: 'g/dL', color: '#6f69b1' },
  { key: 'bp', label: 'Blood pressure', unit: 'mmHg', color: '#d56c72' },
]

function dateLabel(value) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function numeric(value) {
  return value === null || value === undefined || value === '' ? null : Number(value)
}

function changeMessage(label, first, second) {
  if (first === null || second === null || first === undefined || second === undefined) return `${label} was not recorded in both screenings.`
  const difference = second - first
  if (Math.abs(difference) < 0.01) return `${label} stayed about the same.`
  return `${label} ${difference > 0 ? 'increased' : 'decreased'} from ${first} to ${second}.`
}

export default function Insights() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [metric, setMetric] = useState('sc')
  const [comparisonIds, setComparisonIds] = useState([])

  useEffect(() => {
    let active = true
    const load = () => api.get('/predictions')
      .then(({ data }) => { if (active) setItems(data) })
      .catch(() => { if (active) setError('Unable to load health insights') })
      .finally(() => { if (active) setLoading(false) })
    load()
    const refresh = () => load()
    window.addEventListener('renalcare:prediction-created', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      active = false
      window.removeEventListener('renalcare:prediction-created', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  const filtered = useMemo(() => items.filter((item) => {
    const date = new Date(item.createdAt)
    return (!fromDate || date >= new Date(`${fromDate}T00:00:00`))
      && (!toDate || date <= new Date(`${toDate}T23:59:59.999`))
  }), [items, fromDate, toDate])

  const trend = useMemo(() => filtered.slice().reverse().map((item) => ({
    date: dateLabel(item.createdAt),
    value: numeric(item[metric]),
    probability: Math.round(Number(item.probability) * 100),
  })), [filtered, metric])

  const selected = comparisonIds.map((id) => filtered.find((item) => item._id === id)).filter(Boolean)
  const comparison = selected.length === 2 ? selected.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) : []
  const selectedMetric = metrics.find((item) => item.key === metric)

  const toggleComparison = (id) => setComparisonIds((current) => current.includes(id)
    ? current.filter((value) => value !== id)
    : current.length < 2 ? [...current, id] : current)

  return <div>
    <div className="page-title">
      <span className="eyebrow">HEALTH INSIGHTS</span>
      <h1>Understand your screening trends.</h1>
      <p className="muted">Explore saved results over time and compare changes in your CKD probability and lab values.</p>
    </div>
    <div className="insights-toolbar">
      <label>From<input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
      <label>To<input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></label>
      <button className="clear-filter" type="button" onClick={() => { setFromDate(''); setToDate(''); setComparisonIds([]) }}>Clear filters</button>
      <span className="insight-count">{filtered.length} screening{filtered.length === 1 ? '' : 's'} shown</span>
    </div>
    {error && <p className="error">{error}</p>}
    {loading ? <section className="card"><p className="muted">Loading your saved screening data...</p></section> : !filtered.length ? <section className="card insights-empty"><div className="empty-insight-icon">⌁</div><h2>No health insights yet</h2><p className="muted">Complete a screening to see your CKD probability and lab value trends here.</p><a className="button" href="/predict">Start a screening</a></section> : <>
      <section className="card insight-chart-card">
        <div className="chart-heading"><div><span className="eyebrow">LAB VALUE TREND</span><h2>{selectedMetric.label} over time</h2><p className="chart-subtitle">Values are taken from your saved screenings. Missing values stay blank.</p></div><span className="chart-caption">{selectedMetric.unit}</span></div>
        <div className="metric-switcher">{metrics.map((item) => <button type="button" key={item.key} className={metric === item.key ? 'active' : ''} onClick={() => setMetric(item.key)}>{item.label}</button>)}</div>
        {trend.some((point) => point.value !== null) ? <ResponsiveContainer width="100%" height={290}><LineChart data={trend} margin={{ top: 12, right: 12, left: -15, bottom: 5 }}><CartesianGrid stroke="#edf2f2" vertical={false} /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#8aa0a2', fontSize: 11 }} /><YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#8aa0a2', fontSize: 11 }} /><Tooltip formatter={(value) => [`${value} ${selectedMetric.unit}`, selectedMetric.label]} /><Line connectNulls={false} type="monotone" dataKey="value" stroke={selectedMetric.color} strokeWidth={3} dot={{ fill: selectedMetric.color, r: 4 }} /></LineChart></ResponsiveContainer> : <div className="empty-chart">This lab value was not recorded in the selected screenings.</div>}
      </section>
      <div className="insights-two-column">
        <section className="card insight-chart-card">
          <div className="chart-heading"><div><span className="eyebrow">SCREENING HISTORY</span><h2>Probability and risk</h2><p className="chart-subtitle">How the model’s CKD probability has changed.</p></div></div>
          <ResponsiveContainer width="100%" height={245}><LineChart data={trend} margin={{ top: 12, right: 12, left: -15, bottom: 5 }}><CartesianGrid stroke="#edf2f2" vertical={false} /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#8aa0a2', fontSize: 11 }} /><YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#8aa0a2', fontSize: 11 }} tickFormatter={(value) => `${value}%`} /><Tooltip formatter={(value) => [`${value}%`, 'CKD probability']} /><Line type="monotone" dataKey="probability" name="CKD probability" stroke="#247d9a" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer>
        </section>
        <section className="card comparison-card">
          <div className="chart-heading"><div><span className="eyebrow">COMPARE SCREENINGS</span><h2>See what changed</h2><p className="chart-subtitle">Choose two records for a simple comparison.</p></div>{comparisonIds.length > 0 && <button className="clear-filter" type="button" onClick={() => setComparisonIds([])}>Clear selection</button>}</div>
          <div className="comparison-picker">{filtered.map((item) => <label key={item._id}><input type="checkbox" checked={comparisonIds.includes(item._id)} disabled={!comparisonIds.includes(item._id) && comparisonIds.length >= 2} onChange={() => toggleComparison(item._id)} /><span>{dateLabel(item.createdAt)} · {(Number(item.probability) * 100).toFixed(1)}%</span></label>)}</div>
          {comparison.length === 2 ? <div className="comparison-result"><div className="compare-values"><div><small>Earlier</small><strong>{(Number(comparison[0].probability) * 100).toFixed(1)}%</strong><span>{dateLabel(comparison[0].createdAt)}</span></div><b>→</b><div><small>Later</small><strong>{(Number(comparison[1].probability) * 100).toFixed(1)}%</strong><span>{dateLabel(comparison[1].createdAt)}</span></div></div><p>{changeMessage('Your CKD probability', Number(comparison[0].probability), Number(comparison[1].probability))}</p><p>{changeMessage(selectedMetric.label, numeric(comparison[0][metric]), numeric(comparison[1][metric]))}</p></div> : <p className="muted comparison-help">Select two screenings above to compare their probability and {selectedMetric.label.toLowerCase()}.</p>}
        </section>
      </div>
    </>}
  </div>
}
