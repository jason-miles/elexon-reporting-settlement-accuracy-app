import { useMemo, useState } from 'react'
import Callout from '../components/Callout'
import PageHero from '../components/PageHero'
import {
  mockReports,
  reportCategories,
  assignees,
  type CaseReport,
  type ReportStatus,
  type ReportPriority,
} from '../utils/mockData'
import styles from './ReportsActions.module.css'

const statusLabel: Record<ReportStatus, string> = {
  open: 'Open',
  investigating: 'Investigating',
  escalated: 'Escalated',
  resolved: 'Resolved',
}

const nowIso = () => new Date().toISOString()
const fmt = (ts: string) => new Date(ts).toLocaleString()
let seq = 1043

export default function ReportsActions() {
  const [reports, setReports] = useState<CaseReport[]>(mockReports)
  const [selectedId, setSelectedId] = useState<string | null>(mockReports[0]?.report_id ?? null)
  const [filter, setFilter] = useState<'all' | ReportStatus>('all')
  const [showForm, setShowForm] = useState(false)

  // New-report form state
  const [form, setForm] = useState({
    title: '',
    category: reportCategories[0],
    mpan_id: '',
    priority: 'medium' as ReportPriority,
    assignee: assignees[0],
    description: '',
  })

  const filtered = useMemo(
    () => (filter === 'all' ? reports : reports.filter((r) => r.status === filter)),
    [reports, filter],
  )
  const selected = reports.find((r) => r.report_id === selectedId) ?? null

  const stats = useMemo(() => {
    const by = (s: ReportStatus) => reports.filter((r) => r.status === s).length
    return [
      { label: 'Open', value: by('open'), tone: 'red' },
      { label: 'Investigating', value: by('investigating'), tone: 'amber' },
      { label: 'Escalated', value: by('escalated'), tone: 'red' },
      { label: 'Resolved', value: by('resolved'), tone: 'green' },
    ]
  }, [reports])

  const applyAction = (id: string, action: string, status: ReportStatus, actor = 'You', note?: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.report_id === id
          ? {
              ...r,
              status,
              updated_at: nowIso(),
              actions: [...r.actions, { ts: nowIso(), actor, action, note }],
            }
          : r,
      ),
    )
  }

  const submitReport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const id = `RPT-${seq++}`
    const newReport: CaseReport = {
      report_id: id,
      title: form.title.trim(),
      category: form.category,
      mpan_id: form.mpan_id.trim() || '***----',
      priority: form.priority,
      status: 'open',
      assignee: form.assignee,
      created_at: nowIso(),
      updated_at: nowIso(),
      description: form.description.trim(),
      actions: [{ ts: nowIso(), actor: 'You', action: 'Report created' }],
    }
    setReports((prev) => [newReport, ...prev])
    setSelectedId(id)
    setShowForm(false)
    setForm({ title: '', category: reportCategories[0], mpan_id: '', priority: 'medium', assignee: assignees[0], description: '' })
  }

  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Reports & Actions"
        title="Log reports,"
        titleAccent="take action"
        subtitle="Raise a case against an anomaly, assign an owner, and track it through to resolution — with a full activity trail for audit."
        aside={
          <button className={styles.heroButton} onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Close' : '+ Log new report'}
          </button>
        }
      />

      <div className={styles.statGrid}>
        {stats.map((s) => (
          <div key={s.label} className={`${styles.statTile} ${styles[`tone_${s.tone}`]}`}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={submitReport}>
          <h2 className={styles.formTitle}>New report</h2>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Title</span>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Short summary of the issue"
                required
              />
            </label>
            <label className={styles.field}>
              <span>MPAN (masked)</span>
              <input
                value={form.mpan_id}
                onChange={(e) => setForm({ ...form, mpan_id: e.target.value })}
                placeholder="***1234"
              />
            </label>
            <label className={styles.field}>
              <span>Category</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {reportCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Priority</span>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as ReportPriority })}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className={styles.field}>
              <span>Assignee</span>
              <select value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })}>
                {assignees.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
          </div>
          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span>Description</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What was observed, expected behaviour, any context…"
            />
          </label>
          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton}>Create report</button>
            <button type="button" className={styles.ghostButton} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className={styles.filterBar}>
        {(['all', 'open', 'investigating', 'escalated', 'resolved'] as const).map((f) => (
          <button
            key={f}
            className={`${styles.filterChip} ${filter === f ? styles.filterChipActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : statusLabel[f]}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        <ul className={styles.list}>
          {filtered.map((r) => (
            <li
              key={r.report_id}
              className={`${styles.listItem} ${selectedId === r.report_id ? styles.listItemActive : ''}`}
              onClick={() => setSelectedId(r.report_id)}
            >
              <div className={styles.listTop}>
                <span className={styles.reportId}>{r.report_id}</span>
                <span className={`${styles.priBadge} ${styles[`pri_${r.priority}`]}`}>{r.priority}</span>
              </div>
              <div className={styles.listTitle}>{r.title}</div>
              <div className={styles.listMeta}>
                <span className={`${styles.statusPill} ${styles[`st_${r.status}`]}`}>{statusLabel[r.status]}</span>
                <span className={styles.metaMuted}>{r.assignee}</span>
              </div>
            </li>
          ))}
          {filtered.length === 0 && <li className={styles.empty}>No reports in this view.</li>}
        </ul>

        {selected ? (
          <section className={styles.detail}>
            <div className={styles.detailHead}>
              <div>
                <span className={styles.reportId}>{selected.report_id}</span>
                <h2 className={styles.detailTitle}>{selected.title}</h2>
              </div>
              <span className={`${styles.statusPill} ${styles[`st_${selected.status}`]}`}>
                {statusLabel[selected.status]}
              </span>
            </div>

            <dl className={styles.metaGrid}>
              <div><dt>Category</dt><dd>{selected.category}</dd></div>
              <div><dt>MPAN</dt><dd className={styles.mono}>{selected.mpan_id}</dd></div>
              <div><dt>Priority</dt><dd className={styles.capitalize}>{selected.priority}</dd></div>
              <div><dt>Assignee</dt><dd>{selected.assignee}</dd></div>
              {selected.linked_anomaly && (
                <div><dt>Linked anomaly</dt><dd className={styles.mono}>{selected.linked_anomaly}</dd></div>
              )}
              <div><dt>Updated</dt><dd>{fmt(selected.updated_at)}</dd></div>
            </dl>

            {selected.description && <p className={styles.description}>{selected.description}</p>}

            <div className={styles.actionBar}>
              <span className={styles.actionLabel}>Take action:</span>
              <button
                className={styles.actionBtn}
                disabled={selected.status !== 'open'}
                onClick={() => applyAction(selected.report_id, 'Acknowledged', 'investigating')}
              >
                Acknowledge
              </button>
              <button
                className={styles.actionBtn}
                disabled={selected.status === 'resolved'}
                onClick={() => applyAction(selected.report_id, 'Escalated', 'escalated', 'You', 'Escalated for investigation')}
              >
                Escalate
              </button>
              <button
                className={`${styles.actionBtn} ${styles.actionResolve}`}
                disabled={selected.status === 'resolved'}
                onClick={() => applyAction(selected.report_id, 'Resolved', 'resolved', 'You', 'Marked resolved')}
              >
                Resolve
              </button>
            </div>

            <div className={styles.timeline}>
              <h3 className={styles.timelineTitle}>Activity</h3>
              <ul className={styles.timelineList}>
                {[...selected.actions].reverse().map((a, i) => (
                  <li key={i} className={styles.timelineItem}>
                    <span className={styles.timelineDot} />
                    <div className={styles.timelineBody}>
                      <div className={styles.timelineTop}>
                        <span className={styles.timelineAction}>{a.action}</span>
                        <span className={styles.timelineTime}>{fmt(a.ts)}</span>
                      </div>
                      <div className={styles.timelineActor}>{a.actor}{a.note ? ` · ${a.note}` : ''}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : (
          <section className={styles.detail}>
            <p className={styles.empty}>Select a report to view details and take action.</p>
          </section>
        )}
      </div>

      <Callout variant="info" title="Demo behaviour">
        Reports and actions are held in the browser for this demo. In production, cases would be
        written to a governed Unity Catalog table (e.g. <code>gold.case_reports</code>) via an app
        backend, with the activity trail feeding the audit log.
      </Callout>
    </div>
  )
}
