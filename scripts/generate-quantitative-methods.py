#!/usr/bin/env python3
"""Generate the public quantitative methodology and evidence-boundaries PDF."""

from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Sequence

from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    HRFlowable,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "public" / "cv" / "Faris_Maulana_Quantitative_Portfolio.pdf"
EDITION = "25 November 2026"
TITLE = "Quantitative Methods and Evidence Boundaries"
PORTFOLIO_URL = "https://faris-portfolio-red.vercel.app/"
RESEARCH_URL = f"{PORTFOLIO_URL}#research"
CASE_STUDY_SOURCE_URL = (
    "https://github.com/Faris-Maulana/faris-portfolio/blob/"
    "de6bc222fab87fe38921017c80504679e21084ee/src/lib/constants.ts"
)

PAGE_WIDTH, PAGE_HEIGHT = A4
LEFT_MARGIN = 17 * mm
RIGHT_MARGIN = 17 * mm
TOP_MARGIN = 23 * mm
BOTTOM_MARGIN = 19 * mm
CONTENT_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN

INK = HexColor("#17242D")
MUTED = HexColor("#53636B")
ACCENT = HexColor("#167A78")
ACCENT_DARK = HexColor("#105856")
PALE = HexColor("#EDF4F2")
PALE_WARM = HexColor("#F5F2EC")
RULE = HexColor("#D7E0DF")
WHITE = colors.white


def external_link(label: str, url: str) -> str:
    return f'<a href="{url}" color="#105856" underline="1">{label}</a>'


@dataclass(frozen=True)
class FontSet:
    body: str
    body_bold: str
    body_italic: str
    display: str
    display_bold: str


@dataclass(frozen=True)
class CaseStudy:
    title: str
    company: str
    method: str
    question: str
    approach: str
    validation: str
    limitation: str
    evidence: tuple[tuple[str, str], ...]
    available: str
    short_label: str


