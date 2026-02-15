import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
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

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Streaming Anomalies</h1>
      <p className={styles.subtitle}>
        Real-time chart, top anomalies, and alert feed (theft, meter issues, network, maintenance).
      </p>

      <Callout title="Near real-time detection">
        Anomalies are detected using an ML model (e.g. Isolation Forest) on half-hourly consumption.
        Late-arriving data up to 48 hours is supported via watermarking and deduplication by
        (mpan_id, interval_start_ts).
      </Callout>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Consumption & anomalies (last 24h)</h2>
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v: number) => [v, 'kWh']}
                labelFormatter={(_, payload) => payload[0]?.payload?.ts && new Date(payload[0].payload.ts).toLocaleString()}
              />
              <Line type="monotone" dataKey="kwh" stroke="var(--elexon-red)" strokeWidth={2} dot={false} name="kWh" />
              {anomalyDots.map((dot, i) => (
                <ReferenceDot
                  key={i}
                  x={dot.time}
                  y={dot.kwh}
                  r={5}
                  fill="var(--elexon-warning)"
                  stroke="var(--elexon-gray-900)"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Top anomalies</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Anomaly ID</th>
                <th>MPAN (masked)</th>
                <th>Interval</th>
                <th>kWh</th>
                <th>Score</th>
                <th>Type</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((a) => (
                <tr key={a.anomaly_id}>
                  <td>{a.anomaly_id}</td>
                  <td>{a.mpan_id}</td>
                  <td>{new Date(a.interval_start_ts).toLocaleString()}</td>
                  <td>{a.kwh.toFixed(2)}</td>
                  <td>{(a.anomaly_score * 100).toFixed(0)}%</td>
                  <td>{anomalyTypeLabel[a.anomaly_type] || a.anomaly_type}</td>
                  <td>
                    <span className={styles[`sev_${a.severity}`]}>{a.severity}</span>
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
              <span className={styles.alertTime}>
                {new Date(a.created_at).toLocaleTimeString()}
              </span>
              <span className={styles.alertType}>{anomalyTypeLabel[a.anomaly_type] || a.anomaly_type}</span>
              <span className={styles.alertDetail}>
                MPAN *** — score {(a.anomaly_score * 100).toFixed(0)}%, severity {a.severity}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
