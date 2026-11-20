"use client";

import { useState, useRef } from "react";

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

export default function QRPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<QRResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // =========================
  // FILE HANDLING
  // =========================

  const handleFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
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

  // =========================
  // DRAG & DROP
  // =========================

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

  // =========================
  // QR ANALYSIS
  // =========================

  const analyzeQR = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:8000/analyze-qr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed (${response.status})`);
      }

      const data: QRResult = await response.json();
      setResult(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // AI ASSISTANT LISTEN
  // =========================

  const listenToReport = () => {
    if (!result?.assistant?.summary) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(result.assistant.summary);

    speech.rate = 0.95;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  };

  // =========================
  // COPY REPORT
  // =========================

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
      alert("Security report copied successfully!");
    } catch {
      alert("Unable to copy report.");
    }
  };

  // =========================
  // RESET
  // =========================

  const analyzeAgain = () => {
    window.speechSynthesis.cancel();
    removeFile();
  };

  // =========================
  // RESULT VALUES
  // =========================

  const qrCode = result?.codes?.[0];

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

  const isSafe = result?.prediction?.toUpperCase().includes("SAFE");

  // =========================
  // MAIN UI
  // =========================

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
        {/* HEADER */}

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
            DEEPSHIELD AI / QR INTELLIGENCE
          </div>

          <h1
            style={{
              fontSize: "38px",
              fontWeight: 800,
              margin: "0 0 12px",
            }}
          >
            QR Analysis
          </h1>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "15px",
              maxWidth: "700px",
              lineHeight: 1.7,
            }}
          >
            Analyze QR codes for suspicious links, malicious content, unsafe
            redirects, and potential security threats using DeepShield AI.
          </p>
        </div>

        {/* MAIN GRID */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.8fr) minmax(300px, 1fr)",
            gap: "25px",
            alignItems: "start",
          }}
        >
          {/* LEFT PANEL */}

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
                marginBottom: "25px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "20px" }}>
                  QR Scanner
                </h2>

                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "13px",
                    marginTop: "8px",
                  }}
                >
                  Upload an image containing a QR code
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

            {/* UPLOAD AREA */}

            {!preview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragActive ? "#10b981" : "#334155"}`,
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
                  ▦
                </div>

                <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>
                  Upload QR Code Image
                </h3>

                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "14px",
                    marginBottom: "20px",
                  }}
                >
                  Drag and drop your image here or click to browse
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
                  Browse Files
                </button>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "12px",
                    marginTop: "20px",
                  }}
                >
                  Supported formats: PNG, JPG, JPEG, WEBP
                </p>
              </div>
            ) : (
              /* IMAGE PREVIEW */

              <div
                style={{
                  background: "#0b111b",
                  border: "1px solid #263244",
                  borderRadius: "18px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "15px" }}>
                    Uploaded Image
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

                <div
                  style={{
                    background: "#080b12",
                    borderRadius: "14px",
                    padding: "15px",
                    display: "flex",
                    justifyContent: "center",
                    maxHeight: "400px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={preview}
                    alt="QR code preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "370px",
                      objectFit: "contain",
                      borderRadius: "10px",
                    }}
                  />
                </div>

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

                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      margin: 0,
                    }}
                  >
                    {file ? (file.size / 1024).toFixed(2) : "0"} KB
                  </p>
                </div>
              </div>
            )}

            {/* FILE INPUT */}

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            {/* ERROR */}

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
                  onClick={analyzeQR}
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
                  {loading ? "Analyzing QR Code..." : "Analyze QR Code"}
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
                  Change Image
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
                  DeepShield AI is analyzing your QR code
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
                  Checking QR content and security indicators...
                </p>
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* CAPABILITIES */}

            <div
              style={{
                background: "#101620",
                border: "1px solid #1e293b",
                borderRadius: "20px",
                padding: "25px",
              }}
            >
              <h3 style={{ margin: "0 0 20px", fontSize: "18px" }}>
                QR Security Capabilities
              </h3>

              {[
                ["🔗", "URL Threat Detection", "Detect suspicious and potentially malicious URLs"],
                ["🛡️", "Payload Analysis", "Analyze the data encoded within the QR code"],
                ["⚠️", "Risk Assessment", "Identify suspicious content and security indicators"],
                ["🤖", "AI Intelligence", "Get an AI-generated security explanation"],
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
                    <h4 style={{ margin: "0 0 6px", fontSize: "14px" }}>
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
                ["01", "Image Processing", "Image is processed and QR code is detected"],
                ["02", "Content Extraction", "Encoded information is extracted"],
                ["03", "Security Analysis", "Content is checked for suspicious indicators"],
                ["04", "Risk Assessment", "Security score and verdict are generated"],
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
                    <h4 style={{ margin: "0 0 5px", fontSize: "13px" }}>
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
                QR codes can hide malicious links. Always verify the destination
                before opening unknown QR codes or entering sensitive information.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* ANALYSIS RESULTS */}
        {/* ========================================= */}

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

            {/* VERDICT AND RISK CARDS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
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
                  {result.prediction}
                </div>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                    margin: 0,
                  }}
                >
                  Final verdict generated from QR security analysis.
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

                  <span style={{ color: "#64748b", fontSize: "16px" }}>
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
                  {result.risk_level}
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

              {/* QR DETECTION */}

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
                  QR DETECTION
                </p>

                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: 800,
                    color: result.detected ? "#10b981" : "#f87171",
                    marginBottom: "10px",
                  }}
                >
                  {result.detected ? "DETECTED" : "NOT DETECTED"}
                </div>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                    margin: 0,
                  }}
                >
                  {result.codes?.length ?? 0} QR code(s) identified
                </p>
              </div>
            </div>

            {/* QR INFORMATION */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 1fr)",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              {/* DECODED DATA */}

              <div
                style={{
                  background: "#101620",
                  border: "1px solid #1e293b",
                  borderRadius: "20px",
                  padding: "25px",
                }}
              >
                <h3 style={{ margin: "0 0 20px", fontSize: "18px" }}>
                  Decoded QR Information
                </h3>

                <div style={{ marginBottom: "18px" }}>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      margin: "0 0 8px",
                    }}
                  >
                    QR CODE TYPE
                  </p>

                  <div
                    style={{
                      background: "#0b111b",
                      padding: "12px",
                      borderRadius: "10px",
                      color: "#10b981",
                      fontWeight: 700,
                    }}
                  >
                    {qrCode?.type || "Unknown"}
                  </div>
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      margin: "0 0 8px",
                    }}
                  >
                    PAYLOAD TYPE
                  </p>

                  <div
                    style={{
                      background: "#0b111b",
                      padding: "12px",
                      borderRadius: "10px",
                    }}
                  >
                    {qrCode?.payload_type || "Unknown"}
                  </div>
                </div>

                <div>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      margin: "0 0 8px",
                    }}
                  >
                    DECODED CONTENT
                  </p>

                  <div
                    style={{
                      background: "#0b111b",
                      border: "1px solid #263244",
                      padding: "15px",
                      borderRadius: "12px",
                      wordBreak: "break-all",
                      lineHeight: 1.7,
                      color: "#cbd5e1",
                      fontSize: "14px",
                    }}
                  >
                    {qrCode?.data || "No decoded content available"}
                  </div>
                </div>
              </div>

              {/* SECURITY FINDINGS */}

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

                {result.security_findings?.length > 0 ? (
                  result.security_findings.map((finding, index) => (
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
                        ⚠ Security Finding {index + 1}
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
            </div>

            {/* AI ASSISTANT */}

            <div
              style={{
                background: "#101620",
                border: "1px solid #1e293b",
                borderRadius: "20px",
                padding: "25px",
                marginBottom: "20px",
              }}
            >
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

              {/* ACTIONS */}

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

            {/* TECHNICAL DETAILS */}

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

        {/* FOOTER */}

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