import { ReactNode } from 'react'
import styles from './Callout.module.css'

type Variant = 'default' | 'success' | 'warning' | 'info'

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
      <div className={styles.calloutTitle}>{title}</div>
      <div className={styles.calloutBody}>{children}</div>
    </div>
  )
}
