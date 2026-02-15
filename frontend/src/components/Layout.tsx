import { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import styles from './Layout.module.css'

export default function Layout({ children }: { children: ReactNode }) {
  const nav = [
    { to: '/', label: 'Overview' },
    { to: '/streaming-anomalies', label: 'Streaming Anomalies' },
    { to: '/governance-consent', label: 'Governance & Consent' },
    { to: '/data-sharing', label: 'Data Sharing' },
    { to: '/ask-question', label: 'Ask a Question' },
  ]
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src="/elexon-logo.jpg" alt="Elexon" className={styles.logoImg} />
          <span className={styles.appName}>Consumption Insights & Anomaly Detection</span>
        </div>
        <nav className={styles.nav}>
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        Elexon demo · Unity Catalog · Delta Sharing · UK South
      </footer>
    </div>
  )
}
