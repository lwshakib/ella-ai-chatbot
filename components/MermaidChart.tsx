"use client";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Copy,
  Maximize2,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";

export default function MermaidChart({
  chartDefinition,
}: {
  chartDefinition: string;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const modalChartRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [copySuccess, setCopySuccess] = useState(false);

  const renderChart = async (
    targetRef: React.RefObject<HTMLDivElement | null>,
    id: string
  ) => {
    if (targetRef.current) {
      const { svg } = await mermaid.render(id, chartDefinition);
      targetRef.current.innerHTML = svg;
    }
  };

  useEffect(() => {
    // Configure Mermaid (theme can be 'default', 'dark', 'forest', 'neutral')
    mermaid.initialize({ startOnLoad: false, theme: "neutral" });

    renderChart(chartRef, "mermaid-diagram");
  }, [chartDefinition]);

  useEffect(() => {
    if (isModalOpen) {
      renderChart(modalChartRef, "mermaid-modal-diagram");
    }
  }, [isModalOpen, chartDefinition]);

  const handleExpandClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset zoom and pan when closing
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Navigation and zoom controls
  const handlePan = (direction: "left" | "right" | "up" | "down") => {
    const moveAmount = 50;
    setPan((prev) => {
      switch (direction) {
        case "left":
          return { ...prev, x: prev.x + moveAmount };
        case "right":
          return { ...prev, x: prev.x - moveAmount };
        case "up":
          return { ...prev, y: prev.y + moveAmount };
        case "down":
          return { ...prev, y: prev.y - moveAmount };
        default:
          return prev;
      }
    });
  };

  const handleZoom = (type: "in" | "out") => {
    setZoom((prev) => {
      const newZoom = type === "in" ? prev * 1.2 : prev / 1.2;
      return Math.max(0.1, Math.min(5, newZoom)); // Limit zoom between 0.1x and 5x
    });
  };

  const handleReload = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    renderChart(modalChartRef, "mermaid-modal-diagram-" + Date.now());
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chartDefinition);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isModalOpen]);

  return (
    <>
      <main className="text-gray-900">
        <div className="relative">
          <div
            ref={chartRef}
            className="border border-gray-300 rounded-lg p-4 shadow"
          />
          <button
            onClick={handleExpandClick}
            className="absolute top-2 right-2 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg shadow-md transition-all duration-200 hover:scale-105"
            title="Expand chart"
          >
            <Maximize2 size={16} className="text-gray-600" />
          </button>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={handleCloseModal}
          />

          {/* Modal Content */}
          <div
            className="relative bg-white rounded-lg shadow-2xl"
            style={{ width: "90vw", height: "90vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Chart View
              </h2>

              {/* Control Buttons */}
              <div className="flex items-center gap-2">
                {/* Navigation Controls */}
                <div className="flex items-center gap-1 mr-2">
                  <button
                    onClick={() => handlePan("left")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Move left"
                  >
                    <ArrowLeft size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handlePan("right")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Move right"
                  >
                    <ArrowRight size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handlePan("up")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Move up"
                  >
                    <ArrowUp size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handlePan("down")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Move down"
                  >
                    <ArrowDown size={16} className="text-gray-600" />
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 mr-2">
                  <button
                    onClick={() => handleZoom("in")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zoom in"
                  >
                    <ZoomIn size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleZoom("out")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zoom out"
                  >
                    <ZoomOut size={16} className="text-gray-600" />
                  </button>
                  <span className="text-sm text-gray-500 min-w-[60px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>

                {/* Utility Controls */}
                <div className="flex items-center gap-1 mr-2">
                  <button
                    onClick={handleReload}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Reload chart"
                  >
                    <RotateCcw size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                      copySuccess ? "bg-green-100" : ""
                    }`}
                    title="Copy chart definition"
                  >
                    <Copy
                      size={16}
                      className={
                        copySuccess ? "text-green-600" : "text-gray-600"
                      }
                    />
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close modal"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Chart Container */}
            <div
              ref={modalContainerRef}
              className="overflow-hidden"
              style={{ height: "calc(90vh - 80px)" }}
            >
              <div
                ref={modalChartRef}
                className="w-full h-full flex items-center justify-center transition-transform duration-200"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}