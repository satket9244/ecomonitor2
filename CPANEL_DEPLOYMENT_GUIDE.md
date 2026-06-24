# cPanel Passenger Deployment Guide – FastAPI UHI Backend

## Pre-Deployment Checklist

- [ ] Create Python 3.11 application in cPanel with settings specified
- [ ] Application root: `uhi-api`
- [ ] Application URL: `/api`
- [ ] Startup file: `passenger_wsgi.py`
- [ ] Entry point: `application`

## Folder Structure to Upload to cPanel

Create this exact structure in your `uhi-api` folder:

```
uhi-api/
├── passenger_wsgi.py          # WSGI entry point (cPanel Passenger loads this)
├── requirements-cpanel.txt    # Python dependencies
├── .env                        # Environment variables (CREATE LOCALLY, don't commit)
├── backend/
│   ├── __init__.py
│   ├── main.py                # FastAPI app with lifespan
│   ├── routes.py              # UHI router
│   ├── schemas.py             # Pydantic models
│   └── uhi_calculator.py       # Earth Engine calculations
├── ee-service-account.json     # Earth Engine credentials (if using service account)
└── tmp/                        # Temp directory for logs (create empty)
```

## Step-by-Step Deployment

### 1. Prepare Files Locally

```bash
# In your project root
cd gardony-ecomonitor

# Copy backend files to a staging folder
mkdir -p deploy/uhi-api/backend
cp passenger_wsgi.py deploy/uhi-api/
cp requirements-cpanel.txt deploy/uhi-api/
cp backend/*.py deploy/uhi-api/backend/
cp backend/__init__.py deploy/uhi-api/backend/

# Create empty directories
mkdir -p deploy/uhi-api/tmp

# If using Earth Engine service account, copy it (DO NOT commit to git!)
# cp ~/ee-service-account.json deploy/uhi-api/
```

### 2. Upload to cPanel via FTP

1. Connect via FTP to your cPanel account
2. Navigate to the `uhi-api` folder (created by cPanel during app setup)
3. Upload all files from `deploy/uhi-api/`:
   - `passenger_wsgi.py`
   - `requirements-cpanel.txt`
   - `backend/` directory (with all .py files)
   - `ee-service-account.json` (if using service account)
   - Create empty `tmp/` directory

### 3. Set Environment Variables in cPanel

In cPanel **Setup Python App** configuration, set these environment variables:

```
EE_SERVICE_ACCOUNT = your-service-account@iam.gserviceaccount.com
EE_PRIVATE_KEY = /home/username/uhi-api/ee-service-account.json
```

Or leave blank if using default Earth Engine authentication.

### 4. Install Dependencies via cPanel Terminal

cPanel creates a virtual environment automatically. In cPanel **Terminal** (or via SSH):

```bash
# Navigate to your app directory
cd ~/uhi-api

# Activate the virtual environment (path shown in cPanel Setup Python App)
source /home/username/virtualenv/uhi-api/3.11/bin/activate

# Install dependencies from requirements-cpanel.txt
pip install --upgrade pip setuptools wheel
pip install -r requirements-cpanel.txt

# Verify installation
pip list
```

### 5. Test the Deployment

After installation, test the endpoints:

```bash
# Test health endpoint
curl -X GET https://yourdomain.com/api/health

# Test UHI calculation with sample data
curl -X POST https://yourdomain.com/api/v1/uhi/intensity \
  -H "Content-Type: application/json" \
  -d '{
    "urban_core_polygon": {
      "type": "Polygon",
      "coordinates": [[
        [18.61, 47.195],
        [18.635, 47.195],
        [18.635, 47.21],
        [18.61, 47.21],
        [18.61, 47.195]
      ]]
    },
    "rural_reference_polygon": {
      "type": "Polygon",
      "coordinates": [[
        [18.55, 47.17],
        [18.59, 47.17],
        [18.59, 47.19],
        [18.55, 47.19],
        [18.55, 47.17]
      ]]
    }
  }'
```

## Environment Variables Reference

### Required for Earth Engine Authentication

| Variable | Value | Example |
|----------|-------|---------|
| `EE_SERVICE_ACCOUNT` | Service account email | `my-app@my-project.iam.gserviceaccount.com` |
| `EE_PRIVATE_KEY` | Path to JSON key file | `/home/user/uhi-api/ee-service-account.json` |

### Optional

- Leave blank if using default Earth Engine authentication (requires `earthengine authenticate` locally first)

## API Endpoints Available

### Health Check
```
GET /health
Response: {"status": "ok"}
```

### UHI Intensity Calculation
```
POST /api/v1/uhi/intensity
Content-Type: application/json

Request:
{
  "urban_core_polygon": {GeoJSON Polygon},
  "rural_reference_polygon": {GeoJSON Polygon}
}

Response:
{
  "urban_mean_celsius": 28.5,
  "rural_mean_celsius": 24.2,
  "uhi_anomaly_celsius": 4.3,
  "secap_statement": "..."
}
```

## Troubleshooting

### 500 Error / ASGI-to-WSGI Wrapper Failed

1. Check cPanel app logs: **Setup Python App** → **Application root** → View logs
2. Verify `passenger_wsgi.py` is in the root of `uhi-api/`
3. Ensure `asgiref` is installed: `pip install asgiref`

### "Module backend not found"

1. Verify `backend/` folder exists with `__init__.py`
2. Check `sys.path` is set correctly in `passenger_wsgi.py`
3. Use `python -c "import backend; print(backend.__file__)"` to debug

### Earth Engine Authentication Error

1. Verify Earth Engine credentials are set:
   - Service account JSON path exists and is readable
   - `EE_SERVICE_ACCOUNT` and `EE_PRIVATE_KEY` env vars are set
2. Test locally first: `python -c "import ee; ee.Initialize()"`

### "Connection Refused" / Cannot Reach API

1. Verify the application URL matches (`/api` in this case)
2. Check your cPanel app is running (green status in **Setup Python App**)
3. Restart the app: Go to **Setup Python App** → **Restart**

## Production Best Practices

✅ **Do:**
- Keep `passenger_wsgi.py` in app root
- Use environment variables for secrets (not hardcoded)
- Monitor app logs regularly
- Test before deploying changes
- Keep `requirements-cpanel.txt` minimal

❌ **Don't:**
- Commit `ee-service-account.json` to git
- Use development flags in production
- Edit Python files directly on the server (deploy via upload)
- Share CORS origins beyond your frontend domain

## CORS Configuration

Edit `backend/main.py` to update allowed origins for production:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourdomain.com",  # Production frontend
        "https://www.yourdomain.com",
        # Remove localhost entries for production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Performance Tuning (Optional)

If you experience slow responses:

1. Increase cPanel app memory limit (if available)
2. Optimize Earth Engine queries in `backend/uhi_calculator.py`
3. Add response caching headers if data doesn't change frequently

## Support & Debugging

- cPanel Logs: **Logs** → **Error log** or **Passenger log**
- Python errors: SSH into server, check `~/uhi-api/` for logs
- FastAPI docs: Visit `https://yourdomain.com/api/docs` (Swagger UI)

---

**Deployment Version:** 1.0  
**Last Updated:** 2026-06-24  
**FastAPI Version:** 0.104.1  
**Python Version:** 3.11
