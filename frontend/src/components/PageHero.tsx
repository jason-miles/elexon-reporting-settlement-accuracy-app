import { ReactNode } from 'react'
import styles from './PageHero.module.css'

export interface HeroStat {
  value: string
  label: string
}

export default function PageHero({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  stats,
  aside,
}: {
  eyebrow: string
  title: string
  /** Optional trailing part of the title rendered in the gradient accent. */
  titleAccent?: string
  subtitle: string
  /** Compact stat chips shown on the right (ignored if `aside` is provided). */
  stats?: HeroStat[]
  /** Custom right-hand content; overrides `stats`. */
  aside?: ReactNode
}) {
  return (
    <section className={styles.hero}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.left}>
          <span className={styles.eyebrow}>
            <span className={styles.dot} /> {eyebrow}
          </span>
          <h1 className={styles.title}>
            {title}
            {titleAccent && <span className={styles.titleAccent}> {titleAccent}</span>}
          </h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {aside ? (
          <div className={styles.aside}>{aside}</div>
        ) : stats && stats.length > 0 ? (
          <div className={styles.stats}>
            {stats.map((s) => (
              <div key={s.label} className={styles.stat}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