CASE_STUDIES = (
    CaseStudy(
        title="Fleet economics association study",
        company="PT Berlian Laju Tanker",
        method="PCA + OLS with robust standard errors",
        question=(
            "Which operational and compliance signals are associated with TCE yield "
            "in the available ERP history?"
        ),
        approach=(
            "Use principal component analysis to reduce correlated operational inputs, "
            "then fit an observational ordinary least squares regression for TCE yield "
            "with robust standard errors. Inspect residual and stability behaviour "
            "before discussing operational hypotheses. The inferential frame remains "
            "associational."
        ),
        validation=(
            "Before publishing any estimate, provide a disclosure-safe data dictionary "
            "and ERP lineage, define the observation unit and TCE derivation, and record "
            "inclusion, exclusion and missing-data rules. Release the PCA construction, "
            "regression specification, robust-variance rationale, residual and stability "
            "diagnostics, and a versioned executable analysis with pinned dependencies. "
            "Identify every transformation so an independent reviewer can trace published "
            "outputs back to their source extracts."
        ),
        limitation=(
            "Observational coefficients do not establish a causal lift. Original model "
            "artifacts are required before publishing coefficient or outcome precision. "
            "Robust standard errors address a stated variance assumption; they do not "
            "supply identification or verify the private source records."
        ),
        evidence=(
            ("Observation window", "36 months"),
            ("Inferential frame", "Associational"),
            ("Source", "Private ERP records"),
        ),
        available=(
            f"{external_link('The public website', RESEARCH_URL)} supplies the question, "
            "method label, observation window, associational frame and private-ERP source "
            "label shown above. This document "
            "adds methodological boundaries, not source records, fitted artifacts or "
            "verified quantitative results."
        ),
        short_label="Fleet economics",
    ),
    CaseStudy(
        title="Enterprise churn risk framing",
        company="Telkom Indonesia",
        method="Survival analysis + regularized classification",
        question=(
            "How can account behaviour inform retention prioritisation without reducing "
            "churn to one opaque score?"
        ),
        approach=(
            "Separate time-to-event behaviour from account classification. Use "
            "Kaplan-Meier estimates to describe cohort survival and regularized "
            "classification to structure risk segments. Inspect API-usage signals and "
            "define the retention intervention each segment should trigger, keeping "
            "survival description, classification and intervention decisions distinct."
        ),
        validation=(
            "Publish cohort entry and exit rules, the churn event definition, observation "
            "windows, censoring rules and account exclusions. Define API features and "
            "their measurement timing to expose leakage, then document regularization, "
            "validation splits and drift handling. Require calibration assessment, an "
            "evaluation of the proposed segment actions, executable code and auditable "
            "data lineage under appropriate disclosure controls."
        ),
        limitation=(
            "Reported historical performance is not reproduced here. Cohort definitions, "
            "censoring and calibration must be reviewed before reusing the model. A risk "
            "segment is a decision aid, not proof that a retention intervention will "
            "change an account outcome."
        ),
        evidence=(
            ("Unit of analysis", "B2B accounts"),
            ("Temporal view", "Kaplan-Meier"),
            ("Decision output", "Risk segments"),
        ),
        available=(
            f"{external_link('The public website', RESEARCH_URL)} supplies the question, "
            "method label, account unit, Kaplan-Meier temporal view and risk-segment "
            "decision output. No cohort "
            "extract, survival table, classification artifact, calibration record or "
            "intervention evaluation is supplied with this methodology note."
        ),
        short_label="Enterprise churn",
    ),
    CaseStudy(
        title="Triage decision-cost analysis",
        company="Toyota Research Institute",
        method="Regression + confusion-matrix costing",
        question=(
            "Which operating threshold balances intake efficiency against the "
            "administrative cost of false positives?"
        ),
        approach=(
            "Make the error-cost matrix explicit, assess candidate thresholds against "
            "desk capacity, and separate continuous prediction from classification "
            "decisions. Use regression and confusion-matrix costing to structure the "
            "analysis while keeping prediction quality, review effort and workflow "
            "decisions as separately defined quantities."
        ),
        validation=(
            "Provide a governance-approved provenance statement for restricted data, "
            "including cohort and task definitions, label adjudication and separation of "
            "training, validation and evaluation. Publish error costs and desk-capacity "
            "assumptions with named owners and units. Supply a reproducible operating-"
            "curve evaluation, sensitivity analysis and threshold-selection rule, plus "
            "the monitoring and human-review protocol needed to assess the decision in "
            "its intended setting."
        ),
        limitation=(
            "No patient data or verifiable operating curve is published. A threshold is "
            "task-specific and must not be presented as a universal optimum. Changing "
            "cost assumptions, case mix, labels or review capacity can change the "
            "appropriate decision."
        ),
        evidence=(
            ("Evaluation lens", "Error cost"),
            ("Constraint", "Restricted data"),
            ("Decision output", "Operating threshold"),
        ),
        available=(
            f"{external_link('The public website', RESEARCH_URL)} supplies the question, "
            "method label, error-cost lens, restricted-data constraint and "
            "operating-threshold decision output. No "
            "restricted records, confusion matrices, cost inputs, operating curves or "
            "selected cutoff are reproduced or certified here."
        ),
        short_label="Triage decision cost",
    ),
    CaseStudy(
        title="Learning-mode efficacy study",
        company="Anak Bangsa Bisa",
        method="Mixed-effects logistic regression",
        question=(
            "How do learning mode and platform responsiveness relate to observed "
            "learning outcomes across groups?"
        ),
        approach=(
            "Model grouped observations with mixed-effects logistic regression rather "
            "than treating every learner as independent. Compare active and passive "
            "learning modes, then test whether technical conditions change the estimated "
            "relationship. Pre-specify the grouping structure, outcome coding and "
            "responsiveness analysis before interpreting across-group comparisons."
        ),
        validation=(
            "Supply the study design, recruitment and cohort flow, learning-outcome "
            "definition, active and passive exposure definitions, and telemetry semantics. "
            "Document grouping levels, random-effects specification, missing and idle-"
            "session handling, responsiveness measurement and potential confounding. "
            "Provide executable analysis, disclosure-safe data or fixtures, model "
            "diagnostics and sensitivity analyses; justify any causal design separately "
            "rather than relying on the model label."
        ),
        limitation=(
            "Effect sizes and latency cutoffs require the original study design for "
            "interpretation. They are not transferable product benchmarks. Grouped "
            "regression alone does not remove selection, measurement or confounding "
            "concerns, and platform responsiveness may reflect its own context."
        ),
        evidence=(
            ("Design feature", "Grouped observations"),
            ("Comparison", "Active vs passive"),
            ("Engineering lens", "Responsiveness"),
        ),
        available=(
            f"{external_link('The public website', RESEARCH_URL)} supplies the question, "
            "method label, grouped-observation design feature, active-versus-passive "
            "comparison and responsiveness lens. "
            "No learner records, telemetry extract, fitted model or reproducible outcome "
            "analysis accompanies this public note."
        ),
        short_label="Learning modes",
    ),
)


