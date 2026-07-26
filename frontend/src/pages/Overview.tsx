import { useEffect, useMemo, useRef, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Line, LineChart } from 'recharts'
import Callout from '../components/Callout'
import { mockKpiSummary, mockTimeSeries } from '../utils/mockData'
import styles from './Overview.module.css'

/* Animated count-up that respects reduced-motion */
function useCountUp(target: number, duration = 1100) {
  const [value, setValue] = useState(0)
  const raf = useRef<number>()
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setValue(target)
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setValue(target * eased)
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [target, duration])
  return value
}

function Sparkline({ data, color, height = 34 }: { data: number[]; color: string; height?: number }) {
  const series = data.map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={series} margin={{ top: 3, bottom: 3, left: 0, right: 0 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function Overview() {
  const [kpi, setKpi] = useState(mockKpiSummary)
  const [liveStatus] = useState<'operational' | 'degraded'>('operational')

  useEffect(() => {
    // In production: fetch from Databricks SQL / app backend
    setKpi(mockKpiSummary)
  }, [])

  const heroSeries = useMemo(
    () => mockTimeSeries.map((p) => ({ ts: p.ts, kwh: p.kwh })),
    [],
  )
  const currentKwh = heroSeries.length ? heroSeries[heroSeries.length - 1].kwh : 0

  // Count-up animated values
  const mpans = useCountUp(kpi.total_mpans)
  const kwhM = useCountUp(kpi.total_kwh / 1_000_000)
  const readings = useCountUp(kpi.total_readings)
  const protectedM = useCountUp(2.4)

  const latest = kpi.latest_reading_ts ? new Date(kpi.latest_reading_ts).toLocaleString() : '—'

  // Real sparkline trends derived from the consumption series (distinct windows per KPI)
  const kwhVals = useMemo(() => heroSeries.map((p) => p.kwh), [heroSeries])
  const sparks = useMemo(() => {
    const n = kwhVals.length
    return {
      recent: kwhVals.slice(Math.max(0, n - 12)),
      firstHalf: kwhVals.filter((_, i) => i % 2 === 0).slice(-12),
      secondHalf: kwhVals.filter((_, i) => i % 2 === 1).slice(-12),
    }
  }, [kwhVals])

  const kpis = [
    { label: 'Distinct MPANs', period: 'last 7 days', value: Math.round(mpans).toLocaleString(), icon: '⚡', trend: '+2.4%', spark: sparks.recent },
    { label: 'Total consumption', period: 'last 7 days', value: kwhM.toFixed(1), unit: 'M kWh', icon: '🔌', trend: '+1.1%', spark: sparks.firstHalf },
    { label: 'Half-hourly readings', period: 'last 7 days', value: Math.round(readings).toLocaleString(), icon: '📊', trend: '+0.8%', spark: sparks.secondHalf },
    { label: 'Latest reading', period: 'ingested', value: latest, small: true, icon: '🕒' },
  ]

  const impact = [
    { value: `£${protectedM.toFixed(1)}M`, label: 'Estimated revenue protected', sub: 'from theft & meter faults caught early', accent: 'red' },
    { value: '<30s', label: 'Anomaly detection latency', sub: 'ML scoring on half-hourly reads', accent: 'amber' },
    { value: '100%', label: 'Governed & auditable access', sub: 'Unity Catalog purpose-based roles', accent: 'green' },
  ]

  return (
    <div className={styles.page}>
      {/* ---------- Cinematic hero ---------- */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <span className={styles.eyebrow}>
              <span className={styles.liveDot} /> Live · Elexon settlement platform
            </span>
            <h1 className={styles.title}>
              Consumption Insights <span className={styles.titleAccent}>&amp; Anomaly Detection</span>
            </h1>
            <p className={styles.subtitle}>
              One governed view of GB half-hourly consumption — real-time anomaly detection,
              purpose-based access, and secure data sharing for Elexon and industry signatories.
            </p>
            <div className={styles.heroMeta}>
              <span className={`${styles.statusBadge} ${liveStatus === 'operational' ? styles.statusOk : styles.statusWarn}`}>
                <span className={styles.badgeDot} />
                {liveStatus === 'operational' ? 'All systems operational' : 'Degraded'}
              </span>
              <span className={styles.metaMuted}>Updated {latest}</span>
            </div>
          </div>

          <div className={styles.heroCard}>
            <div className={styles.heroCardHead}>
              <span>Consumption · last 24h</span>
              <span className={styles.heroTrendPill}>▲ +1.1%</span>
            </div>
            <div className={styles.heroReadout}>
              {currentKwh.toFixed(2)}<span className={styles.heroReadoutUnit}> kWh</span>
            </div>
            <div className={styles.heroChart}>
              <ResponsiveContainer width="100%" height={90}>
                <AreaChart data={heroSeries} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b6d" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#ff6b6d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="kwh" stroke="#ff8a8c" strokeWidth={2} fill="url(#heroFill)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- KPI row ---------- */}
      <div className={styles.kpiGrid}>
        {kpis.map((k) => (
          <div key={k.label} className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiIcon} aria-hidden="true">{k.icon}</span>
              {k.trend && <span className={styles.kpiTrend}>▲ {k.trend}</span>}
            </div>
            <div className={k.small ? styles.kpiValueSmall : styles.kpiValue}>
              {k.value}
              {k.unit && <span className={styles.kpiUnit}> {k.unit}</span>}
            </div>
            <div className={styles.kpiLabel}>
              {k.label} <span className={styles.kpiPeriod}>· {k.period}</span>
            </div>
            {k.spark && (
              <div className={styles.kpiSpark}>
                <Sparkline data={k.spark} color="var(--elexon-red-light)" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ---------- Executive impact strip ---------- */}
      <section className={styles.impactSection}>
        <h2 className={styles.sectionEyebrow}>Business impact at a glance</h2>
        <div className={styles.impactGrid}>
          {impact.map((m) => (
            <div key={m.label} className={`${styles.impactCard} ${styles[`imp_${m.accent}`]}`}>
              <div className={styles.impactValue}>{m.value}</div>
              <div className={styles.impactLabel}>{m.label}</div>
              <div className={styles.impactSub}>{m.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Pipeline status ---------- */}
      <div className={styles.statusPanel}>
        <div className={styles.statusHead}>
          <div>
            <h2 className={styles.sectionTitle}>Pipeline status</h2>
            <p className={styles.statusText}>
              Ingestion and anomaly detection are running. Late-arriving data is supported with up
              to a 48-hour watermark and deduplication by <code>(mpan_id, interval_start_ts)</code>.
            </p>
          </div>
          <div className={`${styles.statusBadge} ${styles.statusPanelBadge} ${liveStatus === 'operational' ? styles.statusOk : styles.statusWarn}`}>
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
