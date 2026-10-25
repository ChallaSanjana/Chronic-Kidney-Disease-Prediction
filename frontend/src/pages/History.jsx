import { useEffect, useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
import api from '../api'

function formatDate(value) {
  return new Date(value).toLocaleString()
}

function downloadPredictionPdf(item) {
  const document = new jsPDF()
  const date = formatDate(item.createdAt)
  document.setFontSize(19)
  document.setTextColor(14, 48, 54)
  document.text('RenalCare screening report', 20, 24)
  document.setFontSize(10)
  document.setTextColor(91, 112, 117)
  document.text(`Generated: ${date}`, 20, 32)
  document.line(20, 38, 190, 38)
  document.setFontSize(13)
  document.setTextColor(22, 58, 64)
  document.text('Prediction summary', 20, 52)
  document.setFontSize(11)
  document.text(`CKD probability: ${(Number(item.probability) * 100).toFixed(1)}%`, 20, 64)
  document.text(`Prediction: ${item.prediction === 1 ? 'CKD' : 'Not CKD'}`, 20, 73)
  document.text(`Risk level: ${item.riskLevel}`, 20, 82)
  document.setFontSize(13)
  document.text('Top contributing factors', 20, 101)
  document.setFontSize(10)
  ;(item.topFactors || []).slice(0, 5).forEach((factor, index) => {
    document.text(`${index + 1}. ${factor.name}: impact ${Number(factor.impact).toFixed(3)}`, 24, 113 + index * 8)
  })
  document.setFontSize(8)
  document.setTextColor(120, 88, 11)
  document.text('Educational screening aid only; not a medical diagnosis.', 20, 275)
  document.save(`renalcare-prediction-${new Date(item.createdAt).toISOString().slice(0, 10)}.pdf`)
}

function Details({ item, onClose, onDownload }) {
  return <div className="details-panel">
    <div className="details-heading">
      <div><span className="eyebrow">PREDICTION DETAILS</span><h2>{formatDate(item.createdAt)}</h2></div>
      <button className="icon-button" type="button" onClick={onClose} aria-label="Close details">×</button>
    </div>
    <div className="details-metrics">
      <div><span>Probability</span><strong>{(Number(item.probability) * 100).toFixed(1)}%</strong></div>
      <div><span>Prediction</span><strong>{item.prediction === 1 ? 'CKD' : 'Not CKD'}</strong></div>
      <div><span>Risk</span><strong className={`risk-badge risk-${item.riskLevel.toLowerCase()}`}>{item.riskLevel}</strong></div>
    </div>
    <h3>Top contributing factors</h3>
    {(item.topFactors || []).length ? <ul className="factor-list">{item.topFactors.map((factor) => <li key={factor.name}><span>{factor.name}</span><strong>{Number(factor.impact) > 0 ? '+' : ''}{Number(factor.impact).toFixed(3)}</strong></li>)}</ul> : <p className="muted">No factor details were saved for this prediction.</p>}
    <button type="button" onClick={onDownload}>Download PDF</button>
  </div>
}

export default function History() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  useEffect(() => {
    api.get('/predictions')
      .then(({ data }) => setItems(data))
      .catch(() => setError('Unable to load prediction history'))
      .finally(() => setLoading(false))
  }, [])

  const filteredItems = useMemo(() => items.filter((item) => {
    const date = new Date(item.createdAt)
    const afterStart = !fromDate || date >= new Date(`${fromDate}T00:00:00`)
    const beforeEnd = !toDate || date <= new Date(`${toDate}T23:59:59.999`)
    return (riskFilter === 'all' || item.riskLevel === riskFilter) && afterStart && beforeEnd
  }), [items, riskFilter, fromDate, toDate])

  const selected = items.find((item) => item._id === selectedId)

  const remove = async (id) => {
    setError('')
    setDeletingId(id)
    try {
      await api.delete(`/predictions/${id}`)
      setItems((currentItems) => currentItems.filter((item) => item._id !== id))
      if (selectedId === id) setSelectedId('')
    } catch {
      setError('Unable to delete prediction')
    } finally {
      setDeletingId('')
    }
  }

  return <section className="card">
    <div className="page-heading">
      <div><h1>Prediction history</h1><p className="muted">Review and download your previous kidney health screenings.</p></div>
      <span className="history-count">{filteredItems.length} of {items.length}</span>
    </div>
    <div className="history-toolbar">
      <label>From<input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
      <label>To<input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></label>
      <label>Risk<select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}><option value="all">All levels</option><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option></select></label>
      <button className="clear-filter" type="button" onClick={() => { setFromDate(''); setToDate(''); setRiskFilter('all') }}>Clear filters</button>
    </div>
    {error && <p className="error">{error}</p>}
    {selected && <Details item={selected} onClose={() => setSelectedId('')} onDownload={() => downloadPredictionPdf(selected)} />}
    {loading ? <p className="muted">Loading prediction history...</p> : filteredItems.length === 0 ? <p className="muted">No predictions match your filters.</p> : <div className="table-wrap">
      <table><thead><tr><th>Date</th><th>Probability</th><th>Risk level</th><th>Prediction</th><th aria-label="Actions" /></tr></thead>
        <tbody>{filteredItems.map((item) => <tr key={item._id}>
          <td>{formatDate(item.createdAt)}</td>
          <td>{(Number(item.probability) * 100).toFixed(1)}%</td>
          <td><span className={`risk-badge risk-${item.riskLevel.toLowerCase()}`}>{item.riskLevel}</span></td>
          <td>{item.prediction === 1 ? 'CKD' : 'Not CKD'}</td>
          <td className="action-cell"><button type="button" className="details-button" onClick={() => setSelectedId(item._id)}>View details</button><button className="delete-button" disabled={deletingId === item._id} onClick={() => remove(item._id)}>{deletingId === item._id ? 'Deleting...' : 'Delete'}</button></td>
        </tr>)}</tbody>
      </table>
    </div>}
  </section>
}
