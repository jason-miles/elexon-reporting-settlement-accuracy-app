import styles from './PageLoader.module.css'

/**
 * Skeleton shown while a lazy route chunk loads. Mimics the common page shape
 * (hero band → stat tiles → content block) so the layout doesn't jump when the
 * real page mounts.
 */
export default function PageLoader() {
  return (
    <div className={styles.skeleton} role="status" aria-live="polite" aria-busy="true">
      <span className={styles.srOnly}>Loading…</span>

      <div className={`${styles.block} ${styles.hero} ${styles.shimmer}`} />

      <div className={styles.tiles}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${styles.block} ${styles.tile} ${styles.shimmer}`} />
        ))}
      </div>

      <div className={`${styles.block} ${styles.panel} ${styles.shimmer}`} />
    </div>
  )
}
