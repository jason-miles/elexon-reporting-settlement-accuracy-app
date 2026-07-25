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

/* ---------- Reports & Actions ---------- */

export type ReportStatus = 'open' | 'investigating' | 'escalated' | 'resolved'
export type ReportPriority = 'high' | 'medium' | 'low'

export interface ReportAction {
  ts: string
  actor: string
  action: string
  note?: string
}

export interface CaseReport {
  report_id: string
  title: string
  category: string
  linked_anomaly?: string
  mpan_id: string
  priority: ReportPriority
  status: ReportStatus
  assignee: string
  created_at: string
  updated_at: string
  description: string
  actions: ReportAction[]
}

export const reportCategories = [
  'Theft / bypass',
  'Meter malfunction',
  'Network anomaly',
  'Maintenance',
  'Data quality',
  'Other',
]

export const assignees = [
  'Unassigned',
  'Ops — Settlement',
  'Ops — Field',
  'Market Monitoring',
  'Data Engineering',
]

export const mockReports: CaseReport[] = [
  {
    report_id: 'RPT-1042',
    title: 'Zero consumption on active MPAN — suspected stuck meter',
    category: 'Meter malfunction',
    linked_anomaly: 'a1',
    mpan_id: '***4567',
    priority: 'high',
    status: 'investigating',
    assignee: 'Ops — Field',
    created_at: '2024-02-15T09:10:00Z',
    updated_at: '2024-02-15T11:20:00Z',
    description:
      'Meter reporting 0.00 kWh across consecutive half-hourly intervals despite site being active. Anomaly score 92%.',
    actions: [
      { ts: '2024-02-15T09:10:00Z', actor: 'System', action: 'Report created', note: 'Auto-raised from anomaly a1' },
      { ts: '2024-02-15T09:42:00Z', actor: 'Ops — Settlement', action: 'Acknowledged' },
      { ts: '2024-02-15T11:20:00Z', actor: 'Ops — Field', action: 'Assigned', note: 'Field visit scheduled' },
    ],
  },
  {
    report_id: 'RPT-1041',
    title: 'Consumption spike inconsistent with profile — possible bypass',
    category: 'Theft / bypass',
    linked_anomaly: 'a2',
    mpan_id: '***8821',
    priority: 'high',
    status: 'escalated',
    assignee: 'Market Monitoring',
    created_at: '2024-02-15T07:15:00Z',
    updated_at: '2024-02-15T08:05:00Z',
    description: 'Overnight consumption pattern inconsistent with historical profile. Escalated for investigation.',
    actions: [
      { ts: '2024-02-15T07:15:00Z', actor: 'System', action: 'Report created', note: 'Auto-raised from anomaly a2' },
      { ts: '2024-02-15T08:05:00Z', actor: 'Market Monitoring', action: 'Escalated', note: 'Referred to revenue protection' },
    ],
  },
  {
    report_id: 'RPT-1039',
    title: 'Intermittent network gaps in half-hourly feed',
    category: 'Network anomaly',
    linked_anomaly: 'a3',
    mpan_id: '***1203',
    priority: 'medium',
    status: 'resolved',
    assignee: 'Data Engineering',
    created_at: '2024-02-14T05:40:00Z',
    updated_at: '2024-02-14T14:00:00Z',
    description: 'Gaps in feed traced to upstream comms outage. Backfilled within 48h watermark window.',
    actions: [
      { ts: '2024-02-14T05:40:00Z', actor: 'System', action: 'Report created' },
      { ts: '2024-02-14T09:12:00Z', actor: 'Data Engineering', action: 'Acknowledged' },
      { ts: '2024-02-14T14:00:00Z', actor: 'Data Engineering', action: 'Resolved', note: 'Late data backfilled; readings reconciled' },
    ],
  },
]
