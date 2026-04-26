import io
from pypdf import PdfReader
from docx import Document


def parse_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    parts = []
    for page in reader.pages:
        parts.append(page.extract_text() or "")
    return "\n".join(parts).strip()


def parse_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs).strip()


def parse_resume(file_bytes: bytes, filename: str, content_type: str) -> str:
    is_pdf = filename.endswith(".pdf") or content_type == "application/pdf"
    is_docx = filename.endswith(".docx") or content_type == (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

    if is_pdf:
        return parse_pdf(file_bytes)
    if is_docx:
        return parse_docx(file_bytes)

    raise ValueError("Unsupported file type. Please upload PDF or DOCX.")
