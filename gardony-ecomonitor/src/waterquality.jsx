import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aamdkhjfmrtyrpminbah.supabase.co';
const supabaseKey = 'sb_publishable_S4hByAurZQclluthyygTZA_p4vtgbHm';
const supabase = createClient(supabaseUrl, supabaseKey);

export function WaterQualityPanel() {
    const [waterData, setWaterData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from('water_quality_measurements')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (!error && data) {
                setWaterData(data);
            } else if (error) {
                console.error("Hiba a vízadatok betöltésekor:", error);
            }
        };
        fetchData();
    }, []);

    if (!Array.isArray(waterData) || waterData.length === 0 || !waterData[0]) {
        return <div className="loading-state">Loading water quality data...</div>;
    }

    const latest = waterData[0];

    const safeRender = (val) => {
        if (val === null || val === undefined) return '--';
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
    };

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
                Water Quality
            </div>
            <div className="live-data-grid">
                <div className="live-data-card">
                    <div className="live-data-value water">{safeRender(latest.water_level_cm)}</div>
                    <div className="live-data-unit">Level (cm)</div>
                </div>
                <div className="live-data-card">
                    <div className="live-data-value water">{safeRender(latest.water_temp_c)}°</div>
                    <div className="live-data-unit">Temp °C</div>
                </div>
            </div>
            {/* Mini trend */}
            {waterData.length > 1 && (
                <div style={{
                    marginTop: '8px',
                    borderTop: '1px solid rgba(59,73,75,0.2)',
                    paddingTop: '6px',
                }}>
                    {waterData.slice(1, 4).map((row, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '9px',
                            color: 'var(--on-surface-variant)',
                            opacity: 0.6,
                            padding: '2px 0',
                        }}>
                            <span>{row.created_at ? new Date(row.created_at).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }) : `−${i + 1}d`}</span>
                            <span>{safeRender(row.water_level_cm)}cm | {safeRender(row.water_temp_c)}°C</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
