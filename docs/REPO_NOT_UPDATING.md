# 00_setup (or repo) not updating in Databricks

Databricks **does not auto-sync** with GitHub. When we push changes, you must **pull** inside Databricks to get them.

---

## Quick steps to get the latest 00_setup

1. **Go to your repo in Databricks**  
   Left sidebar → **Workspace** or **Repos** → open the folder **elexon-reporting-settlement-accuracy-app** (or whatever you named it).

2. **Pull from GitHub**  
   With that repo folder open, look at the **top** of the page for:
   - A **branch** label (e.g. **main**), or  
   - A **Git** menu / **⋯** (three dots)  
   Then choose **Pull** (or **Pull latest**). Wait until it finishes.

3. **Reopen the notebook**  
   Open **notebooks** → **00_setup**. It should now show the latest version (catalog-not-found fix, SHOW CATALOGS hint, etc.).

---

## If you don’t see Pull

- Some workspaces use **Repos** in the sidebar: open **Repos** → your repo → look for **Pull** near the branch name at the top.
- If there’s a **Sync** or **Refresh** button, try that.
- If the repo was created as a **Git folder** under Workspace, open the folder and use the Git/Pull control for that folder.

---

## If Pull fails or isn’t available

- **Re-clone:** Create a new Git folder (same URL, branch **main**) and use that. It will have the latest code.
- **Copy from GitHub:** Open  
  https://github.com/jason-miles/elexon-reporting-settlement-accuracy-app/blob/main/notebooks/00_setup.py  
  click **Raw**, copy all, and in Databricks create or replace the notebook content (e.g. import or paste as .py source if your workspace supports it).

More options: see [DATABRICKS_GIT_SETUP.md](DATABRICKS_GIT_SETUP.md) → “Repo not updating? Pull latest”.
