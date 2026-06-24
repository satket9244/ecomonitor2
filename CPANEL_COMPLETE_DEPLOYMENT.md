# cPanel Passenger Deployment – Complete File Structure & Commands

## 1. EXACT FOLDER STRUCTURE TO CREATE & UPLOAD

Your cPanel app root is `uhi-api`. Create this structure locally, then upload via FTP:

```
uhi-api/
│
├── passenger_wsgi.py                 [NEW - ASGI-to-WSGI wrapper, ~120 lines]
├── requirements-cpanel.txt           [NEW - dependencies for cPanel]
│
├── backend/
│   ├── __init__.py                   [EXISTING - keep as-is]
│   ├── main.py                       [EXISTING - FastAPI app, ~113 lines]
│   ├── routes.py                     [EXISTING - UHI router, ~57 lines]
│   ├── schemas.py                    [EXISTING - Pydantic models, ~69 lines]
│   └── uhi_calculator.py             [EXISTING - Earth Engine logic]
│
├── ee-service-account.json           [OPTIONAL - Earth Engine credentials]
│   └── (Do NOT commit to git, upload separately if using service account)
│
└── tmp/                              [CREATE EMPTY - for logs]
```

## 2. FILE-BY-FILE WHAT'S NEW

### `passenger_wsgi.py` ✨ NEW
- **Purpose:** WSGI entry point for cPanel Passenger
- **Creates:** `application` callable that Passenger invokes
- **Size:** ~120 lines
- **Key function:** Converts FastAPI (ASGI) to WSGI
- **Location:** ROOT of `uhi-api/`

### `requirements-cpanel.txt` ✨ NEW
```
fastapi==0.104.1
pydantic==2.5.2
asgiref==3.7.1                  ← CRITICAL: ASGI-to-WSGI adapter
earthengine-api==0.1.407
shapely==2.0.1
python-dotenv==1.0.0
gunicorn==21.2.0                ← Fallback if Passenger fails
```

### `backend/*` — NO CHANGES
All existing files stay the same. Just upload them as-is.

---

## 3. EXACT DEPLOYMENT COMMANDS

### Command 1: Prepare Locally
```bash
# Navigate to your project
cd /path/to/gardony-ecomonitor

# Create staging folder
mkdir -p deploy/uhi-api/backend
mkdir -p deploy/uhi-api/tmp

# Copy files
cp passenger_wsgi.py deploy/uhi-api/
cp requirements-cpanel.txt deploy/uhi-api/
cp backend/*.py deploy/uhi-api/backend/
```

### Command 2: Upload via FTP
1. Use FileZilla, Cyberduck, or cPanel File Manager
2. Connect to your account
3. Navigate to `~/uhi-api` (created by cPanel)
4. Upload all files from `deploy/uhi-api/`
   - `passenger_wsgi.py`
   - `requirements-cpanel.txt`
   - `backend/` folder

### Command 3: SSH / cPanel Terminal
```bash
# Connect to cPanel (SSH or Terminal in cPanel)

# 1. Navigate to app directory
cd ~/uhi-api

# 2. Activate virtual environment (PATH FROM CPANEL SETUP PYTHON APP)
source /home/YOUR_USERNAME/virtualenv/uhi-api/3.11/bin/activate

# 3. Upgrade pip & tools
pip install --upgrade pip setuptools wheel

# 4. Install dependencies
pip install -r requirements-cpanel.txt

# 5. Verify (should show ~7 packages)
pip list
```

### Command 4: Set Environment Variables in cPanel
In cPanel **Setup Python App**, click **Edit** and add:

```
EE_SERVICE_ACCOUNT = your-account@project.iam.gserviceaccount.com
EE_PRIVATE_KEY = /home/YOUR_USERNAME/uhi-api/ee-service-account.json
```

Or leave blank for default authentication.

### Command 5: Restart App
In cPanel **Setup Python App**, click **Restart**.

---

## 4. PIP INSTALL COMMAND (Copy-Paste Ready)

Run this in cPanel Terminal after activating virtual environment:

```bash
pip install fastapi==0.104.1 pydantic==2.5.2 asgiref==3.7.1 earthengine-api==0.1.407 shapely==2.0.1 python-dotenv==1.0.0 gunicorn==21.2.0
```

Or use the requirements file (simpler):

```bash
pip install -r requirements-cpanel.txt
```

---

## 5. ENVIRONMENT VARIABLES REFERENCE

### For Earth Engine Authentication

| Variable | Example Value | Required? |
|----------|---------------|-----------|
| `EE_SERVICE_ACCOUNT` | `uhi-bot@my-project.iam.gserviceaccount.com` | If using service account |
| `EE_PRIVATE_KEY` | `/home/user/uhi-api/ee-service-account.json` | If using service account |

### How to Get Earth Engine Credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create service account → Generate JSON key
3. Download and upload to cPanel as `ee-service-account.json`
4. Set env vars to point to this file

### If NOT Using Service Account:
- Leave both variables blank
- App will use default credentials
- (Requires running `earthengine authenticate` locally first)

