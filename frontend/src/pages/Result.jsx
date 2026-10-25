import { Link, useLocation } from 'react-router-dom'
import {
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

export default function Result() {
  const { state } = useLocation()
  if (!state) return <section className="card"><h1>No result yet</h1><Link className="button" to="/predict">Run a prediction</Link></section>
  const probability = Number(state.probability)
  const riskLevel = state.riskLevel || state.risk_level
  const factors = (state.topFactors || state.top_features || []).map((factor) => ({
    ...factor,
    impact: Number(factor.impact),
  }))
  const gaugeData = [{ name: 'Probability', value: probability }, { name: 'Remaining', value: 1 - probability }]

  return <div>
    <div className="page-title">
      <span className="eyebrow">SCREENING COMPLETE</span>
      <h1>Your kidney health snapshot.</h1>
      <p className="muted">Here is the model’s estimate based on the information provided. Review the contributing factors below.</p>
    </div>
    <section className="card">
    <div className="result-grid">
      <div className="metric gauge-card">
        <span>CKD probability</span>
        <div className="gauge">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={gaugeData} dataKey="value" startAngle={180} endAngle={0} innerRadius="68%" outerRadius="100%" cy="100%" stroke="none">
                <Cell fill="#176b87" />
                <Cell fill="#dbe5ed" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <strong>{(probability * 100).toFixed(1)}%</strong>
        </div>
      </div>
      <div className="metric"><span>Prediction</span><strong>{state.prediction === 1 ? 'CKD' : 'Not CKD'}</strong></div>
      <div className="metric"><span>Risk level</span><strong className={`risk-badge risk-${String(riskLevel).toLowerCase()}`}>{riskLevel}</strong></div>
    </div>
    <h2>Top contributing factors</h2>
    <div className="factor-chart">
      <ResponsiveContainer width="100%" height={Math.max(230, factors.length * 48)}>
        <BarChart data={factors} layout="vertical" margin={{ top: 8, right: 20, left: 30, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={65} />
          <Tooltip formatter={(value) => [Number(value).toFixed(3), 'Impact']} />
          <Bar dataKey="impact" radius={[0, 5, 5, 0]}>
            {factors.map((factor) => <Cell key={factor.name} fill={factor.impact >= 0 ? '#d95d39' : '#176b87'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="form-actions"><span className="muted">Need to check another set of values?</span><Link className="button" to="/predict">New screening →</Link></div>
    </section>
  </div>
}
