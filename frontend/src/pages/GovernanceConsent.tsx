import { useState } from 'react'
import Callout from '../components/Callout'
import { mockGrants } from '../utils/mockData'
import styles from './GovernanceConsent.module.css'

const purposes = [
  { id: 'settlement', label: 'Settlement', desc: 'Full half-hourly reads, tokenized MPAN where required.' },
  { id: 'market_monitoring', label: 'Market monitoring', desc: 'Aggregates, trends, no raw PII.' },
  { id: 'research', label: 'Research', desc: 'Anonymised aggregates, long-term trends.' },
]

export default function GovernanceConsent() {
  const [selectedPurpose, setSelectedPurpose] = useState('settlement')

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Governance & Consent</h1>
      <p className={styles.subtitle}>
        Who can see what; use-case purpose selection; MPAN masking; audit snippet.
      </p>

      <Callout title="Purpose-based access">
        Access is controlled by Unity Catalog roles aligned to use-case purposes: settlement sees
        the most detail; market monitoring gets aggregates; research gets anonymised data only.
        MPAN is treated as PII and masked for non-settlement roles.
      </Callout>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Use-case purpose</h2>
        <div className={styles.purposeGrid}>
          {purposes.map((p) => (
            <button
              key={p.id}
              className={`${styles.purposeCard} ${selectedPurpose === p.id ? styles.purposeCardActive : ''}`}
              onClick={() => setSelectedPurpose(p.id)}
            >
              <span className={styles.purposeLabel}>{p.label}</span>
              <span className={styles.purposeDesc}>{p.desc}</span>
            </button>
          ))}
        </div>
        <p className={styles.purposeNote}>
          Selected: <strong>{purposes.find((p) => p.id === selectedPurpose)?.label}</strong> — 
          views and row filters are applied per role in Unity Catalog.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Who can see what (grants)</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Principal (role)</th>
                <th>Action</th>
                <th>Object type</th>
              </tr>
            </thead>
            <tbody>
              {mockGrants.map((g, i) => (
                <tr key={i}>
                  <td><code>{g.Principal}</code></td>
                  <td>{g.ActionType}</td>
                  <td>{g.ObjectType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>MPAN masking</h2>
        <Callout title="PII protection" variant="success">
          MPAN is stored in a restricted table; broader roles see <code>tokenized_mpan</code> only
          (hash/tokenized). Row filters can further limit by region or purpose. This evidences
          compliance with data minimisation and purpose-based access.
        </Callout>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Audit</h2>
        <Callout title="Evidence for compliance">
          Unity Catalog records access to tables and views in the account audit log. Use
          <strong> Account Console → Audit logs</strong> (or <code>system.information_schema.access</code> where
          available) to demonstrate who accessed what and when.
        </Callout>
        <pre className={styles.auditSnippet}>
{`-- Example: list recent access to elexon_app_for_settlement_acc_catalog (adapt to your workspace)
SELECT event_time, user_identity, request_params
FROM system.access.audit
WHERE request_params.full_name_arg LIKE '%elexon_app_for_settlement_acc_catalog%'
ORDER BY event_time DESC
LIMIT 100;`}
        </pre>
      </section>
    </div>
  )
}
