# UHI (Urban Heat Island) Feature — Progress & Changes

## Summary

Implemented a full-stack Urban Heat Island intensity calculation feature for the Gárdony EcoMonitor platform: a **FastAPI Python backend** that queries Landsat-8/9 surface temperature data via Google Earth Engine, and a **React frontend panel** integrated into the existing dashboard.

---

## Backend — New Files

### `gardony-ecomonitor/backend/main.py`
FastAPI application entry point. Key changes:
- Uses the modern **`lifespan`** async context manager instead of the deprecated `@app.on_event("startup")`.
- CORS middleware allows `localhost:5173` / `localhost:3000` (Vite dev server).
- Attempts EE service-account authentication on startup if `EE_SERVICE_ACCOUNT` and `EE_PRIVATE_KEY` env vars are set.
- Includes a `/health` endpoint for monitoring.

### `gardony-ecomonitor/backend/routes.py`
Defines the **`POST /api/v1/uhi/intensity`** endpoint:
- Accepts the [`UHIRequest`](gardony-ecomonitor/backend/schemas.py:31) body (two GeoJSON polygons).
- Calls [`calculate_uhi()`](gardony-ecomonitor/backend/uhi_calculator.py:135) and returns [`UHIResponse`](gardony-ecomonitor/backend/schemas.py:45).
- Returns HTTP 400 for computation errors (e.g. fully cloud-covered polygon), HTTP 500 for EE failures.

### `gardony-ecomonitor/backend/schemas.py`
Pydantic v2 models:
- **`GeoJSONPolygon`** — validates `type` must be `Polygon` or `MultiPolygon`; checks coordinates structure.
- **`UHIRequest`** — `urban_core_polygon` + `rural_reference_polygon`.
- **`UHIResponse`** — `urban_mean_celsius`, `rural_mean_celsius`, `uhi_anomaly_celsius`, `secap_statement`.

### `gardony-ecomonitor/backend/uhi_calculator.py`
Core computation module:
1. Merges **Landsat-8** (`LANDSAT/LC08/C02/T1_L2`) and **Landsat-9** (`LANDSAT/LC09/C02/T1_L2`) image collections.
2. Filters to **previous-year summer** (June 1 – August 31).
3. Applies **cloud mask** via `QA_PIXEL` band (bits 1–4: dilated cloud, cirrus, cloud, cloud shadow) — see [`_mask_landsat_sr()`](gardony-ecomonitor/backend/uhi_calculator.py:63).
4. Converts DN → Kelvin → Celsius using Collection 2 scale factor (0.00341802) + offset (149.0) — see [`_lst_to_celsius()`](gardony-ecomonitor/backend/uhi_calculator.py:82).
5. Computes spatial-temporal mean LST per polygon via `ee.Reducer.mean()`.
6. Returns the anomaly, raw means, and the **SECAP compliance string** in Hungarian.

### `gardony-ecomonitor/backend/requirements.txt`
```
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
earthengine-api>=0.1.400
pydantic>=2.5.0
shapely>=2.0.0
python-dotenv>=1.0.0
```

### `gardony-ecomonitor/backend/.env.example`
Template for `EE_SERVICE_ACCOUNT` and `EE_PRIVATE_KEY` environment variables.

### `gardony-ecomonitor/backend/__init__.py`
Empty package marker for Python import resolution.

### `gardony-ecomonitor/backend/README.md`
Full documentation of the backend: endpoint spec, computation pipeline, project structure, and run instructions.

---

## Frontend — Modified / New Files

### `gardony-ecomonitor/src/uhi.jsx` *(NEW)*
React component **`UHIPanel`** that:
- Pre-defines Gárdony urban core and rural reference GeoJSON polygons.
- Shows a **"CALCULATE UHI"** button that calls `POST /api/v1/uhi/intensity`.
- Displays a **loading spinner** while the EE computation runs.
- Renders the **UHI anomaly** in large coloured text (red ≥4°C, yellow ≥2°C, green otherwise).
- Shows the **urban vs. rural means** side-by-side.
- Displays the **SECAP compliance statement** in a styled card.
- Offers a **"RECALCULATE"** button after results are shown.
- Handles errors with a styled error box.

