"""
PDF extractor for Doraemon AI Study World.
Extracts page text, detects section headings, lists, and formatted tables.
"""
import os
import re
from typing import List, Dict, Any
from pypdf import PdfReader

def extract_pdf(file_path: str) -> List[Dict[str, Any]]:
    """
    Extracts structured content from a PDF file.
    Returns a list of page dicts with:
    - page_number (1-indexed)
    - title (inferred main heading)
    - paragraphs (list of strings)
    - bullet_points (list of strings)
    - tables (basic detected tabular data)
    - full_text (consolidated string)
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    reader = PdfReader(file_path)
    pages_data = []

    for idx, page in enumerate(reader.pages, start=1):
        raw_text = page.extract_text() or ""
        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]

        page_title = ""
        paragraphs = []
        bullet_points = []
        tables = []

        if lines:
            # First clean line is candidate title
            # Check if line looks like a title (short, capitalized, or starts with Unit/Chapter/Session/Topic)
            first_line = lines[0]
            if len(first_line) < 120:
                page_title = first_line
                body_lines = lines[1:]
            else:
                page_title = f"Page {idx}"
                body_lines = lines
        else:
            page_title = f"Page {idx}"
            body_lines = []

        current_para = []
        for line in body_lines:
            # Check for bullet points
            if line.startswith(("•", "-", "*", "–", "▪", "1.", "2.", "3.", "4.", "5.", "a.", "b.", "c.")):
                if current_para:
                    paragraphs.append(" ".join(current_para))
                    current_para = []
                bullet_points.append(re.sub(r"^[•\-*–▪\d+\.\s]+", "", line).strip())
            # Check for tabular row indicators (multiple spaces or tabs or vertical bars)
            elif " | " in line or "\t" in line or re.search(r"\s{4,}", line):
                parts = [p.strip() for p in re.split(r"\s{3,}|\t|\|", line) if p.strip()]
                if len(parts) >= 2:
                    if not tables or len(tables[-1]) > 10:
                        tables.append([parts])
                    else:
                        tables[-1].append(parts)
                    continue
                else:
                    current_para.append(line)
            else:
                current_para.append(line)

        if current_para:
            paragraphs.append(" ".join(current_para))

        # Consolidate text
        text_segments = [f"Page {idx}: {page_title}"]
        if paragraphs:
            text_segments.append("Text: " + " | ".join(paragraphs))
        if bullet_points:
            text_segments.append("Bullets: " + " • ".join(bullet_points))
        if tables:
            for t_idx, t in enumerate(tables, 1):
                t_str = " ; ".join([" | ".join(row) for row in t])
                text_segments.append(f"Table {t_idx}: {t_str}")

        full_text = "\n".join(text_segments)

        pages_data.append({
            "page_number": idx,
            "title": page_title,
            "paragraphs": paragraphs,
            "bullet_points": bullet_points,
            "tables": tables,
            "full_text": full_text
        })

    return pages_data