def register_fonts() -> FontSet:
    """Embed macOS system fonts when available, with portable PDF font fallbacks."""
    font_dir = Path("/System/Library/Fonts/Supplemental")
    candidates = {
        "body": font_dir / "Arial.ttf",
        "body_bold": font_dir / "Arial Bold.ttf",
        "body_italic": font_dir / "Arial Italic.ttf",
        "display": font_dir / "Georgia.ttf",
        "display_bold": font_dir / "Georgia Bold.ttf",
    }
    if all(path.is_file() for path in candidates.values()):
        names = FontSet(
            body="FM-Body",
            body_bold="FM-Body-Bold",
            body_italic="FM-Body-Italic",
            display="FM-Display",
            display_bold="FM-Display-Bold",
        )
        for field_name, path in candidates.items():
            pdfmetrics.registerFont(TTFont(getattr(names, field_name), str(path)))
        pdfmetrics.registerFontFamily(
            names.body,
            normal=names.body,
            bold=names.body_bold,
            italic=names.body_italic,
            boldItalic=names.body_bold,
        )
        pdfmetrics.registerFontFamily(
            names.display,
            normal=names.display,
            bold=names.display_bold,
            italic=names.display,
            boldItalic=names.display_bold,
        )
        return names

    return FontSet(
        body="Helvetica",
        body_bold="Helvetica-Bold",
        body_italic="Helvetica-Oblique",
        display="Times-Roman",
        display_bold="Times-Bold",
    )


def make_styles(fonts: FontSet) -> dict[str, ParagraphStyle]:
    return {
        "eyebrow": ParagraphStyle(
            "Eyebrow",
            fontName=fonts.body_bold,
            fontSize=7.4,
            leading=10,
            tracking=1.2,
            textColor=ACCENT_DARK,
            spaceAfter=7,
        ),
        "cover_title": ParagraphStyle(
            "CoverTitle",
            fontName=fonts.display_bold,
            fontSize=29,
            leading=34,
            textColor=INK,
            spaceAfter=12,
        ),
        "cover_subtitle": ParagraphStyle(
            "CoverSubtitle",
            fontName=fonts.body,
            fontSize=11,
            leading=17,
            textColor=MUTED,
        ),
        "page_title": ParagraphStyle(
            "PageTitle",
            fontName=fonts.display_bold,
            fontSize=23,
            leading=28,
            textColor=INK,
            spaceAfter=5,
        ),
        "company": ParagraphStyle(
            "Company",
            fontName=fonts.body_bold,
            fontSize=8.2,
            leading=11,
            tracking=0.7,
            textColor=MUTED,
            spaceAfter=12,
        ),
        "section": ParagraphStyle(
            "Section",
            fontName=fonts.body_bold,
            fontSize=8.2,
            leading=11,
            tracking=0.65,
            textColor=ACCENT_DARK,
            spaceBefore=8,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "Body",
            fontName=fonts.body,
            fontSize=9.35,
            leading=14.3,
            textColor=INK,
            spaceAfter=5,
        ),
        "body_small": ParagraphStyle(
            "BodySmall",
            fontName=fonts.body,
            fontSize=8.55,
            leading=12.8,
            textColor=INK,
        ),
        "question": ParagraphStyle(
            "Question",
            fontName=fonts.display,
            fontSize=11.4,
            leading=16.2,
            textColor=INK,
        ),
        "notice": ParagraphStyle(
            "Notice",
            fontName=fonts.body,
            fontSize=9.5,
            leading=14.5,
            textColor=INK,
        ),
        "method": ParagraphStyle(
            "Method",
            fontName=fonts.body_bold,
            fontSize=9,
            leading=12,
            textColor=WHITE,
        ),
        "evidence_label": ParagraphStyle(
            "EvidenceLabel",
            fontName=fonts.body_bold,
            fontSize=6.7,
            leading=9,
            tracking=0.45,
            textColor=MUTED,
            spaceAfter=3,
        ),
        "evidence_value": ParagraphStyle(
            "EvidenceValue",
            fontName=fonts.body_bold,
            fontSize=8.8,
            leading=11.5,
            textColor=INK,
        ),
        "scope": ParagraphStyle(
            "Scope",
            fontName=fonts.body,
            fontSize=8.4,
            leading=12.2,
            textColor=INK,
        ),
        "scope_number": ParagraphStyle(
            "ScopeNumber",
            fontName=fonts.display_bold,
            fontSize=12,
            leading=15,
            textColor=ACCENT,
        ),
        "gate": ParagraphStyle(
            "Gate",
            fontName=fonts.body_bold,
            fontSize=11,
            leading=16,
            textColor=WHITE,
        ),
        "standard_number": ParagraphStyle(
            "StandardNumber",
            fontName=fonts.display_bold,
            fontSize=13,
            leading=16,
            textColor=ACCENT,
        ),
        "table_head": ParagraphStyle(
            "TableHead",
            fontName=fonts.body_bold,
            fontSize=7.5,
            leading=10,
            tracking=0.5,
            textColor=MUTED,
        ),
        "footer": ParagraphStyle(
            "Footer",
            fontName=fonts.body,
            fontSize=6.7,
            leading=8,
            tracking=0.45,
            textColor=MUTED,
        ),
        "footer_right": ParagraphStyle(
            "FooterRight",
            fontName=fonts.body_bold,
            fontSize=7.2,
            leading=8,
            alignment=TA_RIGHT,
            textColor=MUTED,
        ),
    }


