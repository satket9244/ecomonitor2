"""
Pydantic schemas for the UHI endpoint.
"""

from __future__ import annotations

from typing import Any, Dict, List

from pydantic import BaseModel, Field, model_validator


class GeoJSONPolygon(BaseModel):
    """A minimal GeoJSON Polygon / MultiPolygon validator."""

    type: str = Field(..., pattern=r"^(Polygon|MultiPolygon)$")
    coordinates: List[Any] = Field(
        ...,
        description="GeoJSON coordinates array (Polygon or MultiPolygon)",
    )

    @model_validator(mode="after")
    def _validate_coords(self) -> "GeoJSONPolygon":
        if self.type == "Polygon":
            if not self.coordinates or not isinstance(self.coordinates[0], list):
                raise ValueError("Polygon coordinates must be a list of linear rings")
        elif self.type == "MultiPolygon":
            if not self.coordinates or not isinstance(self.coordinates[0], list):
                raise ValueError(
                    "MultiPolygon coordinates must be a list of Polygon coordinate arrays"
                )
        return self


class UHIRequest(BaseModel):
    """Request body for the Urban Heat Island intensity calculation."""

    urban_core_polygon: GeoJSONPolygon = Field(
        ...,
        description="GeoJSON Polygon/MultiPolygon delineating the urban core area",
    )
    rural_reference_polygon: GeoJSONPolygon = Field(
        ...,
        description="GeoJSON Polygon/MultiPolygon delineating the rural reference area",
    )


class UHIResponse(BaseModel):
    """Response body for the Urban Heat Island intensity calculation."""

    urban_mean_celsius: float = Field(
        ...,
        description="Mean land surface temperature (°C) over the urban core, "
        "averaged across all cloud-free Landsat-8/9 images for the previous "
        "summer season (Jun–Aug).",
    )
    rural_mean_celsius: float = Field(
        ...,
        description="Mean land surface temperature (°C) over the rural reference, "
        "averaged across the same image set.",
    )
    uhi_anomaly_celsius: float = Field(
        ...,
        description="Urban Heat Island intensity: urban_mean minus rural_mean (°C).",
    )
    secap_statement: str = Field(
        ...,
        description="Pre-formatted SECAP compliance statement in Hungarian.",
    )
