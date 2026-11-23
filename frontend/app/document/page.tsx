
"use client";

import { useRef, useState } from "react";
import {
  FileText,
  Upload,
  ShieldCheck,
  ScanText,
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Volume2,
  Copy,
  RefreshCw,
  FileType,
  Sparkles,
  LockKeyhole,
  FileCheck2,
  X,
} from "lucide-react";

interface DocumentFinding {
  description?: string;
  message?: string;
  severity?: string;
  [key: string]: unknown;
}

interface DocumentAssistant {
  summary?: string;
  prediction?: string;
  risk_score?: number;
  risk_level?: string;
  voice_enabled?: boolean;
}

interface DocumentResult {
  modality?: string;
  filename?: string;
  prediction?: string;
  risk_score?: number;
  risk_level?: string;
  detected?: boolean;
  security_findings?: DocumentFinding[];
  findings?: DocumentFinding[];
  content_findings?: DocumentFinding[];
  language_findings?: DocumentFinding[];
  extracted_text?: string;
  text?: string;
  content?: string;
  assistant?: DocumentAssistant;
  [key: string]: unknown;
}

const capabilities = [
  {
    icon: ScanText,
    title: "Content Analysis",
    description: "Extract and inspect document content for suspicious information.",
  },
  {
    icon: ShieldCheck,
    title: "Threat Detection",
    description: "Identify potential security risks and unusual indicators.",
  },
  {
    icon: FileSearch,
    title: "Risk Assessment",
    description: "Evaluate document signals and generate a risk score.",
  },
  {
    icon: BrainCircuit,
    title: "AI Intelligence",
    description: "Translate analysis results into an understandable explanation.",
  },
];

const processSteps = [
  ["01", "Document Processing", "The uploaded file is prepared for analysis."],
  ["02", "Content Extraction", "Text and relevant information are extracted."],
  ["03", "Security Inspection", "Extracted content is checked for suspicious indicators."],
  ["04", "Risk Assessment", "The analysis engine returns a verdict and risk score."],
];

