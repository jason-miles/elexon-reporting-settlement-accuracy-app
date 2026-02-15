/**
 * Genie space URL for "Ask a Question" tab.
 * Direct link to "Genie Room: Elexon Consumption & Anomaly Detection".
 * Get the exact URL from Databricks: open the Genie space → Share → Copy link.
 * Override with VITE_GENIE_SPACE_URL when building if needed.
 */
export const GENIE_SPACE_URL =
  import.meta.env.VITE_GENIE_SPACE_URL ||
  'https://fevm-elexon-app-for-settlement-acc.cloud.databricks.com/?o=7474654808133980#workspace/Users/jason.miles@databricks.com/Genie%20Room%3A%20Elexon%20Consumption%20%26%20Anomaly%20Detection'
