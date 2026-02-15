# Install and view the Databricks App (Consumption Insights & Anomaly Detection)

Two ways to run the React frontend:

---

## Option A: Run locally (quickest)

1. **From your Mac**, in the project root (e.g. `elexon-reporting-settlement-accuracy-app2`):
   ```bash
   cd /Users/jason.miles/vibe-coding-repos/elexon-reporting-settlement-accuracy-app2/frontend
   npm install
   npm run build
   npm run preview
   ```
2. Open the URL shown (e.g. `http://localhost:4173`) in your browser.
3. The app uses mock data by default. To connect to real data, you’d add an API or SQL warehouse endpoint later.

---

## Option B: Deploy as a Databricks App (in workspace)

### 1. Build the frontend

From your Mac (or in CI):

```bash
cd frontend
npm ci
npm run build
```

This creates the `frontend/dist` folder with the built app.

### 2. Create the app in Databricks

1. In the **left sidebar**, click **New** → **App**.
2. Click **Create a custom app**.
3. **Name:** e.g. `consumption-insights-anomaly-detection` (lowercase, hyphens only).
4. **Description (optional):** `Elexon Consumption Insights & Anomaly Detection`.
5. Click **Next: Configure** (or **Create app** if you want to skip config).
6. Optionally set compute size, user authorization, or app resources.
7. Click **Create app**.

### 3. Sync the app code and deploy

After the app is created, Databricks shows instructions. Use one of these:

**A. Sync from your Mac (Databricks CLI):**

```bash
cd /Users/jason.miles/vibe-coding-repos/elexon-reporting-settlement-accuracy-app2/frontend
databricks sync . /Workspace/Users/<your-email>/consumption-insights-app
```

Then in Databricks: open the app → **Deploy** (or use the deploy button on the app details page).

**B. Upload from Repos:**

1. In Databricks, open your **Repos** → `elexon-reporting-settlement-accuracy-app`.
2. Go to the **frontend** folder.
3. Build in Repos (if Node is available) or build locally and upload the **frontend** folder (including `dist`) to the path shown in the app details (e.g. `/Workspace/Users/<you>/consumption-insights-app`).
4. Click **Deploy** on the app.

**C. Manual upload:**

1. Zip the **frontend** folder (including `package.json`, `dist/`, `index.html`, `vite.config.ts`, `src/`, etc.).
2. In the app details page, use **Upload** or **Sync** to upload the zip or folder.
3. Click **Deploy**.

### 4. Open the app URL

After deployment succeeds, Databricks shows the **App URL** (e.g. `https://<workspace>.cloud.databricks.com/apps/<app-name>`). Click it or copy it into your browser to open the app.

---

## Important: frontend needs a `start` script for Databricks

The Databricks Apps runtime expects `npm run start` to serve the app. The `frontend/package.json` should include:

```json
"scripts": {
  "start": "npm run build && npx serve -s dist -l 8080",
  ...
}
```

If `start` is missing, add it (see the next section). This builds the app and serves the static files so the app is reachable in the browser.

---

## If the app fails to deploy

- **Node not found:** Databricks Apps support Node.js; ensure the app’s compute/environment has Node installed.
- **Build fails:** Run `npm run build` locally first; if it succeeds, the same dependencies should work in Databricks.
- **404 / blank page:** Ensure `vite.config.ts` has `base: './'` so asset paths work when served from a subpath.
- **No data:** The app uses mock data by default. Real data requires connecting to a Databricks SQL warehouse or backend API (future enhancement).