def draw_page_furniture(
    pdf: canvas.Canvas,
    doc: BaseDocTemplate,
    fonts: FontSet,
) -> None:
    page = pdf.getPageNumber()
    pdf.saveState()
    pdf.setTitle(TITLE)
    pdf.setAuthor("Faris Maulana")
    pdf.setSubject("Public quantitative methodology, validation requirements and evidence boundaries")
    pdf.setKeywords("methodology, evidence, provenance, reproducibility, quantitative analysis")
    pdf.setCreator("ReportLab — scripts/generate-quantitative-methods.py")

    if page > 1:
        section = (
            CASE_STUDIES[page - 2].short_label
            if 2 <= page <= 5
            else "Publication standard"
        )
        pdf.setFont(fonts.body_bold, 6.8)
        pdf.setFillColor(MUTED)
        pdf.drawString(LEFT_MARGIN, PAGE_HEIGHT - 12 * mm, "QUANTITATIVE METHODS")
        pdf.drawRightString(
            PAGE_WIDTH - RIGHT_MARGIN,
            PAGE_HEIGHT - 12 * mm,
            section.upper(),
        )
        pdf.setStrokeColor(RULE)
        pdf.setLineWidth(0.6)
        pdf.line(
            LEFT_MARGIN,
            PAGE_HEIGHT - 15 * mm,
            PAGE_WIDTH - RIGHT_MARGIN,
            PAGE_HEIGHT - 15 * mm,
        )

    footer_y = 10 * mm
    pdf.setStrokeColor(RULE)
    pdf.setLineWidth(0.6)
    pdf.line(LEFT_MARGIN, footer_y + 5 * mm, PAGE_WIDTH - RIGHT_MARGIN, footer_y + 5 * mm)
    pdf.setFont(fonts.body, 6.5)
    pdf.setFillColor(MUTED)
    pdf.drawString(LEFT_MARGIN, footer_y, "FARIS MAULANA  /  PUBLIC METHODOLOGY")
    pdf.drawCentredString(PAGE_WIDTH / 2, footer_y, EDITION.upper())
    pdf.setFont(fonts.body_bold, 7)
    pdf.drawRightString(PAGE_WIDTH - RIGHT_MARGIN, footer_y, f"PAGE {page:02d}")
    pdf.restoreState()


