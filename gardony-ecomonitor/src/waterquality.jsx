import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aamdkhjfmrtyrpminbah.supabase.co';
const supabaseKey = 'sb_publishable_S4hByAurZQclluthyygTZA_p4vtgbHm';
const supabase = createClient(supabaseUrl, supabaseKey);

export function WaterQualityPanel() {
    const [waterData, setWaterData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            // FONTOS: Ide írd be a Supabase táblád PONTOS nevét a 'viz_adatok' helyett!
            const { data, error } = await supabase
                .from('water_quality_measurements')
                .select('*')
                .order('created_at', { ascending: false }) // Ha nálad nem created_at a dátum oszlop, akkor írd át!
                .limit(5); // Bekérjük az utolsó 5 napi adatot a trendhez

            if (!error && data) {
                setWaterData(data);
            } else if (error) {
                console.error("Hiba a vízadatok betöltésekor:", error);
            }
        };
        fetchData();
    }, []);

    if (!Array.isArray(waterData) || waterData.length === 0 || !waterData[0]) {
        return <div>Vízszint adatok betöltése (vagy a táblanév nem egyezik)...</div>;
    }

    const latest = waterData[0];

    // Biztonságos dátum formázó (ha érvénytelen a dátum, ne fagyjon ki)
    const safeFormatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return String(dateString).substring(0, 10);
            return d.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' });
        } catch (e) {
            return '-';
        }
    };

    // Biztonságos érték megjelenítő (ha véletlenül objektum vagy tömb az adat, ne omoljon össze a React)
    const safeRender = (val) => {
        if (val === null || val === undefined) return '--';
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
    };

    return (
        <div style={{ textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>🌊 VÍZSZINT & HŐMÉRSÉKLET</h2>

                {/* Itt is át kell írnod a .vizszint és .vizhomerseklet részt a te oszlopaid nevére! */}
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{safeRender(latest.water_level_cm)} cm</div>
                <div style={{ marginTop: '5px', fontSize: '1.9rem', opacity: 0.9 }}>
                    Vízhőmérséklet: {safeRender(latest.water_temp_c)} °C
                </div>
            </div>

            {/* Kistáblázat az előző napok adataival (Mini-trend) */}
            {waterData.length > 1 && (
                <div style={{ marginTop: 'auto', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '8px' }}>
                    <div style={{ marginBottom: '4px', opacity: 0.7, textTransform: 'uppercase', fontSize: '0.75rem' }}>Előző napok trendje:</div>
                    {waterData.slice(1).map((row, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8, padding: '2px 0' }}>
                            <span>{safeFormatDate(row.created_at)}</span>
                            <span>{safeRender(row.water_level_cm)} cm | {safeRender(row.water_temp_c)}°C</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
