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
                .order('created_at', { ascending: false })
                .limit(5);

            if (!error && data) {
                setAirData(data);
            } else if (error) {
                console.error("Hiba a levegőadatok betöltésekor:", error);
            }
        };
        fetchData();
    }, []);

    if (airData.length === 0) {
        return <div className="loading-state">Loading air quality data...</div>;
    }

    const latest = airData[0];

    // AQI color mapping
    const aqiColors = {
        1: '#5bffa1',
        2: '#a3e635',
        3: '#facc15',
        4: '#f87171',
        5: '#b91c1c',
    };
    const aqiLabels = { 1: 'Excellent', 2: 'Good', 3: 'Moderate', 4: 'Poor', 5: 'Hazardous' };
    const aqiColor = aqiColors[latest.aqi] || 'var(--on-surface)';
    const aqiText  = aqiLabels[latest.aqi]  || String(latest.aqi);

    return (
        <div>
            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: 'var(--on-surface-variant)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '10px',
            }}>
                Air Quality
            </div>
            <div className="live-data-grid">
                <div className="live-data-card">
                    <div className="live-data-value aqi" style={{ color: aqiColor }}>AQI {latest.aqi}</div>
                    <div className="live-data-unit" style={{ color: aqiColor, opacity: 0.7 }}>{aqiText}</div>
                </div>
                <div className="live-data-card">
                    <div className="live-data-value" style={{ fontSize: '14px', color: 'var(--primary-fixed)' }}>
                        {latest.pm2_5} <span style={{ fontSize: '10px' }}>µg</span>
                    </div>
                    <div className="live-data-unit">PM2.5</div>
                </div>
                <div className="live-data-card">
                    <div className="live-data-value" style={{ fontSize: '14px', color: 'var(--primary-fixed)' }}>
                        {latest.pm10} <span style={{ fontSize: '10px' }}>µg</span>
                    </div>
                    <div className="live-data-unit">PM10</div>
                </div>
                <div className="live-data-card">
                    <div className="live-data-value" style={{ fontSize: '14px', color: 'var(--tertiary-fixed-dim)' }}>
                        {latest.no2} <span style={{ fontSize: '10px' }}>µg</span>
                    </div>
                    <div className="live-data-unit">NO₂</div>
                </div>
            </div>
        </div>
    );
}
