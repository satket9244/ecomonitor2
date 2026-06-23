import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aamdkhjfmrtyrpminbah.supabase.co';
const supabaseKey = 'sb_publishable_S4hByAurZQclluthyygTZA_p4vtgbHm';
const supabase = createClient(supabaseUrl, supabaseKey);

export function LatestReportPanel() {
    const [report, setReport] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
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

    if (!report) return <div className="loading-state">No reports yet...</div>;

    return (
        <div>
            <p className="report-description">
                "{report.description}"
            </p>

            {report.image_url && (
                <img
                    src={report.image_url}
                    alt="Citizen report"
                    className="report-image"
                />
            )}

            {report.created_at && (
                <div className="report-date">
                    {new Date(report.created_at).toLocaleString('hu-HU', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                </div>
            )}
        </div>
    );
}
