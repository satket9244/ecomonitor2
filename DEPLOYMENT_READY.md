# ✅ cPanel Passenger Deployment – READY FOR UPLOAD

Your FastAPI backend is now ready for cPanel Passenger deployment. All files have been created and committed.

---

## 📦 What Was Created

| File | Location | Purpose |
|------|----------|---------|
| `passenger_wsgi.py` | `gardony-ecomonitor/` | **NEW** – WSGI entry point for Passenger |
| `requirements-cpanel.txt` | `gardony-ecomonitor/` | **NEW** – Production dependencies |
| `.env.example` | `gardony-ecomonitor/` | **NEW** – Environment variable template |
| `CPANEL_COMPLETE_DEPLOYMENT.md` | Root | **NEW** – Full deployment guide (MUST READ) |
| `CPANEL_DEPLOYMENT_GUIDE.md` | Root | **NEW** – Comprehensive reference manual |
| `CPANEL_QUICK_REFERENCE.md` | Root | **NEW** – CLI commands & checklist |

---

## 🚀 Quick Start: 3 Steps to Deploy

### Step 1: Create Local Upload Package
```bash
cd gardony-ecomonitor

# Files to upload to cPanel:
# 1. passenger_wsgi.py (in root of uhi-api/)
# 2. requirements-cpanel.txt (in root of uhi-api/)
# 3. backend/ folder (entire directory)
# 4. ee-service-account.json (if using Earth Engine service account)
```

### Step 2: Upload via FTP to cPanel `uhi-api/` Folder
- Use FileZilla or cPanel File Manager
- Ensure directory structure matches: `uhi-api/passenger_wsgi.py`, `uhi-api/backend/`

### Step 3: Install & Test
```bash
# In cPanel Terminal:
cd ~/uhi-api
source /home/YOUR_USERNAME/virtualenv/uhi-api/3.11/bin/activate
pip install -r requirements-cpanel.txt
# Then restart app in cPanel
```

---

## 📋 File Structure for Upload

```
uhi-api/                          ← cPanel app root
├── passenger_wsgi.py              ← ASGI-to-WSGI wrapper
├── requirements-cpanel.txt        ← Dependencies
├── backend/
│   ├── __init__.py
│   ├── main.py
│   ├── routes.py
│   ├── schemas.py
│   └── uhi_calculator.py
├── ee-service-account.json        ← Optional: Earth Engine credentials
└── tmp/                           ← Create empty directory
```

---

## 🔧 Key Technical Details

### ASGI-to-WSGI Conversion
- **Problem:** FastAPI is ASGI, Passenger expects WSGI
- **Solution:** `passenger_wsgi.py` includes ASGItoWSGI adapter class
- **Dependencies:** asgiref 3.7.1 (automatically installed)

### API Endpoints Exposed
After deployment, these work automatically:
- `GET /health` → `{"status":"ok"}`
- `POST /api/v1/uhi/intensity` → UHI calculation

### Environment Variables (Set in cPanel)
```
EE_SERVICE_ACCOUNT = your-service-account@iam.gserviceaccount.com
EE_PRIVATE_KEY = /home/username/uhi-api/ee-service-account.json
```

---

## 📚 Documentation Files (Read These)

### 1. **CPANEL_COMPLETE_DEPLOYMENT.md** ← START HERE
- Full step-by-step guide
- Exact commands to run
- Complete file structure
- Environment setup

### 2. **CPANEL_QUICK_REFERENCE.md**
- Quick CLI commands (copy-paste ready)
- Pre-deployment checklist
- Common issues & fixes
- Testing procedures

### 3. **CPANEL_DEPLOYMENT_GUIDE.md**
- Detailed reference manual
- Troubleshooting section
- Production best practices
- CORS configuration

---

## 🧪 Test After Deployment

### Health Check
```bash
curl https://yourdomain.com/api/health
# Expected: {"status":"ok"}
```

### API Documentation
```
https://yourdomain.com/api/docs
```

### UHI Calculation Test
```bash
curl -X POST https://yourdomain.com/api/v1/uhi/intensity \
  -H "Content-Type: application/json" \
  -d '{
    "urban_core_polygon": {"type":"Polygon","coordinates":[[[18.61,47.195],[18.635,47.195],[18.635,47.21],[18.61,47.21],[18.61,47.195]]]},
    "rural_reference_polygon": {"type":"Polygon","coordinates":[[[18.55,47.17],[18.59,47.17],[18.59,47.19],[18.55,47.19],[18.55,47.17]]]}
  }'
```

