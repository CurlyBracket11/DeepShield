
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Upload,
  Video,
  Shield,
  ShieldCheck,
  ShieldAlert,
  FileVideo,
  X,
  RefreshCw,
  Activity,
  Brain,
  AlertTriangle,
  CheckCircle,
  Copy,
  Volume2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Scan,
  Layers,
  Fingerprint,
  Clock,
  FileCheck2,
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
  const [copyMessage, setCopyMessage] = useState("");
  const [result, setResult] = useState<VideoResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || !Number.isFinite(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleFile = (selectedFile: File) => {
    setError("");
    setCopyMessage("");
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
      ".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv",
    ];

    const fileName = selectedFile.name.toLowerCase();

    const validType =
      allowedTypes.includes(selectedFile.type) ||
      allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!validType) {
      setError("Please upload a valid video file.");
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setError("Video size must be less than 100 MB.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const newUrl = URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setPreviewUrl(newUrl);
    setVideoDuration(0);
    setIsPlaying(false);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
    event.target.value = "";
  };

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
    if (droppedFile) handleFile(droppedFile);
  };

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

  const analyzeVideo = async () => {
    if (!file) {
      setError("Please upload a video first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setCopyMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_VIDEO_API_URL || "http://127.0.0.1:8001"}/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Video analysis failed.");
      }

      const prediction = String(data.prediction).toUpperCase();
      const fakeProbability = Number(data.fake_confidence);
      const realProbability = Number(data.real_confidence);

      if (
        !["FAKE", "REAL"].includes(prediction) ||
        !Number.isFinite(fakeProbability) ||
        !Number.isFinite(realProbability)
      ) {
        throw new Error("The video API returned an invalid response.");
      }

      const confidence =
        (prediction === "FAKE" ? fakeProbability : realProbability) * 100;

            const analysisResult: VideoResult = {
        prediction,
        risk_score: Number(data.risk_score),
        risk_level: String(data.risk_level).toUpperCase(),
        confidence: Number(confidence.toFixed(2)),
        frames_analyzed: 16,
        duration: formatDuration(videoDuration || 0),
        ai_probability: Number((fakeProbability * 100).toFixed(2)),
        findings: [],
        suspicious_frames: [],
        assistant_summary:
          `The video model classified this clip as ${prediction}. ` +
          `Estimated fake probability: ${(fakeProbability * 100).toFixed(2)}%. ` +
          "This is a model-based estimate, not definitive proof of authenticity.",
      };

      setShowAssessment(false);
      setResult(analysisResult);

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();

        const announcement = new SpeechSynthesisUtterance(
          analysisResult.assistant_summary
        );

        announcement.rate = 0.95;
        announcement.pitch = 1;

        announcement.onend = () => setShowAssessment(true);
        announcement.onerror = () => setShowAssessment(true);

        window.speechSynthesis.speak(announcement);
      } else {
        setShowAssessment(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to analyze video."
      );
    } finally {
      setLoading(false);
    }
  };

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

