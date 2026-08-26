# ============================================================
# DEEPSHIELD-AI — DOCUMENT ANALYZER
# ============================================================

import sys
from pathlib import Path
import re

import pytesseract

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

# ============================================================
# PROJECT PATH
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# ============================================================
# IMPORTS
# ============================================================

from services.document.utils.document_preprocessor import (
    preprocess_document
)

from services.document.utils.document_metadata import (
    analyze_document_metadata
)


# ============================================================
# SUPPORTED DOCUMENT TYPES
# ============================================================

SUPPORTED_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".doc",
    ".txt",
    ".jpg",
    ".jpeg",
    ".png",
}


# ============================================================
# DOCUMENT ANALYZER
# ============================================================

class DocumentAnalyzer:

    def __init__(self):

        print("=" * 70)
        print("DEEPSHIELD-AI — DOCUMENT ANALYZER")
        print("=" * 70)

        print("Supported formats:")

        print(
            ", ".join(
                sorted(SUPPORTED_EXTENSIONS)
            )
        )

        print("=" * 70)

    # --------------------------------------------------------
    # Validate document
    # --------------------------------------------------------

    def validate_document(self, document_path):

        document_path = Path(
            document_path
        )

        if not document_path.exists():

            raise FileNotFoundError(
                f"Document not found: {document_path}"
            )

        if not document_path.is_file():

            raise ValueError(
                f"Path is not a file: {document_path}"
            )

        extension = document_path.suffix.lower()

        if extension not in SUPPORTED_EXTENSIONS:

            raise ValueError(
                f"Unsupported document format: {extension}"
            )

        return document_path

    # --------------------------------------------------------
    # Suspicious text detection
    # --------------------------------------------------------

    def analyze_text(self, text):

        warnings = []

        # ----------------------------------------------------
        # Empty document
        # ----------------------------------------------------

        if not text.strip():

            warnings.append(
                "No readable text could be extracted."
            )

            return warnings

        # ----------------------------------------------------
        # Extremely short document
        # ----------------------------------------------------

        if len(text.strip()) < 50:

            warnings.append(
                "Document contains very little readable text."
            )

        # ----------------------------------------------------
        # Suspicious urgency / threat language
        # ----------------------------------------------------

        suspicious_patterns = [

            r"\burgent\b",
            r"\bimmediately\b",
            r"\baccount will be closed\b",
            r"\bverify your account\b",
            r"\bclick here\b",
            r"\bpayment required\b",
            r"\bwire transfer\b",
            r"\bconfidential\b",

        ]

        text_lower = text.lower()

        matches = []

        for pattern in suspicious_patterns:

            if re.search(
                pattern,
                text_lower
            ):

                matches.append(pattern)

        if matches:

            warnings.append(
                "Document contains potentially suspicious "
                "language or instructions."
            )

        # ----------------------------------------------------
        # Excessive special characters
        # ----------------------------------------------------

        if len(text) > 100:

            special_chars = sum(
                1
                for char in text
                if not char.isalnum()
                and not char.isspace()
            )

            special_ratio = (
                special_chars / len(text)
            )

            if special_ratio > 0.20:

                warnings.append(
                    "Document contains an unusually high "
                    "ratio of special characters."
                )

        return warnings

    # --------------------------------------------------------
    # Metadata analysis
    # --------------------------------------------------------

    def analyze_metadata(self, metadata):

        warnings = []

        if "pdf" not in metadata:

            return warnings

        pdf = metadata["pdf"]

        pdf_metadata = pdf.get(
            "metadata",
            {}
        )

        # ----------------------------------------------------
        # Missing creator / producer
        # ----------------------------------------------------

        creator = pdf_metadata.get(
            "creator"
        )

        producer = pdf_metadata.get(
            "producer"
        )

        if not creator and not producer:

            warnings.append(
                "PDF contains limited document-generation metadata."
            )

        # ----------------------------------------------------
        # Creation / modification mismatch
        # ----------------------------------------------------

        creation_date = pdf_metadata.get(
            "creation_date"
        )

        modification_date = pdf_metadata.get(
            "modification_date"
        )

        if (
            creation_date
            and modification_date
            and creation_date != modification_date
        ):

            warnings.append(
                "PDF creation and modification timestamps differ."
            )

        return warnings

    # --------------------------------------------------------
    # Structured content detection
    # --------------------------------------------------------

    def analyze_structured_content(self, text):

        findings = []

        if not text.strip():

            return findings

        # ----------------------------------------------------
        # URLs
        # ----------------------------------------------------

        url_pattern = (
            r"https?://[^\s]+"
            r"|www\.[^\s]+"
        )

        urls = re.findall(
            url_pattern,
            text,
            flags=re.IGNORECASE
        )

        if urls:

            findings.append({

                "type": "URL",

                "count": len(urls),

                "severity": "MEDIUM",

                "description":
                    f"Document contains "
                    f"{len(urls)} URL(s)."

            })

        # ----------------------------------------------------
        # Email addresses
        # ----------------------------------------------------

        email_pattern = (
            r"\b[A-Za-z0-9._%+-]+"
            r"@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
        )

        emails = re.findall(
            email_pattern,
            text
        )

        if emails:

            findings.append({

                "type": "EMAIL",

                "count": len(emails),

                "severity": "LOW",

                "description":
                    f"Document contains "
                    f"{len(emails)} email address(es)."

            })

        # ----------------------------------------------------
        # Indian phone numbers
        # ----------------------------------------------------

        phone_pattern = (
            r"(?<!\d)"
            r"(?:\+91[\s-]?)?"
            r"[6-9]\d{9}"
            r"(?!\d)"
        )

        phones = re.findall(
            phone_pattern,
            text
        )

        if phones:

            findings.append({

                "type": "PHONE",

                "count": len(phones),

                "severity": "LOW",

                "description":
                    f"Document contains "
                    f"{len(phones)} phone number(s)."

            })

        return findings

    # --------------------------------------------------------
    # Suspicious language analysis
    # --------------------------------------------------------

    def analyze_suspicious_language(self, text):

        findings = []

        if not text.strip():

            return findings

        suspicious_groups = {

            "URGENT_ACTION": [

                r"\burgent\b",
                r"\bimmediately\b",
                r"\bact now\b",
                r"\blast warning\b",
                r"\bfinal warning\b",

            ],

            "ACCOUNT_THREAT": [

                r"\baccount will be closed\b",
                r"\baccount suspended\b",
                r"\baccount blocked\b",
                r"\bverify your account\b",

            ],

            "PAYMENT_REQUEST": [

                r"\bpayment required\b",
                r"\bwire transfer\b",
                r"\bsend money\b",
                r"\bpay immediately\b",

            ],

            "CREDENTIAL_REQUEST": [

                r"\bpassword\b",
                r"\botp\b",
                r"\bone time password\b",
                r"\bverification code\b",

            ],

            "SUSPICIOUS_INSTRUCTION": [

                r"\bclick here\b",
                r"\bopen the link\b",
                r"\bdownload immediately\b",
                r"\bverify now\b",

            ]

        }

        text_lower = text.lower()

        for category, patterns in suspicious_groups.items():

            matches = []

            for pattern in patterns:

                if re.search(
                    pattern,
                    text_lower
                ):

                    matches.append(pattern)

            if matches:

                findings.append({

                    "type": category,

                    "count": len(matches),

                    "severity": "HIGH",

                    "description":
                        f"Potentially risky "
                        f"{category.lower().replace('_', ' ')} "
                        "language detected."

                })

        return findings

    # --------------------------------------------------------
    # Risk score
    # --------------------------------------------------------


    def calculate_risk_score(
        self,
        warnings,
        structured_findings,
        language_findings
    ):

        risk_score = 0.0

    # ========================================================
    # GENERAL WARNINGS
    # ========================================================

        for warning in warnings:

            if "very little readable text" in warning:

                risk_score += 20

            elif "suspicious language" in warning:

                risk_score += 15

            elif "special characters" in warning:

                risk_score += 10

            elif "limited document-generation metadata" in warning:

                risk_score += 10

            elif "timestamps differ" in warning:

                risk_score += 10

            elif "No readable text" in warning:

                risk_score += 10

    # ========================================================
    # STRUCTURED CONTENT
    # ========================================================

        for finding in structured_findings:

            finding_type = finding.get(
                "type",
                ""
            )

            if finding_type == "URL":

                risk_score += 20

            elif finding_type == "EMAIL":

            # Email alone is not suspicious.
                risk_score += 0

            elif finding_type == "PHONE":

            # Phone number alone is not suspicious.
                risk_score += 0

    # ========================================================
    # SUSPICIOUS LANGUAGE
    # ========================================================

        language_weights = {

            "URGENT_ACTION": 10,

            "ACCOUNT_THREAT": 25,

            "PAYMENT_REQUEST": 30,

            "CREDENTIAL_REQUEST": 30,

            "SUSPICIOUS_INSTRUCTION": 20,

        }

        for finding in language_findings:

            finding_type = finding.get(
                "type",
                ""
            )

            risk_score += language_weights.get(
                finding_type,
                0
            )

    # ========================================================
    # CAP SCORE
    # ========================================================

        risk_score = min(
            risk_score,
            100
        )

        return float(
            risk_score
        )

    # --------------------------------------------------------
    # Risk level
    # --------------------------------------------------------

    def get_risk_level(
        self,
        risk_score
    ):

        if risk_score >= 70:

            return "HIGH RISK"

        elif risk_score >= 40:

            return "MEDIUM RISK"

        return "LOW RISK"

        # --------------------------------------------------------
    # Explain risk
    # --------------------------------------------------------

    def generate_explanation(
        self,
        warnings,
        structured_findings,
        language_findings,
        risk_score,
        risk_level,
        prediction
    ):

        evidence = []

        # ====================================================
        # WARNINGS
        # ====================================================

        for warning in warnings:

            evidence.append({
                "category": "DOCUMENT WARNING",
                "severity": "MEDIUM",
                "message": warning
            })

        # ====================================================
        # STRUCTURED CONTENT
        # ====================================================

        for finding in structured_findings:

            evidence.append({
                "category": finding.get(
                    "type",
                    "STRUCTURED CONTENT"
                ),
                "severity": finding.get(
                    "severity",
                    "LOW"
                ),
                "message": finding.get(
                    "description",
                    ""
                )
            })

        # ====================================================
        # SUSPICIOUS LANGUAGE
        # ====================================================

        for finding in language_findings:

            evidence.append({
                "category": finding.get(
                    "type",
                    "SUSPICIOUS LANGUAGE"
                ),
                "severity": finding.get(
                    "severity",
                    "HIGH"
                ),
                "message": finding.get(
                    "description",
                    ""
                )
            })

        # ====================================================
        # OVERALL EXPLANATION
        # ====================================================

        if risk_score >= 70:

            summary = (
                "The document contains multiple high-risk "
                "indicators and should be treated as suspicious."
            )

        elif risk_score >= 40:

            summary = (
                "The document contains indicators that "
                "require additional review before being trusted."
            )

        elif evidence:

            summary = (
                "The document contains some detectable "
                "characteristics, but no strong evidence of "
                "malicious or fraudulent content was identified."
            )

        else:

            summary = (
                "No significant suspicious indicators were "
                "detected in the analyzed document."
            )

        return {

            "prediction": prediction,

            "risk_score": round(
                risk_score,
                2
            ),

            "risk_level": risk_level,

            "summary": summary,

            "evidence": evidence

        }

    # --------------------------------------------------------
    # Analyze document
    # --------------------------------------------------------

    def analyze(
        self,
        document_path
    ):

        document_path = self.validate_document(
            document_path
        )

        print("=" * 70)
        print("DEEPSHIELD-AI — DOCUMENT ANALYSIS")
        print("=" * 70)

        print(
            f"Document : {document_path.name}"
        )

        # ----------------------------------------------------
        # Extract and preprocess text
        # ----------------------------------------------------

        processed = preprocess_document(
            document_path
        )

        text = processed["text"]

        # ----------------------------------------------------
        # Metadata
        # ----------------------------------------------------

        metadata = analyze_document_metadata(
            document_path
        )

        # ----------------------------------------------------
        # Text analysis
        # ----------------------------------------------------

        text_warnings = self.analyze_text(
            text
        )

        # ----------------------------------------------------
        # Metadata analysis
        # ----------------------------------------------------

        metadata_warnings = self.analyze_metadata(
            metadata
        )

        # ----------------------------------------------------
        # Structured content
        # ----------------------------------------------------

        structured_findings = (
            self.analyze_structured_content(
                text
            )
        )

        # ----------------------------------------------------
        # Suspicious language
        # ----------------------------------------------------

        language_findings = (
            self.analyze_suspicious_language(
                text
            )
        )

        # ----------------------------------------------------
        # Combine warnings
        # ----------------------------------------------------

        warnings = list(
            dict.fromkeys(
                text_warnings
                + metadata_warnings
            )
        )

        # ----------------------------------------------------
        # Risk
        # ----------------------------------------------------

        risk_score = self.calculate_risk_score(
            warnings,
            structured_findings,
            language_findings
        )

        risk_level = self.get_risk_level(
            risk_score
        )

        # ----------------------------------------------------
        # Prediction
        # ----------------------------------------------------

        if risk_score >= 70:

            prediction = "SUSPICIOUS"

        elif risk_score >= 40:

            prediction = "REVIEW REQUIRED"

        else:

            prediction = "LIKELY AUTHENTIC"

        # ----------------------------------------------------
        # Structured result
        # ----------------------------------------------------

        # ----------------------------------------------------
        # Explainability
        # ----------------------------------------------------

        explanation = self.generate_explanation(
            warnings,
            structured_findings,
            language_findings,
            risk_score,
            risk_level,
            prediction
        )

        result = {

            "modality": "document",

            "filename": document_path.name,

            "file_type": document_path.suffix.lower(),

            "prediction": prediction,

            "risk_score": round(
                risk_score,
                2
            ),

            "risk_level": risk_level,

            "text": text,

            "text_statistics": {

                "characters": processed[
                    "character_count"
                ],

                "words": processed[
                    "word_count"
                ],

                "lines": processed[
                    "line_count"
                ]

            },

            "warnings": warnings,

            "metadata": metadata,

            "content_findings":
                structured_findings,

            "language_findings":
                language_findings,

            "explanation":
                explanation

        }

        # ----------------------------------------------------
        # Console output
        # ----------------------------------------------------

        print(
            f"Prediction : {prediction}"
        )

        print(
            f"Risk Score : {risk_score:.2f}"
        )

        print(
            f"Risk Level : {risk_level}"
        )

        print(
            f"Characters : "
            f"{processed['character_count']}"
        )

        print(
            f"Words      : "
            f"{processed['word_count']}"
        )

        print(
            f"Warnings   : "
            f"{len(warnings)}"
        )

        # ----------------------------------------------------
        # PDF metadata summary
        # ----------------------------------------------------

        if "pdf" in metadata:

            pdf_metadata = metadata["pdf"]

            print(
                f"Pages       : "
                f"{pdf_metadata['page_count']}"
            )

            print(
                f"Images      : "
                f"{pdf_metadata['image_count']}"
            )

            print(
                f"PDF Type    : "
                f"{pdf_metadata['document_type']}"
            )

        # ----------------------------------------------------
        # Warnings
        # ----------------------------------------------------

        if warnings:

            print(
                "\nDetected warnings:"
            )

            for warning in warnings:

                print(
                    f"  - {warning}"
                )

        else:

            print(
                "\nDetected warnings: None"
            )

        # ----------------------------------------------------
        # Security findings
        # ----------------------------------------------------

        all_findings = (
            structured_findings
            + language_findings
        )

        if all_findings:

            print(
                "\nSecurity findings:"
            )

            for finding in all_findings:

                print(
                    f"  - [{finding['severity']}] "
                    f"{finding['description']}"
                )

        else:

            print(
                "\nSecurity findings: None"
            )

        print("=" * 70)

        return result


# ============================================================
# BASIC TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 70)

    print(
        "DEEPSHIELD-AI — DOCUMENT ANALYZER TEST"
    )

    print("=" * 70)

    analyzer = DocumentAnalyzer()

    print(
        "\nDocument analyzer initialized successfully."
    )