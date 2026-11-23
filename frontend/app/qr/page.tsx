
"use client";

import { useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import {
  QrCode,
  Upload,
  ScanSearch,
  ShieldCheck,
  FileSearch,
  Link2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Volume2,
  Copy,
  RefreshCw,
  ChevronDown,
    Bot,
} from "lucide-react";

interface QRCodeData {
  index: number;
  type: string;
  data: string;
  rect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  payload_type: string;
}

interface SecurityFinding {
  description?: string;
  message?: string;
  severity?: string;
  [key: string]: unknown;
}

interface AssistantData {
  modality?: string;
  filename?: string;
  prediction?: string;
  risk_score?: number;
  risk_level?: string;
  summary?: string;
  voice_enabled?: boolean;
}

interface QRResult {
  modality: string;
  filename: string;
  detected: boolean;
  prediction: string;
  risk_score: number;
  risk_level: string;
  codes: QRCodeData[];
  security_findings: SecurityFinding[];
  assistant?: AssistantData;
}

const processSteps = [
  {
    number: "01",
    title: "Image detection",
    description: "Locate QR patterns in the uploaded image.",
  },
  {
    number: "02",
    title: "Payload extraction",
    description: "Decode the information stored in the QR code.",
  },
  {
    number: "03",
    title: "Security inspection",
    description: "Review available security indicators in the payload.",
  },
];

export default function QRPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<QRResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      window.speechSynthesis?.cancel();
    };
  }, [preview]);

  const handleFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError("");
    setCopyMessage("");
  };

  const removeFile = () => {
    if (preview) URL.revokeObjectURL(preview);

    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    setCopyMessage("");

    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const analyzeQR = async () => {
    if (!file || loading) return;

    setLoading(true);
    setError("");
    setResult(null);
    setCopyMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/analyze-qr`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed (${response.status})`);
      }

      const data: QRResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while analyzing the image."
      );
    } finally {
      setLoading(false);
    }
  };

  const listenToReport = () => {
    const summary = result?.assistant?.summary;
    if (!summary || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(summary);
    speech.rate = 0.95;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  };

  const copyReport = async () => {
    if (!result) return;

    const qrCode = result.codes?.[0];

    const findingsText =
      result.security_findings?.length > 0
        ? result.security_findings
            .map(
              (finding) =>
                finding.description ||
                finding.message ||
                JSON.stringify(finding)
            )
            .join("\n")
        : "No security findings detected.";

    const report = `
DEEPSHIELD AI - QR SECURITY REPORT

Verdict: ${result.prediction}
Risk Level: ${result.risk_level}
Risk Score: ${result.risk_score}/100
QR Detected: ${result.detected ? "Yes" : "No"}

QR Type: ${qrCode?.type || "Unknown"}
Payload Type: ${qrCode?.payload_type || "Unknown"}
Decoded Content: ${qrCode?.data || "No content available"}

Security Findings:
${findingsText}

AI Assistant Summary:
${result.assistant?.summary || "No summary available."}
`;

    try {
      await navigator.clipboard.writeText(report);
      setCopyMessage("Report copied successfully.");
    } catch {
      setCopyMessage("Unable to copy report. Check browser permissions.");
    }
  };

  const analyzeAgain = () => {
    window.speechSynthesis?.cancel();
    removeFile();
  };

  const qrCode = result?.codes?.[0];

  const riskScore = Math.max(
    0,
    Math.min(100, Number(result?.risk_score ?? 0))
  );

  const isSafe = result?.prediction?.toUpperCase().includes("SAFE");

  const riskColor =
    riskScore >= 70
      ? "text-[#b84e47]"
      : riskScore >= 40
        ? "text-[#a47737]"
        : "text-[#52764b]";

  const riskBar =
    riskScore >= 70
      ? "bg-[#b84e47]"
      : riskScore >= 40
        ? "bg-[#c49a56]"
        : "bg-[#71866a]";

  return (
    <main className="min-h-screen bg-[#f5f5ef] px-6 py-8 text-[#202820] md:px-10 md:py-10 lg:px-12">
      <div className="mx-auto max-w-[1440px]">

        {/* Header */}
        <header className="border-b border-[#dedfd5] pb-7">
          <p className="text-[10px] font-semibold tracking-[2.5px] text-[#718174]">
            DEEPSHIELD / WORKSPACE / QR
          </p>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-1.2px] text-[#202b23] md:text-[38px]">
                QR Analysis
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#747c72]">
                Decode QR content, inspect embedded destinations and review
                potentially suspicious security indicators.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#718174]">
              <QrCode size={16} />
              QR INTELLIGENCE
            </div>
          </div>
        </header>

        {/* Main scanner */}
        <section className="mt-9 grid items-start gap-10 xl:grid-cols-[1.55fr_0.65fr]">

          <div>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#819080]">
                  SCAN WORKSPACE
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[#29372d]">
                  Upload a QR image
                </h2>
              </div>

              <span className="text-[10px] font-semibold tracking-[1.5px] text-[#899287]">
                IMAGE INPUT
              </span>
            </div>

            {!preview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    inputRef.current?.click();
                  }
                }}
                className={`flex min-h-[350px] cursor-pointer flex-col items-center justify-center border-2 border-dashed px-6 py-12 text-center transition-colors ${
                  dragActive
                    ? "border-[#71866a] bg-[#e9eee4]"
                    : "border-[#cfd5ca] bg-[#f0f1eb] hover:border-[#91a58a] hover:bg-[#ecefe7]"
                }`}
              >
                <div className="flex h-16 w-16 items-center justify-center bg-[#e2e9dd] text-[#48644b]">
                  <Upload size={27} strokeWidth={1.6} />
                </div>

                <h3 className="mt-6 text-lg font-semibold text-[#29372d]">
                  Drop your QR image here
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#81877e]">
                  Upload an image containing a QR code. DeepShield will
                  process the image and extract its encoded content.
                </p>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="mt-7 inline-flex items-center gap-2 bg-[#294434] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#365842]"
                >
                  <FileSearch size={16} />
                  Browse image
                </button>

                <p className="mt-5 text-[10px] tracking-wide text-[#999f94]">
                  PNG · JPG · JPEG · WEBP
                </p>
              </div>
            ) : (
              <div className="border border-[#dedfd5] bg-[#f0f1eb] p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[1.5px] text-[#819080]">
                      SELECTED IMAGE
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-[#29372d]">
                      {file?.name}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-xs font-semibold text-[#a45149] hover:underline"
                  >
                    Remove image
                  </button>
                </div>

                <div className="flex max-h-[390px] justify-center overflow-hidden bg-[#e5e7df] p-4">
                  <img
                    src={preview}
                    alt="Uploaded QR code preview"
                    className="max-h-[350px] max-w-full object-contain"
                  />
                </div>

                <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-[#81877e]">
                  <span>Image ready for analysis</span>
                  <span>
                    {file ? (file.size / 1024).toFixed(2) : "0"} KB
                  </span>
                </div>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                handleFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            {error && (
              <div
                role="alert"
                className="mt-5 border-l-4 border-[#b84e47] bg-[#f9eae8] px-4 py-3 text-sm text-[#9c403a]"
              >
                {error}
              </div>
            )}

            {file && (
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={analyzeQR}
                  disabled={loading}
                  className="inline-flex min-w-[190px] flex-1 items-center justify-center gap-2 bg-[#294434] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#365842] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ScanSearch size={17} />
                  {loading ? "Analyzing QR code..." : "Start analysis"}
                </button>

                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={loading}
                  className="border border-[#d7dbd1] bg-transparent px-5 py-3.5 text-sm font-semibold text-[#59665a] transition hover:bg-[#e9ece4] disabled:opacity-50"
                >
                  Change image
                </button>
              </div>
            )}

            {loading && (
              <div className="mt-5 border border-[#dce2d7] bg-[#edf1e9] p-5">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#9aab93] border-t-[#294434]" />
                  <p className="text-sm font-semibold text-[#42614a]">
                    Processing QR image
                  </p>
                </div>

                <p className="mt-2 text-xs text-[#788675]">
                  Detecting QR patterns and checking available security indicators.
                </p>
              </div>
            )}
          </div>

          {/* Process guide */}
          <aside className="border-t border-[#dedfd5] pt-6 xl:border-t-0 xl:pt-0">
            <div className="flex items-center gap-2 text-[#547052]">
              <ShieldCheck size={17} />
              <p className="text-[10px] font-semibold tracking-[2px]">
                HOW IT WORKS
              </p>
            </div>

            <h3 className="mt-3 text-xl font-semibold text-[#29372d]">
              Inside the scanner
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#81877e]">
              Each uploaded image passes through a sequence of processing
              and inspection stages.
            </p>

            <div className="mt-8">
              {processSteps.map((step, index) => (
                <div
                  key={step.number}
                  className="relative flex gap-4 pb-8 last:pb-0"
                >
                  {index !== processSteps.length - 1 && (
                    <span className="absolute left-[15px] top-9 h-[calc(100%-18px)] w-px bg-[#d6ddd1]" />
                  )}

                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center bg-[#e4eadf] text-[10px] font-semibold text-[#547052]">
                    {step.number}
                  </span>

                  <div className="pt-1">
                    <h4 className="text-sm font-semibold text-[#354437]">
                      {step.title}
                    </h4>
                    <p className="mt-2 text-xs leading-6 text-[#81877e]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-l-2 border-[#91a58a] bg-[#e9eee4] p-4">
              <div className="flex items-center gap-2 text-[#547052]">
                <AlertTriangle size={15} />
                <p className="text-xs font-semibold">Security reminder</p>
              </div>
              <p className="mt-2 text-xs leading-6 text-[#71816d]">
                Never open unknown QR destinations or share sensitive
                information without independently checking the destination.
              </p>
            </div>
          </aside>
        </section>

        
        {/* Security Assessment */}
        {result && (
          <section className="mt-14 border-t border-[#d9ddd3] pt-9">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold tracking-[2.5px] text-[#819080]">
                  DEEPSHIELD / SECURITY INTELLIGENCE
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#29372d]">
                  Analysis report
                </h2>
                <p className="mt-2 text-sm text-[#81877e]">
                  Inspection results for {result.filename || file?.name || "uploaded image"}
                </p>
              </div>

              <span className="border border-[#d8ded2] px-3 py-2 text-[10px] font-semibold tracking-[1.5px] text-[#718174]">
                QR SCAN COMPLETE
              </span>
            </div>

            {/* Main verdict panel */}
            <div className="relative mt-8 overflow-hidden bg-[#20372a] p-7 text-[#f3f2e9] md:p-9">
              <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-[#ffffff12]" />
              <div className="pointer-events-none absolute -right-5 -top-12 h-52 w-52 rounded-full border border-[#ffffff12]" />

              <div className="relative grid items-center gap-9 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex items-center gap-2">
                    {isSafe ? (
                      <CheckCircle2 size={17} className="text-[#b8d2a9]" />
                    ) : (
                      <AlertTriangle size={17} className="text-[#e2b77b]" />
                    )}
                    <p className="text-[10px] font-semibold tracking-[2px] text-[#b7c7b5]">
                      OVERALL SECURITY VERDICT
                    </p>
                  </div>

                  <h3 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
                    {result.prediction || "Assessment unavailable"}
                  </h3>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-[#c0cbbd]">
                    {result.detected
                      ? "A QR code was identified in the uploaded image. Review the decoded content and security indicators below before interacting with its destination."
                      : "No QR code was detected in the uploaded image. Try another image with a clearly visible QR code."}
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <span className="border border-[#ffffff30] px-3 py-2 text-[10px] font-semibold tracking-wide text-[#e3e9df]">
                      {result.risk_level || "UNKNOWN"} RISK
                    </span>
                    <span className="border border-[#ffffff30] px-3 py-2 text-[10px] font-semibold tracking-wide text-[#e3e9df]">
                      {result.codes?.length ?? 0} QR CODE(S)
                    </span>
                  </div>
                </div>

                {/* Circular risk gauge */}
                <div className="flex items-center justify-center lg:pr-8">
                  <div
                    className="relative flex h-48 w-48 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(${
                        riskScore >= 70
                          ? "#d8897c"
                          : riskScore >= 40
                            ? "#d8b475"
                            : "#b6cba7"
                      } ${riskScore * 3.6}deg, #ffffff20 0deg)`,
                    }}
                  >
                    <div className="absolute inset-[9px] flex flex-col items-center justify-center rounded-full bg-[#20372a]">
                      <span className="text-[10px] font-semibold tracking-[2px] text-[#aebfac]">
                        RISK SCORE
                      </span>
                      <span className="mt-1 text-5xl font-semibold tracking-tight text-white">
                        {riskScore}
                      </span>
                      <span className="mt-1 text-xs text-[#b4c3b0]">
                        out of 100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment metrics */}
            <div className="grid border-b border-[#dedfd5] bg-[#eceee7] sm:grid-cols-3">
              <div className="border-b border-[#d9ddd3] p-5 sm:border-b-0 sm:border-r">
                <p className="text-[10px] font-semibold tracking-[1.7px] text-[#899287]">
                  RISK CLASSIFICATION
                </p>
                <p className="mt-3 text-lg font-semibold text-[#354437]">
                  {result.risk_level || "Not available"}
                </p>
                <p className="mt-1 text-xs text-[#81877e]">
                  Based on returned risk score
                </p>
              </div>

              <div className="border-b border-[#d9ddd3] p-5 sm:border-b-0 sm:border-r">
                <p className="text-[10px] font-semibold tracking-[1.7px] text-[#899287]">
                  DETECTION STATUS
                </p>
                <p className="mt-3 text-lg font-semibold text-[#354437]">
                  {result.detected ? "QR identified" : "No QR identified"}
                </p>
                <p className="mt-1 text-xs text-[#81877e]">
                  Image detection result
                </p>
              </div>

              <div className="p-5">
                <p className="text-[10px] font-semibold tracking-[1.7px] text-[#899287]">
                  SECURITY INDICATORS
                </p>
                <p className="mt-3 text-lg font-semibold text-[#354437]">
                  {result.security_findings?.length ?? 0} finding(s)
                </p>
                <p className="mt-1 text-xs text-[#81877e]">
                  Returned by the analysis engine
                </p>
              </div>
            </div>

            {/* Detailed inspection */}
            <div className="mt-12">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#819080]">
                    INSPECTION DETAILS
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[#29372d]">
                    What did we find?
                  </h3>
                </div>
                <span className="text-xs text-[#899287]">
                  Technical breakdown
                </span>
              </div>

              <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1fr]">
                {/* Decoded payload */}
                <div className="border border-[#dce0d6] bg-[#f0f1eb]">
                  <div className="flex items-center justify-between border-b border-[#dce0d6] px-5 py-4">
                    <div className="flex items-center gap-2">
                      <QrCode size={17} className="text-[#547052]" />
                      <h4 className="text-sm font-semibold text-[#354437]">
                        Decoded payload
                      </h4>
                    </div>
                    <span className="text-[9px] font-semibold tracking-[1.5px] text-[#899287]">
                      QR DATA
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-semibold tracking-[1.5px] text-[#899287]">
                          CODE TYPE
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#354437]">
                          {qrCode?.type || "Unknown"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-semibold tracking-[1.5px] text-[#899287]">
                          PAYLOAD TYPE
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#354437]">
                          {qrCode?.payload_type || "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center gap-2">
                        <Link2 size={14} className="text-[#71866a]" />
                        <p className="text-[9px] font-semibold tracking-[1.5px] text-[#899287]">
                          EXTRACTED CONTENT
                        </p>
                      </div>

                      <div className="mt-3 min-h-[120px] break-all border border-[#dce0d6] bg-[#f7f7f2] p-4 text-sm leading-7 text-[#59665a]">
                        {qrCode?.data || "No decoded content available."}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Findings */}
                <div className="border border-[#dce0d6] bg-[#f0f1eb]">
                  <div className="flex items-center justify-between border-b border-[#dce0d6] px-5 py-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={17} className="text-[#a47737]" />
                      <h4 className="text-sm font-semibold text-[#354437]">
                        Security findings
                      </h4>
                    </div>
                    <span className="text-[9px] font-semibold tracking-[1.5px] text-[#899287]">
                      INSPECTION
                    </span>
                  </div>

                  <div className="p-5">
                    {result.security_findings?.length > 0 ? (
                      <div className="space-y-3">
                        {result.security_findings.map((finding, index) => (
                          <div
                            key={index}
                            className="border-l-[3px] border-[#c49a56] bg-[#f6f0e5] p-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-[10px] font-semibold tracking-wide text-[#886b3f]">
                                FINDING {String(index + 1).padStart(2, "0")}
                              </p>
                              {finding.severity && (
                                <span className="text-[10px] font-semibold uppercase text-[#a47737]">
                                  {finding.severity}
                                </span>
                              )}
                            </div>
                            <p className="mt-2 break-words text-sm leading-6 text-[#6f6149]">
                              {finding.description ||
                                finding.message ||
                                JSON.stringify(finding)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-[190px] flex-col justify-center">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center bg-[#e1e9dc] text-[#547052]">
                            <CheckCircle2 size={21} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#354437]">
                              No findings returned
                            </p>
                            <p className="mt-1 text-xs text-[#81877e]">
                              No major indicators were reported by this scan.
                            </p>
                          </div>
                        </div>
                        <p className="mt-5 text-xs leading-6 text-[#81877e]">
                          An absence of findings is not a guarantee that the
                          QR destination is safe. Always verify unknown links
                          independently.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* AI explanation */}
            <div className="mt-12 border-t border-[#d9ddd3] pt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#819080]">
                    INTELLIGENCE SUMMARY
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[#29372d]">
                    AI Assistant interpretation
                  </h3>
                </div>
                <Bot size={24} className="text-[#547052]" />
              </div>

              <div className="mt-5 border-l-[3px] border-[#91a58a] bg-[#e9eee4] p-6">
                <p className="whitespace-pre-wrap text-sm leading-7 text-[#536653]">
                  {result.assistant?.summary ||
                    "AI assistant summary is not available for this analysis."}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={listenToReport}
                  disabled={!result.assistant?.summary}
                  className="inline-flex items-center gap-2 border border-[#d7dbd1] px-4 py-3 text-sm font-medium text-[#59665a] transition hover:bg-[#e9ece4] disabled:opacity-50"
                >
                  <Volume2 size={16} />
                  Listen to summary
                </button>

                <button
                  type="button"
                  onClick={copyReport}
                  className="inline-flex items-center gap-2 border border-[#d7dbd1] px-4 py-3 text-sm font-medium text-[#59665a] transition hover:bg-[#e9ece4]"
                >
                  <Copy size={16} />
                  Copy full report
                </button>

                <button
                  type="button"
                  onClick={analyzeAgain}
                  className="inline-flex items-center gap-2 bg-[#294434] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#365842]"
                >
                  <RefreshCw size={16} />
                  Analyze another image
                </button>
              </div>

              {copyMessage && (
                <p aria-live="polite" className="mt-3 text-xs font-medium text-[#547052]">
                  {copyMessage}
                </p>
              )}
            </div>

            {/* Technical details */}
            <details className="mt-10 border-t border-[#dedfd5] pt-5">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[#59665a]">
                <ChevronDown size={16} />
                View raw technical response
              </summary>

              <pre className="mt-4 overflow-x-auto bg-[#eceee7] p-5 text-xs leading-6 text-[#617b5b]">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>

            <p className="mt-6 text-xs leading-6 text-[#92978e]">
              Automated risk scores are estimates based on available analysis.
              They should not be treated as a guarantee of authenticity or safety.
            </p>
          </section>
        )}


        <footer className="mt-14 flex flex-col justify-between gap-2 border-t border-[#dedfd5] pt-5 text-[10px] tracking-wide text-[#92978e] sm:flex-row">
          <span>DEEPSHIELD AI · QR INTELLIGENCE</span>
          <span>CODE SANTOS · 2026</span>
        </footer>
      </div>
    </main>
  );
}