DISCLAIMER:
These values are model estimates, not definitive proof of authenticity.
`;

    try {
      await navigator.clipboard.writeText(report);
      setCopyMessage("Report copied successfully.");
    } catch {
      setError("Unable to copy report.");
    }
  };

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

  const resetAnalysis = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    window.speechSynthesis?.cancel();

    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError("");
    setCopyMessage("");
    setLoading(false);
    setShowDetails(false);
    setShowAssessment(false);
    setIsPlaying(false);
    setVideoDuration(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-[#63836a]";
    if (score < 60) return "text-[#a47c37]";
    return "text-[#b45e50]";
  };

  const getRiskBarColor = (score: number) => {
    if (score < 30) return "bg-[#63836a]";
    if (score < 60) return "bg-[#b18b49]";
    return "bg-[#b45e50]";
  };

  const getVerdictStyle = (prediction: string) => {
    return prediction === "FAKE"
      ? {
          icon: ShieldAlert,
          color: "text-[#b45e50]",
          background: "bg-[#f6e9e5]",
          label: "Potential manipulation detected",
        }
      : {
          icon: ShieldCheck,
          color: "text-[#63836a]",
          background: "bg-[#e8efe5]",
          label: "Model classified this video as real",
        };
  };

  const capabilities = [
    {
      title: "Deepfake Detection",
      description: "Identify potential indicators of manipulated and synthetic video content.",
      icon: Shield,
    },
    {
      title: "Temporal Analysis",
      description: "Evaluate consistency across sampled video frames.",
      icon: Activity,
    },
    {
      title: "Frame Inspection",
      description: "Inspect sampled frames for suspicious visual patterns.",
      icon: Layers,
    },
    {
      title: "AI Content Estimation",
      description: "Estimate the likelihood of synthetic video indicators.",
      icon: Brain,
    },
  ];

  const processSteps = [
    "Video ingestion",
    "Frame extraction",
    "Visual analysis",
    "Temporal comparison",
    "Risk assessment",
  ];

  return (
    <main className="min-h-screen bg-[#f5f5ef] px-4 py-8 text-[#26382e] md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <header className="mb-9 flex flex-wrap items-end justify-between gap-5 border-b border-[#d9dfd5] pb-7">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center bg-[#e5ebe1] text-[#55735b]">
                <Video size={22} />
              </div>
              <span className="text-[10px] font-bold tracking-[2.5px] text-[#829083]">
                DEEPSHIELD / VIDEO INTELLIGENCE
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Video AI Analyzer
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#829087]">
              Inspect videos for potential deepfakes, manipulation and synthetic content.
            </p>
          </div>

          <div className="flex items-center gap-2 border border-[#d9dfd5] bg-[#eeefe8] px-4 py-2.5 text-xs font-semibold tracking-wide text-[#54705b]">
            <Activity size={15} />
            VIDEO SCANNER
          </div>
        </header>

        {/* UPLOAD WORKSPACE */}

        <section className="border border-[#dce0d6] bg-[#fafaf6]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dce0d6] px-6 py-5">
            <div>
              <p className="text-[10px] font-bold tracking-[2px] text-[#849184]">
                VIDEO INPUT
              </p>
              <h2 className="mt-1.5 text-lg font-bold">
                Upload a video
              </h2>
              <p className="mt-1 text-xs text-[#829087]">
                Select a video file to begin the inspection
              </p>
            </div>

            {file && (
              <button
                type="button"
                onClick={resetAnalysis}
                className="inline-flex items-center gap-2 border border-[#d9dfd5] bg-[#f0f2eb] px-4 py-2.5 text-xs font-bold text-[#58745d] hover:bg-[#e8ede4]"
              >
                <RefreshCw size={14} />
                RESET
              </button>
            )}
          </div>

          <div className="p-5 md:p-7">
            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`cursor-pointer border-2 border-dashed px-5 py-14 text-center transition-colors md:py-20 ${
                  dragActive
                    ? "border-[#66866d] bg-[#edf3eb]"
                    : "border-[#cbd5c9] bg-[#f3f4ed] hover:border-[#91a593] hover:bg-[#f0f3eb]"
                }`}
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center bg-[#e5ebe1] text-[#57755d]">
                  <FileVideo size={28} strokeWidth={1.7} />
                </div>

                <h3 className="mt-6 text-lg font-bold text-[#263c31]">
                  Drop your video here
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#849087]">
                  Drag and drop a video into this area, or browse your device to select a file.
                </p>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-6 inline-flex items-center gap-2 bg-[#294638] px-6 py-3 text-xs font-bold tracking-wide text-white transition-colors hover:bg-[#365844]"
                >
                  <Upload size={15} />
                  BROWSE VIDEOS
                </button>

                <p className="mt-6 text-[10px] font-semibold tracking-[1.5px] text-[#9aa399]">
                  MP4 <span className="mx-2">·</span> MOV
                  <span className="mx-2">·</span> AVI
                  <span className="mx-2">·</span> WEBM
                  <span className="mx-2">·</span> MKV
                </p>

                <p className="mt-2 text-xs text-[#9aa399]">
                  Maximum file size: 100 MB
                </p>
              </div>
            ) : (
              <div className="border border-[#dce0d6] bg-[#f3f4ed] p-4 md:p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center bg-[#e4ebe1] text-[#5d7a63]">
                      <FileVideo size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Video Preview</p>
                      <p className="mt-1 text-[10px] tracking-wider text-[#829087]">
                        SELECTED FILE
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={resetAnalysis}
                    className="inline-flex items-center gap-2 border border-[#e2c9c3] bg-[#f7eeeb] px-3 py-2 text-xs font-semibold text-[#a35c4e] hover:bg-[#f1e3df]"
                  >
                    <X size={14} />
                    Remove
                  </button>
                </div>

                <div className="overflow-hidden border border-[#dce0d6] bg-black">
                  <video
                    ref={videoRef}
                    src={previewUrl || undefined}
                    controls
                    className="max-h-[480px] w-full object-contain"
                    onLoadedMetadata={(event) => {
                      setVideoDuration(event.currentTarget.duration);
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border border-[#dce0d6] bg-[#fafaf6] p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e5ebe1] text-[#5d7a63]">
                      <FileVideo size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#30463a]">
                        {file.name}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-3 text-[10px] font-semibold tracking-wider text-[#879188]">
                        <span>{formatSize(file.size)}</span>
                        {videoDuration > 0 && (
                          <span>{formatDuration(videoDuration)} DURATION</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-[#cfd8cc] bg-[#f0f2eb] px-4 py-2.5 text-xs font-bold tracking-wide text-[#4e6854] hover:bg-[#e8ede4]"
                  >
                    CHANGE VIDEO
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

            {error && (
              <div className="mt-5 flex items-start gap-3 border border-[#e5c5bd] bg-[#f8eeea] p-4 text-sm text-[#a65345]">
                <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {file && !result && (
              <button
                type="button"
                onClick={analyzeVideo}
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 bg-[#294638] px-5 py-4 text-xs font-bold tracking-wider text-white transition-colors hover:bg-[#365844] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    ANALYZING VIDEO...
                  </>
                ) : (
                  <>
                    <Scan size={16} />
                    ANALYZE VIDEO
                  </>
                )}
              </button>
            )}

            {loading && (
              <div className="mt-6 border border-[#dce0d6] bg-[#f2f4ed] p-5">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#b9c9b7] border-t-[#42634b]" />
                  <div>
                    <p className="text-sm font-bold text-[#395441]">
                      DeepShield is analyzing your video
                    </p>
                    <p className="mt-1 text-xs text-[#829087]">
                      Processing sampled frames and evaluating visual patterns...
                    </p>
                  </div>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden bg-[#dce3d8]">
                  <div className="h-full w-2/3 animate-pulse bg-[#66866d]" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    "Extracting Frames",
                    "Analyzing Visuals",
                    "Checking Consistency",
                    "Calculating Risk",
                  ].map((step) => (
                    <p key={step} className="flex items-center gap-2 text-[10px] font-semibold text-[#829087]">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#66866d]" />
                      {step}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECURITY ASSESSMENT */}

        {result && showAssessment && (
          <section className="mt-12 border-t border-[#d9ddd3] pt-9">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold tracking-[2.5px] text-[#849184]">
                  DEEPSHIELD INTELLIGENCE
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-[28px]">
                  Video Assessment
                </h2>
                <p className="mt-2 text-sm text-[#849087]">
                  Analysis results for {file?.name || "uploaded video"}
                </p>
              </div>

              <div className="flex items-center gap-2 border border-[#d7dfd4] bg-[#edf1e9] px-4 py-2.5 text-[10px] font-bold tracking-wider text-[#607b64]">
                <CheckCircle size={14} />
                MODEL INFERENCE
              </div>
            </div>

            {/* VERDICT HERO */}

            <div className="relative grid overflow-hidden bg-[#203a2e] text-[#f5f5ef] lg:grid-cols-[1fr_300px]">
              <div className="relative z-10 p-7 md:p-10">
                <div className="flex items-center gap-3 text-[#c0d2b5]">
                  <ShieldCheck size={19} />
                  <span className="text-[11px] font-bold tracking-[2px]">
                    OVERALL VIDEO VERDICT
                  </span>
                </div>

                {(() => {
                  const verdict = getVerdictStyle(result.prediction);
                  const VerdictIcon = verdict.icon;

                  return (
                    <>
                      <div className="mt-7 flex flex-wrap items-center gap-4">
                        <div className={`flex h-16 w-16 items-center justify-center ${verdict.background} ${verdict.color}`}>
                          <VerdictIcon size={32} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold tracking-[2px] text-[#bdcdb9]">
                            MODEL CLASSIFICATION
                          </p>
                          <h3 className={`mt-1 text-3xl font-bold tracking-wide ${
                            result.prediction === "FAKE" ? "text-[#efb4a8]" : "text-[#c4d9b8]"
                          }`}>
                            {result.prediction}
                          </h3>
                          <p className="mt-1 text-xs text-[#c0d2b5]">
                            {verdict.label}
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })()}

                <p className="mt-7 max-w-2xl text-sm leading-7 text-[#d0ddca]">
                  {result.assistant_summary}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-semibold tracking-wide text-[#d1ddca]">
                  <ShieldAlert size={14} />
                  PROBABILISTIC MODEL ESTIMATE — NOT DEFINITIVE PROOF
                </div>
              </div>

              <div className="flex flex-col items-center justify-center border-t border-white/10 bg-[#192f25] p-7 lg:border-l lg:border-t-0">
                <p className="text-[10px] font-bold tracking-[2px] text-[#b9cbb4]">
                  RISK SCORE
                </p>

                <div
                  className="relative mt-5 flex h-40 w-40 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(${result.risk_score < 30 ? "#8eae88" : result.risk_score < 60 ? "#c4a15d" : "#c77969"} ${Math.max(0, Math.min(100, result.risk_score)) * 3.6}deg, #3b5143 0deg)`,
                  }}
                >
                  <div className="flex h-[124px] w-[124px] flex-col items-center justify-center rounded-full bg-[#192f25]">
                    <span className="text-4xl font-bold tabular-nums">
                      {result.risk_score}
                    </span>
                    <span className="mt-1 text-[10px] tracking-wider text-[#b9cbb4]">
                      OUT OF 100
                    </span>
                  </div>
                </div>

                <p className="mt-5 text-xs font-bold tracking-[2px] text-[#d0ddca]">
                  {result.risk_level} RISK
                </p>
              </div>
            </div>

            {/* METRICS */}

            <div className="grid grid-cols-2 border-b border-[#d9ddd3] bg-[#eceee7] md:grid-cols-4">
              <div className="border-b border-[#d9ddd3] p-5 md:border-b-0 md:border-r">
                <p className="text-[10px] font-bold tracking-[1.5px] text-[#849184]">
                  CONFIDENCE
                </p>
                <p className="mt-3 text-2xl font-bold tabular-nums text-[#57755d]">
                  {result.confidence}%
                </p>
                <p className="mt-2 text-xs text-[#829087]">
                  Model prediction confidence
                </p>
              </div>

              <div className="border-b border-[#d9ddd3] p-5 md:border-b-0 md:border-r">
                <p className="text-[10px] font-bold tracking-[1.5px] text-[#849184]">
                  AI PROBABILITY
                </p>
                <p className="mt-3 text-2xl font-bold tabular-nums text-[#718a73]">
                  {result.ai_probability}%
                </p>
                <p className="mt-2 text-xs text-[#829087]">
                  Estimated fake probability
                </p>
              </div>

              <div className="border-b border-[#d9ddd3] p-5 md:border-b-0 md:border-r">
                <p className="text-[10px] font-bold tracking-[1.5px] text-[#849184]">
                  FRAMES ANALYZED
                </p>
                <p className="mt-3 text-2xl font-bold tabular-nums">
                  {result.frames_analyzed}
                </p>
                <p className="mt-2 text-xs text-[#829087]">
                  Sampled video frames
                </p>
              </div>

              <div className="p-5">
                <p className="text-[10px] font-bold tracking-[1.5px] text-[#849184]">
                  VIDEO DURATION
                </p>
                <p className="mt-3 text-2xl font-bold tabular-nums">
                  {result.duration}
                </p>
                <p className="mt-2 text-xs text-[#829087]">
                  Uploaded clip length
                </p>
              </div>
            </div>

            {/* RISK BREAKDOWN */}

            <div className="mt-7 grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div className="border border-[#dce0d6] bg-[#fafaf6] p-6">
                <div className="flex items-center gap-3">
                  <Activity size={19} className="text-[#718a73]" />
                  <h3 className="text-sm font-bold">Risk Breakdown</h3>
                </div>

                <div className="mt-7">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-[#6d7d70]">
                      Overall risk score
                    </span>
                    <span className={`text-sm font-bold ${getRiskColor(result.risk_score)}`}>
                      {result.risk_score}/100
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden bg-[#e8ebe3]">
                    <div
                      className={`h-full ${getRiskBarColor(result.risk_score)}`}
                      style={{
                        width: `${Math.max(0, Math.min(100, result.risk_score))}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-7 border-t border-[#e0e4dc] pt-5">
                  <p className="text-[10px] font-bold tracking-[1.5px] text-[#849184]">
                    INTERPRETATION
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#718174]">
                    The score represents the connected model's estimated risk output. It should be interpreted alongside other evidence and not used alone to determine whether a video is authentic.
                  </p>
                </div>
              </div>

              <div className="border border-[#dce0d6] bg-[#fafaf6] p-6">
                <div className="flex items-center gap-3">
                  <FileCheck2 size={19} className="text-[#718a73]" />
                  <h3 className="text-sm font-bold">Video Information</h3>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <p className="text-[10px] font-bold tracking-[1.5px] text-[#849184]">
                      FILE NAME
                    </p>
                    <p className="mt-2 break-all text-sm font-semibold text-[#405747]">
                      {file?.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <p className="text-[10px] font-bold tracking-[1.5px] text-[#849184]">
                        FILE SIZE
                      </p>
                      <p className="mt-2 text-sm font-semibold">
                        {file ? formatSize(file.size) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-[1.5px] text-[#849184]">
                        DURATION
                      </p>
                      <p className="mt-2 text-sm font-semibold">
                        {result.duration}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FINDINGS */}

            {result.findings.length > 0 && (
              <div className="mt-7 border border-[#dce0d6] bg-[#fafaf6]">
                <div className="flex items-center gap-3 border-b border-[#dce0d6] px-5 py-4">
                  <AlertTriangle size={18} className="text-[#a47c37]" />
                  <h3 className="text-sm font-bold">Security Findings</h3>
                </div>

                <div className="space-y-3 p-5">
                  {result.findings.map((finding, index) => (
                    <div key={index} className="border border-[#dce0d6] bg-[#f3f4ed] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold">{finding.title}</h4>
                          <p className="mt-2 text-sm leading-6 text-[#829087]">
                            {finding.description}
                          </p>
                        </div>
                        <span className="shrink-0 border border-[#d9dfd5] bg-[#e9eee5] px-2 py-1 text-[10px] font-bold uppercase text-[#58745d]">
                          {finding.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FRAME ANALYSIS */}

            {result.suspicious_frames.length > 0 && (
              <div className="mt-7 border border-[#dce0d6] bg-[#fafaf6]">
                <div className="flex items-center gap-3 border-b border-[#dce0d6] px-5 py-4">
                  <Layers size={18} className="text-[#718a73]" />
                  <h3 className="text-sm font-bold">Frame Analysis</h3>
                </div>

                <div className="space-y-3 p-5">
                  {result.suspicious_frames.map((frame, index) => (
                    <div key={index} className="border border-[#dce0d6] bg-[#f3f4ed] p-4">
                      <div className="flex flex-wrap items-start gap-3">
                        <span className="bg-[#e5ebe1] px-3 py-2 text-xs font-bold text-[#58745d]">
                          {frame.timestamp}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-sm font-bold">{frame.verdict}</h4>
                            <span className="text-xs text-[#829087]">
                              {frame.confidence}% confidence
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-[#829087]">
                            {frame.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI ASSISTANT */}

            <div className="mt-7 border border-[#dce0d6] bg-[#fafaf6]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce0d6] px-5 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center bg-[#e5ebe1] text-[#58745d]">
                    <Sparkles size={21} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">
                      DeepShield AI Assistant
                    </h3>
                    <p className="mt-1 text-[10px] font-semibold tracking-wider text-[#7d917e]">
                      AI-GENERATED VIDEO EXPLANATION
                    </p>
                  </div>
                </div>
                <span className="border border-[#d2ddcf] bg-[#f4f6f0] px-3 py-2 text-[9px] font-bold tracking-wider text-[#69806a]">
                  ANALYSIS SUMMARY
                </span>
              </div>

              <div className="p-5 md:p-7">
                <div className="border border-[#d8e0d4] bg-[#f7f8f3] p-5 text-sm leading-8 text-[#596c5e]">
                  {result.assistant_summary}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={listenReport}
                    className="inline-flex items-center gap-2 bg-[#294638] px-5 py-3 text-xs font-bold tracking-wide text-white hover:bg-[#365844]"
                  >
                    <Volume2 size={15} />
                    LISTEN
                  </button>

                  <button
                    type="button"
                    onClick={copyReport}
                    className="inline-flex items-center gap-2 border border-[#cbd7c8] bg-[#f4f6f0] px-5 py-3 text-xs font-bold tracking-wide text-[#4e6854] hover:bg-[#e9eee5]"
                  >
                    <Copy size={15} />
                    COPY REPORT
                  </button>

                  {copyMessage && (
                    <span className="text-xs font-semibold text-[#58745d]">
                      {copyMessage}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* TECHNICAL DETAILS */}

            <details className="mt-7 border border-[#dce0d6] bg-[#fafaf6]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-5">
                <div className="flex items-center gap-3">
                  <Fingerprint size={18} className="text-[#718a73]" />
                  <span className="text-sm font-bold">
                    View Technical Analysis Details
                  </span>
                </div>
                <span className="text-[10px] font-bold tracking-wider text-[#849184]">
                  JSON RESPONSE
                </span>
              </summary>

              <div className="border-t border-[#dce0d6] p-5">
                <pre className="max-h-[450px] overflow-auto bg-[#203a2e] p-5 text-xs leading-6 text-[#d5e4d0]">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </details>

            <button
              type="button"
              onClick={resetAnalysis}
              className="mt-6 flex w-full items-center justify-center gap-2 border border-[#cbd7c8] bg-[#edf1e9] px-5 py-4 text-xs font-bold tracking-wider text-[#4e6854] hover:bg-[#e3eae0]"
            >
              <RefreshCw size={16} />
              ANALYZE ANOTHER VIDEO
            </button>
          </section>
        )}

        {/* SUPPORTING INFORMATION */}

        <section className="mt-10 grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
          <div className="border border-[#dce0d6] bg-[#fafaf6] p-5 md:p-6">
            <p className="text-[10px] font-bold tracking-[2px] text-[#849184]">
              WHAT WE INSPECT
            </p>
            <h3 className="mb-6 mt-2 text-lg font-bold">
              Video AI Capabilities
            </h3>

            <div className="space-y-5">
              {capabilities.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e9eee5] text-[#5d7a63]">
                      <Icon size={19} strokeWidth={1.7} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{item.title}</h4>
                      <p className="mt-1 text-xs leading-5 text-[#849087]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border border-[#dce0d6] bg-[#fafaf6] p-5 md:p-6">
            <p className="text-[10px] font-bold tracking-[2px] text-[#849184]">
              HOW IT WORKS
            </p>
            <h3 className="mb-6 mt-2 text-lg font-bold">
              Analysis Pipeline
            </h3>

            <div className="space-y-5">
              {processSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#e9eee5] text-[11px] font-bold text-[#5d7a63]">
                    {index + 1}
                  </div>
                  <p className="text-xs font-semibold text-[#718174]">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="border border-[#d9dfd3] bg-[#eaf0e6] p-5">
              <div className="flex items-center gap-2 text-[#58745d]">
                <ShieldAlert size={17} />
                <h4 className="text-xs font-bold tracking-wide">
                  ANALYSIS DISCLAIMER
                </h4>
              </div>
              <p className="mt-3 text-xs leading-6 text-[#718374]">
                The connected ResNet18 + LSTM model analyzes sampled video frames. Its predictions are probabilistic indicators, not definitive proof of authenticity.
              </p>
            </div>

            <div className="border border-[#dce0d6] bg-[#fafaf6] p-5">
              <p className="text-[10px] font-bold tracking-[2px] text-[#849184]">
                SYSTEM INFORMATION
              </p>
              <h4 className="mb-5 mt-2 text-sm font-bold">
                Service Status
              </h4>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-[#829087]">Video Engine</span>
                  <span className="flex items-center gap-2 text-[10px] font-bold text-[#66866d]">
                    <span className="h-2 w-2 rounded-full bg-[#66866d]" />
                    API CONFIGURED
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-[#829087]">Frontend</span>
                  <span className="flex items-center gap-2 text-[10px] font-bold text-[#66866d]">
                    <span className="h-2 w-2 rounded-full bg-[#66866d]" />
                    READY
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-[#829087]">File Limit</span>
                  <span className="text-[10px] font-bold text-[#58745d]">
                    100 MB
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}

        <footer className="mt-12 border-t border-[#d9ddd3] pt-6 text-center">
          <p className="text-[10px] font-semibold tracking-[2px] text-[#98a196]">
            DEEPSHIELD AI <span className="mx-2">·</span>
            INTELLIGENT MULTIMODAL SECURITY ANALYSIS
          </p>
        </footer>
      </div>
    </main>
  );
}
