import { useEffect, useState } from 'react'
import Callout from '../components/Callout'
import { mockKpiSummary } from '../utils/mockData'
import styles from './Overview.module.css'

export default function Overview() {
  const [kpi, setKpi] = useState(mockKpiSummary)
  const [liveStatus] = useState<'operational' | 'degraded'>('operational')

  useEffect(() => {
    // In production: fetch from Databricks SQL / app backend
    setKpi(mockKpiSummary)
  }, [])

  const formatNum = (n: number) => n.toLocaleString()
  const formatKwh = (n: number) => `${(n / 1_000_000).toFixed(1)}M`
  const latest = kpi.latest_reading_ts ? new Date(kpi.latest_reading_ts).toLocaleString() : '—'

  const kpis = [
    { label: 'Distinct MPANs', period: 'last 7 days', value: formatNum(kpi.total_mpans), icon: '⚡', trend: '+2.4%' },
    { label: 'Total consumption', period: 'last 7 days', value: formatKwh(kpi.total_kwh), unit: 'kWh', icon: '🔌', trend: '+1.1%' },
    { label: 'Half-hourly readings', period: 'last 7 days', value: formatNum(kpi.total_readings), icon: '📈', trend: '+0.8%' },
    { label: 'Latest reading', period: 'ingested', value: latest, small: true, icon: '🕒' },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Consumption Insights &amp; Anomaly Detection</span>
        <h1 className={styles.title}>Overview</h1>
        <p className={styles.subtitle}>
          A single, governed view of GB half-hourly consumption — with real-time anomaly detection,
          purpose-based access, and secure data sharing for Elexon and industry signatories.
        </p>
      </header>

      <div className={styles.kpiGrid}>
        {kpis.map((k) => (
          <div key={k.label} className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiIcon} aria-hidden="true">{k.icon}</span>
              {k.trend && <span className={styles.kpiTrend}>{k.trend}</span>}
            </div>
            <div className={k.small ? styles.kpiValueSmall : styles.kpiValue}>
              {k.value}
              {k.unit && <span className={styles.kpiUnit}> {k.unit}</span>}
            </div>
            <div className={styles.kpiLabel}>
              {k.label} <span className={styles.kpiPeriod}>· {k.period}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.statusPanel}>
        <div className={styles.statusHead}>
          <div>
            <h2 className={styles.sectionTitle}>Pipeline status</h2>
            <p className={styles.statusText}>
              Ingestion and anomaly detection are running. Late-arriving data is supported with up
              to a 48-hour watermark and deduplication by <code>(mpan_id, interval_start_ts)</code>.
            </p>
          </div>
          <div className={`${styles.statusBadge} ${liveStatus === 'operational' ? styles.statusOk : styles.statusWarn}`}>
            <span className={styles.badgeDot} />
            {liveStatus === 'operational' ? 'Operational' : 'Degraded'}
          </div>
        </div>
        <div className={styles.pipeline}>
          {['Bronze · raw', 'Silver · cleaned', 'Gold · curated', 'ML · anomalies'].map((stage, i, arr) => (
            <div key={stage} className={styles.pipeStageWrap}>
              <div className={styles.pipeStage}>
                <span className={styles.pipeCheck}>✓</span>
                {stage}
              </div>
              {i < arr.length - 1 && <span className={styles.pipeArrow}>→</span>}
            </div>
          ))}
        </div>
      </div>

      <Callout title="What this app does" variant="success">
        Consumption Insights &amp; Anomaly Detection gives Elexon internal ops and industry signatories
        (suppliers/generators) one place to see half-hourly consumption, real-time anomaly alerts
        (theft, meter malfunction, network issues, maintenance), and governed access to data via
        Unity Catalog and Delta Sharing.
      </Callout>

      <Callout title="Demo context">
        This demo uses synthetic MPAN-like identifiers and sample data. In production, ~40M MPANs
        would be represented; access is controlled by purpose (settlement, market monitoring,
        research) and Delta Sharing for external recipients.
      </Callout>
    </div>
  )
}
