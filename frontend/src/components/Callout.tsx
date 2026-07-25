import { ReactNode } from 'react'
import styles from './Callout.module.css'

type Variant = 'default' | 'success' | 'warning' | 'info'

const icons: Record<Variant, string> = {
  default: 'ℹ',
  success: '✓',
  warning: '!',
  info: 'ℹ',
}

export default function Callout({
  title,
  children,
  variant = 'default',
}: {
  title: string
  children: ReactNode
  variant?: Variant
}) {
  return (
    <div className={`${styles.callout} ${styles[variant]}`}>
      <span className={styles.icon} aria-hidden="true">
        {icons[variant]}
      </span>
      <div className={styles.content}>
        <div className={styles.calloutTitle}>{title}</div>
        <div className={styles.calloutBody}>{children}</div>
      </div>
    </div>
  )
}
