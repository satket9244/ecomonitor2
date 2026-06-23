"""
FastAPI routes for UHI (Urban Heat Island) calculations.
"""

from __future__ import annotations

import logging
from typing import Dict

from fastapi import APIRouter, HTTPException

from .schemas import UHIRequest, UHIResponse
from .uhi_calculator import calculate_uhi

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/uhi",
    tags=["UHI"],
)


@router.post(
    "/intensity",
    response_model=UHIResponse,
    summary="Calculate Urban Heat Island intensity",
    description=(
        "Calculates the UHI intensity for a municipality by comparing the "
        "mean summer land surface temperature (LST) of an urban core polygon "
        "against a rural reference polygon. Uses Landsat-8/9 Collection 2 "
        "Tier 1 imagery from the previous year's summer season (Jun 1 – "
        "Aug 31) with cloud masking via the QA_PIXEL band."
    ),
    responses={
        400: {"description": "Invalid GeoJSON or computation error"},
        500: {"description": "Earth Engine or server-side error"},
    },
)
def uhi_intensity(request: UHIRequest) -> UHIResponse:
    """Endpoint that returns UHI intensity for the given polygons."""
    try:
        result: Dict = calculate_uhi(
            urban_core_geojson=request.urban_core_polygon.model_dump(),
            rural_reference_geojson=request.rural_reference_polygon.model_dump(),
        )
    except ValueError as exc:
        logger.warning("Computation error: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected error during UHI calculation")
        raise HTTPException(
            status_code=500,
            detail=f"Earth Engine computation failed: {exc}",
        )

    return UHIResponse(**result)
