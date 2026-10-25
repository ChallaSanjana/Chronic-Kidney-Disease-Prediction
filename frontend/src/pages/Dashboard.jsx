import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'
import api from '../api'

const riskColors = {
  Low: '#51b99c',
  Medium: '#e3a34b',
  High: '#df6f6a',
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function StatCard({ label, value, detail, tone, icon }) {
  return <div className={`dashboard-stat stat-${tone}`}>
    <div className="stat-icon">{icon}</div>
    <div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
  </div>
}

export default function Dashboard() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const loadHistory = (showLoading = false) => {
      if (showLoading) setLoading(true)
      api.get('/predictions')
        .then(({ data }) => {
          if (!active) return
          setItems(data)
          setError('')
        })
        .catch(() => {
          if (active) setError('Unable to load dashboard activity')
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }
    const refreshAfterPrediction = () => loadHistory()
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') loadHistory()
    }

    loadHistory(true)
    window.addEventListener('renalcare:prediction-created', refreshAfterPrediction)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      active = false
      window.removeEventListener('renalcare:prediction-created', refreshAfterPrediction)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [])

  const stats = useMemo(() => {
    const positive = items.filter((item) => item.prediction === 1).length
    const highRisk = items.filter((item) => item.riskLevel === 'High').length
    const average = items.length
      ? items.reduce((sum, item) => sum + Number(item.probability), 0) / items.length
      : 0
    return { positive, highRisk, average }
  }, [items])

  const trend = useMemo(() => items.slice().reverse().slice(-8).map((item) => ({
    date: formatDate(item.createdAt),
    probability: Math.round(Number(item.probability) * 100),
  })), [items])

  const riskData = useMemo(() => ['Low', 'Medium', 'High'].map((risk) => ({
    name: risk,
    value: items.filter((item) => item.riskLevel === risk).length,
  })).filter((item) => item.value > 0), [items])

  const weeklyData = useMemo(() => {
    const grouped = new Map()
    items.slice().reverse().forEach((item) => {
      const date = new Date(item.createdAt)
      const key = date.toLocaleDateString(undefined, { weekday: 'short' })
      grouped.set(key, (grouped.get(key) || 0) + 1)
    })
    return Array.from(grouped, ([day, screenings]) => ({ day, screenings })).slice(-7)
  }, [items])

  const recent = items.slice(0, 4)

  return <div>
    <div className="dashboard-welcome">
      <div><span className="eyebrow">OVERVIEW</span><h1>Your health at a glance.</h1><p className="muted">Track your CKD screening activity and understand your recent risk patterns.</p></div>
      <Link className="primary-button dashboard-cta" to="/predict">+ New screening</Link>
    </div>
    {error && <p className="error">{error}</p>}
    {loading ? <section className="card"><p className="muted">Loading your dashboard...</p></section> : <>
      <div className="dashboard-stats">
        <StatCard label="Total screenings" value={items.length} detail="All-time screenings" tone="teal" icon="⌁" />
        <StatCard label="CKD-positive" value={stats.positive} detail={items.length ? `${Math.round((stats.positive / items.length) * 100)}% of screenings` : 'No screenings yet'} tone="coral" icon="◉" />
        <StatCard label="Average probability" value={`${(stats.average * 100).toFixed(1)}%`} detail="Across all screenings" tone="gold" icon="≈" />
        <StatCard label="High-risk results" value={stats.highRisk} detail="Review with a clinician" tone="violet" icon="!" />
      </div>
      <div className="dashboard-chart-grid">
        <section className="card chart-card trend-card">
          <div className="chart-heading"><div><span className="eyebrow">SCREENING TREND</span><h2>CKD probability over time</h2></div><span className="chart-caption">Last 8 screenings</span></div>
          {trend.length ? <ResponsiveContainer width="100%" height={245}><AreaChart data={trend} margin={{ top: 15, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="probabilityFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#37ad98" stopOpacity=".35" /><stop offset="100%" stopColor="#37ad98" stopOpacity=".02" /></linearGradient></defs><CartesianGrid stroke="#edf2f2" vertical={false} /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#8aa0a2', fontSize: 11 }} /><YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#8aa0a2', fontSize: 11 }} tickFormatter={(value) => `${value}%`} /><Tooltip formatter={(value) => [`${value}%`, 'Probability']} /><Area type="monotone" dataKey="probability" stroke="#15947f" strokeWidth={3} fill="url(#probabilityFill)" /></AreaChart></ResponsiveContainer> : <div className="empty-chart">Complete a screening to see your probability trend.</div>}
        </section>
        <section className="card chart-card risk-card">
          <div className="chart-heading"><div><span className="eyebrow">RISK PROFILE</span><h2>Risk distribution</h2></div></div>
          {riskData.length ? <div className="risk-chart"><ResponsiveContainer width="100%" height={190}><PieChart><Pie data={riskData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={4} stroke="none">{riskData.map((entry) => <Cell key={entry.name} fill={riskColors[entry.name]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="risk-legend">{riskData.map((entry) => <div key={entry.name}><i style={{ background: riskColors[entry.name] }} /><span>{entry.name}</span><strong>{entry.value}</strong></div>)}</div></div> : <div className="empty-chart">No risk data yet.</div>}
        </section>
      </div>
      <div className="dashboard-bottom-grid">
        <section className="card chart-card activity-card">
          <div className="chart-heading"><div><span className="eyebrow">ACTIVITY</span><h2>Screenings by day</h2></div></div>
          {weeklyData.length ? <ResponsiveContainer width="100%" height={190}><BarChart data={weeklyData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}><CartesianGrid stroke="#edf2f2" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8aa0a2', fontSize: 11 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#8aa0a2', fontSize: 11 }} /><Tooltip /><Bar dataKey="screenings" fill="#2c9d8b" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer> : <div className="empty-chart">Your screening activity will appear here.</div>}
        </section>
        <section className="card recent-card">
          <div className="chart-heading"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>Latest screenings</h2></div><Link to="/history">View all</Link></div>
          {recent.length ? <div className="recent-list">{recent.map((item) => <div className="recent-item" key={item._id}><span className={`recent-dot risk-dot-${item.riskLevel.toLowerCase()}`} /><div><strong>{item.prediction === 1 ? 'CKD-positive screening' : 'Not CKD screening'}</strong><small>{formatDate(item.createdAt)} · {(Number(item.probability) * 100).toFixed(1)}% probability</small></div><span className={`risk-badge risk-${item.riskLevel.toLowerCase()}`}>{item.riskLevel}</span></div>)}</div> : <div className="empty-recent"><p>No screenings yet.</p><Link className="button" to="/predict">Start a screening</Link></div>}
        </section>
      </div>
    </>}
  </div>
}
