
"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  Upload,
  ShieldCheck,
  X,
  FileImage,
  Loader2,
  ScanSearch,
  AlertCircle,
  Copy,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Activity,
  FileCheck2,
  Info,
} from "lucide-react";

interface PhotoAnalysisResult {
  filename?: string;
  prediction?: string;
  confidence?: number | string;
  risk_score?: number | string;
  confidence_level?: string;
  device?: string;
  modality?: string;
  assistant?: {
    summary?: string;
    voice_enabled?: boolean;
  };
}

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/bmp",
];

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#e8e5dc] bg-white p-5 shadow-[0_2px_12px_rgba(35,45,35,0.03)] sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#899187]">
      {children}
    </p>
  );
}

export default function PhotoAnalysis() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<PhotoAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!preview) return;

    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const handleImageSelect = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please select a JPG, PNG, WEBP or BMP image.");
      return;
    }

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setAnalysisResult(null);
    setError(null);
    setCopied(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    if (loading) return;

    const file = event.dataTransfer.files?.[0];

    if (file) handleImageSelect(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreview(null);
    setAnalysisResult(null);
    setError(null);
    setCopied(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage || loading) return;

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedImage);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/analyze-photo`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Image analysis failed."
        );
      }

      setAnalysisResult(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to DeepShield API."
      );
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 25) return "text-[#56866a]";
    if (risk <= 50) return "text-[#b38a3d]";
    if (risk <= 75) return "text-[#c47b45]";
    return "text-[#bd6262]";
  };

  const getRiskBarColor = (risk: number) => {
    if (risk <= 25) return "bg-[#75a987]";
    if (risk <= 50) return "bg-[#d3ad62]";
    if (risk <= 75) return "bg-[#d48b58]";
    return "bg-[#c66f6f]";
  };

  const getRiskLabel = (risk: number) => {
    if (risk >= 70) return "HIGH RISK";
    if (risk >= 40) return "MEDIUM RISK";
    return "LOW RISK";
  };

  const getVerdictColor = (prediction: string) => {
    const normalized = prediction.toUpperCase();

    if (normalized === "REAL") return "text-[#56866a]";

    if (
      normalized.includes("AI") ||
      normalized.includes("FAKE") ||
      normalized.includes("GENERATED")
    ) {
      return "text-[#bd6262]";
    }

    return "text-[#b38a3d]";
  };

  const getVerdictIcon = (prediction: string) => {
    if (prediction.toUpperCase() === "REAL") {
      return <CheckCircle2 size={25} className="text-[#56866a]" />;
    }

    return <AlertTriangle size={25} className="text-[#bd6262]" />;
  };

  const speakAnalysis = () => {
    if (!analysisResult) return;

    const text =
      analysisResult.assistant?.summary ||
      `The image analysis result is ${analysisResult.prediction}, with ${analysisResult.confidence}% confidence and a risk score of ${analysisResult.risk_score} percent.`;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      window.speechSynthesis.speak(utterance);
    } else {
      setError("Speech playback is not supported in this browser.");
    }
  };

  const copyReport = async () => {
    if (!analysisResult) return;

    const report = `
DEEPSHIELD AI - PHOTO ANALYSIS REPORT

File: ${analysisResult.filename || selectedImage?.name || "N/A"}
Verdict: ${analysisResult.prediction || "N/A"}
Confidence: ${analysisResult.confidence ?? "N/A"}%
Risk Score: ${analysisResult.risk_score ?? "N/A"}/100
Confidence Level: ${analysisResult.confidence_level || "N/A"}
Device: ${analysisResult.device || "N/A"}

AI ASSISTANT ANALYSIS:
${analysisResult.assistant?.summary || "No assistant summary available."}

Note: Model predictions are estimates, not definitive proof of authenticity.
    `.trim();

    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy report. Please check clipboard permissions.");
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
    setCopied(false);
  };

  const confidence = Math.min(
    Math.max(Number(analysisResult?.confidence) || 0, 0),
    100
  );

  const risk = Math.min(
    Math.max(Number(analysisResult?.risk_score) || 0, 0),
    100
  );

  return (
    <div className="min-h-screen bg-[#f6f5ef] px-4 py-7 text-[#303b34] sm:px-7 sm:py-9 lg:px-9">
      <div className="mx-auto max-w-[1450px]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[2.5px] text-[#78917c]">
            <span>DEEPSHIELD AI</span>
            <span className="text-[#c3c8bd]">/</span>
            <span>IMAGE INTELLIGENCE</span>
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#29362e] sm:text-[38px]">
                Photo Analysis
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#818980]">
                Examine images for signs of AI generation and potential
                manipulation through model-based analysis.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#dce6dc] bg-[#edf3eb] px-3 py-2 text-xs font-medium text-[#66836c]">
              <Activity size={14} />
              Image Intelligence
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">
          <div className="space-y-6">
            {/* Upload Panel */}
            <Panel>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3eb] text-[#66866d]">
                  <ImageIcon size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-[#354238]">
                    Image Intelligence Scanner
                  </h2>
                  <p className="mt-0.5 text-xs text-[#929a91]">
                    Upload an image to begin your analysis
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/bmp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleImageSelect(file);
                }}
              />

              <div
                onClick={() => {
                  if (!selectedImage && !loading) {
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (!loading) setDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setDragging(false);
                }}
                onDrop={handleDrop}
                className={`mt-7 flex min-h-[340px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-9 ${
                  dragging
                    ? "border-[#7b9d80] bg-[#edf4eb]"
                    : "border-[#dfe4da] bg-[#fafbf8]"
                } ${
                  !selectedImage && !loading
                    ? "cursor-pointer hover:border-[#91ad91] hover:bg-[#f5f8f2]"
                    : ""
                }`}
              >
                {!selectedImage ? (
                  <>
                    <div className="flex h-[68px] w-[68px] items-center justify-center rounded-2xl bg-[#eaf1e7] text-[#729078]">
                      <Upload size={29} strokeWidth={1.7} />
                    </div>

                    <h3 className="mt-6 text-lg font-semibold text-[#354238]">
                      Upload an Image for Analysis
                    </h3>

                    <p className="mt-2 max-w-md text-sm leading-6 text-[#929a91]">
                      Select an image from your device or drag and drop it
                      here to examine its authenticity.
                    </p>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#78977c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#66866c]"
                    >
                      <Upload size={16} />
                      Select Image
                    </button>

                    <p className="mt-4 text-xs text-[#a1a89f]">
                      JPG · JPEG · PNG · WEBP · BMP
                    </p>

                    <p className="mt-1 text-xs text-[#b1b7ae]">
                      Or drag and drop your image here
                    </p>
                  </>
                ) : (
                  <div
                    className="w-full"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="relative mx-auto max-w-[560px]">
                      {preview && (
                        <img
                          src={preview}
                          alt="Selected image preview"
                          className="mx-auto max-h-[390px] w-full rounded-xl object-contain"
                        />
                      )}

                      <button
                        type="button"
                        onClick={removeImage}
                        disabled={loading}
                        title="Remove image"
                        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#303b34]/80 text-white transition hover:bg-[#bd6262] disabled:opacity-50"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3eb] text-[#729078]">
                        <FileImage size={20} />
                      </div>

                      <div className="min-w-0 text-left">
                        <p className="max-w-[260px] truncate text-sm font-semibold text-[#465349]">
                          {selectedImage.name}
                        </p>
                        <p className="mt-0.5 text-xs text-[#929a91]">
                          {(selectedImage.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={analyzeImage}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#78977c] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#66866c] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={17} className="animate-spin" />
                            Analyzing Image...
                          </>
                        ) : (
                          <>
                            <ScanSearch size={17} />
                            Analyze Image
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="rounded-xl border border-[#dfe4da] bg-white px-5 py-3 text-sm font-medium text-[#657268] transition hover:bg-[#f5f7f2] disabled:opacity-50"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#efd5d2] bg-[#fff5f3] p-4 text-sm text-[#b65e58]">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {loading && (
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#dfe8dc] bg-[#f4f8f1] p-4 text-sm text-[#69846d]">
                  <Loader2 size={18} className="animate-spin" />
                  <div>
                    <p className="font-semibold">Processing your image</p>
                    <p className="mt-0.5 text-xs text-[#91a092]">
                      Please wait while the analysis is running.
                    </p>
                  </div>
                </div>
              )}
            </Panel>

            {/* Results */}
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="space-y-5"
              >
                {/* Report Header */}
                <Panel>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf3eb] text-[#729078]">
                        <ShieldCheck size={22} />
                      </div>

                      <div>
                        <h2 className="font-semibold text-[#354238]">
                          Security Analysis Report
                        </h2>
                        <p className="mt-1 text-xs text-[#929a91]">
                          Image authenticity assessment
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={speakAnalysis}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#e4e7df] px-3 py-2 text-xs font-medium text-[#69766b] transition hover:bg-[#f5f7f2]"
                      >
                        <Volume2 size={15} />
                        Listen
                      </button>

                      <button
                        type="button"
                        onClick={copyReport}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#e4e7df] px-3 py-2 text-xs font-medium text-[#69766b] transition hover:bg-[#f5f7f2]"
                      >
                        <Copy size={15} />
                        {copied ? "Copied!" : "Copy Report"}
                      </button>
                    </div>
                  </div>
                </Panel>

                {/* Verdict and Confidence */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Panel>
                    <SectionLabel>AI Verdict</SectionLabel>

                    <div className="mt-5 flex items-center gap-3">
                      {getVerdictIcon(analysisResult.prediction || "")}

                      <h3
                        className={`text-3xl font-semibold ${getVerdictColor(
                          analysisResult.prediction || ""
                        )}`}
                      >
                        {analysisResult.prediction || "N/A"}
                      </h3>
                    </div>

                    <p className="mt-3 text-xs text-[#929a91]">
                      Model classification result
                    </p>
                  </Panel>

                  <Panel>
                    <SectionLabel>Model Confidence</SectionLabel>

                    <div className="mt-4 flex items-end gap-2">
                      <h3 className="text-3xl font-semibold text-[#354238]">
                        {analysisResult.confidence ?? "N/A"}
                        {analysisResult.confidence != null ? "%" : ""}
                      </h3>

                      {analysisResult.confidence_level && (
                        <span className="mb-1 text-xs font-medium text-[#729078]">
                          {analysisResult.confidence_level}
                        </span>
                      )}
                    </div>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#edf0e9]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${confidence}%` }}
                        transition={{ duration: 0.9 }}
                        className="h-full rounded-full bg-[#85a68a]"
                      />
                    </div>

                    <p className="mt-2 text-xs text-[#929a91]">
                      Confidence reported by the model
                    </p>
                  </Panel>
                </div>

                {/* Risk Assessment */}
                <Panel>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <SectionLabel>Image Risk Assessment</SectionLabel>
                      <h3
                        className={`mt-3 text-2xl font-semibold ${getRiskColor(
                          risk
                        )}`}
                      >
                        {getRiskLabel(risk)}
                      </h3>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl font-semibold tabular-nums text-[#354238]">
                        {analysisResult.risk_score ?? "N/A"}
                        <span className="text-sm font-normal text-[#929a91]">
                          {" "}
                          / 100
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-[#929a91]">Risk Score</p>
                    </div>
                  </div>

                  <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#edf0e9]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${risk}%` }}
                      transition={{ duration: 0.9 }}
                      className={`h-full rounded-full ${getRiskBarColor(risk)}`}
                    />
                  </div>

                  <div className="mt-3 flex justify-between text-[11px] text-[#a0a79e]">
                    <span>Low</span>
                    <span>Moderate</span>
                    <span>High</span>
                    <span>Critical</span>
                  </div>
                </Panel>

                {/* Assistant Summary */}
                <Panel className="border-[#dce7d9] bg-[#f8faf6]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf1e7] text-[#729078]">
                      <Sparkles size={20} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#526e57]">
                        DeepShield AI Assistant
                      </h3>
                      <p className="mt-0.5 text-xs text-[#929f91]">
                        Analysis insights
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#68756a]">
                    {analysisResult.assistant?.summary ||
                      "Analysis completed. No additional assistant insights available."}
                  </p>
                </Panel>

                {/* Analysis Details */}
                <Panel>
                  <div className="flex items-center gap-2">
                    <FileCheck2 size={18} className="text-[#78977c]" />
                    <h3 className="font-semibold text-[#354238]">
                      Analysis Details
                    </h3>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <SectionLabel>Filename</SectionLabel>
                      <p className="mt-2 break-all text-sm text-[#59665b]">
                        {analysisResult.filename || selectedImage?.name || "N/A"}
                      </p>
                    </div>

                    <div>
                      <SectionLabel>Processing Device</SectionLabel>
                      <p className="mt-2 text-sm uppercase text-[#59665b]">
                        {analysisResult.device || "N/A"}
                      </p>
                    </div>

                    <div>
                      <SectionLabel>Modality</SectionLabel>
                      <p className="mt-2 text-sm capitalize text-[#59665b]">
                        {analysisResult.modality || "Photo"}
                      </p>
                    </div>

                    <div>
                      <SectionLabel>Voice Assistant</SectionLabel>
                      <p className="mt-2 text-sm text-[#729078]">
                        {analysisResult.assistant?.voice_enabled
                          ? "Enabled"
                          : "Disabled"}
                      </p>
                    </div>
                  </div>
                </Panel>

                {/* Model Disclaimer */}
                <div className="flex items-start gap-3 rounded-xl border border-[#e8e4d7] bg-[#faf8f1] p-4">
                  <Info size={17} className="mt-0.5 shrink-0 text-[#a18d5e]" />
                  <p className="text-xs leading-5 text-[#89816d]">
                    Model predictions are estimates based on the available
                    model and input image. They should not be treated as
                    definitive proof that an image is genuine or manipulated.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetAnalysis}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#dfe4da] bg-white py-3 text-sm font-medium text-[#69766b] transition hover:bg-[#f4f6f1]"
                >
                  <RotateCcw size={16} />
                  Analyze Again
                </button>
              </motion.div>
            )}
          </div>

          {/* Right Information Sidebar */}
          <aside className="space-y-5">
            <Panel>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3eb] text-[#729078]">
                  <ShieldCheck size={20} />
                </div>

                <h2 className="font-semibold text-[#354238]">
                  Analysis Capabilities
                </h2>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  "AI-generated image detection",
                  "Image authenticity assessment",
                  "Model-based prediction",
                  "Confidence-based analysis",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-sm text-[#788278]"
                  >
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-[#85a68a]"
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <h2 className="font-semibold text-[#354238]">
                Analysis Process
              </h2>

              <div className="mt-6 space-y-5">
                {[
                  "Upload Image",
                  "AI Processing",
                  "Authenticity Assessment",
                  "Results & Insights",
                ].map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#dce7d9] bg-[#f1f5ee] text-xs font-semibold text-[#729078]">
                      {index + 1}
                    </div>

                    <span className="text-sm text-[#788278]">{step}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="bg-[#f9faf6]">
              <div className="flex items-center gap-2 text-[#78977c]">
                <Info size={17} />
                <h3 className="text-sm font-semibold text-[#526e57]">
                  Important Note
                </h3>
              </div>

              <p className="mt-3 text-xs leading-6 text-[#899388]">
                An AI model can make incorrect predictions. Always consider
                additional context before relying on an authenticity result.
              </p>
            </Panel>
          </aside>
        </div>

        {/* Footer */}
        <footer className="mt-10 border-t border-[#e5e4db] pt-5 text-xs text-[#a0a69d]">
          DeepShield AI <span className="mx-2">·</span> Image Intelligence
          Module
        </footer>
      </div>
    </div>
  );
}

