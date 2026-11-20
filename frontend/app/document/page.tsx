"use client";

import { useRef, useState } from "react";

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
  extracted_text?: string;
  text?: string;
  content?: string;
  assistant?: DocumentAssistant;
  [key: string]: unknown;
}

export default function DocumentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<DocumentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // FILE HANDLING
  // ==========================================

  const handleFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    const allowedExtensions = [
      ".pdf",
      ".txt",
      ".doc",
      ".docx",
    ];

    const fileName = selectedFile.name.toLowerCase();

    const isValidFile = allowedExtensions.some((extension =>
      fileName.endsWith(extension)
    ));

    if (!isValidFile) {
      setError("Please upload a PDF, TXT, DOC, or DOCX file.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError("");
  };

  // ==========================================
  // REMOVE FILE
  // ==========================================

  const removeFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // ==========================================
  // DRAG AND DROP
  // ==========================================

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

  // ==========================================
  // DOCUMENT ANALYSIS
  // ==========================================

  const analyzeDocument = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        "http://127.0.0.1:8000/analyze-document",
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

  // ==========================================
  // SPEECH
  // ==========================================

  const listenToReport = () => {
    const summary = result?.assistant?.summary;

    if (!summary) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(summary);

    speech.rate = 0.95;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  };

  // ==========================================
  // COPY REPORT
  // ==========================================

  const copyReport = async () => {
    if (!result) return;

    const findings =
      result.security_findings || result.findings || [];

    const findingsText =
      findings.length > 0
        ? findings
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
      alert("Document report copied successfully!");
    } catch {
      alert("Unable to copy report.");
    }
  };

  // ==========================================
  // RESET
  // ==========================================

  const analyzeAgain = () => {
    window.speechSynthesis.cancel();
    removeFile();
  };

  // ==========================================
  // RESULT HELPERS
  // ==========================================

  const riskScore = Math.max(
    0,
    Math.min(100, Number(result?.risk_score ?? 0))
  );

  const riskColor =
    riskScore >= 70
      ? "#ef4444"
      : riskScore >= 40
        ? "#f59e0b"
        : "#10b981";

  const isSafe = result?.prediction
    ?.toUpperCase()
    .includes("SAFE");

  const findings =
    result?.security_findings ||
    result?.findings ||
    [];

  const extractedText =
    result?.extracted_text ||
    result?.text ||
    result?.content ||
    "";

  const fileExtension = file?.name
    .split(".")
    .pop()
    ?.toUpperCase() || "FILE";

  const isPDF = file?.name.toLowerCase().endsWith(".pdf");

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080b12",
        color: "#f1f5f9",
        padding: "40px",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div style={{ marginBottom: "35px" }}>
          <div
            style={{
              color: "#10b981",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "3px",
              marginBottom: "10px",
            }}
          >
            DEEPSHIELD AI / DOCUMENT INTELLIGENCE
          </div>

          <h1
            style={{
              fontSize: "38px",
              fontWeight: 800,
              margin: "0 0 12px",
            }}
          >
            Document Analysis
          </h1>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "15px",
              maxWidth: "750px",
              lineHeight: 1.7,
            }}
          >
            Analyze documents for suspicious content, potentially malicious
            information, security threats, and hidden risks with DeepShield AI.
          </p>
        </div>

        {/* ================================= */}
        {/* MAIN GRID */}
        {/* ================================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1.8fr) minmax(300px, 1fr)",
            gap: "25px",
            alignItems: "start",
          }}
        >
          {/* ================================= */}
          {/* LEFT UPLOAD PANEL */}
          {/* ================================= */}

          <div
            style={{
              background: "#101620",
              border: "1px solid #1e293b",
              borderRadius: "20px",
              padding: "28px",
            }}
          >
            {/* PANEL HEADER */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "25px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "20px" }}>
                  Document Scanner
                </h2>

                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "13px",
                    marginTop: "8px",
                  }}
                >
                  Upload a document for security analysis
                </p>
              </div>

              <div
                style={{
                  background: "#052e24",
                  color: "#10b981",
                  padding: "9px 14px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                AI SCANNER
              </div>
            </div>

            {/* ================================= */}
            {/* UPLOAD AREA */}
            {/* ================================= */}

            {!preview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                style={{
                  border: `2px dashed ${
                    dragActive ? "#10b981" : "#334155"
                  }`,
                  background: dragActive ? "#0b2b22" : "#0b111b",
                  borderRadius: "18px",
                  padding: "60px 25px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
              >
                <div
                  style={{
                    width: "75px",
                    height: "75px",
                    margin: "0 auto 20px",
                    borderRadius: "18px",
                    background: "#102c24",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "34px",
                  }}
                >
                  📄
                </div>

                <h3
                  style={{
                    fontSize: "18px",
                    marginBottom: "10px",
                  }}
                >
                  Upload Document
                </h3>

                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "14px",
                    marginBottom: "20px",
                  }}
                >
                  Drag and drop your document here or browse files
                </p>

                <button
                  type="button"
                  style={{
                    background: "#10b981",
                    color: "#052e24",
                    border: "none",
                    padding: "12px 22px",
                    borderRadius: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Browse Documents
                </button>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "12px",
                    marginTop: "20px",
                  }}
                >
                  Supported formats: PDF, TXT, DOC, DOCX
                </p>
              </div>
            ) : (
              /* ================================= */
              /* DOCUMENT PREVIEW */
              /* ================================= */

              <div
                style={{
                  background: "#0b111b",
                  border: "1px solid #263244",
                  borderRadius: "18px",
                  padding: "20px",
                }}
              >
                {/* PREVIEW HEADER */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                    gap: "12px",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "15px" }}>
                    Document Preview
                  </h3>

                  <button
                    type="button"
                    onClick={removeFile}
                    style={{
                      background: "#301819",
                      border: "1px solid #7f1d1d",
                      color: "#f87171",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>

                {/* PDF PREVIEW */}

                {isPDF ? (
                  <div
                    style={{
                      background: "#080b12",
                      borderRadius: "14px",
                      overflow: "hidden",
                      height: "430px",
                    }}
                  >
                    <iframe
                      src={preview}
                      title="PDF Document Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        background: "#ffffff",
                      }}
                    />
                  </div>
                ) : (
                  /* NON PDF PREVIEW */

                  <div
                    style={{
                      background: "#080b12",
                      borderRadius: "14px",
                      padding: "40px 20px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "65px", marginBottom: "15px" }}>
                      📃
                    </div>

                    <h3 style={{ marginBottom: "10px" }}>
                      {fileExtension} DOCUMENT
                    </h3>

                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      Document ready for security analysis
                    </p>
                  </div>
                )}

                {/* FILE INFORMATION */}

                <div
                  style={{
                    marginTop: "18px",
                    background: "#111a27",
                    border: "1px solid #253244",
                    borderRadius: "12px",
                    padding: "15px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: "14px",
                      fontWeight: 600,
                      wordBreak: "break-all",
                    }}
                  >
                    {file?.name}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      flexWrap: "wrap",
                      color: "#64748b",
                      fontSize: "12px",
                    }}
                  >
                    <span>
                      {file
                        ? (file.size / 1024).toFixed(2)
                        : "0"}{" "}
                      KB
                    </span>

                    <span>{fileExtension} FORMAT</span>
                  </div>
                </div>
              </div>
            )}

            {/* FILE INPUT */}

            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            {/* ERROR MESSAGE */}

            {error && (
              <div
                style={{
                  background: "#2b1518",
                  border: "1px solid #7f1d1d",
                  color: "#f87171",
                  borderRadius: "12px",
                  padding: "15px",
                  marginTop: "20px",
                }}
              >
                ⚠ {error}
              </div>
            )}

            {/* ACTION BUTTONS */}

            {file && (
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "25px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={analyzeDocument}
                  disabled={loading}
                  style={{
                    flex: 1,
                    minWidth: "180px",
                    background: loading ? "#047857" : "#10b981",
                    color: "#052e24",
                    border: "none",
                    padding: "15px",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "14px",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading
                    ? "Analyzing Document..."
                    : "Analyze Document"}
                </button>

                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  style={{
                    background: "#1e293b",
                    color: "#cbd5e1",
                    border: "1px solid #334155",
                    padding: "15px 20px",
                    borderRadius: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Change Document
                </button>
              </div>
            )}

            {/* LOADING */}

            {loading && (
              <div
                style={{
                  marginTop: "25px",
                  padding: "20px",
                  background: "#0b111b",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#10b981",
                    fontSize: "14px",
                    fontWeight: 700,
                    marginBottom: "10px",
                  }}
                >
                  DeepShield AI is analyzing your document
                </div>

                <div
                  style={{
                    width: "100%",
                    height: "5px",
                    background: "#1e293b",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "70%",
                      height: "100%",
                      background: "#10b981",
                      borderRadius: "10px",
                    }}
                  />
                </div>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "12px",
                    marginTop: "12px",
                  }}
                >
                  Extracting information and checking security indicators...
                </p>
              </div>
            )}
          </div>

          {/* ================================= */}
          {/* RIGHT PANEL */}
          {/* ================================= */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* DOCUMENT CAPABILITIES */}

            <div
              style={{
                background: "#101620",
                border: "1px solid #1e293b",
                borderRadius: "20px",
                padding: "25px",
              }}
            >
              <h3 style={{ margin: "0 0 20px", fontSize: "18px" }}>
                Document Security Capabilities
              </h3>

              {[
                [
                  "📑",
                  "Content Analysis",
                  "Analyze document contents and identify suspicious information",
                ],
                [
                  "🛡️",
                  "Threat Detection",
                  "Identify potential security risks and suspicious indicators",
                ],
                [
                  "🔍",
                  "Risk Assessment",
                  "Evaluate the document and generate a risk score",
                ],
                [
                  "🤖",
                  "AI Intelligence",
                  "Generate an understandable explanation of the findings",
                ],
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "13px",
                    marginBottom: "20px",
                    alignItems: "start",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      minWidth: "40px",
                      borderRadius: "12px",
                      background: "#162a24",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item[0]}
                  </div>

                  <div>
                    <h4
                      style={{
                        margin: "0 0 6px",
                        fontSize: "14px",
                      }}
                    >
                      {item[1]}
                    </h4>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#94a3b8",
                        lineHeight: 1.6,
                      }}
                    >
                      {item[2]}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ANALYSIS PROCESS */}

            <div
              style={{
                background: "#101620",
                border: "1px solid #1e293b",
                borderRadius: "20px",
                padding: "25px",
              }}
            >
              <h3 style={{ margin: "0 0 20px", fontSize: "18px" }}>
                Analysis Process
              </h3>

              {[
                [
                  "01",
                  "Document Processing",
                  "Uploaded document is processed",
                ],
                [
                  "02",
                  "Content Extraction",
                  "Text and relevant content are extracted",
                ],
                [
                  "03",
                  "Security Inspection",
                  "Content is evaluated for suspicious indicators",
                ],
                [
                  "04",
                  "Risk Assessment",
                  "Verdict and risk score are generated",
                ],
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "13px",
                    marginBottom: "18px",
                  }}
                >
                  <div
                    style={{
                      color: "#10b981",
                      background: "#052e24",
                      borderRadius: "9px",
                      padding: "8px",
                      height: "fit-content",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    {item[0]}
                  </div>

                  <div>
                    <h4
                      style={{
                        margin: "0 0 5px",
                        fontSize: "13px",
                      }}
                    >
                      {item[1]}
                    </h4>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b",
                        fontSize: "12px",
                        lineHeight: 1.5,
                      }}
                    >
                      {item[2]}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* SECURITY TIP */}

            <div
              style={{
                background: "#11251f",
                border: "1px solid #14532d",
                borderRadius: "16px",
                padding: "20px",
              }}
            >
              <h4
                style={{
                  color: "#10b981",
                  margin: "0 0 10px",
                  fontSize: "14px",
                }}
              >
                Security Tip
              </h4>

              <p
                style={{
                  color: "#a7f3d0",
                  fontSize: "12px",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Documents can contain deceptive links, suspicious content,
                embedded objects, or misleading information. Always verify
                documents from unknown sources before opening links or
                interacting with their contents.
              </p>
            </div>
          </div>
        </div>

        {/* ================================= */}
        {/* ANALYSIS RESULTS */}
        {/* ================================= */}

        {result && (
          <div style={{ marginTop: "35px" }}>
            {/* RESULTS HEADER */}

            <div
              style={{
                marginBottom: "25px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#10b981",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    marginBottom: "8px",
                  }}
                >
                  DEEPSHIELD INTELLIGENCE
                </div>

                <h2 style={{ margin: 0, fontSize: "28px" }}>
                  Security Analysis Report
                </h2>
              </div>

              <div
                style={{
                  background: "#052e24",
                  color: "#10b981",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 800,
                }}
              >
                ANALYSIS COMPLETED
              </div>
            </div>

            {/* VERDICT CARDS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              {/* VERDICT */}

              <div
                style={{
                  background: "#101620",
                  border: "1px solid #1e293b",
                  borderRadius: "20px",
                  padding: "25px",
                }}
              >
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    margin: "0 0 15px",
                  }}
                >
                  SECURITY VERDICT
                </p>

                <div
                  style={{
                    display: "inline-block",
                    padding: "12px 18px",
                    borderRadius: "12px",
                    background: isSafe ? "#052e24" : "#301819",
                    color: isSafe ? "#10b981" : "#f87171",
                    fontSize: "18px",
                    fontWeight: 800,
                    marginBottom: "15px",
                  }}
                >
                  {result.prediction || "UNKNOWN"}
                </div>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                    margin: 0,
                  }}
                >
                  Verdict generated from document security analysis.
                </p>
              </div>

              {/* RISK SCORE */}

              <div
                style={{
                  background: "#101620",
                  border: "1px solid #1e293b",
                  borderRadius: "20px",
                  padding: "25px",
                }}
              >
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    margin: "0 0 15px",
                  }}
                >
                  RISK SCORE
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "42px",
                      fontWeight: 800,
                      color: riskColor,
                    }}
                  >
                    {riskScore}
                  </span>

                  <span
                    style={{
                      color: "#64748b",
                      fontSize: "16px",
                    }}
                  >
                    /100
                  </span>
                </div>

                <p
                  style={{
                    color: riskColor,
                    fontWeight: 700,
                    fontSize: "13px",
                    margin: "5px 0 15px",
                  }}
                >
                  {result.risk_level || "UNKNOWN RISK"}
                </p>

                <div
                  style={{
                    height: "8px",
                    background: "#1e293b",
                    borderRadius: "20px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${riskScore}%`,
                      height: "100%",
                      background: riskColor,
                      borderRadius: "20px",
                      transition: "width 0.5s",
                    }}
                  />
                </div>
              </div>

              {/* DOCUMENT INFO */}

              <div
                style={{
                  background: "#101620",
                  border: "1px solid #1e293b",
                  borderRadius: "20px",
                  padding: "25px",
                }}
              >
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    margin: "0 0 15px",
                  }}
                >
                  DOCUMENT INFORMATION
                </p>

                <div
                  style={{
                    fontSize: "25px",
                    fontWeight: 800,
                    color: "#10b981",
                    marginBottom: "10px",
                  }}
                >
                  {fileExtension}
                </div>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                    margin: "0 0 8px",
                    wordBreak: "break-all",
                  }}
                >
                  {result.filename || file?.name}
                </p>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                    margin: 0,
                  }}
                >
                  {file ? (file.size / 1024).toFixed(2) : "0"} KB
                </p>
              </div>
            </div>

            {/* ================================= */}
            {/* SECURITY FINDINGS */}
            {/* ================================= */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 1.4fr) minmax(280px, 1fr)",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              {/* FINDINGS */}

              <div
                style={{
                  background: "#101620",
                  border: "1px solid #1e293b",
                  borderRadius: "20px",
                  padding: "25px",
                }}
              >
                <h3 style={{ margin: "0 0 20px", fontSize: "18px" }}>
                  Security Findings
                </h3>

                {findings.length > 0 ? (
                  findings.map((finding, index) => (
                    <div
                      key={index}
                      style={{
                        background: "#2b1518",
                        border: "1px solid #7f1d1d",
                        borderRadius: "12px",
                        padding: "15px",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          color: "#f87171",
                          fontWeight: 700,
                          fontSize: "14px",
                          marginBottom: "8px",
                        }}
                      >
                        ⚠ Finding {index + 1}
                      </div>

                      <p
                        style={{
                          color: "#fca5a5",
                          fontSize: "13px",
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        {finding.description ||
                          finding.message ||
                          JSON.stringify(finding)}
                      </p>

                      {finding.severity && (
                        <div
                          style={{
                            marginTop: "10px",
                            color: "#f87171",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          SEVERITY: {finding.severity}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      background: "#052e24",
                      border: "1px solid #14532d",
                      borderRadius: "14px",
                      padding: "20px",
                    }}
                  >
                    <div
                      style={{
                        color: "#10b981",
                        fontWeight: 800,
                        fontSize: "15px",
                        marginBottom: "10px",
                      }}
                    >
                      ✓ No Security Findings
                    </div>

                    <p
                      style={{
                        color: "#a7f3d0",
                        fontSize: "13px",
                        lineHeight: 1.7,
                        margin: 0,
                      }}
                    >
                      No major security indicators were detected during this
                      analysis.
                    </p>
                  </div>
                )}
              </div>

              {/* DOCUMENT CONTENT */}

              <div
                style={{
                  background: "#101620",
                  border: "1px solid #1e293b",
                  borderRadius: "20px",
                  padding: "25px",
                }}
              >
                <h3 style={{ margin: "0 0 20px", fontSize: "18px" }}>
                  Document Content
                </h3>

                {extractedText ? (
                  <div
                    style={{
                      background: "#0b111b",
                      border: "1px solid #263244",
                      borderRadius: "12px",
                      padding: "15px",
                      maxHeight: "350px",
                      overflowY: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      color: "#cbd5e1",
                      fontSize: "13px",
                      lineHeight: 1.7,
                    }}
                  >
                    {extractedText}
                  </div>
                ) : (
                  <div
                    style={{
                      background: "#0b111b",
                      borderRadius: "12px",
                      padding: "20px",
                      color: "#64748b",
                      fontSize: "13px",
                      lineHeight: 1.7,
                    }}
                  >
                    Document text preview is not available in the API response.
                    The security analysis is displayed below.
                  </div>
                )}
              </div>
            </div>

            {/* ================================= */}
            {/* AI ASSISTANT */}
            {/* ================================= */}

            <div
              style={{
                background: "#101620",
                border: "1px solid #1e293b",
                borderRadius: "20px",
                padding: "25px",
                marginBottom: "20px",
              }}
            >
              {/* ASSISTANT HEADER */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "45px",
                    height: "45px",
                    background: "#052e24",
                    border: "1px solid #14532d",
                    borderRadius: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                  }}
                >
                  🤖
                </div>

                <div>
                  <h3 style={{ margin: 0, fontSize: "18px" }}>
                    DeepShield AI Assistant
                  </h3>

                  <p
                    style={{
                      color: "#10b981",
                      fontSize: "12px",
                      margin: "5px 0 0",
                    }}
                  >
                    AI-generated security explanation
                  </p>
                </div>
              </div>

              {/* SUMMARY */}

              <div
                style={{
                  background: "#0b111b",
                  border: "1px solid #263244",
                  borderRadius: "14px",
                  padding: "20px",
                  lineHeight: 1.8,
                  fontSize: "14px",
                  color: "#cbd5e1",
                }}
              >
                {result.assistant?.summary ||
                  "AI assistant summary is not available."}
              </div>

              {/* ACTION BUTTONS */}

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  onClick={listenToReport}
                  style={{
                    background: "#052e24",
                    border: "1px solid #14532d",
                    color: "#10b981",
                    padding: "12px 18px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  🔊 Listen
                </button>

                <button
                  type="button"
                  onClick={copyReport}
                  style={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#cbd5e1",
                    padding: "12px 18px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  📋 Copy Report
                </button>

                <button
                  type="button"
                  onClick={analyzeAgain}
                  style={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#cbd5e1",
                    padding: "12px 18px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  ↻ Analyze Again
                </button>
              </div>
            </div>

            {/* ================================= */}
            {/* TECHNICAL DETAILS */}
            {/* ================================= */}

            <details
              style={{
                background: "#101620",
                border: "1px solid #1e293b",
                borderRadius: "16px",
                padding: "20px",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 700,
                  color: "#94a3b8",
                }}
              >
                View Technical Analysis Details
              </summary>

              <pre
                style={{
                  marginTop: "20px",
                  background: "#080b12",
                  padding: "20px",
                  borderRadius: "12px",
                  overflowX: "auto",
                  color: "#10b981",
                  fontSize: "12px",
                  lineHeight: 1.6,
                }}
              >
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* ================================= */}
        {/* FOOTER */}
        {/* ================================= */}

        <div
          style={{
            borderTop: "1px solid #1e293b",
            marginTop: "40px",
            paddingTop: "20px",
            textAlign: "center",
            color: "#475569",
            fontSize: "12px",
          }}
        >
          DEEPSHIELD AI • Intelligent Multimodal Security Analysis
        </div>
      </div>
    </div>
  );
}