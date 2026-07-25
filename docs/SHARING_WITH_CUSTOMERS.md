# Sharing the Bundle with Customers

This bundle is **standalone** — no GitHub or git required. Share it with customers as a folder or zip.

---

## Before sharing: verification checklist

- [ ] Folder contains: `databricks.yml`, `resources/`, `notebooks/`, `frontend/`, `backend/`, `data/`, `docs/`
- [ ] `docs/CUSTOMER_SETUP.md` is present (customer entry point)
- [ ] Run `databricks bundle validate -t dev` — passes (optional, requires CLI + auth)

---

## How to prepare the bundle for sharing

**Option A: Share the folder directly**

Copy the folder to a shared drive or transfer location. Exclude before copying:
- `.git/` (version control — not needed by customer)
- `node_modules/` (large; customer runs `npm install` if building locally)
- `.databricks/` (deployment state — customer-specific)
- `STATUS_*.md` (internal status files)

**Option B: Create a zip**

From the parent directory of the bundle folder:

```bash
cd /path/to/parent
zip -r elexon-consumption-insights-bundle.zip elexon-reporting-settlement-accuracy-app2 \
  -x "*.git*" -x "*__pycache__*" -x "*node_modules*" -x "*.databricks*" -x "STATUS_*"
```

When the customer extracts the zip, they get a folder they can `cd` into and deploy from.

---

## How to share

- **Zip file** — Email, SharePoint, OneDrive, or similar (check size limits)
- **Shared drive** — Copy the folder to a network share
- **Secure file transfer** — Use your organization's preferred method

---

## What to tell the customer

**Short version:**

> Attached is the Elexon Consumption Insights bundle. Extract the folder, open **docs/CUSTOMER_SETUP.md**, and follow the steps. You will edit `databricks.yml` with your workspace URL, then run `databricks bundle deploy`. No GitHub or git required.

**Slightly longer:**

1. Extract the zip (or copy the folder) to your machine.
2. Open **docs/CUSTOMER_SETUP.md** — this is your setup guide.
3. Edit `databricks.yml` and set your Databricks workspace URL in `targets.dev.workspace.host`.
4. Run `databricks bundle deploy -t dev`, then `databricks bundle run elexon_setup_only -t dev`.
5. Open the app from **Apps** in your Databricks workspace.
