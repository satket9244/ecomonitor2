# Gárdony EcoMonitor – Python Backend

FastAPI backend providing environmental monitoring calculations for the
Gárdony EcoMonitor urban digital twin platform.

## Features

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/uhi/intensity` | POST | Urban Heat Island intensity from Landsat-8/9 LST |
| `/health` | GET | Simple health check |

## Quick Start

```bash
# 1. Create a virtual environment
python -m venv .venv
# PowerShell
.\.venv\Scripts\Activate.ps1
# bash / zsh
# source .venv/bin/activate

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. (Optional) Configure Earth Engine authentication
cp backend/.env.example backend/.env
# Edit .env with your service-account credentials,
# or run: earthengine authenticate

# 4. Run the development server
uvicorn backend.main:app --reload --port 8000
```

The interactive Swagger docs will be available at
<http://localhost:8000/docs>.

## UHI Endpoint Details

### Request

`POST /api/v1/uhi/intensity`

```json
{
  "urban_core_polygon": {
    "type": "Polygon",
    "coordinates": [[[18.28, 47.22], [18.30, 47.22], [18.30, 47.24], [18.28, 47.24], [18.28, 47.22]]]
  },
  "rural_reference_polygon": {
    "type": "Polygon",
    "coordinates": [[[18.20, 47.18], [18.24, 47.18], [18.24, 47.20], [18.20, 47.20], [18.20, 47.18]]]
  }
}
```

### Response

```json
{
  "urban_mean_celsius": 28.54,
  "rural_mean_celsius": 25.10,
  "uhi_anomaly_celsius": 3.4,
  "secap_statement": "A belváros hőmérsékleti anomáliája +3.4°C a külterületekhez képest."
}
```

### How it works

1. **Image collection** – Merges Landsat-8 and Landsat-9 Collection 2 Tier 1
   Surface Temperature datasets.
2. **Temporal filter** – Restricts to the **previous calendar year's summer**
   (June 1 – August 31).
3. **Spatial filter** – Filters to images intersecting the union of both
   polygons.
4. **Cloud mask** – Uses the `QA_PIXEL` band (bits 1–4: dilated cloud, cirrus,
   cloud, cloud shadow) to mask out contaminated pixels.
5. **LST conversion** – Applies the Collection 2 scale factor (0.00341802)
   and offset (149.0) to convert DN → Kelvin, then subtracts 273.15 for
   Celsius.
6. **Mean computation** – Computes the spatial-temporal mean LST for each
   polygon via `ee.Reducer.mean()`.
7. **UHI anomaly** – `urban_mean_celsius − rural_mean_celsius`.
8. **SECAP statement** – Formats the Hungarian compliance string:
   *"A belváros hőmérsékleti anomáliája +[X.X]°C a külterületekhez képest."*

## Project Structure

```
backend/
├── main.py              # FastAPI app & startup
├── routes.py            # /api/v1/uhi/intensity endpoint
├── schemas.py           # Pydantic request/response models
├── uhi_calculator.py    # Core Earth Engine computation logic
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variable template
└── README.md            # This file
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `EE_SERVICE_ACCOUNT` | No | GEE service account email |
| `EE_PRIVATE_KEY` | No | Path to GEE private-key JSON |

If these are not set, the app falls back to `ee.Initialize()` using
whatever default credentials are available (e.g. from `earthengine authenticate`).

## License

Internal – Gárdony EcoMonitor project.
