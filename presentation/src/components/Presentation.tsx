import {
  Clock,
  DollarSign,
  Zap,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Server,
  ArrowRight,
  FileText,
  Code,
  Palette,
  Target,
  Monitor,
  GitBranch,
  FileCheck,
} from "lucide-react";
import MermaidDiagram from "./MermaidDiagram";
import SlideDeck from "./SlideDeck";

const AS_IS_MERMAID = `C4Container
  title Current Architecture — Fragmented Settlement Monitoring

  Person(analyst, "Settlement Analyst", "Monitors accuracy, reconciles data")

  System_Boundary(sources, "Data Sources") {
    Container(portal, "Elexon Portal", "Web", "Finalised settlement, Best View Prices")
    Container(insights, "Insights Solution", "API", "Indicative prices, real-time data")
    ContainerDb(mdm, "MDM", "Meter Data", "Half-hourly meter reads")
  }

  System_Boundary(tools, "Monitoring Tools") {
    Container(spreadsheets, "Spreadsheets", "Excel", "Manual accuracy tracking")
    Container(reports, "Batch Reports", "Exports", "Delayed reconciliation")
  }

  Rel(analyst, spreadsheets, "Updates manually")
  Rel(analyst, portal, "Downloads exports")
  Rel(analyst, insights, "Checks prices")
  Rel(portal, spreadsheets, "Copy-paste")
  Rel(mdm, reports, "Batch sync", "Hours delay")
  Rel(reports, spreadsheets, "Manual cross-check")
`;

const TO_BE_MERMAID = `C4Container
  title Target Architecture — Databricks Lakehouse

  Person(analyst, "Settlement Analyst", "Monitors accuracy, explores data")

  System_Ext(sources, "Elexon Sources", "Portal, Insights, MDM")

  System_Boundary(databricks, "Databricks Lakehouse Platform") {
    Container(lakeflow, "Lakeflow Pipeline", "SDP", "Ingests settlement data")
    ContainerDb(delta, "Delta Tables", "Unity Catalog", "Settlement, accuracy metrics")
    Container(uc, "Unity Catalog", "Governance", "Lineage, access control, audit")
    Container(aibi, "AI/BI Dashboards", "Databricks", "Real-time accuracy KPIs")
    Container(genie, "Genie Space", "Text-to-SQL", "Natural language queries")
    Container(app, "Databricks App", "APX", "Interactive monitoring")
  }

  Rel(sources, lakeflow, "Ingests")
  Rel(lakeflow, delta, "Writes")
  Rel(delta, uc, "Governed")
  Rel(delta, aibi, "Visualises")
  Rel(delta, genie, "Queries")
  Rel(analyst, app, "Monitors")
  Rel(analyst, aibi, "Views dashboards")
  Rel(analyst, genie, "Asks questions")
`;

function TitleSlide() {
  return (
    <section className="space-y-6 py-16 text-center">
      <span className="rounded-full border border-gray-300 px-4 py-1 text-sm">
        Databricks Demo
      </span>
      <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
        Elexon Settlement{" "}
        <span className="text-accent">Accuracy</span> App
      </h1>
      <p className="mx-auto max-w-2xl text-xl text-gray-600">
        Real-time settlement accuracy monitoring with governed lineage and
        AI-assisted insights
      </p>
      <div className="flex items-center justify-center gap-4 pt-4">
        <span className="rounded-md bg-accent px-3 py-1 text-sm font-medium text-white">
          Databricks
        </span>
        <span className="text-gray-500">&times;</span>
        <span className="rounded-md border border-accent bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
          Elexon / Energy Sector
        </span>
      </div>
      <p className="text-sm text-gray-500">March 2026</p>
    </section>
  );
}

