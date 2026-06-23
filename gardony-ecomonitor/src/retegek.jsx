import React from 'react';
import { MapContainer, TileLayer, WMSTileLayer, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export function GardonyMap() {
    // Gárdony pontos koordinátái
    const gardonyPosition = [47.198, 18.618];

    // A te személyes Copernicus WMS linked!
    const copernicusWmsUrl = "https://sh.dataspace.copernicus.eu/ogc/wms/720a3d1b-dab6-4b26-aa51-fb8b7eb52d28";

    return (
        <div style={{ height: '520px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
            <MapContainer
                center={gardonyPosition}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <LayersControl position="topright">

                    {/* 1. Alaptérkép (Utak, Házak) - Mindig alul van */}
                    <LayersControl.BaseLayer checked name="OpenStreetMap">
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>

                    {/* 2. Új Copernicus Műholdas Rétegek */}
                    <LayersControl.Overlay name="Hőtérkép (LST)">
                        <WMSTileLayer
                            url={copernicusWmsUrl}
                            layers="LST"
                            format="image/png"
                            transparent={true}
                            maxcc={20}
                            opacity={0.6}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Beépítettség (NDBI)">
                        <WMSTileLayer
                            url={copernicusWmsUrl}
                            layers="NDBI"
                            format="image/png"
                            transparent={true}
                            maxcc={20}
                            opacity={0.6}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay checked name="Zöldterület (NDVI)">
                        <WMSTileLayer
                            url={copernicusWmsUrl}
                            layers="NDVI"
                            format="image/png"
                            transparent={true}
                            maxcc={20}
                            opacity={0.6}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Növényzet nedvesség (NDMI)">
                        <WMSTileLayer
                            url={copernicusWmsUrl}
                            layers="NDMI"
                            format="image/png"
                            transparent={true}
                            maxcc={20}
                            opacity={0.6}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Víz (NDWI)">
                        <WMSTileLayer
                            url={copernicusWmsUrl}
                            layers="NDWI"
                            format="image/png"
                            transparent={true}
                            maxcc={20}
                            opacity={0.6}
                        />
                    </LayersControl.Overlay>

                </LayersControl>
            </MapContainer>
        </div>
    );
}