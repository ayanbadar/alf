from pathlib import Path


def extract_text(file_path: Path, mime_type: str) -> str:
    suffix = file_path.suffix.lower()
    if suffix == ".pdf" or mime_type == "application/pdf":
        return _extract_pdf(file_path)
    if suffix in {".docx"} or "wordprocessingml" in mime_type:
        return _extract_docx(file_path)
    if suffix in {".txt", ".md"} or mime_type.startswith("text/"):
        return file_path.read_text(encoding="utf-8", errors="ignore")
    raise ValueError(f"Unsupported file type: {suffix}")


def _extract_pdf(path: Path) -> str:
    from pypdf import PdfReader

    reader = PdfReader(str(path))
    parts = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            parts.append(text)
    return "\n\n".join(parts)


def _extract_docx(path: Path) -> str:
    from docx import Document as DocxDocument

    doc = DocxDocument(str(path))
    return "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())
