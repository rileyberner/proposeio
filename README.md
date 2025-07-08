# Propose IO – Developer README

Propose IO is a web-based tool for outdoor advertising vendors that automates proposal generation. It helps vendors populate agency media grids and compile creative photo decks with smart AI matching, Google Sheets integration, and photo exports.

---

## 🧱 Project Structure
```
propose-io/
├── frontend/             # React-based UI (with Tailwind)
│   └── src/components/  # Core UI components
├── backend/              # FastAPI Python backend
├── output/               # Final Excel/PDF exports
├── uploads/              # Incoming files/photos
├── README.md             # Project setup and developer guide
```

---

## 🛠 Technologies Used
- **Frontend**: React, TailwindCSS
- **Backend**: Python, FastAPI, OpenAI API, Google Sheets API
- **Export Tools**: `openpyxl`, `FPDF`, `Pillow`
- **Deployment**: Vercel (frontend), Render or Railway (backend)

---

## 🚀 Setup Instructions

### 1. Clone and Navigate
```bash
git clone https://github.com/YOUR_USERNAME/propose-io.git
cd propose-io
```

### 2. Frontend Setup (React)
```bash
cd frontend
npm install
npm run dev     # Runs on http://localhost:3000
```

### 3. Backend Setup (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload     # Runs on http://localhost:8000
```

---

## ⚙️ Core Features

### ✅ AI-Powered Grid Mapping
Upload an agency Excel grid → OpenAI matches headers to vendor data.

### 📆 Real-Time Availability
Vendor's Google Sheet is used to confirm unit timing and availability.

### 🖼 Photo Export Builder
Select up to 3 photos per unit → Generates a compressed PDF or PowerPoint photo sheet.

### 🔍 Smart Filters
Users can filter available units/photos by:
- City
- Zip Code
- Neighborhoods (e.g., SoHo, Venice, Williamsburg)

### 📦 Compression Settings
Choose export quality (High, Medium, Low) for the PDF image deck.

---

## 🌍 Deployment

### Frontend → Vercel
- Deploy `/frontend` directly

### Backend → Render or Railway
- Deploy `/backend`
- Use `uvicorn main:app --host 0.0.0.0 --port 10000`

---

## 🔐 API Keys Needed
Create a `.env` in the backend folder:
```
OPENAI_API_KEY=your_openai_key_here
```
Also include a `credentials.json` from your Google Cloud service account (for Sheets API).

---

## ✅ Ready to Build
- Build new UI in `/frontend/src/components`
- Backend endpoints live in `main.py`
- Modular logic: `column_mapper.py`, `availability_checker.py`, `export_builder.py`

---

## 🧑‍💻 Contributing
- Open to collaborators who want to extend filtering, UI polish, or export features.
- PRs welcome with clean commit history and working demos.

---

## 🧠 Maintainer Notes
This codebase is currently evolving to integrate:
- Firebase (for backend or hosting)
- Optimized landing page (React + Tailwind)

If you're working from YouTube tutorials or live coding, sync your folder structure before deploying.

---

**Made with ❤️ for outdoor media innovators.**

Updated 7.7.25 8:29 PM