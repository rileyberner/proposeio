# main.py
from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os

from column_mapper import suggest_column_mappings
# from availability_checker import get_unit_availability  # 🔒 Disabled for now
from export_builder import build_excel_grid, build_photosheet

app = FastAPI()

# Enable frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "output"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.post("/map-columns")
async def map_columns(agency_headers: list[str], master_headers: list[str]):
    try:
        mapping = suggest_column_mappings(agency_headers, master_headers)
        return mapping
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# @app.post("/availability")  # 🔒 Commented out temporarily
# async def availability(sheet_url: str):
#     try:
#         availability_data = get_unit_availability(sheet_url)
#         return availability_data
#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/export")
async def export_assets(
    excel_data: list[dict],
    units_with_photos: list[dict],
    compression_level: str = "medium"
):
    try:
        quality_map = {
            "high": 40,
            "medium": 70,
            "low": 90
        }
        jpeg_quality = quality_map.get(compression_level.lower(), 70)

        excel_path = os.path.join(OUTPUT_DIR, "propose_io_grid.xlsx")
        pdf_path = os.path.join(OUTPUT_DIR, "propose_io_photosheet.pdf")

        build_excel_grid(excel_data, excel_path)
        build_photosheet(units_with_photos, pdf_path, compression_quality=jpeg_quality)

        return {
            "excel_url": f"/download/propose_io_grid.xlsx",
            "pdf_url": f"/download/propose_io_photosheet.pdf"
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/download/{file_name}")
async def download(file_name: str):
    file_path = os.path.join(OUTPUT_DIR, file_name)
    if os.path.exists(file_path):
        return FileResponse(path=file_path, filename=file_name, media_type='application/octet-stream')
    return JSONResponse(status_code=404, content={"error": "File not found"})
