import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aamdkhjfmrtyrpminbah.supabase.co';
const supabaseKey = 'sb_publishable_S4hByAurZQclluthyygTZA_p4vtgbHm';
const supabase = createClient(supabaseUrl, supabaseKey);

export function AirQualityPanel() {
    const [airData, setAirData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from('air_quality')
                .select('*')
                .order('created_at', { ascending: false }) // Ha a dátum oszlopod neve más (pl. timestamp), írd át!
                .limit(5);

            if (!error && data) {
                setAirData(data);
            } else if (error) {
                console.error("Hiba a levegőadatok betöltésekor:", error);
            }
        };
        fetchData();
    }, []);

    if (airData.length === 0) return <div>Levegőminőség betöltése...</div>;

    const latest = airData[0];

    // AQI (Air Quality Index) fordítás és színezés (OpenWeatherMap 1-5 skála alapján)
    let aqiColor = "#ffffff";
    let aqiText = "Ismeretlen";
    switch (latest.aqi) {
        case 1: aqiColor = "#4ade80"; aqiText = "Kiváló"; break;     // Zöld
        case 2: aqiColor = "#a3e635"; aqiText = "Jó"; break;         // Világoszöld
        case 3: aqiColor = "#facc15"; aqiText = "Közepes"; break;    // Sárga
        case 4: aqiColor = "#f87171"; aqiText = "Rossz"; break;      // Piros
        case 5: aqiColor = "#b91c1c"; aqiText = "Veszélyes"; break;  // Sötétpiros
        default: aqiText = String(latest.aqi);
    }

    return (
        <div style={{ textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>💨 LEVEGŐMINŐSÉG</h2>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: aqiColor }}>AQI: {latest.aqi}</div>
                    <div style={{ fontSize: '1.2rem', opacity: 0.9, color: aqiColor }}>({aqiText})</div>
                </div>

                <div style={{ marginTop: '10px', fontSize: '0.9rem', opacity: 0.9, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div><strong>PM2.5:</strong> {latest.pm2_5} µg/m³</div>
                    <div><strong>PM10:</strong> {latest.pm10} µg/m³</div>
                    <div><strong>O3:</strong> {latest.o3} µg/m³</div>
                    <div><strong>NO2:</strong> {latest.no2} µg/m³</div>
                </div>
            </div>

            {/* Kistáblázat az előző napok adataival (Mini-trend PM2.5 és PM10 alapján) */}
            {airData.length > 1 && (
                <div style={{ marginTop: 'auto', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '8px' }}>
                    <div style={{ marginBottom: '4px', opacity: 0.7, textTransform: 'uppercase', fontSize: '0.75rem' }}>Előző napok trendje (PM2.5 / PM10):</div>
                    {airData.slice(1).map((row, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8, padding: '2px 0' }}>
                            <span>{row.created_at ? new Date(row.created_at).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }) : `-${i + 1} nap`}</span>
                            <span>{row.pm2_5} / {row.pm10} µg/m³</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
