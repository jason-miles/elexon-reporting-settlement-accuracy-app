# Databricks AI Dev Kit

This project uses [Databricks AI Dev Kit](https://github.com/databricks-solutions/ai-dev-kit) standards for AI-assisted development on Databricks.

## What's Installed

- **Skills** (`.cursor/skills/`): 19+ Databricks skills for pipelines, Unity Catalog, MLflow, Jobs, Apps, etc.
- **MCP Server** (`.cursor/mcp.json`): 50+ Databricks tools for AI assistants
- **Project rule** (`.cursor/rules/databricks-ai-dev-kit.mdc`): Standards for Databricks work

## Apply to New Databricks Projects

For any new Databricks project, run:

```bash
cd your-new-project
bash <(curl -sL https://raw.githubusercontent.com/databricks-solutions/ai-dev-kit/main/install.sh) --tools cursor
```

Then copy the rule from this project:

```bash
mkdir -p .cursor/rules
cp /Users/jason.miles/vibe-coding-repos/elexon-reporting-settlement-accuracy-app2/.cursor/rules/databricks-ai-dev-kit.mdc .cursor/rules/
```

## Global User Rule (Optional)

To have AI Dev Kit standards apply across all projects, add this to **Cursor Settings** → **General** → **Rules for AI**:

```
When working on Databricks projects (databricks.yml, notebooks, pipelines): Follow Databricks AI Dev Kit standards. Install with: bash <(curl -sL https://raw.githubusercontent.com/databricks-solutions/ai-dev-kit/main/install.sh) --tools cursor. Use skills in .cursor/skills/ for patterns.
```
