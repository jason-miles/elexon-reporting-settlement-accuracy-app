import styles from './AskQuestion.module.css'
import Callout from '../components/Callout'
import { GENIE_SPACE_URL } from '../utils/genieConfig'

export default function AskQuestion() {
  return (
    <div className={styles.page}>
      <h1>Ask a Question of Your Data</h1>
      <p className={styles.lead}>
        Use <strong>Databricks AI/BI Genie</strong> to ask natural language questions about consumption, anomalies, and governance.
      </p>

      <Callout variant="info" title="How it works">
        Genie translates your questions into SQL against Unity Catalog tables. You can ask things like:
        <ul>
          <li>How many MPANs have we seen in the last 7 days?
          </li>
          <li>What are the top anomalies by score this week?
          </li>
          <li>Total kWh consumed in the last 24 hours
          </li>
        </ul>
        Access is governed by Unity Catalog — you only see data you have permission to access.
      </Callout>

      <div className={styles.actions}>
        <a
          href={GENIE_SPACE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.primaryButton}
          style={{ textDecoration: 'none' }}
        >
          Open Genie in Databricks →
        </a>
      </div>

      <Callout variant="warning" title="First-time setup">
        A Genie space must be created in your Databricks workspace before users can ask questions.
        See <strong>docs/GENIE_SETUP.md</strong> in the repo for step-by-step instructions.
      </Callout>
    </div>
  )
}
