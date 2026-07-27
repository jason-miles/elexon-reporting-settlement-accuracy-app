import PageHero from '../components/PageHero'
import Callout from '../components/Callout'
import styles from './Architecture.module.css'

/**
 * Databricks Well-Architected reference architecture for this app, rendered in
 * the classic left→right poster style: Data Sources → Ingest & ETL → Storage →
 * Serving & Orchestration → Databricks App, over a unified-governance foundation.
 */

interface Node {
  icon: string
  label: string
  sub?: string
  dbx?: boolean // show the Databricks brand tile treatment
}

const dataSources: { group: string; tone: string; items: Node[] }[] = [
  {
    group: 'Structured',
    tone: 'green',
    items: [
      { icon: '⚡', label: 'Half-hourly reads', sub: 'MPAN consumption' },
      { icon: '🧾', label: 'Settlement data', sub: 'BSC parties' },
      { icon: '🗂️', label: 'Meter registry', sub: 'MPAN ↔ supplier' },
    ],
  },
  {
    group: 'Semi-structured',
    tone: 'amber',
    items: [
      { icon: '🏛️', label: 'Anomaly taxonomy', sub: 'reference JSON' },
    ],
  },
  {
    group: 'Unstructured',
    tone: 'blue',
    items: [
      { icon: '🛰️', label: 'Grid / network events' },
      { icon: '🛠️', label: 'Maintenance logs' },
    ],
  },
]

const ingest: Node[] = [
  { icon: '🔀', label: 'Lakeflow Connect', sub: 'ingest + Auto Loader', dbx: true },
  { icon: '⏱️', label: 'Watermark + dedup', sub: '48h late data' },
  { icon: '🧠', label: 'ML model', sub: 'Isolation Forest · MLflow' },
]

const storage: Node[] = [
  { icon: '🥉', label: 'Bronze', sub: 'raw reads', dbx: true },
  { icon: '🥈', label: 'Silver', sub: 'cleaned + deduped', dbx: true },
  { icon: '🥇', label: 'Gold', sub: 'curated + anomalies', dbx: true },
  { icon: '🗃️', label: 'Delta tables', sub: 'incl. case_reports' },
]

const serving: Node[] = [
  { icon: '💬', label: 'AI/BI Genie', sub: 'NL → governed SQL', dbx: true },
  { icon: '📊', label: 'AI/BI Dashboards', sub: 'consumption + anomalies', dbx: true },
  { icon: '🎯', label: 'Model Serving', sub: 'real-time anomaly scoring', dbx: true },
  { icon: '🔄', label: 'Delta Sharing', sub: 'provider → recipient', dbx: true },
]

const appCaps: Node[] = [
  { icon: '📈', label: 'Overview & KPIs', sub: 'live consumption + impact' },
  { icon: '🚨', label: 'Streaming Anomalies', sub: 'theft / meter / network' },
  { icon: '📝', label: 'Reports & Actions', sub: 'FastAPI → gold.case_reports' },
  { icon: '🔐', label: 'Governance & Consent', sub: 'purpose-based access' },
  { icon: '🔄', label: 'Data Sharing', sub: 'in-app provider/recipient' },
  { icon: '💬', label: 'Ask a Question', sub: 'Genie deep-links' },
]

const foundation: { title: string; items: string[] }[] = [
  { title: 'Unified governance', items: ['Unity Catalog', 'Purpose-based roles', 'Audit', 'MPAN masking'] },
  { title: 'All formats', items: ['Delta Lake', 'Iceberg', 'Parquet'] },
  { title: 'All clouds', items: ['AWS', 'Azure', 'GCP'] },
  { title: 'Any model', items: ['Foundation Model APIs', 'MLflow registry'] },
]

function NodeCard({ n }: { n: Node }) {
  return (
    <div className={`${styles.node} ${n.dbx ? styles.nodeDbx : ''}`}>
      <span className={styles.nodeIcon} aria-hidden="true">{n.icon}</span>
      <div className={styles.nodeText}>
        <span className={styles.nodeLabel}>{n.label}</span>
        {n.sub && <span className={styles.nodeSub}>{n.sub}</span>}
      </div>
    </div>
  )
}

function ColHead({ children }: { children: string }) {
  return <h2 className={styles.colHead}>{children}</h2>
}

