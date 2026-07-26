import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";

interface SlideDeckProps {
  slides: ReactNode[];
  title?: string;
}

function Button({
  children,
  onClick,
  disabled,
  variant = "outline",
  size = "sm",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  variant?: "outline" | "ghost";
  size?: "sm";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-1 rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none";
  const variants = {
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    ghost: "hover:bg-gray-100",
  };
  const sizes = { sm: "h-8 px-3 text-sm" };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export default function SlideDeck({
  slides,
  title = "Presentation",
}: SlideDeckProps) {
  const [mode, setMode] = useState<"scroll" | "slides">("scroll");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [downloading, setDownloading] = useState<"pdf" | "pptx" | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const totalSlides = slides.length;

  const goTo = useCallback(
    (idx: number) =>
      setCurrentSlide(Math.max(0, Math.min(idx, totalSlides - 1))),
    [totalSlides]
  );

  useEffect(() => {
    if (mode !== "slides") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goTo(currentSlide + 1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(currentSlide - 1);
      }
      if (e.key === "Escape") setMode("scroll");
      if (e.key === "f") containerRef.current?.requestFullscreen?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, currentSlide, goTo]);

  useEffect(() => {
    if (!showDownloadMenu) return;
    const close = () => setShowDownloadMenu(false);
    window.addEventListener("click", close, { once: true });
    return () => window.removeEventListener("click", close);
  }, [showDownloadMenu]);

  async function handleDownloadPdf() {
    setDownloading("pdf");
    setShowDownloadMenu(false);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1280, 720],
      });

      for (let i = 0; i < slides.length; i++) {
        setCurrentSlide(i);
        await new Promise((r) => setTimeout(r, 300));

        const el = contentRef.current;
        if (!el) continue;

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor:
            getComputedStyle(document.documentElement)
              .getPropertyValue("--background")
              .trim() || "#F9F7F4",
        });

        const imgData = canvas.toDataURL("image/png");
        if (i > 0) pdf.addPage([1280, 720], "landscape");
        pdf.addImage(imgData, "PNG", 0, 0, 1280, 720);
      }

      pdf.save(`${title.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(
        "PDF download failed. Make sure html2canvas and jspdf are installed."
      );
    } finally {
      setDownloading(null);
    }
  }

  async function handleDownloadPptx() {
    setDownloading("pptx");
    setShowDownloadMenu(false);
    try {
      const [{ default: html2canvas }, { default: PptxGenJS }] =
        await Promise.all([import("html2canvas"), import("pptxgenjs")]);
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_WIDE";
      pptx.author = "Databricks AI Dev Kit";
      pptx.title = title;

      for (let i = 0; i < slides.length; i++) {
        setCurrentSlide(i);
        await new Promise((r) => setTimeout(r, 300));

        const el = contentRef.current;
        if (!el) continue;

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor:
            getComputedStyle(document.documentElement)
              .getPropertyValue("--background")
              .trim() || "#F9F7F4",
        });

        const slide = pptx.addSlide();
        slide.addImage({
          data: canvas.toDataURL("image/png"),
          x: 0,
          y: 0,
          w: "100%",
          h: "100%",
        });
      }

      await pptx.writeFile({
        fileName: `${title.replace(/\s+/g, "_")}.pptx`,
      });
    } catch (err) {
      console.error("PPTX generation failed:", err);
      alert(
        "PPTX download failed. Make sure html2canvas and pptxgenjs are installed."
      );
    } finally {
      setDownloading(null);
    }
  }

  const downloadButton = (
    <div className="relative">
      <Button
        onClick={(e) => {
          e.stopPropagation();
          setShowDownloadMenu(!showDownloadMenu);
        }}
        disabled={downloading !== null}
        className="gap-1"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        {downloading ? "Exporting…" : "Download"}
      </Button>
      {showDownloadMenu && (
        <div className="absolute right-0 top-full z-[60] mt-1 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Download as PDF
          </button>
          <button
            type="button"
            onClick={handleDownloadPptx}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
            Download as PPTX
          </button>
        </div>
      )}
    </div>
  );

  if (mode === "scroll") {
    return (
      <div className="relative">
        <div className="sticky top-0 z-10 flex justify-end gap-2 pb-4">
          {downloadButton}
          <Button
            onClick={() => setMode("slides")}
            className="gap-1"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Slide View
          </Button>
        </div>
        <div className="mx-auto max-w-5xl space-y-16 pb-16">
          {slides.map((slide, i) => (
            <div key={i}>
              {slide}
              {i < slides.length - 1 && (
                <hr className="mt-16 border-t border-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-[var(--background)]"
    >
      <div className="absolute right-4 top-4 z-50 flex gap-2">
        {downloadButton}
        <Button
          variant="outline"
          onClick={() => setMode("scroll")}
          className="gap-1"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
          Scroll View
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-auto p-8">
        <div ref={contentRef} className="w-full max-w-5xl">
          {slides[currentSlide]}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 pb-6">
        <Button
          variant="ghost"
          onClick={() => goTo(currentSlide - 1)}
          disabled={currentSlide === 0}
        >
          &larr; Previous
        </Button>

        <div className="flex gap-1.5">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentSlide
                  ? "w-6 bg-primary"
                  : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

        <span className="min-w-[4ch] text-center text-xs text-gray-500">
          {currentSlide + 1} / {totalSlides}
        </span>

        <Button
          variant="ghost"
          onClick={() => goTo(currentSlide + 1)}
          disabled={currentSlide === totalSlides - 1}
        >
          Next &rarr;
        </Button>
      </div>

      <p className="pb-2 text-center text-xs text-gray-500">
        Use &larr; &rarr; arrow keys to navigate
      </p>
    </div>
  );
}
