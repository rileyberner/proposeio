# column_mapper.py
import openai

openai.api_key = "your_openai_api_key_here"

def suggest_column_mappings(agency_headers, master_headers):
    prompt = (
        "You are helping match column headers from an unfamiliar Excel file to a known schema.\n"
        f"Agency headers: {agency_headers}\n"
        f"Master headers: {master_headers}\n"
        "Return a JSON dictionary mapping agency headers to the most likely master headers."
    )

    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
    )

    reply = response.choices[0].message.content
    return eval(reply)  # Note: use with caution; consider json.loads with structured prompt


# availability_checker.py
import gspread
from oauth2client.service_account import ServiceAccountCredentials


def get_unit_availability(sheet_url):
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds = ServiceAccountCredentials.from_json_keyfile_name("credentials.json", scope)
    client = gspread.authorize(creds)

    sheet = client.open_by_url(sheet_url).sheet1
    data = sheet.get_all_records()
    availability = {row["Unit ID"]: row for row in data}
    return availability


# export_builder.py
from fpdf import FPDF
from openpyxl import Workbook
import os


def build_excel_grid(units, output_path):
    wb = Workbook()
    ws = wb.active
    ws.append(["Unit ID", "Location", "Format", "Timing"])
    for unit in units:
        ws.append([unit["id"], unit["location"], unit["format"], unit["timing"]])
    wb.save(output_path)


def build_photosheet(units_with_photos, output_path):
    pdf = FPDF()
    for unit in units_with_photos:
        pdf.add_page()
        pdf.set_font("Arial", "B", 12)
        pdf.cell(200, 10, f"Unit ID: {unit['id']}", ln=1)
        for photo_path in unit["photos"]:
            pdf.image(photo_path, w=180)
    pdf.output(output_path)


# Example usage:
# build_excel_grid(unit_data, "output/propose_io_grid.xlsx")
# build_photosheet(unit_photos_data, "output/propose_io_photosheet.pdf")