function ChallengeSlide() {
  const challenges = [
    {
      icon: <Clock className="h-5 w-5 text-red-600" />,
      title: "99% Accuracy Compliance Pressure",
      description:
        "Suppliers must settle 99% of HH metered energy on actual reads. Spreadsheet-based monitoring makes it hard to detect drift before regulatory deadlines.",
    },
    {
      icon: <Server className="h-5 w-5 text-red-600" />,
      title: "Fragmented Data Sources",
      description:
        "Elexon Portal, Insights, MDM, and reconciliation reports live in separate systems. No unified view for real-time accuracy monitoring.",
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
      title: "Delayed Reconciliation",
      description:
        "Settlement corrections and post-M10 adjustments take days to propagate. Analysts discover issues too late for corrective action.",
    },
    {
      icon: <Database className="h-5 w-5 text-red-600" />,
      title: "Limited Visibility & Audit Trail",
      description:
        "Understanding why accuracy dropped requires piecing together logs from disparate systems. No governed lineage from source to final reports.",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">The Challenge</h2>
        <p className="text-gray-600">
          Pain points in Elexon BSC settlement reporting
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {challenges.map((c) => (
          <div
            key={c.title}
            className="rounded-lg border-2 border-red-200 bg-red-50/50 p-6"
          >
            <h3 className="mb-2 flex items-center gap-2 font-semibold">
              {c.icon} {c.title}
            </h3>
            <p className="text-gray-600">{c.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AsIsArchitectureSlide() {
  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Current Architecture</h2>
        <p className="text-gray-600">
          Fragmented systems, manual processes, delayed reconciliation
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <MermaidDiagram chart={AS_IS_MERMAID} className="min-h-[400px]" />
      </div>
    </section>
  );
}

function ToBeArchitectureSlide() {
  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">
          The <span className="text-accent">Databricks</span> Solution
        </h2>
        <p className="text-gray-600">
          Unified lakehouse for settlement data with real-time monitoring
        </p>
      </div>
      <div className="rounded-lg border-2 border-accent/30 bg-accent/5 p-8">
        <MermaidDiagram chart={TO_BE_MERMAID} className="min-h-[400px]" />
      </div>
    </section>
  );
}

function ValuePropsSlide() {
  const props = [
    {
      icon: <Zap className="h-5 w-5 text-accent" />,
      title: "Real-Time Accuracy Monitoring",
      description:
        "Live dashboards replace spreadsheets. See trends, drill into underperforming periods, and get alerts before regulatory deadlines.",
    },
    {
      icon: <Database className="h-5 w-5 text-accent" />,
      title: "Unified Data Platform",
      description:
        "Single source of truth for Elexon data. Lakeflow ingests from Portal, Insights, and MDM into governed Delta tables.",
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-accent" />,
      title: "Governed Lineage & Audit",
      description:
        "Unity Catalog provides end-to-end lineage from raw settlement data to final reports. Compliance-ready audit trail.",
    },
    {
      icon: <Activity className="h-5 w-5 text-accent" />,
      title: "AI-Assisted Insights",
      description:
        "Genie Space lets analysts ask questions in natural language without writing SQL. Find root causes faster.",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Key Value Propositions</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {props.map((p) => (
          <div
            key={p.title}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-2 flex items-center gap-2 font-semibold">
              {p.icon} {p.title}
            </h3>
            <p className="text-gray-600">{p.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DemoWalkthroughSlide() {
  const steps = [
    {
      step: 1,
      title: "Accuracy Dashboard",
      description: "Live KPIs and trends for settlement accuracy",
      link: "/dashboard",
      icon: <Activity className="h-5 w-5" />,
    },
    {
      step: 2,
      title: "Settlement Reports",
      description: "Reconciliation views and drill-down",
      link: "/reports",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      step: 3,
      title: "Accuracy Alerts",
      description: "Configure thresholds and notifications",
      link: "/alerts",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      step: 4,
      title: "Genie Query",
      description: "Natural language exploration of settlement data",
      link: "/explore",
      icon: <Zap className="h-5 w-5" />,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Demo Walkthrough</h2>
        <p className="text-gray-600">Interactive demonstrations</p>
      </div>
      <div className="grid gap-4">
        {steps.map((item) => (
          <div
            key={item.step}
            className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-accent/50"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 font-bold text-accent">
              {item.step}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                {item.icon}
                <h3 className="text-lg font-semibold">{item.title}</h3>
              </div>
              <p className="text-gray-600">{item.description}</p>
            </div>
            <a
              href={item.link}
              className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Open <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

function NextStepsSlide() {
  const steps = [
    {
      title: "PoC Scoping",
      description: "Define data sources, success criteria, integration points",
      status: "Proposed",
    },
    {
      title: "Data Ingestion",
      description: "Design Lakeflow pipeline for Elexon data formats",
      status: "Week 1–2",
    },
    {
      title: "Dashboard Design",
      description: "Build AI/BI dashboards for accuracy KPIs",
      status: "Week 2–3",
    },
    {
      title: "App Development",
      description: "APX app with monitoring routes",
      status: "Week 3–4",
    },
    {
      title: "Production Planning",
      description: "Deployment, alerting, governance review",
      status: "Week 4–6",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Next Steps</h2>
        <p className="text-gray-600">Path from demo to production</p>
      </div>
      <div className="grid gap-4">
        {steps.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-6"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutSkillSlide() {
  const inputs = [
    { icon: <FileText className="h-4 w-4" />, label: "docs/PRD.md", note: "Problem, architecture, solution" },
    { icon: <Code className="h-4 w-4" />, label: "docs/tech-stack.md", note: "Technology choices (optional)" },
    { icon: <DollarSign className="h-4 w-4" />, label: "use_case_sizing/", note: "Cost comparison data (optional)" },
    { icon: <Palette className="h-4 w-4" />, label: "Customer branding", note: "Logo, colors (optional)" },
    { icon: <Target className="h-4 w-4" />, label: "Strategic pillars", note: "PoC success criteria (optional)" },
  ];

  const impact = [
    { before: "Days of slide crafting", after: "~15 min generation", icon: <Clock className="h-4 w-4" /> },
    { before: "Manual brand compliance", after: "Automatic defaults", icon: <Palette className="h-4 w-4" /> },
    { before: "Hours in draw.io", after: "C4 diagrams from PRD", icon: <GitBranch className="h-4 w-4" /> },
    { before: "Copy-paste drift", after: "PRD as source of truth", icon: <FileCheck className="h-4 w-4" /> },
    { before: "One-off PowerPoints", after: "Embedded in the app", icon: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">What Powers This Presentation</h2>
        <p className="text-gray-600">
          From PRD to polished demo deck in minutes
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <span className="mb-2 inline-block rounded-full border border-gray-300 px-2 py-0.5 text-xs">
            Databricks AI Dev Kit
          </span>
          <h3 className="mb-4 text-xl font-semibold">Show Not Tell Apps</h3>
          <p className="mb-3 text-sm font-semibold">Inputs:</p>
          <div className="space-y-2">
            {inputs.map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <div className="mt-0.5 text-accent">{item.icon}</div>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border-2 border-accent/30 bg-accent/5 p-6">
          <h3 className="mb-4 font-semibold">SA Productivity Impact</h3>
          <div className="space-y-4">
            {impact.map((item) => (
              <div key={item.before} className="flex items-start gap-3">
                <div className="text-accent">{item.icon}</div>
                <p className="text-sm">
                  <span className="line-through text-gray-500">{item.before}</span>
                  {" → "}
                  <span className="font-semibold text-accent">{item.after}</span>
                </p>
              </div>
            ))}
          </div>
          <hr className="my-4 border-gray-200" />
          <p className="text-center text-sm font-semibold italic">
            &ldquo;Every Databricks App becomes its own pitch deck&rdquo;
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 pt-4">
        <span className="rounded-md bg-accent px-3 py-1 text-sm font-medium text-white">
          Powered by Databricks AI Dev Kit
        </span>
        <code className="rounded bg-gray-100 px-2 py-1 text-xs">
          github.com/databricks-solutions/ai-dev-kit
        </code>
      </div>
    </section>
  );
}

export default function Presentation() {
  const sections = [
    <TitleSlide key="title" />,
    <ChallengeSlide key="challenge" />,
    <AsIsArchitectureSlide key="as-is" />,
    <ToBeArchitectureSlide key="to-be" />,
    <ValuePropsSlide key="value-props" />,
    <DemoWalkthroughSlide key="demo" />,
    <NextStepsSlide key="next-steps" />,
    <AboutSkillSlide key="about" />,
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-8">
      <SlideDeck
        slides={sections}
        title="Elexon_Settlement_Accuracy_App"
      />
    </div>
  );
}