export default function DocumentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<DocumentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    const allowedExtensions = [
      ".pdf",
      ".txt",
      ".docx",
      ".jpg",
      ".jpeg",
      ".png",
    ];

    const fileName = selectedFile.name.toLowerCase();

    const isValidFile = allowedExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

    if (!isValidFile) {
      setError("Please upload a PDF, TXT, DOCX, JPG, JPEG, or PNG file.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError("");
    setCopyMessage("");
  };

  const removeFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    setCopyMessage("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const analyzeDocument = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/analyze-document`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        let errorMessage = "Document analysis failed.";

        try {
          const errorData = await response.json();
          errorMessage =
            errorData.detail || errorData.message || errorMessage;
        } catch {
          // Keep default error message
        }

        throw new Error(errorMessage);
      }

      const data: DocumentResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze document."
      );
    } finally {
      setLoading(false);
    }
  };

  const listenToReport = () => {
    const summary = result?.assistant?.summary;

    if (!summary) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(summary);
    speech.rate = 0.95;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  };

  const copyReport = async () => {
    if (!result) return;

    const reportFindings = [
      ...(result.content_findings ?? []),
      ...(result.language_findings ?? []),
      ...(result.security_findings ?? []),
      ...(result.findings ?? []),
    ];

    const findingsText =
      reportFindings.length > 0
        ? reportFindings
            .map(
              (finding, index) =>
                `${index + 1}. ${
                  finding.description ||
                  finding.message ||
                  JSON.stringify(finding)
                }`
            )
            .join("\n")
        : "No security findings detected.";

    const report = `
DEEPSHIELD AI
DOCUMENT SECURITY REPORT

Filename: ${result.filename || file?.name || "Unknown"}
Verdict: ${result.prediction || "Unknown"}
Risk Score: ${result.risk_score ?? "N/A"}/100
Risk Level: ${result.risk_level || "Unknown"}

SECURITY FINDINGS:
${findingsText}

AI ASSISTANT SUMMARY:
${result.assistant?.summary || "Summary unavailable."}
`;

    try {
      await navigator.clipboard.writeText(report);
      setCopyMessage("Report copied successfully.");

      window.setTimeout(() => setCopyMessage(""), 2500);
    } catch {
      setCopyMessage("Unable to copy report.");
    }
  };

  const analyzeAgain = () => {
    window.speechSynthesis.cancel();
    removeFile();
  };

  const riskScore = Math.max(
    0,
    Math.min(100, Number(result?.risk_score ?? 0))
  );

  const riskColor =
    riskScore >= 70
      ? "#c65c4b"
      : riskScore >= 40
        ? "#bd8a36"
        : "#65866b";

  const prediction = result?.prediction?.toUpperCase() ?? "";

  const isSafe =
    prediction.includes("SAFE") ||
    prediction.includes("LIKELY AUTHENTIC");

  const findings = [
    ...(result?.content_findings ?? []),
    ...(result?.language_findings ?? []),
    ...(result?.security_findings ?? []),
    ...(result?.findings ?? []),
  ];

  const extractedText =
    result?.extracted_text ||
    result?.text ||
    result?.content ||
    "";

  const fileExtension =
    file?.name.split(".").pop()?.toUpperCase() || "FILE";

  const isPDF = file?.name.toLowerCase().endsWith(".pdf");
  const isImage =
    file?.name.toLowerCase().endsWith(".jpg") ||
    file?.name.toLowerCase().endsWith(".jpeg") ||
    file?.name.toLowerCase().endsWith(".png");

  return (
    <main className="min-h-screen bg-[#f5f5ef] px-5 py-8 text-[#20382f] md:px-9 md:py-10">
      <div className="mx-auto max-w-[1450px]">

        {/* PAGE HEADER */}

        <header className="mb-9">
          <p className="mb-3 text-[11px] font-bold tracking-[2.5px] text-[#788d7d]">
            DEEPSHIELD AI <span className="mx-2">/</span> DOCUMENT INTELLIGENCE
          </p>

          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#20382f] md:text-[38px]">
                Document Analysis
              </h1>

              <p className="mt-3 max-w-[720px] text-sm leading-7 text-[#718078] md:text-[15px]">
                Inspect documents for suspicious content, potentially
                malicious information and security indicators with DeepShield AI.
              </p>
            </div>

            <div className="flex items-center gap-2 border border-[#d9dfd5] bg-[#eeefe8] px-4 py-2.5 text-xs font-semibold tracking-wide text-[#54705b]">
              <ShieldCheck size={16} />
              DOCUMENT SCANNER
            </div>
          </div>
        </header>

        {/* UPLOAD WORKSPACE */}

        <section className="block">

          {/* UPLOAD PANEL */}

          <div className="border border-[#dce0d6] bg-[#fafaf6]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dce0d6] px-6 py-5">
              <div>
                <p className="text-[10px] font-bold tracking-[2px] text-[#849184]">
                  DOCUMENT INPUT
                </p>
                <h2 className="mt-1.5 text-lg font-bold">
                  Upload a document
                </h2>
                <p className="mt-1 text-xs text-[#829087]">
                  Select a file to begin the security inspection
                </p>
              </div>

              <div className="flex items-center gap-2 border border-[#d9e1d5] bg-[#eef2eb] px-3 py-2 text-[10px] font-bold tracking-wider text-[#58745d]">
                <LockKeyhole size={13} />
                PRIVATE SCAN
              </div>
            </div>

            <div className="p-5 md:p-7">

              {!preview ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`cursor-pointer border-2 border-dashed px-5 py-14 text-center transition-colors md:py-20 ${
                    dragActive
                      ? "border-[#66866d] bg-[#edf3eb]"
                      : "border-[#cbd5c9] bg-[#f3f4ed] hover:border-[#91a593] hover:bg-[#f0f3eb]"
                  }`}
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center bg-[#e5ebe1] text-[#57755d]">
                    <Upload size={27} strokeWidth={1.7} />
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-[#263c31]">
                    Drop your document here
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#849087]">
                    Drag and drop a file into this area, or browse your device
                    to select a document.
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      inputRef.current?.click();
                    }}
                    className="mt-6 inline-flex items-center gap-2 bg-[#294638] px-6 py-3 text-xs font-bold tracking-wide text-white transition-colors hover:bg-[#365844]"
                  >
                    <FileText size={15} />
                    BROWSE DOCUMENTS
                  </button>

                  <p className="mt-6 text-[10px] font-semibold tracking-[1.5px] text-[#9aa399]">
                    PDF <span className="mx-2">·</span> TXT
                    <span className="mx-2">·</span> DOCX
                    <span className="mx-2">·</span> JPG
                    <span className="mx-2">·</span> PNG
                  </p>
                </div>
              ) : (
                <div className="border border-[#dce0d6] bg-[#f3f4ed] p-4 md:p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center bg-[#e4ebe1] text-[#5d7a63]">
                        <FileType size={20} />
                      </div>

                      <div>
                        <p className="text-sm font-bold">Document Preview</p>
                        <p className="mt-1 text-[10px] tracking-wider text-[#829087]">
                          SELECTED FILE
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeFile}
                      className="inline-flex items-center gap-2 border border-[#e2c9c3] bg-[#f7eeeb] px-3 py-2 text-xs font-semibold text-[#a35c4e] hover:bg-[#f1e3df]"
                    >
                      <X size={14} />
                      Remove
                    </button>
                  </div>

                  {isPDF ? (
                    <div className="h-[430px] overflow-hidden border border-[#dce0d6] bg-white">
                      <iframe
                        src={preview}
                        title="PDF Document Preview"
                        className="h-full w-full border-0"
                      />
                    </div>
                  ) : isImage ? (
                    <div className="flex max-h-[430px] justify-center overflow-hidden border border-[#dce0d6] bg-white p-3">
                      <img
                        src={preview}
                        alt="Uploaded document preview"
                        className="max-h-[400px] max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex min-h-[250px] flex-col items-center justify-center border border-[#dce0d6] bg-white px-5 text-center">
                      <FileText size={48} className="text-[#6e8972]" />
                      <p className="mt-4 text-sm font-bold tracking-wide">
                        {fileExtension} DOCUMENT
                      </p>
                      <p className="mt-2 text-xs text-[#879188]">
                        File selected and ready for security analysis
                      </p>
                    </div>
                  )}

                  <div className="mt-4 border border-[#dce0d6] bg-[#fafaf6] p-4">
                    <p className="break-all text-sm font-semibold text-[#30463a]">
                      {file?.name}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-4 text-[10px] font-semibold tracking-wider text-[#879188]">
                      <span>
                        {file ? (file.size / 1024).toFixed(2) : "0"} KB
                      </span>
                      <span>{fileExtension} FORMAT</span>
                    </div>
                  </div>
                </div>
              )}

              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.txt,.docx,.jpg,.jpeg,.png"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />

              {error && (
                <div className="mt-5 flex items-start gap-3 border border-[#e5c5bd] bg-[#f8eeea] p-4 text-sm text-[#a65345]">
                  <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              {file && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={analyzeDocument}
                    disabled={loading}
                    className="flex min-w-[190px] flex-1 items-center justify-center gap-2 bg-[#294638] px-5 py-4 text-xs font-bold tracking-wider text-white transition-colors hover:bg-[#365844] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ShieldCheck size={16} />
                    {loading ? "ANALYZING DOCUMENT..." : "ANALYZE DOCUMENT"}
                  </button>

                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="border border-[#cfd8cc] bg-[#f0f2eb] px-5 py-4 text-xs font-bold tracking-wider text-[#4e6854] hover:bg-[#e8ede4]"
                  >
                    CHANGE FILE
                  </button>
                </div>
              )}

              {loading && (
                <div className="mt-6 border border-[#dce0d6] bg-[#f2f4ed] p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#b9c9b7] border-t-[#42634b]" />
                    <p className="text-sm font-bold text-[#395441]">
                      DeepShield is analyzing your document
                    </p>
                  </div>

                  <div className="mt-4 h-1.5 overflow-hidden bg-[#dce3d8]">
                    <div className="h-full w-2/3 animate-pulse bg-[#66866d]" />
                  </div>

                  <p className="mt-3 text-xs text-[#829087]">
                    Extracting information and inspecting security indicators...
                  </p>
                </div>
              )}
            </div>
          </div>

        </section>

        {/* SECURITY ASSESSMENT */}

        {result && (
          <section className="mt-14 border-t border-[#d9ddd3] pt-9">

            {/* RESULTS HEADER */}

            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold tracking-[2.5px] text-[#849184]">
                  DEEPSHIELD INTELLIGENCE
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-[28px]">
                  Security Assessment
                </h2>
                <p className="mt-2 text-sm text-[#849087]">
                  Analysis results for {result.filename || file?.name || "uploaded document"}
                </p>
              </div>

              <div className="flex items-center gap-2 border border-[#d7dfd4] bg-[#edf1e9] px-4 py-2.5 text-[10px] font-bold tracking-wider text-[#607b64]">
                <CheckCircle2 size={14} />
                ANALYSIS COMPLETED
              </div>
            </div>

            {/* VERDICT HERO */}

            <div className="relative grid overflow-hidden bg-[#203a2e] text-[#f5f5ef] lg:grid-cols-[1fr_300px]">
              <div className="relative z-10 p-7 md:p-10">
                <div className="flex items-center gap-3 text-[#c0d2b5]">
                  <ShieldCheck size={19} />
                  <span className="text-[11px] font-bold tracking-[2px]">
                    OVERALL SECURITY VERDICT
                  </span>
                </div>

                <h3 className="mt-7 text-4xl font-bold tracking-tight md:text-[48px]">
                  {result.prediction || "UNKNOWN"}
                </h3>

                <p className="mt-5 max-w-[700px] text-sm leading-7 text-[#d0d9d0]">
                  {isSafe
                    ? "No major security indicators were reported in this document analysis. Review the extracted content and findings before relying on the document."
                    : "The document analysis returned indicators that require your attention. Review the reported findings and extracted content carefully."}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <span className="border border-white/20 bg-white/5 px-4 py-2.5 text-[10px] font-bold tracking-wider">
                    {result.risk_level || "RISK LEVEL UNKNOWN"}
                  </span>

                  <span className="border border-white/20 bg-white/5 px-4 py-2.5 text-[10px] font-bold tracking-wider">
                    {findings.length} FINDING(S)
                  </span>

                  <span className="border border-white/20 bg-white/5 px-4 py-2.5 text-[10px] font-bold tracking-wider">
                    {fileExtension} DOCUMENT
                  </span>
                </div>
              </div>

              <div className="relative flex items-center justify-center overflow-hidden border-t border-white/10 p-8 lg:border-l lg:border-t-0">
                <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />
                <div className="absolute -right-5 -top-5 h-48 w-48 rounded-full border border-white/10" />

                <div
                  className="relative flex h-52 w-52 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(${riskColor} ${riskScore * 3.6}deg, rgba(255,255,255,0.13) 0deg)`,
                  }}
                >
                  <div className="flex h-[calc(100%-12px)] w-[calc(100%-12px)] flex-col items-center justify-center rounded-full bg-[#203a2e]">
                    <span className="text-[10px] font-bold tracking-[2px] text-[#c0d2b5]">
                      RISK SCORE
                    </span>
                    <span className="mt-1 text-[52px] font-bold leading-none">
                      {riskScore}
                    </span>
                    <span className="mt-2 text-xs text-[#c0d2b5]">
                      out of 100
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* METRICS STRIP */}

            <div className="grid grid-cols-1 border-b border-[#d9ddd3] bg-[#eceee7] sm:grid-cols-3">
              <div className="border-b border-[#d9ddd3] p-5 sm:border-b-0 sm:border-r">
                <p className="text-[10px] font-bold tracking-[2px] text-[#849184]">
                  RISK CLASSIFICATION
                </p>
                <p className="mt-4 text-xl font-bold">
                  {result.risk_level || "UNKNOWN"}
                </p>
                <p className="mt-2 text-xs text-[#829087]">
                  Based on returned risk score
                </p>
              </div>

              <div className="border-b border-[#d9ddd3] p-5 sm:border-b-0 sm:border-r">
                <p className="text-[10px] font-bold tracking-[2px] text-[#849184]">
                  DOCUMENT STATUS
                </p>
                <p className="mt-4 text-xl font-bold">
                  {result.detected === false ? "Not detected" : "Processed"}
                </p>
                <p className="mt-2 text-xs text-[#829087]">
                  Document analysis response
                </p>
              </div>

              <div className="p-5">
                <p className="text-[10px] font-bold tracking-[2px] text-[#849184]">
                  SECURITY INDICATORS
                </p>
                <p className="mt-4 text-xl font-bold">
                  {findings.length} finding(s)
                </p>
                <p className="mt-2 text-xs text-[#829087]">
                  Returned by the analysis engine
                </p>
              </div>
            </div>

            {/* INSPECTION DETAILS */}

            <div className="mt-12">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold tracking-[2px] text-[#849184]">
                    INSPECTION DETAILS
                  </p>
                  <h3 className="mt-2 text-xl font-bold">
                    What did we find?
                  </h3>
                </div>

                <span className="text-xs text-[#849087]">
                  Document content and security indicators
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

                {/* SECURITY FINDINGS */}

                <div className="border border-[#dce0d6] bg-[#fafaf6]">
                  <div className="flex items-center justify-between border-b border-[#dce0d6] px-5 py-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={18} className="text-[#a47c37]" />
                      <h4 className="text-sm font-bold">Security Findings</h4>
                    </div>
                    <span className="text-[9px] font-bold tracking-[2px] text-[#929b91]">
                      INSPECTION
                    </span>
                  </div>

                  <div className="space-y-3 p-5">
                    {findings.length > 0 ? (
                      findings.map((finding, index) => (
                        <div
                          key={index}
                          className="border border-[#e5d0c9] bg-[#f8eeea] p-4"
                        >
                          <div className="flex items-center gap-2 text-sm font-bold text-[#a65345]">
                            <AlertTriangle size={15} />
                            Finding {index + 1}
                          </div>

                          <p className="mt-3 text-xs leading-6 text-[#8d6259]">
                            {finding.description ||
                              finding.message ||
                              JSON.stringify(finding)}
                          </p>

                          {finding.severity && (
                            <p className="mt-3 text-[10px] font-bold tracking-wider text-[#a65345]">
                              SEVERITY: {finding.severity}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="flex gap-4 border border-[#d9e2d5] bg-[#edf3e9] p-5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#dfe9da] text-[#5e7c62]">
                          <CheckCircle2 size={23} />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-[#3e6347]">
                            No findings returned
                          </p>
                          <p className="mt-1 text-xs leading-6 text-[#7d917e]">
                            No major indicators were reported by this scan.
                          </p>
                        </div>
                      </div>
                    )}

                    <p className="pt-2 text-[11px] leading-5 text-[#929b91]">
                      An absence of findings is not a guarantee that the
                      document is safe. Verify unfamiliar sources independently.
                    </p>
                  </div>
                </div>

                {/* EXTRACTED CONTENT */}

                <div className="border border-[#dce0d6] bg-[#fafaf6]">
                  <div className="flex items-center justify-between border-b border-[#dce0d6] px-5 py-4">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-[#5d7a63]" />
                      <h4 className="text-sm font-bold">Extracted Content</h4>
                    </div>
                    <span className="text-[9px] font-bold tracking-[2px] text-[#929b91]">
                      DOCUMENT TEXT
                    </span>
                  </div>

                  <div className="p-5">
                    {extractedText ? (
                      <div className="max-h-[350px] overflow-y-auto border border-[#e0e3da] bg-[#f3f4ed] p-4 text-xs leading-7 text-[#53665a] [overflow-wrap:anywhere]">
                        {extractedText}
                      </div>
                    ) : (
                      <div className="flex min-h-[150px] flex-col items-center justify-center border border-dashed border-[#d6ddd2] bg-[#f3f4ed] px-5 text-center">
                        <FileSearch size={27} className="text-[#91a18f]" />
                        <p className="mt-3 text-sm font-semibold text-[#647669]">
                          No extracted text available
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#929b91]">
                          The API response did not include a document text preview.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* AI ASSISTANT SUMMARY */}

            <div className="mt-6 border border-[#d7dfd4] bg-[#eaf0e7]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d7dfd4] px-5 py-5 md:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center bg-[#dce8d9] text-[#58745d]">
                    <Sparkles size={21} />
                  </div>

                  <div>
                    <h3 className="text-base font-bold">
                      DeepShield AI Assistant
                    </h3>
                    <p className="mt-1 text-[10px] font-semibold tracking-wider text-[#7d917e]">
                      AI-GENERATED SECURITY EXPLANATION
                    </p>
                  </div>
                </div>

                <span className="border border-[#d2ddcf] bg-[#f4f6f0] px-3 py-2 text-[9px] font-bold tracking-wider text-[#69806a]">
                  ANALYSIS SUMMARY
                </span>
              </div>

              <div className="p-5 md:p-7">
                <div className="border border-[#d8e0d4] bg-[#f7f8f3] p-5 text-sm leading-8 text-[#596c5e]">
                  {result.assistant?.summary ||
                    "AI assistant summary is not available."}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={listenToReport}
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

                  <button
                    type="button"
                    onClick={analyzeAgain}
                    className="inline-flex items-center gap-2 border border-[#cbd7c8] bg-[#f4f6f0] px-5 py-3 text-xs font-bold tracking-wide text-[#4e6854] hover:bg-[#e9eee5]"
                  >
                    <RefreshCw size={15} />
                    ANALYZE AGAIN
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

            <details className="mt-6 border border-[#dce0d6] bg-[#fafaf6]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-5">
                <div className="flex items-center gap-3">
                  <FileCheck2 size={18} className="text-[#718a73]" />
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
          </section>
        )}

        {/* SUPPORTING INFORMATION */}
        <section className="mt-8">
          {/* INFORMATION PANEL */}

          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">

            <div className="border border-[#dce0d6] bg-[#fafaf6] p-5 md:p-6">
              <p className="text-[10px] font-bold tracking-[2px] text-[#849184]">
                WHAT WE INSPECT
              </p>

              <h3 className="mb-6 mt-2 text-lg font-bold">
                Document Security
              </h3>

              <div className="space-y-6">
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
                Analysis Process
              </h3>

              <div className="space-y-5">
                {processSteps.map((step) => (
                  <div key={step[0]} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#e9eee5] text-[11px] font-bold text-[#5d7a63]">
                      {step[0]}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold">{step[1]}</h4>
                      <p className="mt-1 text-[11px] leading-5 text-[#849087]">
                        {step[2]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[#d9dfd3] bg-[#eaf0e6] p-5">
              <div className="flex items-center gap-2 text-[#58745d]">
                <LockKeyhole size={16} />
                <h4 className="text-xs font-bold tracking-wide">
                  SECURITY REMINDER
                </h4>
              </div>

              <p className="mt-3 text-xs leading-6 text-[#718374]">
                Documents may contain deceptive links, suspicious content or
                misleading information. Verify unfamiliar documents and their
                sources before interacting with their contents.
              </p>
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