def notice_box(text: str, styles: dict[str, ParagraphStyle]) -> Table:
    content = Paragraph(text, styles["notice"])
    table = Table([[content]], colWidths=[CONTENT_WIDTH])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), PALE),
                ("BOX", (0, 0), (-1, -1), 0.7, RULE),
                ("LINEBEFORE", (0, 0), (0, -1), 3, ACCENT),
                ("LEFTPADDING", (0, 0), (-1, -1), 15),
                ("RIGHTPADDING", (0, 0), (-1, -1), 15),
                ("TOPPADDING", (0, 0), (-1, -1), 13),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 13),
            ]
        )
    )
    return table


def evidence_table(
    evidence: Sequence[tuple[str, str]],
    styles: dict[str, ParagraphStyle],
) -> Table:
    cells = []
    for label, value in evidence:
        cells.append(
            [
                Paragraph(label.upper(), styles["evidence_label"]),
                Paragraph(value, styles["evidence_value"]),
            ]
        )
    table = Table([cells], colWidths=[CONTENT_WIDTH / len(cells)] * len(cells))
    commands = [
        ("BACKGROUND", (0, 0), (-1, -1), PALE_WARM),
        ("BOX", (0, 0), (-1, -1), 0.5, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]
    for column in range(1, len(cells)):
        commands.append(("LINEAFTER", (column - 1, 0), (column - 1, 0), 0.5, RULE))
    table.setStyle(TableStyle(commands))
    return table


def cover_page(styles: dict[str, ParagraphStyle]) -> list[Flowable]:
    story: list[Flowable] = [
        Spacer(1, 14 * mm),
        Paragraph(f"PUBLIC METHODOLOGY  /  EDITION {EDITION.upper()}", styles["eyebrow"]),
        Paragraph(
            "Quantitative Methods<br/>and <font color='#167A78'>Evidence Boundaries</font>",
            styles["cover_title"],
        ),
        Paragraph(
            "Four case-study methods, their validation requirements and the limits "
            "of what a public reader can verify.",
            styles["cover_subtitle"],
        ),
        Spacer(1, 8 * mm),
        HRFlowable(width="100%", thickness=1.2, color=ACCENT, spaceAfter=7 * mm),
        Paragraph("EVIDENCE NOTICE", styles["eyebrow"]),
        notice_box(
            "<b>No performance claims or original private records are reproduced.</b> "
            "This document describes analytical intent, required validation and evidence "
            "available for public review. It does not publish model results or certify "
            "operational recommendations.",
            styles,
        ),
        Spacer(1, 6 * mm),
        Paragraph("HOW TO READ THIS EDITION", styles["eyebrow"]),
        Paragraph(
            "Questions and method labels follow the website's quantitative case-study "
            "notes. Required validation and provenance state what must be released or "
            "independently reviewed before a metric is publishable. A source label or "
            "observation window describes the stated study frame; it is not independent "
            "verification of the underlying records.",
            styles["body"],
        ),
        Spacer(1, 3 * mm),
        Paragraph("SCOPE OF THIS EDITION", styles["eyebrow"]),
    ]

    rows = []
    for index, study in enumerate(CASE_STUDIES, start=1):
        rows.append(
            [
                Paragraph(f"{index:02d}", styles["scope_number"]),
                [
                    Paragraph(study.title, styles["body_small"]),
                    Paragraph(
                        f"{study.company}  /  {study.method}",
                        styles["evidence_label"],
                    ),
                ],
            ]
        )
    scope = Table(rows, colWidths=[12 * mm, CONTENT_WIDTH - 12 * mm])
    scope.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LINEBELOW", (0, 0), (-1, -2), 0.5, RULE),
            ]
        )
    )
    story.extend(
        [
            scope,
            Spacer(1, 4 * mm),
            Paragraph(
                f"Prepared by {external_link('Faris Maulana', PORTFOLIO_URL)}  /  "
                "Source basis: QUANT_CASE_STUDIES in "
                f"{external_link('src/lib/constants.ts', CASE_STUDY_SOURCE_URL)}  /  "
                "Methodology only; results not published",
                styles["evidence_label"],
            ),
        ]
    )
    return story


