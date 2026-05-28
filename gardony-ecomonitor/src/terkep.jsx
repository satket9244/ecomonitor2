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
    const copernicusWmsUrl = "https://sh.dataspace.copernicus.eu/ogc/wms/5d044f7a-d7a1-4fb2-aeef-c5b6181e121c";

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

                    <LayersControl.Overlay name="Zavarosság (NDWI)">
                        {/* FONTOS: Ha nem jelenik meg, a layers="1_TRUE_COLOR" részt át kell írnod arra a pontos névre, ahogy a Copernicusban elnevezted (pl. "ALGA1", "SZINEK", "TRUE-COLOR")! */}
                        <WMSTileLayer url={wmsLayer1} layers="1_TRUE_COLOR" format="image/png" transparent={true} maxcc={20} />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Sentinel-2 Algásodási Hőtérkép (NDCI)">
                        {/* FONTOS: Szintén így: layers="NDVI" vagy amilyen néven létrehoztad! */}
                        <WMSTileLayer url={wmsLayer2} layers="2_TRUE_COLOR" format="image/png" transparent={true} maxcc={20} />
                    </LayersControl.Overlay>

                    {/* ÚJ MŰHOLDAS RÉTEGEK (Copernicus Service Endpoint: 5d044f7a-d7a1-4fb2-aeef-c5b6181e121c) */}
                    <LayersControl.Overlay name="Hőtérkép (LST)">
                        <WMSTileLayer url={copernicusWmsUrl} layers="LST_HOTERKEP" format="image/png" transparent={true} maxcc={20} />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Beépítettség (NDBI)">
                        <WMSTileLayer url={copernicusWmsUrl} layers="NDBI_BEEPITETTSEG" format="image/png" transparent={true} maxcc={20} />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Zöldterület (NDVI)">
                        <WMSTileLayer url={copernicusWmsUrl} layers="NDVI_ZOLDTERULET" format="image/png" transparent={true} maxcc={20} />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Légszennyezettség (NO₂)">
                        <WMSTileLayer url={copernicusWmsUrl} layers="NO2_LEGSZENNYEZES" format="image/png" transparent={true} maxcc={20} />
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