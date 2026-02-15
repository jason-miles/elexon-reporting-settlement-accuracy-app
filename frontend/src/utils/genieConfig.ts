/**
 * Genie space URL for "Ask a Question" tab.
 * After creating a Genie space in Databricks, get the shareable link from Share → Copy link.
 * Set VITE_GENIE_SPACE_URL when building, or replace the default below.
 */
// Set to your Genie space shareable link (Share → Copy link) after creating the space.
// Until then, links to the workspace where users can open Genie from the sidebar.
export const GENIE_SPACE_URL =
  import.meta.env.VITE_GENIE_SPACE_URL ||
  'https://fevm-elexon-app-for-settlement-acc.cloud.databricks.com/?o=7474654808133980'