def case_study_page(
    study: CaseStudy,
    index: int,
    styles: dict[str, ParagraphStyle],
) -> list[Flowable]:
    method_label = Table(
        [[Paragraph(study.method, styles["method"])]],
        colWidths=[CONTENT_WIDTH],
    )
    method_label.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), ACCENT_DARK),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    question = Table(
        [[Paragraph(study.question, styles["question"])]],
        colWidths=[CONTENT_WIDTH],
    )
    question.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), PALE),
                ("LINEBEFORE", (0, 0), (0, -1), 2.5, ACCENT),
                ("LEFTPADDING", (0, 0), (-1, -1), 13),
                ("RIGHTPADDING", (0, 0), (-1, -1), 13),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )

    return [
        Paragraph(f"METHOD {index:02d}  /  EVIDENCE-BOUNDED CASE NOTE", styles["eyebrow"]),
        Paragraph(study.title, styles["page_title"]),
        Paragraph(study.company.upper(), styles["company"]),
        Paragraph("QUESTION", styles["section"]),
        question,
        Spacer(1, 2 * mm),
        Paragraph("METHOD", styles["section"]),
        method_label,
        Spacer(1, 3 * mm),
        Paragraph(study.approach, styles["body"]),
        Paragraph("REQUIRED VALIDATION / PROVENANCE", styles["section"]),
        Paragraph(study.validation, styles["body"]),
        Paragraph("LIMITATION", styles["section"]),
        Paragraph(study.limitation, styles["body"]),
        Paragraph("EVIDENCE CURRENTLY AVAILABLE", styles["section"]),
        evidence_table(study.evidence, styles),
        Spacer(1, 3 * mm),
        Paragraph(study.available, styles["body"]),
    ]


