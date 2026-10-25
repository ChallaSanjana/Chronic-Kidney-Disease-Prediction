const symptoms = [
  'Tiredness or trouble concentrating',
  'Swelling in the feet, ankles, or around the eyes',
  'Changes in how often you urinate',
  'Poor appetite, nausea, or muscle cramps',
  'Dry, itchy skin or sleep problems',
]

const riskFactors = [
  ['Diabetes', 'High blood sugar can damage the small blood vessels that filter your blood.'],
  ['High blood pressure', 'Pressure that stays high can strain and damage kidney blood vessels.'],
  ['Heart disease', 'Kidney and heart health are closely connected.'],
  ['Family history', 'A close relative with kidney disease may increase your risk.'],
  ['Older age or prior kidney injury', 'Risk can increase with age or after certain kidney problems.'],
]

const tests = [
  ['Serum creatinine', 'A blood measurement of a waste product. Your clinician uses it with other information to estimate kidney filtering.'],
  ['eGFR', 'An estimated filtration rate calculated from blood test results and personal factors. Trends over time are often more useful than one result alone.'],
  ['Urine albumin', 'Albumin in urine can be a sign that the kidney filters are allowing protein to pass through.'],
  ['Blood pressure', 'Regular checks help identify a major, treatable risk factor for kidney disease.'],
]

const habits = [
  'Know your blood pressure and blood sugar, and follow your clinician’s plan.',
  'Choose a balanced eating pattern and ask a clinician about the right amount of salt and protein for you.',
  'Move regularly in a way that is safe and realistic for your health.',
  'Avoid smoking and limit alcohol. Aim for a healthy weight if recommended.',
  'Take medicines exactly as prescribed and ask before using over-the-counter pain medicines regularly.',
  'Keep follow-up appointments and ask when kidney blood and urine tests are needed.',
]

function SourceLink({ href, children }) {
  return <a className="education-source-link" href={href} target="_blank" rel="noreferrer">{children} ↗</a>
}

export default function Education() {
  return <div>
    <div className="page-title education-title">
      <span className="eyebrow">KIDNEY HEALTH EDUCATION</span>
      <h1>Small steps can support kidney health.</h1>
      <p className="muted">Learn what chronic kidney disease means, what to watch for, and which questions to bring to a healthcare professional.</p>
    </div>

    <section className="education-hero card">
      <div className="education-hero-mark">+</div>
      <div><span className="eyebrow">THE BASICS</span><h2>What is chronic kidney disease?</h2><p>Chronic kidney disease (CKD) means the kidneys are damaged or are not filtering blood as well as expected for three months or more. The kidneys help remove waste, balance fluids, and support blood pressure and red blood cell production.</p><p>CKD can develop slowly and may not cause noticeable symptoms early. Testing is important when someone has risk factors, even if they feel well.</p></div>
    </section>

    <div className="education-grid">
      <section className="card education-card">
        <span className="eyebrow">KNOW THE SIGNS</span>
        <h2>Possible symptoms</h2>
        <p className="education-intro">Many people have no symptoms at first. These signs can have many causes, so they do not diagnose CKD by themselves.</p>
        <ul className="education-list">{symptoms.map((symptom) => <li key={symptom}><span className="education-check">✓</span>{symptom}</li>)}</ul>
        <p className="education-note">New or severe symptoms deserve medical attention. Sudden shortness of breath, chest pain, confusion, or very little urine should be treated as urgent.</p>
      </section>
      <section className="card education-card">
        <span className="eyebrow">UNDERSTAND YOUR RISK</span>
        <h2>Common risk factors</h2>
        <div className="education-factors">{riskFactors.map(([title, description]) => <div key={title}><strong>{title}</strong><p>{description}</p></div>)}</div>
      </section>
    </div>

    <section className="card education-card education-tests">
      <div className="education-section-heading"><div><span className="eyebrow">LAB TEST GUIDE</span><h2>What common kidney tests tell you</h2></div><span className="education-pill">Ask your clinician about your results</span></div>
      <div className="test-grid">{tests.map(([name, description]) => <article key={name}><div className="test-icon">⌁</div><div><h3>{name}</h3><p>{description}</p></div></article>)}</div>
      <p className="education-note">A single number is not enough to diagnose CKD. Healthcare professionals interpret results alongside your history, examination, repeat tests, and other findings.</p>
    </section>

    <section className="card education-card lifestyle-card">
      <div><span className="eyebrow">EVERYDAY SUPPORT</span><h2>Healthy lifestyle habits</h2><p className="education-intro">The best plan depends on your health and kidney function. Start with changes you can maintain and get personalized advice.</p></div>
      <ul className="education-list lifestyle-list">{habits.map((habit) => <li key={habit}><span className="education-check">✓</span>{habit}</li>)}</ul>
    </section>

    <section className="education-sources">
      <h2>Learn more from trusted sources</h2>
      <p className="muted">This page summarizes public guidance from national health organizations. It is not a substitute for medical care.</p>
      <div><SourceLink href="https://www.cdc.gov/kidney-disease/about/index.html">CDC: CKD basics</SourceLink><SourceLink href="https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd">NIDDK: CKD overview</SourceLink><SourceLink href="https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd/tests-diagnosis">NIDDK: tests and diagnosis</SourceLink><SourceLink href="https://www.cdc.gov/kidney-disease/prevention/index.html">CDC: prevention</SourceLink></div>
    </section>
  </div>
}
