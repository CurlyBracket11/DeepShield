"use client";

import { useRef, useState } from "react";
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
} from "lucide-react";

export default function PhotoAnalysis() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setAnalysisResult(null);
    setError(null);
  };

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setSelectedImage(null);
    setPreview(null);
    setAnalysisResult(null);
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedImage);

      const response = await fetch("http://127.0.0.1:8000/analyze-photo", {
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
    } catch (err: any) {
      setError(err.message || "Unable to connect to DeepShield API.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 25) return "text-emerald-400";
    if (risk <= 50) return "text-yellow-400";
    if (risk <= 75) return "text-orange-400";
    return "text-red-400";
  };

  const getRiskLabel = (risk: number) => {
    if (risk <= 25) return "LOW RISK";
    if (risk <= 50) return "MODERATE RISK";
    if (risk <= 75) return "HIGH RISK";
    return "CRITICAL RISK";
  };

  const getVerdictColor = (prediction: string) => {
    const normalized = prediction?.toUpperCase();

    if (normalized === "REAL") {
      return "text-emerald-400";
    }

    if (
      normalized.includes("AI") ||
      normalized.includes("FAKE") ||
      normalized.includes("GENERATED")
    ) {
      return "text-red-400";
    }

    return "text-yellow-400";
  };

  const getVerdictIcon = (prediction: string) => {
    if (prediction?.toUpperCase() === "REAL") {
      return <CheckCircle2 size={24} className="text-emerald-400" />;
    }

    return <AlertTriangle size={24} className="text-red-400" />;
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
    }
  };

  const copyReport = async () => {
    if (!analysisResult) return;

    const report = `
DEEPSHIELD AI - PHOTO ANALYSIS REPORT

File: ${analysisResult.filename || selectedImage?.name}
Verdict: ${analysisResult.prediction}
Confidence: ${analysisResult.confidence}%
Risk Score: ${analysisResult.risk_score}/100
Confidence Level: ${analysisResult.confidence_level || "N/A"}
Device: ${analysisResult.device || "N/A"}

AI ASSISTANT ANALYSIS:
${analysisResult.assistant?.summary || "No assistant summary available."}
    `.trim();

    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy report.");
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#080b12] p-8 text-white">
      {/* Header */}
      <div>
        <p className="text-sm font-medium tracking-[3px] text-emerald-400">
          DEEPSHIELD AI / IMAGE INTELLIGENCE
        </p>

        <h1 className="mt-3 text-3xl font-bold">Photo Analysis</h1>

        <p className="mt-2 text-gray-400">
          Analyze images to identify AI-generated or potentially manipulated content.
        </p>
      </div>

      {/* Main Content */}
      <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Upload Section */}
        <motion.div
          whileHover={{ scale: 1.005 }}
          className="xl:col-span-2 rounded-2xl border border-white/10 bg-[#101620] p-8"
        >
          <div className="flex items-center gap-3">
            <ImageIcon className="text-emerald-400" size={22} />

            <h2 className="text-lg font-semibold">
              Image Intelligence Scanner
            </h2>
          </div>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg,image/bmp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                handleImageSelect(file);
              }
            }}
          />

          {/* Upload Area */}
          <div
            onClick={() => {
              if (!selectedImage) {
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();

              const file = e.dataTransfer.files?.[0];

              if (file) {
                handleImageSelect(file);
              }
            }}
            className={`mt-8 flex min-h-[350px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-[#0b1018] p-8 text-center transition ${
              !selectedImage ? "cursor-pointer hover:border-emerald-400/40" : ""
            }`}
          >
            {!selectedImage ? (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/10">
                  <Upload size={28} className="text-emerald-400" />
                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  Upload an Image for Analysis
                </h3>

                <p className="mt-3 max-w-md text-sm leading-6 text-gray-400">
                  Upload an image to examine its authenticity and determine whether
                  it may contain AI-generated content.
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-6 rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-black transition hover:bg-emerald-300"
                >
                  Select Image
                </button>

                <p className="mt-4 text-xs text-gray-600">
                  JPG, JPEG, PNG, WEBP, BMP
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Or drag and drop your image here
                </p>
              </>
            ) : (
              <div className="w-full" onClick={(e) => e.stopPropagation()}>
                {/* Preview */}
                <div className="relative mx-auto max-w-lg">
                  {preview && (
                    <img
                      src={preview}
                      alt="Selected image preview"
                      className="max-h-[400px] w-full rounded-xl object-contain"
                    />
                  )}

                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-500"
                    title="Remove image"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* File Info */}
                <div className="mt-5 flex items-center justify-center gap-3">
                  <FileImage className="text-emerald-400" size={20} />

                  <div className="text-left">
                    <p className="text-sm font-medium text-white">
                      {selectedImage.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {(selectedImage.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <button
                  type="button"
                  onClick={analyzeImage}
                  disabled={loading}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-8 py-3 font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Analyzing Image...
                    </>
                  ) : (
                    <>
                      <ScanSearch size={18} />
                      Analyze Image
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="ml-3 mt-6 rounded-xl border border-white/10 px-5 py-3 text-sm text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  Change Image
                </button>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* PROFESSIONAL RESULTS */}
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-5"
            >
              {/* Results Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-emerald-400" size={25} />

                  <div>
                    <h2 className="text-xl font-bold">Security Analysis Report</h2>
                    <p className="text-xs text-gray-500">
                      AI-powered image authenticity assessment
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={speakAnalysis}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5"
                  >
                    <Volume2 size={16} />
                    Listen
                  </button>

                  <button
                    onClick={copyReport}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5"
                  >
                    <Copy size={16} />
                    {copied ? "Copied!" : "Copy Report"}
                  </button>
                </div>
              </div>

              {/* Verdict */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-[#0b1018] p-6">
                  <p className="text-xs font-medium tracking-widest text-gray-500">
                    AI VERDICT
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    {getVerdictIcon(analysisResult.prediction)}

                    <h3
                      className={`text-3xl font-bold ${getVerdictColor(
                        analysisResult.prediction
                      )}`}
                    >
                      {analysisResult.prediction}
                    </h3>
                  </div>

                  <p className="mt-3 text-sm text-gray-400">
                    Model classification result
                  </p>
                </div>

                {/* Confidence */}
                <div className="rounded-2xl border border-white/10 bg-[#0b1018] p-6">
                  <p className="text-xs font-medium tracking-widest text-gray-500">
                    MODEL CONFIDENCE
                  </p>

                  <div className="mt-4 flex items-end gap-2">
                    <h3 className="text-3xl font-bold text-white">
                      {analysisResult.confidence}%
                    </h3>

                    <span className="mb-1 text-xs text-emerald-400">
                      {analysisResult.confidence_level || ""}
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(
                          Math.max(Number(analysisResult.confidence) || 0,
                          0),
                          100
                        )}%`,
                      }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full bg-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Risk */}
              <div className="rounded-2xl border border-white/10 bg-[#0b1018] p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium tracking-widest text-gray-500">
                      IMAGE RISK ASSESSMENT
                    </p>

                    <h3
                      className={`mt-2 text-2xl font-bold ${getRiskColor(
                        Number(analysisResult.risk_score) || 0
                      )}`}
                    >
                      {getRiskLabel(Number(analysisResult.risk_score) || 0)}
                    </h3>
                  </div>

                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">
                      {analysisResult.risk_score}
                      <span className="text-sm text-gray-500"> / 100</span>
                    </p>
                    <p className="text-xs text-gray-500">Risk Score</p>
                  </div>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        Math.max(Number(analysisResult.risk_score) || 0,
                        0),
                        100
                      )}%`,
                    }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${
                      Number(analysisResult.risk_score) <= 25
                        ? "bg-emerald-400"
                        : Number(analysisResult.risk_score) <= 50
                        ? "bg-yellow-400"
                        : Number(analysisResult.risk_score) <= 75
                        ? "bg-orange-400"
                        : "bg-red-400"
                    }`}
                  />
                </div>

                <div className="mt-2 flex justify-between text-xs text-gray-600">
                  <span>Low</span>
                  <span>Moderate</span>
                  <span>High</span>
                  <span>Critical</span>
                </div>
              </div>

              {/* Assistant Analysis */}
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
                    <ShieldCheck className="text-emerald-400" size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-emerald-400">
                      DeepShield AI Assistant
                    </h3>
                    <p className="text-xs text-gray-500">
                      Intelligent security insights
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-gray-300">
                  {analysisResult.assistant?.summary ||
                    "Analysis completed. No additional assistant insights available."}
                </p>
              </div>

              {/* Details */}
              <div className="rounded-2xl border border-white/10 bg-[#0b1018] p-5">
                <h3 className="text-sm font-semibold text-gray-300">
                  Analysis Details
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">Filename</p>
                    <p className="mt-1 break-all text-sm text-gray-300">
                      {analysisResult.filename || selectedImage?.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Processing Device</p>
                    <p className="mt-1 text-sm text-gray-300">
                      {analysisResult.device?.toUpperCase() || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Modality</p>
                    <p className="mt-1 text-sm capitalize text-gray-300">
                      {analysisResult.modality || "Photo"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Voice Assistant</p>
                    <p className="mt-1 text-sm text-emerald-400">
                      {analysisResult.assistant?.voice_enabled
                        ? "Enabled"
                        : "Disabled"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={resetAnalysis}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm text-gray-300 transition hover:bg-white/5"
              >
                <RotateCcw size={16} />
                Analyze Again
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Information Panel */}
        <div className="space-y-6">
          {/* Capabilities */}
          <div className="rounded-2xl border border-white/10 bg-[#101620] p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-emerald-400" size={22} />

              <h2 className="font-semibold">Analysis Capabilities</h2>
            </div>

            <div className="mt-6 space-y-4 text-sm text-gray-400">
              {[
                "AI-generated image detection",
                "Image authenticity assessment",
                "Model-based prediction",
                "Confidence-based analysis",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="text-emerald-400">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Process */}
          <div className="rounded-2xl border border-white/10 bg-[#101620] p-6">
            <h2 className="font-semibold">Analysis Process</h2>

            <div className="mt-5 space-y-4">
              {[
                "Upload Image",
                "AI Processing",
                "Authenticity Assessment",
                "Results & Insights",
              ].map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/5 text-sm text-emerald-400">
                    {index + 1}
                  </div>

                  <span className="text-sm text-gray-400">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 border-t border-white/10 pt-6 text-xs text-gray-600">
        DeepShield AI · Image Intelligence Module
      </div>
    </div>
  );
}