def publication_standard_page(styles: dict[str, ParagraphStyle]) -> list[Flowable]:
    standards = (
        (
            "Provenance and governance",
            "Identify source ownership, permitted use, disclosure controls, lineage, "
            "observation unit, cohort rules, outcomes and missing-data semantics. Make "
            "private-source restrictions explicit rather than substituting narrative "
            "confidence for access.",
        ),
        (
            "Frozen analysis protocol",
            "Version the question, estimand, model specification, validation design and "
            "decision criteria before examining final evaluation outputs. Define units "
            "and distinguish exploratory analysis from confirmatory evaluation.",
        ),
        (
            "Reproducible analysis package",
            "Release versioned code, dependency locks, configuration, random seeds and "
            "an executable pipeline or notebook. Include disclosure-safe data or exact "
            "synthetic fixtures, a controlled access procedure for restricted sources, "
            "and immutable run logs. A metric without a traceable artifact remains withheld.",
        ),
        (
            "Independent verification",
            "Require a clean-environment replay by someone other than the original "
            "author, with artifact hashes and a recorded reconciliation of discrepancies. "
            "Retain diagnostics, sensitivity analyses and unsuccessful checks so the "
            "review exposes failure modes rather than only a selected narrative.",
        ),
        (
            "Auditable metric presentation",
            "When the release gate is satisfied, tie every estimate to the exact artifact "
            "version, validation population, denominator, unit and uncertainty statement. "
            "Separate association from identification, describe subgroup and temporal "
            "scope, and document updates without silently replacing earlier editions.",
        ),
    )

    story: list[Flowable] = [
        Paragraph("GOVERNANCE  /  RELEASE REQUIREMENTS", styles["eyebrow"]),
        Paragraph("Publication standard", styles["page_title"]),
        Paragraph("ARTIFACTS BEFORE METRICS", styles["company"]),
        Paragraph(
            "Quantitative claims should become public only when an independent reviewer "
            "can trace them to reproducible artifacts. A method name, visualisation or "
            "plausible narrative is not evidence of performance.",
            styles["body"],
        ),
        Spacer(1, 2 * mm),
    ]
    gate = Table(
        [[Paragraph(
            "RELEASE GATE  /  No reproducible artifact package and independent "
            "verification record means no published performance metric.",
            styles["gate"],
        )]],
        colWidths=[CONTENT_WIDTH],
    )
    gate.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), ACCENT_DARK),
                ("LEFTPADDING", (0, 0), (-1, -1), 14),
                ("RIGHTPADDING", (0, 0), (-1, -1), 14),
                ("TOPPADDING", (0, 0), (-1, -1), 12),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ]
        )
    )
    story.extend([gate, Spacer(1, 4 * mm), Paragraph("MINIMUM RELEASE PACKAGE", styles["eyebrow"])])

    rows = []
    for index, (heading, body) in enumerate(standards, start=1):
        rows.append(
            [
                Paragraph(f"{index:02d}", styles["standard_number"]),
                [
                    Paragraph(heading.upper(), styles["evidence_label"]),
                    Paragraph(body, styles["body_small"]),
                ],
            ]
        )
    table = Table(rows, colWidths=[12 * mm, CONTENT_WIDTH - 12 * mm])
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("LINEBELOW", (0, 0), (-1, -2), 0.5, RULE),
            ]
        )
    )
    story.extend([table, Spacer(1, 4 * mm), Paragraph("LANGUAGE DISCIPLINE", styles["eyebrow"])])

    language = Table(
        [
            [
                Paragraph("SUITABLE IN THIS EDITION", styles["table_head"]),
                Paragraph("WITHHELD PENDING THE RELEASE GATE", styles["table_head"]),
            ],
            [
                Paragraph(
                    "Study questions, method labels, public source and unit labels, "
                    "validation requirements, limitations and evidence boundaries.",
                    styles["body_small"],
                ),
                Paragraph(
                    "Effect estimates, comparative lifts, uncertainty statements, "
                    "operating cutoffs, deployment guarantees and causal conclusions "
                    "presented as findings.",
                    styles["body_small"],
                ),
            ],
        ],
        colWidths=[CONTENT_WIDTH / 2, CONTENT_WIDTH / 2],
    )
    language.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), PALE_WARM),
                ("BOX", (0, 0), (-1, -1), 0.5, RULE),
                ("LINEAFTER", (0, 0), (0, -1), 0.5, RULE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 11),
                ("RIGHTPADDING", (0, 0), (-1, -1), 11),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.extend(
        [
            language,
            Spacer(1, 4 * mm),
            notice_box(
                "<b>Current release decision: methodology only.</b> No quantitative "
                "performance result is certified by this document. Future claims must "
                "cite editioned artifacts and their reproducible verification record "
                "before publication.",
                styles,
            ),
        ]
    )
    return story


def generate_pdf() -> bytes:
    fonts = register_fonts()
    styles = make_styles(fonts)
    output = BytesIO()
    document = BaseDocTemplate(
        output,
        pagesize=A4,
        leftMargin=LEFT_MARGIN,
        rightMargin=RIGHT_MARGIN,
        topMargin=TOP_MARGIN,
        bottomMargin=BOTTOM_MARGIN,
        title=TITLE,
        author="Faris Maulana",
        subject="Public methodology and evidence boundaries",
        pageCompression=1,
    )
    frame = Frame(
        LEFT_MARGIN,
        BOTTOM_MARGIN,
        CONTENT_WIDTH,
        PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN,
        leftPadding=0,
        rightPadding=0,
        topPadding=0,
        bottomPadding=0,
        id="main",
    )
    document.addPageTemplates(
        [
            PageTemplate(
                id="methodology",
                frames=[frame],
                onPage=lambda pdf, doc: draw_page_furniture(pdf, doc, fonts),
            )
        ]
    )

    story = cover_page(styles)
    for index, study in enumerate(CASE_STUDIES, start=1):
        story.append(PageBreak())
        story.extend(case_study_page(study, index, styles))
    story.append(PageBreak())
    story.extend(publication_standard_page(styles))
    document.build(story)
    return output.getvalue()


def main() -> None:
    pdf_bytes = generate_pdf()
    if not pdf_bytes.startswith(b"%PDF-"):
        raise RuntimeError("Generated output is not a PDF")
    OUTPUT_PATH.write_bytes(pdf_bytes)
    print(f"Generated {OUTPUT_PATH.relative_to(ROOT)} ({len(pdf_bytes):,} bytes)")


if __name__ == "__main__":
    main()