### `gardony-ecomonitor/src/dashboard.jsx` *(MODIFIED)*
- Added `import { UHIPanel } from './uhi.jsx';`
- Inserted `<UHIPanel />` in the **right analytics sidebar**, between the Historical Variance chart and the Early Warning System section.

### `gardony-ecomonitor/src/dashboard.css` *(MODIFIED)*
- Appended ~200 lines of CSS for the UHI panel classes: `.uhi-section`, `.uhi-header`, `.uhi-calc-btn`, `.uhi-loading`, `.uhi-spinner`, `.uhi-error`, `.uhi-result`, `.uhi-anomaly-row`, `.uhi-anomaly-value`, `.uhi-means-grid`, `.uhi-mean-card`, `.uhi-secap`, `.uhi-secap-badge`, `.uhi-recalc-btn`, and the `@keyframes spin` animation.
- All styles follow the existing METROPOL-IX design system (same CSS variables, monospace fonts, colour palette).

### `gardony-ecomonitor/vite.config.js` *(MODIFIED)*
- Added a **Vite dev proxy** so `fetch('/api/...')` from the frontend is forwarded to `http://127.0.0.1:8000` (the FastAPI server).

---

## How to Run

### 1. Backend
```bash
cd gardony-ecomonitor
python -m venv .venv
.\.venv\Scripts\Activate.ps1         # PowerShell
pip install -r backend/requirements.txt

# Authenticate Earth Engine (choose one):
#   Option A: earthengine authenticate
#   Option B: Set EE_SERVICE_ACCOUNT + EE_PRIVATE_KEY in backend/.env

uvicorn backend.main:app --reload --port 8000
```

### 2. Frontend
```bash
cd gardony-ecomonitor
npm install
npm run dev
```
Opens at `http://localhost:5173`. The Vite proxy forwards `/api/*` to the backend.

### 3. Usage
1. Open the dashboard in your browser.
2. In the right sidebar, find the **"UHI Intensity"** section.
3. Click **"CALCULATE UHI"** — this sends the Gárdony polygons to the backend.
4. The backend queries Landsat-8/9 summer LST via Earth Engine and returns:
   - `urban_mean_celsius`
   - `rural_mean_celsius`
   - `uhi_anomaly_celsius` (urban − rural)
   - `secap_statement` — e.g. *"A belváros hőmérsékleti anomáliája +3.4°C a külterületekhez képest."*

---

## API Reference

### `POST /api/v1/uhi/intensity`

**Request body:**
```json
{
  "urban_core_polygon": {
    "type": "Polygon",
    "coordinates": [[[18.61, 47.195], [18.635, 47.195], [18.635, 47.21], [18.61, 47.21], [18.61, 47.195]]]
  },
  "rural_reference_polygon": {
    "type": "Polygon",
    "coordinates": [[[18.55, 47.17], [18.59, 47.17], [18.59, 47.19], [18.55, 47.19], [18.55, 47.17]]]
  }
}
```

**Response body:**
```json
{
  "urban_mean_celsius": 28.54,
  "rural_mean_celsius": 25.1,
  "uhi_anomaly_celsius": 3.4,
  "secap_statement": "A belváros hőmérsékleti anomáliája +3.4°C a külterületekhez képest."
}
```

---

## Technical Decisions

| Decision | Rationale |
|---|---|
| Google Earth Engine over Planetary Computer | EE provides server-side compositing & reduceRegion — no need to download rasters client-side. |
| `lifespan` over `@app.on_event` | The latter is deprecated in FastAPI ≥0.110. |
| Cloud mask bits 1–4 of `QA_PIXEL` | Standard Landsat Collection 2 cloud/shadow/cirrus masking. |
| Landsat-8 + Landsat-9 merge | Doubles the available revisit frequency during summer. |
| Pre-defined Gárdony polygons in frontend | Keeps UX simple — the user just clicks "Calculate". Polygon editing can be added later. |
| Vite proxy `/api` → `:8000` | Avoids CORS issues during local development. |
| Severity colours (red/yellow/green) | Intuitive heat-island severity indication aligned with the existing dashboard design language. |
