# cPanel Deployment Quick Reference

## Exact Commands to Run in cPanel Terminal

### Step 1: Navigate to App Directory
```bash
cd ~/uhi-api
```

### Step 2: Activate Virtual Environment
```bash
# Adjust the path based on your cPanel username and app name
source /home/YOUR_CPANEL_USERNAME/virtualenv/uhi-api/3.11/bin/activate

# Verify activation (should see (uhi-api) prefix in terminal)
which python
```

### Step 3: Upgrade pip
```bash
pip install --upgrade pip setuptools wheel
```

### Step 4: Install Dependencies
```bash
pip install -r requirements-cpanel.txt
```

### Step 5: Verify Installation
```bash
pip list | grep -E "fastapi|pydantic|asgiref|earthengine"
```

### Step 6: Restart the Application
Go back to **Setup Python App** in cPanel and click **Restart**.

---

## File Checklist Before Upload

- [ ] `passenger_wsgi.py` — WSGI entry point
- [ ] `requirements-cpanel.txt` — Dependencies
- [ ] `backend/__init__.py` — Package marker
- [ ] `backend/main.py` — FastAPI app
- [ ] `backend/routes.py` — UHI routes  
- [ ] `backend/schemas.py` — Request/response models
- [ ] `backend/uhi_calculator.py` — Earth Engine logic
- [ ] `.env` — Environment variables (local only, not uploaded)
- [ ] `ee-service-account.json` — Earth Engine credentials (only if using service account)

---

## cPanel Setup Screenshot Checklist

When creating the Python App in cPanel:

1. **Display name:** `uhi-api` ✓
2. **Python version:** `3.11.x` ✓
3. **Application root:** `uhi-api` ✓
4. **Application URL:** `/api` ✓
5. **Application startup file:** `passenger_wsgi.py` ✓
6. **Application entry point:** `application` ✓

---

## Testing After Deployment

### 1. Health Check (should return 200)
```bash
curl -i https://yourdomain.com/api/health
```

Expected response:
```
HTTP/2 200 OK
{"status":"ok"}
```

### 2. API Docs (if available)
```
https://yourdomain.com/api/docs
```

### 3. UHI Calculation Test
```bash
curl -X POST https://yourdomain.com/api/v1/uhi/intensity \
  -H "Content-Type: application/json" \
  -d '{"urban_core_polygon":{"type":"Polygon","coordinates":[[[18.61,47.195],[18.635,47.195],[18.635,47.21],[18.61,47.21],[18.61,47.195]]]},"rural_reference_polygon":{"type":"Polygon","coordinates":[[[18.55,47.17],[18.59,47.17],[18.59,47.19],[18.55,47.19],[18.55,47.17]]]]}'
```

---

## Environment Variables (Set in cPanel)

Add these in **Setup Python App** → **Environment Variables**:

```
EE_SERVICE_ACCOUNT=your-service-account@iam.gserviceaccount.com
EE_PRIVATE_KEY=/home/yourusername/uhi-api/ee-service-account.json
```

---

## Logs to Check If There Are Issues

1. **cPanel Passenger Log:**
   - **Logs** → **Passenger Log**

2. **cPanel Error Log:**
   - **Logs** → **Error log**

3. **App-specific logs:**
   - May appear in the **Logs** section or in `~/uhi-api/` directory

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `ModuleNotFoundError: No module named 'backend'` | Check `sys.path.insert(0, ...)` in `passenger_wsgi.py`; verify backend folder exists |
| `asgiref` not found | Run `pip install asgiref==3.7.1` in virtual environment |
| 500 Internal Server Error | Check cPanel logs; verify `passenger_wsgi.py` is valid Python |
| Permission denied on `/ee-service-account.json` | Ensure file is readable by the web server user (cPanel handles this) |
| "Application failed to start" | Verify `passenger_wsgi.py` has `application = ...` as module-level variable |

---

## CORS Configuration for Production

Update `backend/main.py` line 94-99 to your production domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://gardonyeco.hu",           # Production domain
        "https://www.gardonyeco.hu",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Next Steps

1. Upload files to cPanel via FTP
2. Run pip install commands in cPanel Terminal
3. Set environment variables in Setup Python App
4. Click "Restart" to apply changes
5. Test endpoints
6. Update CORS origins in main.py
7. Redeploy and restart

---

**Need Help?** Check the full guide: `CPANEL_DEPLOYMENT_GUIDE.md`
