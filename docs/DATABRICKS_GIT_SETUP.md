# Connect the repo to Databricks (Step 2)

You need to do **two things**: (1) add your GitHub credential, then (2) clone the repo into the workspace.

---

## Part A: Add your GitHub credential

So Databricks can read from GitHub, link your Git account once:

1. In the left **Settings** panel, look under the **User** section.
2. Click **Linked accounts** (not "Developer").
3. Find **Git** / **Add Git credential**.
4. Choose **GitHub**:
   - **Option 1 (recommended):** Use **Link Git account** / Databricks GitHub app — follow the prompts to authorize and install on your repos.
   - **Option 2:** Use a **Personal Access Token**: create a token at https://github.com/settings/tokens with `repo` scope, then paste it in Databricks when asked.

After this, Databricks can clone and sync your GitHub repos.

---

## Part B: Clone the repo into the workspace

1. In the **left sidebar**, click **Workspace** (or **Repos**, if your workspace has it).
2. Go to the folder where you want the repo (e.g. your user folder or **Repos**).
3. Click **Create** (or **Add**) and choose **Git folder** / **Repo**.
4. Fill in:
   - **Repository URL:** `https://github.com/jason-miles/elexon-reporting-settlement-accuracy-app`
   - **Git provider:** GitHub  
   - **Branch (optional):** `main`
   - **Folder name (optional):** e.g. `elexon-reporting-settlement-accuracy-app`
5. Click **Create** (or **Clone**).

Databricks will clone the repo. You’ll see the folders: `backend`, `frontend`, `data`, `notebooks`, etc.

---

## If you don’t see “Git integration” or “Linked accounts”

- **Git credentials** are under **Settings** → **User** → **Linked accounts** (add GitHub there).
- **Workspace-level** “Git integration” (if your org uses it) may be under **Settings** → **Workspace admin** or **Workspace settings** — only workspace admins see that. For most users, **Linked accounts** + **Create Git folder** from Workspace is enough.

---

## Repo not updating? Pull latest from GitHub

Databricks does **not** auto-sync with GitHub. After we push changes (e.g. to `00_setup`), you must **pull** in Databricks to see them.

### Option 1 — Pull from the repo folder (recommended)

1. In the **left sidebar**, open **Workspace** (or **Repos**).
2. Navigate to the **folder that contains the repo** (e.g. **Repos** → your user → **elexon-reporting-settlement-accuracy-app**, or wherever you cloned it).
3. **Click on that repo folder** so you’re inside it (you should see `backend`, `frontend`, `data`, `notebooks`).
4. At the **top of the page**, look for the **branch name** (e.g. **main**) or a **Git** / **Pull** control.
5. Click the branch name or the **⋯** (three dots) or **Git** menu → choose **Pull** (or **Pull latest**). Confirm if asked.
6. Wait for the pull to finish. Then open **notebooks** → **00_setup** again; it should show the latest version.

### Option 2 — Pull from the notebook

1. Open the **00_setup** notebook (or any file inside the repo).
2. Look at the **top bar** of the notebook or the repo breadcrumb — there may be a **Pull** icon or a Git menu.
3. Click **Pull** to fetch the latest from GitHub.

### Option 3 — Re-clone the repo

If Pull is missing or fails (e.g. conflicts):

1. Rename the existing repo folder (e.g. add `_old` to the name) or note its path.
2. Create a **new** Git folder as in Part B above, same URL and branch **main**.
3. Use the new folder; it will have the latest from GitHub. You can delete the old folder later.

### Option 4 — Copy the notebook from GitHub

1. On your Mac, open https://github.com/jason-miles/elexon-reporting-settlement-accuracy-app/blob/main/notebooks/00_setup.py
2. Click **Raw** to get the plain file.
3. Copy all the content.
4. In Databricks, open **00_setup** (or create a new notebook), switch to **File** → **Import** (if available) or paste the content into the notebook and save. (Databricks notebooks can be imported as .py source.)

---

## After the repo is cloned: run the notebooks

1. In the cloned repo folder, open **notebooks**.
2. Run in order: **00_setup** → **01_ingest_bronze** → **02_transform_silver** → **03_curate_gold** → **04_unity_catalog_governance** → **05_ml_anomaly_detection** → **06_delta_sharing**.
3. For each notebook: open it and run all cells (or use **Run all**).

That’s Step 2.
