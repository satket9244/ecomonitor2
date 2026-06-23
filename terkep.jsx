import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, LayersControl, Marker, Popup } from 'react-leaflet';
import { createClient } from '@supabase/supabase-js';
import 'leaflet/dist/leaflet.css';

const supabaseUrl = 'https://aamdkhjfmrtyrpminbah.supabase.co';
const supabaseKey = 'sb_publishable_S4hByAurZQclluthyygTZA_p4vtgbHm';
const supabase = createClient(supabaseUrl, supabaseKey);

export function GardonyDashboardMap() {
    const [reports, setReports] = useState([]);

    // A megadott műholdas rétegek WMS URL-jei
    const wmsLayer1 = "https://sh.dataspace.copernicus.eu/ogc/wms/e28f1a16-eeae-472b-b095-39a50537ba6c";
    const wmsLayer2 = "https://sh.dataspace.copernicus.eu/ogc/wms/841fca04-e199-424a-b6f7-86d4aa23b911";
    const copernicusWmsUrl = "https://sh.dataspace.copernicus.eu/ogc/wms/720a3d1b-dab6-4b26-aa51-fb8b7eb52d28";

    useEffect(() => {
        async function fetchReports() {
            const { data, error } = await supabase
                .from('citizen_reports')
                .select('*');

            if (!error && data) {
                setReports(data);
            }
        }
        fetchReports();
    }, []);

    return (
        <div style={{ height: '100%', width: '100%', minHeight: '300px' }}>
            <MapContainer center={[47.198, 18.618]} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
                <LayersControl position="topright">

                    <LayersControl.BaseLayer checked name="Utcák (OpenStreetMap)">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    </LayersControl.BaseLayer>

                    <LayersControl.Overlay name="Műholdkép Réteg 1">
                        <WMSTileLayer url={wmsLayer1} layers="Alga1" format="image/png" transparent={true} opacity={0.6} />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Műholdkép Réteg 2">
                        <WMSTileLayer url={wmsLayer2} layers="Alga2" format="image/png" transparent={true} opacity={0.6} />
                    </LayersControl.Overlay>

                    {/* ÚJ MŰHOLDAS RÉTEGEK (Copernicus Service Endpoint: 720a3d1b-dab6-4b26-aa51-fb8b7eb52d28) */}
                    <LayersControl.Overlay name="Hőtérkép (LST)">
                        <WMSTileLayer url={copernicusWmsUrl} layers="LST" format="image/png" transparent={true} maxcc={20} opacity={0.6} />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Beépítettség (NDBI)">
                        <WMSTileLayer url={copernicusWmsUrl} layers="NDBI" format="image/png" transparent={true} maxcc={20} opacity={0.6} />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Zöldterület (NDVI)">
                        <WMSTileLayer url={copernicusWmsUrl} layers="NDVI" format="image/png" transparent={true} maxcc={20} opacity={0.6} />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Növényzet nedvesség (NDMI)">
                        <WMSTileLayer url={copernicusWmsUrl} layers="NDMI" format="image/png" transparent={true} maxcc={20} opacity={0.6} />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Víz (NDWI)">
                        <WMSTileLayer url={copernicusWmsUrl} layers="NDWI" format="image/png" transparent={true} maxcc={20} opacity={0.6} />
                    </LayersControl.Overlay>

                </LayersControl>

                {reports.map((report) => (
                    report.lat && report.lng && (
                        <Marker key={report.id} position={[report.lat, report.lng]}>
                            <Popup>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0' }}>Lakossági Bejelentés</h3>
                                    <p><strong>Cím:</strong> {report.location}</p>
                                    <p><strong>Leírás:</strong> {report.description}</p>
                                    <p><strong>Állapot:</strong> {report.status}</p>
                                    {report.image_url && (
                                        <img
                                            src={report.image_url}
                                            alt="Bejelentés fotója"
                                            style={{ width: '100%', borderRadius: '4px', marginTop: '5px' }}
                                        />
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
}