export default function Architecture() {
  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Architecture"
        title="Databricks"
        titleAccent="reference architecture"
        subtitle="How this app is built on the Databricks Data Intelligence Platform — an end-to-end, Well-Architected flow from meter data to a governed Databricks App, all on one lakehouse."
        stats={[
          { value: '4', label: 'Medallion layers' },
          { value: '1', label: 'Governance plane (UC)' },
          { value: '0', label: 'Data copies to share' },
        ]}
      />

      {/* ---------- Reference architecture poster ---------- */}
      <div className={styles.poster}>
        <div className={styles.flow}>
          {/* Data Sources */}
          <div className={styles.col}>
            <ColHead>Data Sources</ColHead>
            {dataSources.map((g) => (
              <div key={g.group} className={styles.group}>
                <span className={`${styles.groupTag} ${styles[`tone_${g.tone}`]}`}>{g.group}</span>
                {g.items.map((n) => (
                  <NodeCard key={n.label} n={n} />
                ))}
              </div>
            ))}
          </div>

          <div className={styles.divider} aria-hidden="true"><span>→</span></div>

          {/* Ingest & ETL */}
          <div className={styles.col}>
            <ColHead>Ingest &amp; ETL</ColHead>
            {ingest.map((n) => <NodeCard key={n.label} n={n} />)}
          </div>

          <div className={styles.divider} aria-hidden="true"><span>→</span></div>

          {/* Storage */}
          <div className={styles.col}>
            <ColHead>Storage · Medallion</ColHead>
            {storage.map((n) => <NodeCard key={n.label} n={n} />)}
          </div>

          <div className={styles.divider} aria-hidden="true"><span>→</span></div>

          {/* Serving & Orchestration */}
          <div className={styles.col}>
            <ColHead>Serving &amp; Orchestration</ColHead>
            {serving.map((n) => <NodeCard key={n.label} n={n} />)}
          </div>

          <div className={styles.divider} aria-hidden="true"><span>→</span></div>

          {/* Databricks App */}
          <div className={`${styles.col} ${styles.appCol}`}>
            <div className={styles.appHead}>
              <span className={styles.appHeadIcon} aria-hidden="true">▧</span>
              <div>
                <span className={styles.appHeadTitle}>Databricks App</span>
                <span className={styles.appHeadSub}>this app · FastAPI + React</span>
              </div>
            </div>
            {appCaps.map((n) => <NodeCard key={n.label} n={n} />)}
          </div>
        </div>

        {/* ---------- Foundation bar ---------- */}
        <div className={styles.foundation}>
          {foundation.map((f) => (
            <div key={f.title} className={styles.foundationCell}>
              <span className={styles.foundationTitle}>{f.title}</span>
              <span className={styles.foundationItems}>{f.items.join(' · ')}</span>
            </div>
          ))}
        </div>
        <div className={styles.posterFooter}>
          One copy of data · one governance model · open formats — the Databricks Lakehouse.
        </div>
      </div>

      {/* ---------- Well-Architected pillars ---------- */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Well-Architected — how this app maps to the six pillars</h2>
        <div className={styles.pillars}>
          {[
            { icon: '🛡️', name: 'Data governance & security', body: 'Unity Catalog purpose-based roles (BSC_SETTLEMENT / MARKET_MONITORING / RESEARCH), tokenized MPAN, and account audit logs.' },
            { icon: '⚙️', name: 'Reliability', body: '48h watermarking + dedup by (mpan_id, interval_start_ts); Delta ACID; the app survives failed deploys on the last-good build.' },
            { icon: '🚀', name: 'Performance efficiency', body: 'Serverless SQL warehouse, code-split React bundle, and near-real-time ML scoring under 30s.' },
            { icon: '💰', name: 'Cost optimization', body: 'One lakehouse (no data copies), Delta Sharing instead of ETL exports, auto-stopping warehouse.' },
            { icon: '🔭', name: 'Operational excellence', body: 'Hands-off deploy.sh (build → deploy → provision table → grant SP); MLflow experiment + model registry.' },
            { icon: '📐', name: 'Interoperability & usability', body: 'Open formats (Delta/Iceberg/Parquet), Genie NL access, and a governed Databricks App front-end.' },
          ].map((p) => (
            <div key={p.name} className={styles.pillar}>
              <span className={styles.pillarIcon} aria-hidden="true">{p.icon}</span>
              <div>
                <h3 className={styles.pillarName}>{p.name}</h3>
                <p className={styles.pillarBody}>{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Callout title="Everything on one platform" variant="success">
        Ingestion, transformation, ML, serving, governance, sharing, and the app itself all run on
        the Databricks Data Intelligence Platform — no bolt-on services, one security model, and
        open storage formats end-to-end.
      </Callout>
    </div>
  )
}