---

## 6. API ENDPOINTS EXPOSED

After deployment, these endpoints will work:

### Health Check
```http
GET /health
```
Response: `{"status":"ok"}`

### UHI Calculation
```http
POST /api/v1/uhi/intensity
Content-Type: application/json

{
  "urban_core_polygon": {
    "type": "Polygon",
    "coordinates": [[[lon1,lat1], [lon2,lat2], ...]]
  },
  "rural_reference_polygon": {
    "type": "Polygon",
    "coordinates": [[[lon1,lat1], [lon2,lat2], ...]]
  }
}
```

Response:
```json
{
  "urban_mean_celsius": 28.5,
  "rural_mean_celsius": 24.2,
  "uhi_anomaly_celsius": 4.3,
  "secap_statement": "..."
}
```

---

## 7. CORS CONFIGURATION FOR PRODUCTION

Edit `backend/main.py` lines 92-103:

```python
# For production, replace allow_origins with your domain:
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourdomain.com",
        "https://www.yourdomain.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Then re-upload `main.py` and restart the app.

---

## 8. TESTING AFTER DEPLOYMENT

### Test 1: Health Check
```bash
curl https://yourdomain.com/api/health
# Expected: {"status":"ok"}
```

### Test 2: API Documentation
```
https://yourdomain.com/api/docs
# Should show Swagger UI with available endpoints
```

### Test 3: UHI Endpoint
```bash
curl -X POST https://yourdomain.com/api/v1/uhi/intensity \
  -H "Content-Type: application/json" \
  -d '{
    "urban_core_polygon": {
      "type": "Polygon",
      "coordinates": [[[18.61,47.195],[18.635,47.195],[18.635,47.21],[18.61,47.21],[18.61,47.195]]]
    },
    "rural_reference_polygon": {
      "type": "Polygon",
      "coordinates": [[[18.55,47.17],[18.59,47.17],[18.59,47.19],[18.55,47.19],[18.55,47.17]]]
    }
  }'
```

---

## 9. TROUBLESHOOTING

| Symptom | Solution |
|---------|----------|
| **500 Error** | Check cPanel logs: **Logs** → **Passenger Log** or **Error log** |
| **`ModuleNotFoundError: backend`** | Verify `backend/` folder exists with all `.py` files; check `sys.path` in `passenger_wsgi.py` |
| **`asgiref not found`** | Run `pip install asgiref==3.7.1` in virtual environment |
| **App won't restart** | Check `passenger_wsgi.py` syntax: `python -m py_compile passenger_wsgi.py` |
| **"Cannot connect"** | Check app status in cPanel; click **Restart**; wait 30 seconds |
| **Earth Engine auth fails** | Verify `EE_SERVICE_ACCOUNT` and `EE_PRIVATE_KEY` env vars are set correctly |

---

## 10. PRODUCTION CHECKLIST

✅ **Before Going Live:**
- [ ] Upload all files to cPanel
- [ ] Install dependencies via pip
- [ ] Set environment variables
- [ ] Restart app in cPanel
- [ ] Test `/health` endpoint
- [ ] Test `/api/v1/uhi/intensity` endpoint
- [ ] Update CORS origins in `main.py`
- [ ] Re-upload `main.py` if CORS changed
- [ ] Monitor logs for errors
- [ ] Test from frontend app

✅ **Security:**
- [ ] Do NOT commit `ee-service-account.json` to git
- [ ] Use environment variables, not hardcoded secrets
- [ ] HTTPS only (cPanel provides free SSL)
- [ ] Restrict CORS to your domain only

---

## 11. QUICK REFERENCE: EXACT FILE TREE

```
uhi-api/                          (cPanel application root)
│
├── passenger_wsgi.py              (ASGI-to-WSGI wrapper – FROM: gardony-ecomonitor/)
├── requirements-cpanel.txt        (Dependencies – FROM: gardony-ecomonitor/)
│
├── backend/                       (DIRECTORY)
│   ├── __init__.py                (FROM: gardony-ecomonitor/backend/)
│   ├── main.py                    (FROM: gardony-ecomonitor/backend/)
│   ├── routes.py                  (FROM: gardony-ecomonitor/backend/)
│   ├── schemas.py                 (FROM: gardony-ecomonitor/backend/)
│   └── uhi_calculator.py          (FROM: gardony-ecomonitor/backend/)
│
├── ee-service-account.json        (OPTIONAL: Google Cloud service account key)
└── tmp/                           (EMPTY: for logs)
```

---

## 12. WHERE THE FILES ARE NOW

After following this guide:
- `passenger_wsgi.py` — Already created in `gardony-ecomonitor/`
- `requirements-cpanel.txt` — Already created in `gardony-ecomonitor/`
- `backend/*` files — Existing in `gardony-ecomonitor/backend/`

**Next:** Copy these to a local folder, upload via FTP to cPanel's `uhi-api/`.

---

**Ready? Start with Section 3 (Exact Deployment Commands)**
