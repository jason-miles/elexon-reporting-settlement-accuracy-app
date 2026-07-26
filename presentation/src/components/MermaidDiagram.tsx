import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    primaryColor: "#FF3621",
    primaryTextColor: "#F9F7F4",
    primaryBorderColor: "#FF5F46",
    secondaryColor: "#1B5162",
    tertiaryColor: "#00A972",
    lineColor: "#618794",
    textColor: "#1B3139",
    fontSize: "14px",
  },
});

export default function MermaidDiagram({ chart, className = "" }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
    mermaid
      .render(id, chart)
      .then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg;
      })
      .catch((err) => {
        if (ref.current) ref.current.innerHTML = `<pre class="text-red-600 text-sm">Mermaid error: ${err.message}</pre>`;
      });
  }, [chart]);

  return <div ref={ref} className={className} />;
}
