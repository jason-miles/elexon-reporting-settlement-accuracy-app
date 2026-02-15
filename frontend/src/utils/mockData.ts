/**
 * Mock data for demo when backend/warehouse is not connected.
 * Replace with real API calls to Databricks SQL or app backend.
 */

export interface KpiSummary {
  total_mpans: number
  total_kwh: number
  total_readings: number
  latest_reading_ts: string
}

export interface AnomalyRow {
  anomaly_id: string
  mpan_id: string
  interval_start_ts: string
  kwh: number
  anomaly_score: number
  anomaly_type: string
  severity: string
  created_at: string
}

export interface TimeSeriesPoint {
  ts: string
  kwh: number
  anomalies: number
}

export const mockKpiSummary: KpiSummary = {
  total_mpans: 40250,
  total_kwh: 28475632,
  total_readings: 13542080,
  latest_reading_ts: new Date().toISOString(),
}

export const mockAnomalies: AnomalyRow[] = [
  {
    anomaly_id: 'a1',
    mpan_id: '***4567',
    interval_start_ts: '2024-02-15T08:00:00Z',
    kwh: 0,
    anomaly_score: 0.92,
    anomaly_type: 'meter_malfunction',
    severity: 'high',
    created_at: '2024-02-15T08:35:00Z',
  },
  {
    anomaly_id: 'a2',
    mpan_id: '***8821',
    interval_start_ts: '2024-02-15T06:30:00Z',
    kwh: 12.8,
    anomaly_score: 0.88,
    anomaly_type: 'theft',
    severity: 'high',
    created_at: '2024-02-15T07:02:00Z',
  },
  {
    anomaly_id: 'a3',
    mpan_id: '***1203',
    interval_start_ts: '2024-02-15T05:00:00Z',
    kwh: 45.2,
    anomaly_score: 0.79,
    anomaly_type: 'network_anomaly',
    severity: 'medium',
    created_at: '2024-02-15T05:32:00Z',
  },
  {
    anomaly_id: 'a4',
    mpan_id: '***5544',
    interval_start_ts: '2024-02-14T22:00:00Z',
    kwh: 2.1,
    anomaly_score: 0.71,
    anomaly_type: 'maintenance',
    severity: 'low',
    created_at: '2024-02-14T22:40:00Z',
  },
]

export const mockTimeSeries: TimeSeriesPoint[] = (() => {
  const out: TimeSeriesPoint[] = []
  const base = new Date()
  for (let i = 48; i >= 0; i--) {
    const d = new Date(base)
    d.setMinutes(d.getMinutes() - 30 * i)
    const h = d.getHours() + d.getMinutes() / 60
    const kwh = 0.4 + 0.5 * Math.sin((h - 6) * Math.PI / 12) + (Math.random() - 0.5) * 0.2
    out.push({
      ts: d.toISOString(),
      kwh: Math.max(0.01, Math.round(kwh * 100) / 100),
      anomalies: Math.random() > 0.92 ? 1 : 0,
    })
  }
  return out
})()

export const mockGrants = [
  { Principal: 'BSC_SETTLEMENT', ActionType: 'SELECT', ObjectType: 'TABLE' },
  { Principal: 'BSC_MARKET_MONITORING', ActionType: 'SELECT', ObjectType: 'TABLE' },
  { Principal: 'BSC_RESEARCH', ActionType: 'SELECT', ObjectType: 'TABLE' },
  { Principal: 'RECIPIENT_USER', ActionType: 'SELECT', ObjectType: 'TABLE' },
]

export const mockRecipientTables = [
  { tableName: 'gold_consumption_curated', tableCatalog: 'elexon_app_for_settlement_acc_catalog', tableSchema: 'recipient_shared' },
  { tableName: 'gold_anomalies', tableCatalog: 'elexon_app_for_settlement_acc_catalog', tableSchema: 'recipient_shared' },
]

export const mockProviderTables = [
  { tableName: 'consumption_half_hourly', tableSchema: 'gold' },
  { tableName: 'consumption_daily_agg', tableSchema: 'gold' },
  { tableName: 'anomalies', tableSchema: 'gold' },
  { tableName: 'gold_consumption_curated', tableSchema: 'gold' },
  { tableName: 'gold_anomalies', tableSchema: 'gold' },
]
