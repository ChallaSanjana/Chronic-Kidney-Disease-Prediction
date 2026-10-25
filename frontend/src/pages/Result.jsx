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

const featureInfo = {
  age: ['Age', 'years'],
  bp: ['Blood pressure', 'mmHg'],
  sg: ['Specific gravity', ''],
  al: ['Albumin', ''],
  su: ['Sugar', ''],
  rbc: ['Red blood cells', ''],
  pc: ['Pus cell', ''],
  pcc: ['Pus cell clumps', ''],
  ba: ['Bacteria', ''],
  bgr: ['Blood glucose', 'mg/dL'],
  bu: ['Blood urea', 'mg/dL'],
  sc: ['Serum creatinine', 'mg/dL'],
  sod: ['Sodium', 'mEq/L'],
  pot: ['Potassium', 'mEq/L'],
  hemo: ['Hemoglobin', 'g/dL'],
  pcv: ['Packed cell volume', '%'],
  wc: ['White blood cell count', '/cumm'],
  rc: ['Red blood cell count', 'mill/cumm'],
  htn: ['Hypertension', ''],
  dm: ['Diabetes mellitus', ''],
  cad: ['Coronary artery disease', ''],
  appet: ['Appetite', ''],
  pe: ['Pedal edema', ''],
  ane: ['Anemia', ''],
}

function factorLabel(name) {
  return featureInfo[name]?.[0] || name
}

function factorValue(factor, inputValues) {
  const factorValue = factor.value
  const hasFactorValue = factorValue !== null
    && factorValue !== undefined
    && String(factorValue).trim() !== ''
    && String(factorValue).trim() !== '?'
  const value = hasFactorValue ? factorValue : inputValues?.[factor.name]
  if (value === null || value === undefined || String(value).trim() === '' || String(value).trim() === '?') return 'Not provided'
  const unit = featureInfo[factor.name]?.[1]
  return `${String(value).trim()}${unit ? ` ${unit}` : ''}`
}

export default function Result() {
  const { state } = useLocation()
  if (!state) return <section className="card"><h1>No result yet</h1><Link className="button" to="/predict">Run a prediction</Link></section>
  const probability = Number(state.probability)
  const riskLevel = state.riskLevel || state.risk_level
  const inputValues = state.inputValues || state.inputs || state.features || {}
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
    <section className="explanation-section">
      <div className="explanation-heading">
        <div>
          <span className="eyebrow">AI PREDICTION EXPLANATION</span>
          <h2>What influenced this estimate?</h2>
          <p className="muted">This explanation uses SHAP values from the same CKD model that produced your prediction.</p>
        </div>
        <span className="explanation-badge">Model explanation</span>
      </div>
      <div className="explanation-key">
        <span><i className="impact-dot impact-positive" /> Pushes probability higher</span>
        <span><i className="impact-dot impact-negative" /> Pushes probability lower</span>
      </div>
      <div className="factor-chart">
      <ResponsiveContainer width="100%" height={Math.max(230, factors.length * 48)}>
        <BarChart data={factors.map((factor) => ({ ...factor, label: factorLabel(factor.name) }))} layout="vertical" margin={{ top: 8, right: 20, left: 30, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis dataKey="label" type="category" width={125} tick={{ fill: '#527075', fontSize: 11 }} />
          <Tooltip formatter={(value, name, item) => [`${Number(value).toFixed(3)} (${item.payload.impact >= 0 ? 'higher' : 'lower'} probability)`, 'SHAP impact']} />
          <Bar dataKey="impact" radius={[0, 5, 5, 0]}>
            {factors.map((factor) => <Cell key={factor.name} fill={factor.impact >= 0 ? '#d95d39' : '#176b87'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
      <div className="factor-explanations">
        {factors.map((factor) => <article className="factor-explanation" key={factor.name}>
          <div className={`factor-icon ${factor.impact >= 0 ? 'higher' : 'lower'}`}>{factor.impact >= 0 ? '↑' : '↓'}</div>
          <div><strong>{factorLabel(factor.name)}</strong><span>Your value: {factorValue(factor, inputValues)}</span><p>{factor.impact >= 0 ? 'This factor contributed toward a higher estimated CKD probability.' : 'This factor contributed toward a lower estimated CKD probability.'}</p></div>
        </article>)}
      </div>
      <p className="explanation-disclaimer"><strong>Important:</strong> This is an educational explanation of model behavior, not a diagnosis or medical opinion. Discuss your results with a qualified healthcare professional.</p>
    </section>
    <div className="form-actions"><span className="muted">Need to check another set of values?</span><Link className="button" to="/predict">New screening →</Link></div>
    </section>
  </div>
}