---

## 📝 Exact pip Install Command

Run this in cPanel Terminal (after activating venv):

```bash
pip install fastapi==0.104.1 pydantic==2.5.2 asgiref==3.7.1 earthengine-api==0.1.407 shapely==2.0.1 python-dotenv==1.0.0 gunicorn==21.2.0
```

Or simpler:
```bash
pip install -r requirements-cpanel.txt
```

---

## 🔐 Earth Engine Authentication

### Option 1: Service Account (Recommended)
1. Go to Google Cloud Console
2. Create service account → Generate JSON key
3. Download JSON file
4. Upload to cPanel as `ee-service-account.json`
5. Set env vars in cPanel:
   - `EE_SERVICE_ACCOUNT` = service account email
   - `EE_PRIVATE_KEY` = path to JSON file

### Option 2: Default Credentials
1. Leave env vars blank
2. Run `earthengine authenticate` locally first

---

## ✅ Pre-Upload Checklist

- [ ] Read `CPANEL_COMPLETE_DEPLOYMENT.md`
- [ ] Create cPanel Python 3.11 app with these settings:
  - Application root: `uhi-api`
  - Startup file: `passenger_wsgi.py`
  - Entry point: `application`
- [ ] Prepare files locally:
  - [ ] `passenger_wsgi.py`
  - [ ] `requirements-cpanel.txt`
  - [ ] `backend/` directory (all .py files)
  - [ ] `ee-service-account.json` (if using service account)
- [ ] Upload via FTP to cPanel `uhi-api/` folder
- [ ] Set environment variables in cPanel
- [ ] Run pip install command in Terminal
- [ ] Click "Restart" in cPanel
- [ ] Test endpoints

---

## 🛠️ Troubleshooting

| Issue | Check |
|-------|-------|
| 500 Error | cPanel **Logs** → **Passenger Log** or **Error log** |
| Module not found | Verify `backend/` exists with all files; check `sys.path` in `passenger_wsgi.py` |
| `asgiref` not found | Run `pip install asgiref==3.7.1` in virtual environment |
| Cannot connect | Restart app in cPanel; wait 30 seconds |
| Earth Engine error | Verify env vars are set correctly |

See `CPANEL_QUICK_REFERENCE.md` for more solutions.

---

## 📦 Dependencies Summary

Production dependencies (in `requirements-cpanel.txt`):
- **fastapi** — API framework
- **pydantic** — Data validation
- **asgiref** — ASGI-to-WSGI adapter (KEY for Passenger)
- **earthengine-api** — Satellite data processing
- **shapely** — Geospatial geometry
- **python-dotenv** — Environment variables
- **gunicorn** — Fallback WSGI server

---

## 🎯 What's Included

✅ **Production-Safe:** Minimal dependencies, error handling  
✅ **Drop-in Ready:** All files prepared, just upload and install  
✅ **Documentation:** 3 complete guides (quick, full, reference)  
✅ **CORS Ready:** Update `main.py` for your domain  
✅ **Earth Engine:** Service account setup documented  
✅ **Testing:** Full test procedures provided  

---

## 📞 Next Actions

1. **Read:** `CPANEL_COMPLETE_DEPLOYMENT.md`
2. **Prepare:** Collect all files locally
3. **Upload:** Via FTP to cPanel `uhi-api/`
4. **Install:** Run pip install command in Terminal
5. **Configure:** Set environment variables
6. **Test:** Run curl commands to verify
7. **Deploy:** Update CORS, restart app

---

## 🔗 Related Documentation

- Leaflet-draw integration: `LEAFLET_DRAW_IMPLEMENTATION.md`
- Backend code: `backend/main.py`, `backend/routes.py`
- Frontend: `src/dashboard.jsx`, `src/uhi.jsx`

---

**Status:** ✅ Ready for deployment  
**FastAPI Version:** 0.104.1  
**Python Version:** 3.11+  
**Passenger Adapter:** asgiref 3.7.1  

**Start with:** `CPANEL_COMPLETE_DEPLOYMENT.md`
