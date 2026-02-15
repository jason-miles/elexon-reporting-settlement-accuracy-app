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
  const formatKwh = (n: number) => `${(n / 1_000_000).toFixed(1)}M kWh`
  const latest = kpi.latest_reading_ts ? new Date(kpi.latest_reading_ts).toLocaleString() : '—'

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Overview</h1>
      <p className={styles.subtitle}>
        High-level KPIs and live status for half-hourly consumption and anomaly detection.
      </p>

      <Callout title="What this app does" variant="success">
        Consumption Insights & Anomaly Detection gives Elexon internal ops and industry signatories
        (suppliers/generators) a single view of half-hourly consumption, real-time anomaly alerts
        (theft, meter malfunction, network issues, maintenance), and governed access to data
        via Unity Catalog and Delta Sharing.
      </Callout>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Distinct MPANs (7d)</div>
          <div className={styles.kpiValue}>{formatNum(kpi.total_mpans)}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Total consumption (7d)</div>
          <div className={styles.kpiValue}>{formatKwh(kpi.total_kwh)}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Half-hourly readings (7d)</div>
          <div className={styles.kpiValue}>{formatNum(kpi.total_readings)}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Latest reading</div>
          <div className={styles.kpiValueSmall}>{latest}</div>
        </div>
      </div>

      <div className={styles.statusSection}>
        <h2 className={styles.sectionTitle}>Live status</h2>
        <div className={`${styles.statusBadge} ${liveStatus === 'operational' ? styles.statusOk : styles.statusWarn}`}>
          {liveStatus === 'operational' ? 'Operational' : 'Degraded'}
        </div>
        <p className={styles.statusText}>
          Ingestion and anomaly detection pipelines are running. Data is available with up to 48h
          watermark for late-arriving data.
        </p>
      </div>

      <Callout title="Demo context">
        This demo uses synthetic MPAN-like identifiers and sample data. In production, ~40M MPANs
        would be represented; access is controlled by purpose (settlement, market monitoring,
        research) and Delta Sharing for external recipients.
      </Callout>
    </div>
  )
}
