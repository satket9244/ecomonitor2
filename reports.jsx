import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aamdkhjfmrtyrpminbah.supabase.co';
const supabaseKey = 'sb_publishable_S4hByAurZQclluthyygTZA_p4vtgbHm';
const supabase = createClient(supabaseUrl, supabaseKey);

export function LatestReportPanel() {
    const [report, setReport] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            // Megjegyzés: A térképnél 'citizen_reports' néven hivatkoztál a táblára, így most azt használom.
            // Ha a pontos neve 'citizen_report' (s nélkül), akkor azt itt írd át!
            const { data, error } = await supabase
                .from('citizen_reports')
                .select('description, image_url, created_at')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!error && data) {
                setReport(data);
            } else if (error) {
                console.error("Hiba a bejelentés betöltésekor:", error);
            }
        };
        fetchReport();
    }, []);

    if (!report) return <div>Még nincs bejelentés (vagy töltődik...)</div>;

    return (
        <div style={{ textAlign: 'left', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* Leírás szövege (ha túl hosszú, 4 sor után levágjuk, hogy ne lógjon ki) */}
            <p style={{
                fontStyle: 'italic',
                fontSize: '0.9rem',
                marginBottom: '10px',
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: '1.4'
            }}>
                "{report.description}"
            </p>

            {/* Csatolt kép (ha van) */}
            {report.image_url && (
                <div style={{ flex: 1, minHeight: 0, marginTop: 'auto' }}>
                    <img
                        src={report.image_url}
                        alt="Bejelentés fotója"
                        style={{
                            width: '100%',
                            height: '100%',
                            maxHeight: '140px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                    />
                </div>
            )}

            {/* Dátum a sarokban */}
            {report.created_at && (
                <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '8px', textAlign: 'right' }}>
                    {new Date(report.created_at).toLocaleString('hu-HU', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                </div>
            )}

        </div>
    );
}
