"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Upload,
  Video,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Play,
  FileVideo,
  X,
  RefreshCw,
  Activity,
  Eye,
  Clock,
  Brain,
  AlertTriangle,
  CheckCircle,
  Copy,
  Volume2,
  Pause,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Scan,
  Layers,
  Fingerprint,
} from "lucide-react";

interface VideoFinding {
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  timestamp?: string;
}

interface FrameAnalysis {
  timestamp: string;
  verdict: string;
  confidence: number;
  description: string;
}

interface VideoResult {
  prediction: string;
  risk_score: number;
  risk_level: string;
  confidence: number;
  frames_analyzed: number;
  duration: string;
  ai_probability: number;
  findings: VideoFinding[];
  suspicious_frames: FrameAnalysis[];
  assistant_summary: string;
}

export default function VideoPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const [result, setResult] = useState<VideoResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [videoDuration, setVideoDuration] = useState(0);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Format video duration
  const formatDuration = (seconds: number) => {
    if (!seconds || !Number.isFinite(seconds)) return "00:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Select video
  const handleFile = (selectedFile: File) => {
    setError("");
    setResult(null);

    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
    ];

    const allowedExtensions = [
      ".mp4",
      ".webm",
      ".ogg",
      ".mov",
      ".avi",
      ".mkv",
    ];

    const fileName = selectedFile.name.toLowerCase();

    const validType =
      allowedTypes.includes(selectedFile.type) ||
      allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!validType) {
      setError("Please upload a valid video file.");
      return;
    }

    // 100 MB frontend limit
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError("Video size must be less than 100 MB.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newUrl = URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setPreviewUrl(newUrl);
    setVideoDuration(0);
    setIsPlaying(false);
  };

  // File input handler
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      handleFile(selectedFile);
    }

    event.target.value = "";
  };

  // Drag and drop
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  // Toggle playback
  const togglePlayback = async () => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setError("Unable to play this video format in your browser.");
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Simulated AI analysis
  const analyzeVideo = async () => {
    if (!file) {
      setError("Please upload a video first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    // Simulated analysis delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const duration = videoDuration || 0;

    // TEMPORARY DEMO DATA
    // Replace this function with Bhui's API integration later.

    const demoResult: VideoResult = {
      prediction: "VIDEO ANALYSIS COMPLETE",
      risk_score: 24,
      risk_level: "LOW RISK",
      confidence: 94.6,
      frames_analyzed: Math.max(16, Math.round(duration * 2)),
      duration: formatDuration(duration),
      ai_probability: 8.3,

      findings: [
        {
          title: "Temporal Consistency",
          description:
            "Motion and temporal transitions appear generally consistent across the sampled video sequence.",
          severity: "low",
        },
        {
          title: "Visual Artifacts",
          description:
            "No major visual manipulation artifacts were identified in this simulated analysis.",
          severity: "low",
        },
        {
          title: "Frame Coherence",
          description:
            "Sampled frames demonstrate a relatively stable visual structure.",
          severity: "low",
        },
      ],

      suspicious_frames: [
        {
          timestamp: "00:02",
          verdict: "LOW CONCERN",
          confidence: 96.1,
          description:
            "Visual structure appears consistent in this sampled frame.",
        },
        {
          timestamp: "00:05",
          verdict: "LOW CONCERN",
          confidence: 92.4,
          description:
            "No significant simulated manipulation indicators detected.",
        },
        {
          timestamp: "00:08",
          verdict: "REVIEW",
          confidence: 88.7,
          description:
            "Frame selected for additional review based on simulated visual analysis.",
        },
      ],

      assistant_summary:
        "The video has completed a simulated authenticity analysis. The current demo result indicates a low risk score. Visual consistency and temporal structure appear generally stable in the sampled frames. This is frontend demonstration data and is not a real AI forensic verdict.",
    };

    setResult(demoResult);
    setLoading(false);
  };

  // Copy report
  const copyReport = async () => {
    if (!result || !file) return;

    const report = `
DEEPSHIELD AI — VIDEO ANALYSIS REPORT

File: ${file.name}
File Size: ${formatSize(file.size)}
Duration: ${result.duration}

Verdict: ${result.prediction}
Risk Score: ${result.risk_score}/100
Risk Level: ${result.risk_level}
Confidence: ${result.confidence}%
AI Probability: ${result.ai_probability}%
Frames Analyzed: ${result.frames_analyzed}

SUMMARY:
${result.assistant_summary}

FINDINGS:
${result.findings
  .map(
    (finding) =>
      `${finding.title}: ${finding.description} [${finding.severity.toUpperCase()}]`
  )
  .join("\n")}

DISCLAIMER:
This report contains simulated frontend demo results.
Real AI video analysis is not connected yet.
`;

    try {
      await navigator.clipboard.writeText(report);
      alert("Report copied successfully!");
    } catch {
      setError("Unable to copy report.");
    }
  };

  // Listen to assistant summary
  const listenReport = () => {
    if (!result) return;

    if (!("speechSynthesis" in window)) {
      setError("Speech synthesis is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      result.assistant_summary
    );

    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  // Reset
  const resetAnalysis = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    window.speechSynthesis?.cancel();

    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError("");
    setLoading(false);
    setShowDetails(false);
    setIsPlaying(false);
    setVideoDuration(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-emerald-400";
    if (score < 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getRiskBarColor = (score: number) => {
    if (score < 30) return "bg-emerald-500";
    if (score < 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "border-emerald-500/20 bg-emerald-500/5 text-emerald-400";
      case "medium":
        return "border-yellow-500/20 bg-yellow-500/5 text-yellow-400";
      case "high":
        return "border-red-500/20 bg-red-500/5 text-red-400";
      default:
        return "border-gray-500/20 bg-gray-500/5 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-white px-4 py-8 md:px-8">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8">

        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <Video className="w-6 h-6 text-purple-400" />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Video AI Analyzer
            </h1>

            <p className="text-gray-400 text-sm mt-1">
              Analyze videos for deepfakes, manipulation and synthetic content.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs text-purple-300">
            VIDEO INTELLIGENCE SYSTEM
          </span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">

          {/* UPLOAD CARD */}
          <div className="bg-[#101620] border border-white/5 rounded-2xl p-5 md:p-6">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-400" />
                Video Upload
              </h2>

              {file && (
                <button
                  onClick={resetAnalysis}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  Reset
                </button>
              )}
            </div>

            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-10 md:p-14 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-purple-400 bg-purple-500/10"
                    : "border-white/10 hover:border-purple-500/40 hover:bg-white/[0.02]"
                }`}
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <FileVideo className="w-8 h-8 text-purple-400" />
                </div>

                <h3 className="text-lg font-semibold mb-2">
                  Drop your video here
                </h3>

                <p className="text-sm text-gray-400 mb-5">
                  or click to browse files
                </p>

                <div className="inline-flex px-5 py-2.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition">
                  Select Video
                </div>

                <p className="text-xs text-gray-500 mt-5">
                  MP4 · MOV · AVI · WEBM · MKV
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Maximum file size: 100 MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* VIDEO PLAYER */}
                <div className="relative bg-black rounded-xl overflow-hidden border border-white/10">

                  <video
                    ref={videoRef}
                    src={previewUrl || undefined}
                    controls
                    className="w-full max-h-[420px] object-contain"
                    onLoadedMetadata={(event) => {
                      const duration = event.currentTarget.duration;
                      setVideoDuration(duration);
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />

                  <div className="absolute top-3 left-3 pointer-events-none">
                    <div className="px-3 py-1.5 rounded-md bg-black/60 backdrop-blur text-xs flex items-center gap-2">
                      <Video size={14} className="text-purple-400" />
                      VIDEO PREVIEW
                    </div>
                  </div>
                </div>

                {/* FILE INFORMATION */}
                <div className="flex items-start justify-between gap-4 bg-[#080b12] border border-white/5 rounded-xl p-4">

                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-3 rounded-lg bg-purple-500/10">
                      <FileVideo className="w-5 h-5 text-purple-400" />
                    </div>

                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {file.name}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {formatSize(file.size)}
                        {videoDuration > 0 &&
                          ` • ${formatDuration(videoDuration)}`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-purple-400 hover:text-purple-300 whitespace-nowrap"
                  >
                    Replace
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,.mp4,.mov,.avi,.webm,.mkv"
              onChange={handleInputChange}
              className="hidden"
            />

            {/* ERROR */}
            {error && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {/* ANALYZE BUTTON */}
            {file && !result && (
              <button
                onClick={analyzeVideo}
                disabled={loading}
                className="w-full mt-5 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm bg-purple-500 hover:bg-purple-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing Video...
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4" />
                    Analyze Video
                  </>
                )}
              </button>
            )}

            {/* LOADING */}
            {loading && (
              <div className="mt-5 border border-purple-500/10 rounded-xl bg-purple-500/[0.03] p-5">

                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-5 h-5 text-purple-400 animate-pulse" />

                  <div>
                    <p className="text-sm font-medium">
                      Video analysis in progress
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Scanning visual patterns and temporal consistency...
                    </p>
                  </div>
                </div>

                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full w-full bg-purple-500 animate-pulse rounded-full" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                  {[
                    "Extracting Frames",
                    "Analyzing Visuals",
                    "Checking Consistency",
                    "Calculating Risk",
                  ].map((step, index) => (
                    <div
                      key={index}
                      className="text-xs text-gray-500 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RESULTS */}
          {result && (
            <div className="space-y-6">

              {/* RESULT HEADER */}
              <div className="bg-[#101620] border border-white/5 rounded-2xl p-6">

                <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    Analysis Results
                  </h2>

                  <span className="text-xs px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    DEMO MODE
                  </span>
                </div>

                {/* VERDICT */}
                <div className="p-5 rounded-xl bg-emeremerald-500/5 border border-emerald-500/10">

                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10">
                      <ShieldCheck className="w-7 h-7 text-emerald-400" />
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        Video Verdict
                      </p>

                      <h3 className="text-xl font-bold text-emerald-400">
                        {result.risk_level}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                    {result.assistant_summary}
                  </p>
                </div>

                {/* METRICS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">

                  {/* RISK */}
                  <div className="p-4 rounded-xl bg-[#080b12] border border-white/5">
                    <p className="text-xs text-gray-500 mb-2">
                      Risk Score
                    </p>

                    <p className={`text-2xl font-bold ${getRiskColor(result.risk_score)}`}>
                      {result.risk_score}
                      <span className="text-xs text-gray-500">/100</span>
                    </p>

                    <div className="h-1.5 rounded-full bg-white/5 mt-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getRiskBarColor(result.risk_score)}`}
                        style={{ width: `${result.risk_score}%` }}
                      />
                    </div>
                  </div>

                  {/* CONFIDENCE */}
                  <div className="p-4 rounded-xl bg-[#080b12] border border-white/5">
                    <p className="text-xs text-gray-500 mb-2">
                      Confidence
                    </p>

                    <p className="text-2xl font-bold text-purple-400">
                      {result.confidence}%
                    </p>

                    <div className="h-1.5 rounded-full bg-white/5 mt-3 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* AI PROBABILITY */}
                  <div className="p-4 rounded-xl bg-[#080b12] border border-white/5">
                    <p className="text-xs text-gray-500 mb-2">
                      AI Probability
                    </p>

                    <p className="text-2xl font-bold text-blue-400">
                      {result.ai_probability}%
                    </p>

                    <div className="h-1.5 rounded-full bg-white/5 mt-3 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${result.ai_probability}%` }}
                      />
                    </div>
                  </div>

                  {/* FRAMES */}
                  <div className="p-4 rounded-xl bg-[#080b12] border border-white/5">
                    <p className="text-xs text-gray-500 mb-2">
                      Frames Analyzed
                    </p>

                    <p className="text-2xl font-bold text-cyan-400">
                      {result.frames_analyzed}
                    </p>

                    <p className="text-xs text-gray-500 mt-3">
                      Video frames
                    </p>
                  </div>

                </div>
              </div>

              {/* FINDINGS */}
              <div className="bg-[#101620] border border-white/5 rounded-2xl p-6">

                <h2 className="text-lg font-semibold flex items-center gap-2 mb-5">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Security Findings
                </h2>

                <div className="space-y-3">
                  {result.findings.map((finding, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-[#080b12] border border-white/5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-sm">
                            {finding.title}
                          </h3>

                          <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                            {finding.description}
                          </p>
                        </div>

                        <span
                          className={`text-[10px] uppercase px-2 py-1 rounded-md border shrink-0 ${getSeverityColor(
                            finding.severity
                          )}`}
                        >
                          {finding.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FRAME ANALYSIS */}
              <div className="bg-[#101620] border border-white/5 rounded-2xl p-6">

                <h2 className="text-lg font-semibold flex items-center gap-2 mb-5">
                  <Layers className="w-5 h-5 text-purple-400" />
                  Frame Analysis
                </h2>

                <div className="space-y-3">
                  {result.suspicious_frames.map((frame, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-[#080b12] border border-white/5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="px-3 py-2 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-mono">
                          {frame.timestamp}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h3 className="font-medium text-sm">
                              {frame.verdict}
                            </h3>

                            <span className="text-xs text-gray-500">
                              {frame.confidence}% confidence
                            </span>
                          </div>

                          <p className="text-sm text-gray-400 mt-2">
                            {frame.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ASSISTANT */}
              <div className="bg-[#101620] border border-purple-500/10 rounded-2xl p-6">

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-purple-500/10">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      DeepShield AI Assistant
                    </h2>

                    <p className="text-xs text-gray-500">
                      Video intelligence explanation
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed">
                  {result.assistant_summary}
                </p>

                <div className="flex flex-wrap gap-3 mt-5">

                  <button
                    onClick={listenReport}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 text-sm"
                  >
                    <Volume2 size={16} />
                    Listen
                  </button>

                  <button
                    onClick={copyReport}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-sm"
                  >
                    <Copy size={16} />
                    Copy Report
                  </button>
                </div>
              </div>

              {/* TECHNICAL DETAILS */}
              <div className="bg-[#101620] border border-white/5 rounded-2xl overflow-hidden">

                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full p-5 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2 font-medium text-sm">
                    <Fingerprint className="w-5 h-5 text-purple-400" />
                    Technical Details
                  </span>

                  {showDetails ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </button>

                {showDetails && (
                  <div className="p-5 pt-0">
                    <pre className="bg-[#080b12] border border-white/5 rounded-xl p-4 text-xs text-gray-400 overflow-x-auto">
{JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* ANALYZE AGAIN */}
              <button
                onClick={resetAnalysis}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 text-purple-400 font-medium text-sm transition"
              >
                <RefreshCw size={16} />
                Analyze Another Video
              </button>

            </div>
          )}

        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* CAPABILITIES */}
          <div className="bg-[#101620] border border-white/5 rounded-2xl p-5">

            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Video AI Capabilities
            </h3>

            <div className="space-y-4">

              {[
                [
                  "Deepfake Detection",
                  "Identify potentially manipulated faces and synthetic content.",
                ],
                [
                  "Temporal Analysis",
                  "Analyze consistency across video frames.",
                ],
                [
                  "Frame Inspection",
                  "Identify suspicious visual patterns in sampled frames.",
                ],
                [
                  "AI Content Detection",
                  "Estimate synthetic video indicators.",
                ],
              ].map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 h-fit">
                    <Shield className="w-4 h-4 text-purple-400" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      {item[0]}
                    </p>

                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {item[1]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PROCESS */}
          <div className="bg-[#101620] border border-white/5 rounded-2xl p-5">

            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-purple-400" />
              Analysis Pipeline
            </h3>

            <div className="space-y-4">
              {[
                "Video ingestion",
                "Frame extraction",
                "Visual analysis",
                "Temporal comparison",
                "Risk assessment",
              ].map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs text-purple-400">
                    {index + 1}
                  </div>

                  <p className="text-sm text-gray-400">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SAFETY NOTE */}
          <div className="bg-purple-500/[0.03] border border-purple-500/10 rounded-2xl p-5">

            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-sm">
                Analysis Disclaimer
              </h3>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Video authenticity detection is probabilistic. Results should be
              treated as indicators rather than definitive proof. The current
              interface uses simulated analysis data until the real video AI
              backend is connected.
            </p>
          </div>

          {/* STATUS */}
          <div className="bg-[#101620] border border-white/5 rounded-2xl p-5">

            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-purple-400" />
              System Status
            </h3>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Video Engine
              </span>

              <span className="flex items-center gap-2 text-xs text-yellow-400">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                Demo Mode
              </span>
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-400">
                Frontend
              </span>

              <span className="flex items-center gap-2 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Ready
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}