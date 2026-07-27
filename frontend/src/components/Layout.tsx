import { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import styles from './Layout.module.css'

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const nav = [
    { to: '/', label: 'Overview', end: true },
    { to: '/business-overview', label: 'Business Overview' },
    { to: '/architecture', label: 'Architecture' },
    { to: '/streaming-anomalies', label: 'Streaming Anomalies' },
    { to: '/reports-actions', label: 'Reports & Actions' },
    { to: '/governance-consent', label: 'Governance & Consent' },
    { to: '/data-sharing', label: 'Data Sharing' },
    { to: '/ask-question', label: 'Ask a Question' },
  ]
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <img src="/elexon-logo.jpg" alt="Elexon" className={styles.logoImg} />
            <span className={styles.divider} />
            <div className={styles.brandText}>
              <span className={styles.appName}>Consumption Insights</span>
              <span className={styles.appSub}>&amp; Anomaly Detection</span>
            </div>
          </div>

          <div className={styles.headerMeta}>
            <span className={styles.statusPill}>
              <span className={styles.statusDot} />
              Operational
            </span>
            <span className={styles.envPill}>Synthetic data · UK South</span>
          </div>
        </div>

        <nav className={styles.nav} aria-label="Primary">
          {nav.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className={styles.main} key={pathname}>
        {children}
      </main>

      <footer className={styles.footer}>
        <span>Elexon demo · Powered by Databricks</span>
        <span className={styles.footerTags}>Unity Catalog · Delta Sharing · MLflow · Genie</span>
      </footer>
    </div>
  )
}
