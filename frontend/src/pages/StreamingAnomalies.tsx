import { useMemo, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts'
import Callout from '../components/Callout'
import { mockAnomalies, mockTimeSeries } from '../utils/mockData'
import styles from './StreamingAnomalies.module.css'

const anomalyTypeLabel: Record<string, string> = {
  theft: 'Theft / bypass suspicion',
  meter_malfunction: 'Meter malfunction / stuck',
  network_anomaly: 'Network anomaly',
  maintenance: 'Maintenance needed',
}

const anomalyTypeShort: Record<string, string> = {
  theft: 'Theft / bypass',
  meter_malfunction: 'Meter malfunction',
  network_anomaly: 'Network anomaly',
  maintenance: 'Maintenance',
}

export default function StreamingAnomalies() {
  const [anomalies] = useState(mockAnomalies)

  const chartData = useMemo(() => {
    return mockTimeSeries.map((p) => ({
      ...p,
      time: new Date(p.ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    }))
  }, [])

  const anomalyDots = useMemo(() => {
    return chartData
      .map((d, i) => (d.anomalies > 0 ? { ...d, index: i } : null))
      .filter(Boolean) as { time: string; kwh: number; ts: string; index: number }[]
  }, [chartData])

  const stats = useMemo(() => {
    const high = anomalies.filter((a) => a.severity === 'high').length
    const avgScore = anomalies.length
      ? Math.round((anomalies.reduce((s, a) => s + a.anomaly_score, 0) / anomalies.length) * 100)
      : 0
    return [
      { label: 'Open anomalies', value: anomalies.length, tone: 'red' },
      { label: 'High severity', value: high, tone: 'red' },
      { label: 'Avg. score', value: `${avgScore}%`, tone: 'amber' },
      { label: 'Detection window', value: '24h', tone: 'neutral' },
    ]
  }, [anomalies])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Streaming Anomalies</span>
        <h1 className={styles.title}>Real-time detection</h1>
        <p className={styles.subtitle}>
          Consumption trends, top anomalies, and a live alert feed — theft, meter issues, network
          events, and maintenance.
        </p>
      </header>

      <div className={styles.statGrid}>
        {stats.map((s) => (
          <div key={s.label} className={`${styles.statTile} ${styles[`tone_${s.tone}`]}`}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <section className={styles.section}>
        <div className={styles.cardHead}>
          <h2 className={styles.sectionTitle}>Consumption &amp; anomalies</h2>
          <span className={styles.badgeMuted}>last 24 hours</span>
        </div>
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="kwhFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--elexon-red)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--elexon-red)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--elexon-gray-200)" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--elexon-gray-500)' }} tickLine={false} axisLine={{ stroke: 'var(--elexon-gray-200)' }} minTickGap={24} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--elexon-gray-500)' }} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid var(--elexon-gray-200)', boxShadow: 'var(--elexon-shadow-md)', fontSize: 12 }}
                formatter={(v: number) => [`${v} kWh`, 'Consumption']}
                labelFormatter={(_, payload) => payload[0]?.payload?.ts && new Date(payload[0].payload.ts).toLocaleString()}
              />
              <Area type="monotone" dataKey="kwh" stroke="var(--elexon-red)" strokeWidth={2} fill="url(#kwhFill)" name="kWh" />
              {anomalyDots.map((dot, i) => (
                <ReferenceDot
                  key={i}
                  x={dot.time}
                  y={dot.kwh}
                  r={5}
                  fill="var(--elexon-warning)"
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
          <div className={styles.legend}>
            <span className={styles.legendItem}><span className={styles.legendLine} /> Consumption (kWh)</span>
            <span className={styles.legendItem}><span className={styles.legendDot} /> Detected anomaly</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Top anomalies</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Anomaly</th>
                <th>MPAN (masked)</th>
                <th>Interval</th>
                <th className={styles.num}>kWh</th>
                <th>Score</th>
                <th>Type</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((a) => (
                <tr key={a.anomaly_id}>
                  <td className={styles.mono}>{a.anomaly_id}</td>
                  <td className={styles.mono}>{a.mpan_id}</td>
                  <td>{new Date(a.interval_start_ts).toLocaleString()}</td>
                  <td className={styles.num}>{a.kwh.toFixed(2)}</td>
                  <td>
                    <div className={styles.scoreCell}>
                      <div className={styles.scoreBar}>
                        <span style={{ width: `${a.anomaly_score * 100}%` }} />
                      </div>
                      <span className={styles.scoreVal}>{(a.anomaly_score * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td>{anomalyTypeShort[a.anomaly_type] || a.anomaly_type}</td>
                  <td>
                    <span className={`${styles.sevBadge} ${styles[`sev_${a.severity}`]}`}>{a.severity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Alert feed</h2>
        <ul className={styles.alertList}>
          {anomalies.map((a) => (
            <li key={a.anomaly_id} className={styles.alertItem}>
              <span className={`${styles.alertMarker} ${styles[`sev_${a.severity}`]}`} />
              <span className={styles.alertTime}>{new Date(a.created_at).toLocaleTimeString()}</span>
              <span className={styles.alertType}>{anomalyTypeLabel[a.anomaly_type] || a.anomaly_type}</span>
              <span className={styles.alertDetail}>
                MPAN {a.mpan_id} · score {(a.anomaly_score * 100).toFixed(0)}%
                <span className={`${styles.sevBadge} ${styles[`sev_${a.severity}`]}`}>{a.severity}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Callout title="Near real-time detection">
        Anomalies are detected using an ML model (e.g. Isolation Forest) on half-hourly consumption,
        logged in MLflow and promoted to Production. Late-arriving data up to 48 hours is supported
        via watermarking and deduplication by <code>(mpan_id, interval_start_ts)</code>.
      </Callout>
    </div>
  )
}
