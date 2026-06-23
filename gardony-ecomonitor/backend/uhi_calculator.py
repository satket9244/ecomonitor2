"""
UHI (Urban Heat Island) intensity calculation using Google Earth Engine.

Fetches Landsat-8/9 Surface Temperature data for summer months of the previous
year, applies cloud masking via the QA_PIXEL band, and computes mean LST for
urban and rural polygons.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, Tuple

import ee

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Landsat-8/9 Surface Temperature band name
LST_BAND = "ST_B10"

# QA_PIXEL bit Positions for Landsat-8/9 Collection 2 Tier 1 & 2
# Bit 1 = Dilated Cloud, Bit 2 = Cirrus, Bit 3 = Cloud, Bit 4 = Cloud Shadow
QA_CLOUD_BITS = [1, 2, 3, 4]

# Scale factors for Landsat Collection 2 ST_B10
# ST_B10 is supplied in Kelvin with a scale factor of 0.00341802 and an
# additive offset of 149.0  (see USGS docs).
LST_SCALE = 0.00341802
LST_OFFSET = 149.0

# Kelvin → Celsius offset
KELVIN_TO_CELSIUS = -273.15

# ---------------------------------------------------------------------------
# Earth Engine initialisation
# ---------------------------------------------------------------------------

_ee_initialised = False


def _init_ee() -> None:
    """Initialise Earth Engine (high-volume endpoint). Idempotent."""
    global _ee_initialised
    if _ee_initialised:
        return
    try:
        ee.Initialize()
    except Exception:
        # If default init fails, try the high-volume endpoint
        try:
            ee.Initialize(project='gen-lang-client-0146925135', opt_url="https://earthengine-highvolume.googleapis.com")
        except Exception as exc:
            logger.warning("Earth Engine initialisation failed: %s", exc)
            raise
    _ee_initialised = True


# ---------------------------------------------------------------------------
# Cloud masking helpers
# ---------------------------------------------------------------------------


def _mask_landsat_sr(image: ee.Image) -> ee.Image:
    """Apply cloud/shadow/cirrus mask using the QA_PIXEL band.

    Bits unpacked from QA_PIXEL (Landsat Collection 2):
      Bit 1 – Dilated Cloud
      Bit 2 – Cirrus
      Bit 3 – Cloud
      Bit 4 – Cloud Shadow
    """
    qa = image.select("QA_PIXEL")

    def _bit_mask(bit: int) -> ee.Image:
        return qa.bitwiseAnd(1 << bit).neq(0)

    # Start with a clean mask and turn off any cloudy/shadowy pixels
    mask = ee.Image(1)
    for bit in QA_CLOUD_BITS:
        mask = mask.And(_bit_mask(bit).Not())

    return image.updateMask(mask)


# ---------------------------------------------------------------------------
# LST conversion
# ---------------------------------------------------------------------------


def _lst_to_celsius(image: ee.Image) -> ee.Image:
    """Convert Landsat ST_B10 DN values to brightness temperature in °C."""
    lst_kelvin = image.select(LST_BAND).multiply(LST_SCALE).add(LST_OFFSET)
    lst_celsius = lst_kelvin.add(KELVIN_TO_CELSIUS)
    return lst_celsius.rename("LST_Celsius")


# ---------------------------------------------------------------------------
# Core computation
# ---------------------------------------------------------------------------


def _geojson_to_ee_polygon(geojson: Dict[str, Any]) -> ee.Geometry:
    """Convert a GeoJSON Polygon/MultiPolygon to an ee.Geometry."""
    # ee.Geometry takes coordinates directly from the geometry dict
    geom_type = geojson.get("type", "Polygon")
    coords = geojson.get("coordinates", [])
    if geom_type == "MultiPolygon":
        return ee.Geometry.MultiPolygon(coords)
    return ee.Geometry.Polygon(coords)


def _compute_mean_lst(
    collection: ee.ImageCollection,
    region: ee.Geometry,
) -> float:
    """Compute the spatial-temporal mean LST (°C) over a region."""
    # Mosaic all filtered images (after cloud-mask + conversion) then average
    composite = collection.mosaic()

    # Use reduceRegion with mean reducer; 1-pixel scale is fine for a mean
    stats: Dict[str, Any] = composite.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=region,
        scale=30,  # Landsat thermal resampled to 30 m in Collection 2
        maxPixels=1e9,
        bestEffort=True,
    )

    # .getInfo() pulls the result client-side
    result = stats.getInfo()
    mean_val = result.get("LST_Celsius")
    if mean_val is None:
        raise ValueError(
            "No valid LST pixels found in the given region. "
            "The polygon may be fully cloud-covered or outside the Landsat footprint."
        )
    return float(mean_val)


def calculate_uhi(
    urban_core_geojson: Dict[str, Any],
    rural_reference_geojson: Dict[str, Any],
) -> Dict[str, Any]:
    """Calculate Urban Heat Island intensity.

    Parameters
    ----------
    urban_core_geojson : dict
        GeoJSON Polygon or MultiPolygon for the urban core.
    rural_reference_geojson : dict
        GeoJSON Polygon or MultiPolygon for the rural reference area.

    Returns
    -------
    dict
        ``urban_mean_celsius``, ``rural_mean_celsius``,
        ``uhi_anomaly_celsius``, ``secap_statement``.
    """
    _init_ee()

    # ------------------------------------------------------------------
    # Determine date range: previous-year summer (Jun 1 – Aug 31)
    # ------------------------------------------------------------------
    current_year = datetime.utcnow().year
    prev_year = current_year - 1
    start = f"{prev_year}-06-01"
    end = f"{prev_year}-08-31"
    logger.info("Querying Landsat LST for %s to %s", start, end)

    # ------------------------------------------------------------------
    # Build Earth Engine objects
    # ------------------------------------------------------------------
    urban_geom = _geojson_to_ee_polygon(urban_core_geojson)
    rural_geom = _geojson_to_ee_polygon(rural_reference_geojson)

    # Merge both geometries to define the combined area of interest
    aoi = urban_geom.union(rural_geom)

    # Landsat-8 & Landsat-9 Collection 2 Tier 1 Surface Temperature
    landsat8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
    landsat9 = ee.ImageCollection("LANDSAT/LC09/C02/T1_L2")

    # Merge both missions
    merged = landsat8.merge(landsat9)

    # Date & spatial filter
    filtered = (
        merged.filterDate(start, end)
        .filterBounds(aoi)
    )

    # Cloud-mask → LST conversion pipeline
    processed = filtered.map(_mask_landsat_sr).map(_lst_to_celsius)

    # ------------------------------------------------------------------
    # Compute means
    # ------------------------------------------------------------------
    urban_mean = _compute_mean_lst(processed, urban_geom)
    rural_mean = _compute_mean_lst(processed, rural_geom)
    uhi_anomaly = round(urban_mean - rural_mean, 1)

    # ------------------------------------------------------------------
    # SECAP compliance string (Hungarian)
    # ------------------------------------------------------------------
    sign = "+" if uhi_anomaly >= 0 else ""
    secap_statement = (
        f"A belváros hőmérsékleti anomáliája {sign}{uhi_anomaly:.1f}°C "
        f"a külterületekhez képest."
    )

    return {
        "urban_mean_celsius": round(urban_mean, 2),
        "rural_mean_celsius": round(rural_mean, 2),
        "uhi_anomaly_celsius": uhi_anomaly,
        "secap_statement": secap_statement,
    }
