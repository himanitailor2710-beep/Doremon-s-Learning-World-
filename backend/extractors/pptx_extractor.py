"""
PowerPoint (.pptx) extractor for Doraemon AI Study World.
Extracts slide titles, body text, bullet hierarchies, tables, and speaker notes.
"""
import os
from typing import List, Dict, Any
from pptx import Presentation

def extract_pptx(file_path: str) -> List[Dict[str, Any]]:
    """
    Extracts structured content from a PPTX file.
    Returns a list of slide dicts with:
    - slide_number (1-indexed)
    - title
    - paragraphs (list of strings)
    - bullet_points (list of strings)
    - tables (list of 2D list of strings)
    - notes (speaker notes if any)
    - full_text (consolidated string)
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    prs = Presentation(file_path)
    slides_data = []

    for idx, slide in enumerate(prs.slides, start=1):
        slide_title = ""
        paragraphs = []
        bullet_points = []
        tables = []
        notes = ""

        # Check for title
        if slide.shapes.title and slide.shapes.title.text:
            slide_title = slide.shapes.title.text.strip()

        # Iterate over all shapes in the slide
        for shape in slide.shapes:
            # Handle text frame
            if shape.has_text_frame:
                # If shape is the title shape, skip adding to general paragraphs to avoid duplicate
                is_title_shape = (shape == slide.shapes.title)
                for paragraph in shape.text_frame.paragraphs:
                    text = paragraph.text.strip()
                    if not text:
                        continue
                    if is_title_shape:
                        if not slide_title:
                            slide_title = text
                        continue

                    # Check if paragraph has level > 0 or bullet style
                    if paragraph.level > 0 or text.startswith(("•", "-", "*", "–")):
                        bullet_points.append(text.lstrip("•-*– "))
                    else:
                        paragraphs.append(text)

            # Handle tables
            if shape.has_table:
                table_matrix = []
                for row in shape.table.rows:
                    row_data = [cell.text.strip().replace("\n", " ") for cell in row.cells]
                    if any(row_data):
                        table_matrix.append(row_data)
                if table_matrix:
                    tables.append(table_matrix)

        # Handle speaker notes
        if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
            notes = slide.notes_slide.notes_text_frame.text.strip()

        # If title wasn't found from shapes.title, infer from first paragraph
        if not slide_title and paragraphs:
            slide_title = paragraphs[0]
            paragraphs = paragraphs[1:]
        elif not slide_title:
            slide_title = f"Slide {idx}"

        # Build full text for search / RAG
        text_segments = [f"Title: {slide_title}"]
        if paragraphs:
            text_segments.append("Content: " + " | ".join(paragraphs))
        if bullet_points:
            text_segments.append("Key Points: " + " • ".join(bullet_points))
        if tables:
            for t_idx, t in enumerate(tables, 1):
                t_str = " ; ".join([" | ".join(row) for row in t])
                text_segments.append(f"Table {t_idx}: {t_str}")
        if notes:
            text_segments.append(f"Notes: {notes}")

        full_text = "\n".join(text_segments)

        slides_data.append({
            "slide_number": idx,
            "title": slide_title,
            "paragraphs": paragraphs,
            "bullet_points": bullet_points,
            "tables": tables,
            "notes": notes,
            "full_text": full_text
        })

    return slides_data
