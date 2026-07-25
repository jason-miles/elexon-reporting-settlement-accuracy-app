import Callout from '../components/Callout'
import { mockProviderTables, mockRecipientTables } from '../utils/mockData'
import styles from './DataSharing.module.css'

export default function DataSharing() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Data Sharing</span>
        <h1 className={styles.title}>Share without copying</h1>
        <p className={styles.subtitle}>
          The Provider workspace shares curated tables to a Recipient via Delta Sharing; the
          Recipient sees only permitted tables and columns.
        </p>
      </header>

      <Callout title="Delta Sharing simulation">
        The Provider (Elexon) curates gold tables (e.g. <code>gold_consumption_curated</code>, <code>gold_anomalies</code>)
        and shares them with a Recipient. The Recipient sees only these shared tables and columns—no access to
        raw or internal schemas.
      </Callout>

      <div className={styles.twoCol}>
        <section className={`${styles.section} ${styles.provider}`}>
          <span className={styles.roleTag}>Provider · Elexon</span>
          <h2 className={styles.sectionTitle}>Full gold schema</h2>
          <p className={styles.sectionDesc}>Consumption, aggregates, anomalies, and curated shareables.</p>
          <ul className={styles.tableList}>
            {mockProviderTables.map((t, i) => (
              <li key={i}>
                <code>{t.tableSchema}.{t.tableName}</code>
              </li>
            ))}
          </ul>
        </section>

        <div className={styles.flow} aria-hidden="true">
          <span className={styles.flowIcon}>⇄</span>
          <span className={styles.flowLabel}>Delta Share</span>
        </div>

        <section className={`${styles.section} ${styles.recipient}`}>
          <span className={`${styles.roleTag} ${styles.roleTagRecipient}`}>Recipient</span>
          <h2 className={styles.sectionTitle}>Shared tables only</h2>
          <p className={styles.sectionDesc}>Just what lands in <code>recipient_shared</code> — no raw or internal schemas.</p>
          <ul className={styles.tableList}>
            {mockRecipientTables.map((t, i) => (
              <li key={i}>
                <code>{t.tableSchema}.{t.tableName}</code>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Callout title="How to run in your workspace" variant="success">
        Run the <strong>06_delta_sharing</strong> notebook to create the share, add tables, and
        grant access to the Recipient. In the app, switch between Provider and Recipient context
        (or use two workspaces) to compare visible tables.
      </Callout>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Share configuration (example)</h2>
        <pre className={styles.configSnippet}>
{`-- Provider: create share and add tables
CREATE SHARE IF NOT EXISTS elexon_consumption_share;
ALTER SHARE elexon_consumption_share ADD TABLE elexon_app_for_settlement_acc_catalog.gold.gold_consumption_curated;
ALTER SHARE elexon_consumption_share ADD TABLE elexon_app_for_settlement_acc_catalog.gold.gold_anomalies;

-- Recipient: create catalog from share (using Provider's share credentials)
CREATE CATALOG IF NOT EXISTS elexon_shared
  USING delta_sharing
  LOCATION '<share_url>'
  WITH CREDENTIAL <recipient_credential>;`}
        </pre>
      </section>
    </div>
  )
}
