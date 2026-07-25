import styles from './AskQuestion.module.css'
import Callout from '../components/Callout'
import { GENIE_SPACE_URL } from '../utils/genieConfig'

const examples = [
  'How many MPANs have we seen in the last 7 days?',
  'What are the top anomalies by score this week?',
  'Total kWh consumed in the last 24 hours',
  'Which anomaly types are most common this month?',
  'Show daily consumption trend for the last 14 days',
]

export default function AskQuestion() {
  const genieWith = (q: string) => {
    // Deep-link to the Genie space; the question is offered as a starting prompt.
    try {
      const url = new URL(GENIE_SPACE_URL)
      url.searchParams.set('prompt', q)
      return url.toString()
    } catch {
      return GENIE_SPACE_URL
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Ask a Question</span>
        <h1 className={styles.title}>Query your data in plain English</h1>
        <p className={styles.subtitle}>
          <strong>Databricks AI/BI Genie</strong> translates natural-language questions into governed
          SQL over Unity Catalog — you only see data you have permission to access.
        </p>
      </header>

      <div className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">💬</div>
        <div className={styles.heroBody}>
          <h2 className={styles.heroTitle}>Open the Genie space</h2>
          <p className={styles.heroText}>
            Ask about consumption, anomalies, and governance. Genie shows the generated SQL and
            results so answers stay transparent and auditable.
          </p>
          <a
            href={GENIE_SPACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryButton}
          >
            Open Genie in Databricks
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Try asking</h2>
        <div className={styles.chips}>
          {examples.map((q) => (
            <a
              key={q}
              href={genieWith(q)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.chip}
            >
              <span className={styles.chipIcon} aria-hidden="true">↗</span>
              {q}
            </a>
          ))}
        </div>
      </section>

      <Callout variant="info" title="How it works">
        Genie maps your question to SQL against gold tables (consumption, anomalies, aggregates).
        Access is governed by Unity Catalog — purpose-based roles and MPAN masking apply exactly as
        they do elsewhere in the app.
      </Callout>

      <Callout variant="warning" title="First-time setup">
        A Genie space must exist in your workspace before users can ask questions. See{' '}
        <code>docs/GENIE_SETUP.md</code> for step-by-step instructions, then set{' '}
        <code>VITE_GENIE_SPACE_URL</code> at build time to point at your space.
      </Callout>
    </div>
  )
}
