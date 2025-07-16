# export_builder.py
from fpdf import FPDF
from openpyxl import Workbook
from PIL import Image
import os


def build_excel_grid(units, output_path):
    wb = Workbook()
    ws = wb.active
    ws.append(["Unit ID", "Location", "Format", "Timing"])
    for unit in units:
        ws.append([unit["id"], unit["location"], unit["format"], unit["timing"]])
    wb.save(output_path)


def build_photosheet(units_with_photos, output_path, compression_quality=70):
    pdf = FPDF(unit='pt')
    for unit in units_with_photos:
        pdf.add_page()
        pdf.set_font("Arial", "B", 14)
        pdf.cell(500, 24, f"Unit ID: {unit['id']}", ln=1)
        for photo_path in unit["photos"]:
            try:
                img = Image.open(photo_path)
                img = img.convert("RGB")
                img.thumbnail((900, 600), Image.LANCZOS)
                compressed_path = f"/tmp/compressed_{os.path.basename(photo_path)}"
                img.save(compressed_path, format='JPEG', quality=compression_quality, optimize=True)
                pdf.image(compressed_path, w=500)
            except Exception as e:
                print(f"Error compressing {photo_path}: {e}")
    pdf.output(output_path)


# Example usage:
# build_excel_grid(unit_data, "output/propose_io_grid.xlsx")
# build_photosheet(unit_photos_data, "output/propose_io_photosheet.pdf", compression_quality=60)
