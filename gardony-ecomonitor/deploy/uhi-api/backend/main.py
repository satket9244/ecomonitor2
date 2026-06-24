"""
Gárdony EcoMonitor – Backend API
=================================

FastAPI application entry point.

Run with:
    uvicorn backend.main:app --reload

Environment variables:
    EE_SERVICE_ACCOUNT  – Google Earth Engine service account email
    EE_PRIVATE_KEY      – Path to the EE private-key JSON file
                         (fallback: ``ee.Initialize()`` with default credentials)
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import router as uhi_router

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------
load_dotenv()


def _init_ee_service_account() -> None:
    """Authenticate EE with a service account if env vars are present."""
    sa = os.getenv("EE_SERVICE_ACCOUNT")
    key_path = os.getenv("EE_PRIVATE_KEY")
    if sa and key_path:
        import ee

        try:
            credentials = ee.ServiceAccountCredentials(sa, key_path)
            ee.Initialize(credentials)
            logger.info("Earth Engine authenticated with service account %s", sa)
        except Exception as exc:
            logger.warning(
                "EE service-account auth failed (%s); "
                "will fall back to default initialisation in calculator.",
                exc,
            )


# ---------------------------------------------------------------------------
# Lifespan (replaces deprecated on_event)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    # ── Startup ───────────────────────────────────────────────────────────
    _init_ee_service_account()
    logger.info(
        "Backend API started – UHI endpoint at /api/v1/uhi/intensity"
    )
    yield
    # ── Shutdown ──────────────────────────────────────────────────────────
    logger.info("Backend API shutting down")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Gárdony EcoMonitor – Backend API",
    version="0.1.0",
    description=(
        "REST API for environmental monitoring calculations, including "
        "Urban Heat Island (UHI) intensity from Landsat surface temperature."
    ),
    lifespan=lifespan,
)

# CORS – allow the local Vite dev server and any future deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(uhi_router)


@app.get("/health", tags=["System"])
def health_check() -> dict:
    """Simple health-check endpoint."""
    return {"status": "ok"}
