import Callout from '../components/Callout'
import PageHero from '../components/PageHero'
import styles from './BusinessOverview.module.css'

const capabilities = [
  {
    icon: '🚨',
    title: 'Real-time anomaly detection',
    desc: 'Identify theft, meter malfunction, and network issues as they occur, using ML on half-hourly consumption.',
  },
  {
    icon: '🔐',
    title: 'Governed access',
    desc: 'Purpose-based access (settlement, market monitoring, research) enforced by Unity Catalog.',
  },
  {
    icon: '🔄',
    title: 'Secure data sharing',
    desc: 'Delta Sharing to external recipients — no data copies, no vendor lock-in.',
  },
  {
    icon: '💬',
    title: 'Natural language queries',
    desc: 'Ask a Question (Genie) turns plain-English questions into governed SQL for ad-hoc exploration.',
  },
]

const useCases = [
  { label: 'Settlement', tone: 'settlement', desc: 'Full half-hourly reads for settlement accuracy and compliance.' },
  { label: 'Market monitoring', tone: 'market', desc: 'Aggregates and trends for operational visibility.' },
  { label: 'Research', tone: 'research', desc: 'Anonymised aggregates for long-term analysis.' },
]

export default function BusinessOverview() {
  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Business Overview"
        title="Why this"
        titleAccent="matters"
        subtitle="The business context and value of consumption insights for Elexon and industry signatories — settlement accuracy, market monitoring, and research."
        stats={[
          { value: '~40M', label: 'MPANs in production' },
          { value: '3', label: 'Governed use cases' },
          { value: '48h', label: 'Late-data watermark' },
        ]}
      />

      <Callout title="Business value" variant="success">
        Consumption Insights &amp; Anomaly Detection gives Elexon and signatories a single place to
        monitor half-hourly consumption, detect anomalies (theft, meter issues, network events),
        and share data securely via Delta Sharing — supporting settlement accuracy, market
        monitoring, and research use cases.
      </Callout>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Key capabilities</h2>
        <div className={styles.capGrid}>
          {capabilities.map((c) => (
            <div key={c.title} className={styles.capCard}>
              <span className={styles.capIcon} aria-hidden="true">{c.icon}</span>
              <div>
                <h3 className={styles.capTitle}>{c.title}</h3>
                <p className={styles.capDesc}>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Use cases</h2>
        <div className={styles.cardGrid}>
          {useCases.map((u) => (
            <div key={u.label} className={`${styles.card} ${styles[u.tone]}`}>
              <span className={styles.cardTag}>{u.label}</span>
              <p className={styles.cardText}>{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Callout title="Demo context">
        This demo uses synthetic MPAN-like identifiers and sample data. In production, ~40M MPANs
        would be represented with full governance and access controls.
      </Callout>
    </div>
  )
}
