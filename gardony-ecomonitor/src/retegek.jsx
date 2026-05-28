import React from 'react';
import { MapContainer, TileLayer, WMSTileLayer, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export function GardonyMap() {
    // Gárdony pontos koordinátái
    const gardonyPosition = [47.198, 18.618];

    // A te személyes Copernicus WMS linked!
    const copernicusWmsUrl = "https://sh.dataspace.copernicus.eu/ogc/wms/5d044f7a-d7a1-4fb2-aeef-c5b6181e121c";

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
                            layers="LST_HOTERKEP"
                            format="image/png"
                            transparent={true}
                            maxcc={20}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Beépítettség (NDBI)">
                        <WMSTileLayer
                            url={copernicusWmsUrl}
                            layers="NDBI_BEEPITETTSEG"
                            format="image/png"
                            transparent={true}
                            maxcc={20}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay checked name="Zöldterület (NDVI)">
                        <WMSTileLayer
                            url={copernicusWmsUrl}
                            layers="NDVI_ZOLDTERULET"
                            format="image/png"
                            transparent={true}
                            maxcc={20}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Légszennyezettség (NO₂)">
                        <WMSTileLayer
                            url={copernicusWmsUrl}
                            layers="NO2_LEGSZENNYEZES"
                            format="image/png"
                            transparent={true}
                            maxcc={20}
                        />
                    </LayersControl.Overlay>

                </LayersControl>
            </MapContainer>
        </div>
    );
}