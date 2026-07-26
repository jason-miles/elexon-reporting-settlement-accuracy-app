import styles from './PageLoader.module.css'

export default function PageLoader() {
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>Loading…</span>
    </div>
  )
}
