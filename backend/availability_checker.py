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
