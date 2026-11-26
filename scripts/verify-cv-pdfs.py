#!/usr/bin/env python3
"""Check PDF text, URI annotations and tagging without claiming PDF/UA conformance.

Run with `.venv-pdf/bin/python scripts/verify-cv-pdfs.py` (requires pypdf).
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
CV_DIRECTORY = ROOT / "public" / "cv"
SITE_URL = "https://faris-portfolio-red.vercel.app"


@dataclass(frozen=True)
class PdfContract:
    filename: str
    pages: int
    required_text: tuple[str, ...]
    required_uris: frozenset[str]
    require_tagged: bool = False
    require_linked_annotations_in_structure: bool = False


CONTRACTS = (
    PdfContract(
        filename="Faris_Maulana_CV.pdf",
        pages=2,
        required_text=(
            "FARIS MAULANA",
            "Manager, AI Engineering",
            "SELECTED PUBLIC ENGINEERING WORK",
            "SIMPUL incident proving ground",
            "EVIDENCE CONVENTION",
        ),
        required_uris=frozenset(
            {
                "mailto:maulanafaris016@gmail.com",
                "https://wa.me/6281284049172",
                "https://www.linkedin.com/in/faris-maulana-0035b914a/",
                "https://github.com/Faris-Maulana",
                f"{SITE_URL}/",
                f"{SITE_URL}/simpul",
                f"{SITE_URL}/work/simpul",
                "https://faris-maulana.github.io/wealth-advisor-agents/",
                f"{SITE_URL}/work/wealth-advisor",
                "https://github.com/Faris-Maulana/wealth-advisor-agents/blob/16cbe678197b8976fa40533dcf85ea8fe5fa1d22/samples/output/run_log.jsonl",
                f"{SITE_URL}/work/ottodot",
                "https://github.com/Faris-Maulana/ottodot-trial-booking/blob/d30ae63cb9d162e4d985f95e095826ed275e5ea1/tests/concurrency.test.ts",
                f"{SITE_URL}/work/rag-eval",
                "https://github.com/Faris-Maulana/rag-system/blob/90e16d5d52b20f670cc3a0dd4fcf8a0db5a35427/results/retrieval_report.json",
                f"{SITE_URL}/work/text2sql",
                f"{SITE_URL}/work/noc-agent",
                f"{SITE_URL}/work/appraisal",
                f"{SITE_URL}/cv/Faris_Maulana_Quantitative_Portfolio.pdf",
            }
        ),
        require_tagged=True,
        require_linked_annotations_in_structure=True,
    ),
    PdfContract(
        filename="Faris_Maulana_Quantitative_Portfolio.pdf",
        pages=6,
        required_text=(
            "Quantitative Methods",
            "Evidence Boundaries",
            "Fleet economics association study",
            "Publication standard",
            "Current release decision: methodology only.",
        ),
        required_uris=frozenset(
            {
                f"{SITE_URL}/",
                f"{SITE_URL}/#research",
                "https://github.com/Faris-Maulana/faris-portfolio/blob/de6bc222fab87fe38921017c80504679e21084ee/src/lib/constants.ts",
            }
        ),
    ),
)


def verify_pdf(contract: PdfContract) -> list[str]:
    path = CV_DIRECTORY / contract.filename
    errors: list[str] = []
    reader = PdfReader(path)
    page_text = [page.extract_text() or "" for page in reader.pages]
    combined_text = "\n".join(page_text)

    if len(reader.pages) != contract.pages:
        errors.append(f"expected {contract.pages} pages, found {len(reader.pages)}")
    for page_number, text in enumerate(page_text, start=1):
        if not text.strip():
            errors.append(f"page {page_number} has no extractable text")
    for phrase in contract.required_text:
        if phrase not in combined_text:
            errors.append(f"missing searchable text: {phrase!r}")

    links: list[tuple[int, str, bool]] = []
    for page_number, page in enumerate(reader.pages, start=1):
        for reference in page.get("/Annots", []):
            annotation = reference.get_object()
            if annotation.get("/Subtype") != "/Link":
                continue
            action = annotation.get("/A", {})
            uri = action.get("/URI")
            if not uri:
                errors.append(f"page {page_number} has a link annotation without a URI action")
                continue
            rect = [float(value) for value in annotation["/Rect"]]
            if rect[2] <= rect[0] or rect[3] <= rect[1]:
                errors.append(f"page {page_number} link has an empty rectangle: {uri}")
            links.append((page_number, str(uri), annotation.get("/StructParent") is not None))

    missing_uris = contract.required_uris.difference(uri for _, uri, _ in links)
    for uri in sorted(missing_uris):
        errors.append(f"missing URI annotation: {uri}")

    root = reader.trailer["/Root"]
    mark_info = root.get("/MarkInfo", {})
    marked = bool(mark_info.get("/Marked", False))
    structure_present = root.get("/StructTreeRoot") is not None
    tagged = marked and structure_present
    structured_links = sum(is_structured for _, _, is_structured in links)
    if contract.require_tagged and not tagged:
        errors.append("required /MarkInfo /Marked true and /StructTreeRoot are not both present")
    if contract.require_linked_annotations_in_structure and structured_links != len(links):
        errors.append("not every link annotation has /StructParent")

    language = str(root.get("/Lang", "none"))
    print(
        f"{contract.filename}: pages={len(reader.pages)}, "
        f"text_chars={len(combined_text)}, links={len(links)}, "
        f"structured_links={structured_links}, tagged={'yes' if tagged else 'no'}, "
        f"lang={language}"
    )
    for page_number, uri, is_structured in links:
        print(
            f"  page={page_number} structured={'yes' if is_structured else 'no'} uri={uri}"
        )
    for error in errors:
        print(f"  ERROR: {error}")
    return [f"{contract.filename}: {error}" for error in errors]


def main() -> None:
    errors = [error for contract in CONTRACTS for error in verify_pdf(contract)]

    quant = PdfReader(CV_DIRECTORY / "Faris_Maulana_Quantitative_Portfolio.pdf")
    quant_root = quant.trailer["/Root"]
    if quant_root.get("/StructTreeRoot") is None:
        print(
            "LIMITATION: Faris_Maulana_Quantitative_Portfolio.pdf is untagged; "
            "the installed ReportLab API exposes no structure-tree tagging support."
        )
    print("PDF/UA conformance: NOT VERIFIED; these structural checks are not a PDF/UA validator.")
    if errors:
        raise SystemExit(f"FAIL: {len(errors)} verification error(s): " + "; ".join(errors))
    print("PASS: text, URI annotation and available-tagging checks passed for both PDFs.")


if __name__ == "__main__":
    main()
