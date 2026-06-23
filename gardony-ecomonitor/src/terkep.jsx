import React, { useEffect, useState, useContext, useRef } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup, FeatureGroup, useMap } from 'react-leaflet';
import { createClient } from '@supabase/supabase-js';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import 'leaflet-draw';
import { DrawingContext } from './DrawingContext';

const supabaseUrl = 'https://aamdkhjfmrtyrpminbah.supabase.co';
const supabaseKey = 'sb_publishable_S4hByAurZQclluthyygTZA_p4vtgbHm';
const supabase = createClient(supabaseUrl, supabaseKey);

// WMS endpoints — unchanged from original
const WMS_NDTI  = 'https://sh.dataspace.copernicus.eu/ogc/wms/e28f1a16-eeae-472b-b095-39a50537ba6c';
const WMS_NDCI  = 'https://sh.dataspace.copernicus.eu/ogc/wms/841fca04-e199-424a-b6f7-86d4aa23b911';
const WMS_MAIN  = 'https://sh.dataspace.copernicus.eu/ogc/wms/720a3d1b-dab6-4b26-aa51-fb8b7eb52d28';

function DrawingController({ drawingMode, onDrawCreate, featureGroupRef }) {
    const map = useMap();

    useEffect(() => {
        const drawnItems = L.featureGroup();
        map.addLayer(drawnItems);
        featureGroupRef.current = drawnItems;

        const drawControl = new L.Control.Draw({
            position: 'topleft',
            draw: {
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
                polygon: drawingMode !== null,
            },
        });

        if (drawingMode !== null) {
            map.addControl(drawControl);
        } else {
            map.removeControl(drawControl);
        }

        const handleDrawCreate = (e) => {
            drawnItems.addLayer(e.layer);
            onDrawCreate(e);
        };

        map.on(L.Draw.Event.CREATED, handleDrawCreate);

        return () => {
            map.off(L.Draw.Event.CREATED, handleDrawCreate);
            if (drawingMode === null) {
                map.removeLayer(drawnItems);
            }
        };
    }, [map, drawingMode, onDrawCreate, featureGroupRef]);

    return null;
}

/**
 * GardonyDashboardMap
 * @param {object} activeLayers - { ndti, ndci, lst, mndwi, ndmi } booleans from sidebar toggles
 */
export function GardonyDashboardMap({ activeLayers = {} }) {
    const [reports, setReports] = useState([]);
    const [drawingMode, setDrawingMode] = useState(null); // 'downtown' | 'greenspace' | null
    const { setDowntown, setGreenspace } = useContext(DrawingContext);
    const featureGroupRef = useRef();

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

    const handleDrawCreate = (e) => {
        const layer = e.layer;
        const geoJson = layer.toGeoJSON();

        if (drawingMode === 'downtown') {
            setDowntown(geoJson.geometry);
            setDrawingMode(null);
        } else if (drawingMode === 'greenspace') {
            setGreenspace(geoJson.geometry);
            setDrawingMode(null);
        }
    };

    const handleStartDowntown = () => {
        setDrawingMode('downtown');
    };

    const handleStartGreenspace = () => {
        setDrawingMode('greenspace');
    };

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            {/* Drawing mode buttons */}
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '50px',
                zIndex: 1000,
                display: 'flex',
                gap: '8px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                padding: '8px',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}>
                <button
                    onClick={handleStartDowntown}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: drawingMode === 'downtown' ? '#ef4444' : '#f3f4f6',
                        color: drawingMode === 'downtown' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s',
                    }}
                >
                    📍 Select Downtown
                </button>
                <button
                    onClick={handleStartGreenspace}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: drawingMode === 'greenspace' ? '#22c55e' : '#f3f4f6',
                        color: drawingMode === 'greenspace' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s',
                    }}
                >
                    🌿 Select Greenspace
                </button>
            </div>

            <MapContainer
                center={[47.198, 18.618]}
                zoom={13}
                zoomControl={false}
                style={{ height: '100%', width: '100%' }}
            >
                <DrawingController
                    drawingMode={drawingMode}
                    onDrawCreate={handleDrawCreate}
                    featureGroupRef={featureGroupRef}
                />
                {/* Base tile layer */}
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* NDTI — Turbidity (Sentinel endpoint 1) */}
                {activeLayers.ndti && (
                    <WMSTileLayer
                        key="ndti"
                        url={WMS_NDTI}
                        layers="1_TRUE_COLOR"
                        format="image/png"
                        transparent={true}
                        maxcc={20}
                        opacity={0.6}
                    />
                )}

                {/* NDCI — Chlorophyll / Algae (Sentinel endpoint 2) */}
                {activeLayers.ndci && (
                    <WMSTileLayer
                        key="ndci"
                        url={WMS_NDCI}
                        layers="2_TRUE_COLOR"
                        format="image/png"
                        transparent={true}
                        maxcc={20}
                        opacity={0.6}
                    />
                )}

                {/* LST — Land Surface Temperature */}
                {activeLayers.lst && (
                    <WMSTileLayer
                        key="lst"
                        url={WMS_MAIN}
                        layers="LST"
                        format="image/png"
                        transparent={true}
                        maxcc={20}
                        opacity={0.6}
                    />
                )}

                {/* MNDWI — Water Index */}
                {activeLayers.mndwi && (
                    <WMSTileLayer
                        key="mndwi"
                        url={WMS_MAIN}
                        layers="NDWI"
                        format="image/png"
                        transparent={true}
                        maxcc={20}
                        opacity={0.6}
                    />
                )}

                {/* NDMI — Moisture */}
                {activeLayers.ndmi && (
                    <WMSTileLayer
                        key="ndmi"
                        url={WMS_MAIN}
                        layers="NDMI"
                        format="image/png"
                        transparent={true}
                        maxcc={20}
                        opacity={0.6}
                    />
                )}

                {/* Citizen report markers */}
                {reports.map((report) =>
                    report.lat && report.lng ? (
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
                    ) : null
                )}
            </MapContainer>
        </div>
    );
}