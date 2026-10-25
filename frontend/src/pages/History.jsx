import { useEffect, useState } from 'react'
import api from '../api'

export default function History() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    api.get('/predictions')
      .then(({ data }) => setItems(data))
      .catch(() => setError('Unable to load prediction history'))
      .finally(() => setLoading(false))
  }, [])

  const remove = async (id) => {
    setError('')
    setDeletingId(id)
    try {
      await api.delete(`/predictions/${id}`)
      setItems((currentItems) => currentItems.filter((item) => item._id !== id))
    } catch {
      setError('Unable to delete prediction')
    } finally {
      setDeletingId('')
    }
  }

  return <section className="card">
    <div className="page-heading">
      <div><h1>Prediction history</h1><p className="muted">Review your previous kidney health predictions.</p></div>
      <span className="history-count">{items.length} {items.length === 1 ? 'prediction' : 'predictions'}</span>
    </div>
    {error && <p className="error">{error}</p>}
    {loading ? <p className="muted">Loading prediction history...</p> : items.length === 0 ? <p className="muted">No predictions yet.</p> : <div className="table-wrap">
      <table><thead><tr><th>Date</th><th>Probability</th><th>Risk level</th><th>Prediction</th><th aria-label="Actions" /></tr></thead>
        <tbody>{items.map((item) => <tr key={item._id}>
          <td>{new Date(item.createdAt).toLocaleString()}</td>
          <td>{(Number(item.probability) * 100).toFixed(1)}%</td>
          <td><span className={`risk-badge risk-${item.riskLevel.toLowerCase()}`}>{item.riskLevel}</span></td>
          <td>{item.prediction === 1 ? 'CKD' : 'Not CKD'}</td>
          <td><button className="delete-button" disabled={deletingId === item._id} onClick={() => remove(item._id)}>{deletingId === item._id ? 'Deleting...' : 'Delete'}</button></td>
        </tr>)}</tbody>
      </table>
    </div>}
  </section>
}
