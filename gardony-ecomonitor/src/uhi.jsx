import React, { useState, useCallback } from 'react';

const API_BASE = '/api/v1/uhi';

// Pre-defined polygons for Gárdony municipality
const GARDONY_URBAN_CORE = {
    type: 'Polygon',
    coordinates: [[
        [18.61, 47.195],
        [18.635, 47.195],
        [18.635, 47.21],
        [18.61, 47.21],
        [18.61, 47.195],
    ]],
};

const GARDONY_RURAL_REF = {
    type: 'Polygon',
    coordinates: [[
        [18.55, 47.17],
        [18.59, 47.17],
        [18.59, 47.19],
        [18.55, 47.19],
        [18.55, 47.17],
    ]],
};

export function UHIPanel() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const calculateUHI = useCallback(async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch(`${API_BASE}/intensity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    urban_core_polygon: GARDONY_URBAN_CORE,
                    rural_reference_polygon: GARDONY_RURAL_REF,
                }),
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(errBody.detail || `Server error ${res.status}`);
            }

            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError(err.message || 'Calculation failed');
        } finally {
            setLoading(false);
        }
    }, []);

    // Severity colour based on anomaly
    const severityColor = (anomaly) => {
        if (anomaly === null || anomaly === undefined) return 'var(--on-surface-variant)';
        if (anomaly >= 4) return 'var(--error)';
        if (anomaly >= 2) return '#facc15';
        return 'var(--secondary-fixed)';
    };

    return (
        <div className="uhi-section">
            <div className="uhi-header">
                <span className="material-symbols-outlined" style={{
                    fontSize: '14px',
                    color: 'var(--primary-container)',
                    fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
                }}>
                    thermostat
                </span>
                <span className="uhi-title">UHI Intensity</span>
            </div>

            {/* Calculate button */}
            {!result && !loading && (
                <button
                    className="uhi-calc-btn"
                    onClick={calculateUHI}
                    disabled={loading}
                >
                    CALCULATE UHI
                </button>
            )}

            {/* Loading state */}
            {loading && (
                <div className="uhi-loading">
                    <span className="material-symbols-outlined uhi-spinner">
                        progress_activity
                    </span>
                    <span>Processing Landsat data…</span>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="uhi-error">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        warning
                    </span>
                    <span>{error}</span>
                </div>
            )}

            {/* Result display */}
            {result && (
                <div className="uhi-result">
                    <div className="uhi-anomaly-row">
                        <div
                            className="uhi-anomaly-value"
                            style={{ color: severityColor(result.uhi_anomaly_celsius) }}
                        >
                            {result.uhi_anomaly_celsius >= 0 ? '+' : ''}
                            {result.uhi_anomaly_celsius.toFixed(1)}°C
                        </div>
                        <div className="uhi-anomaly-label">UHI Anomaly</div>
                    </div>

                    <div className="uhi-means-grid">
                        <div className="uhi-mean-card">
                            <div className="uhi-mean-value urban">
                                {result.urban_mean_celsius.toFixed(1)}°C
                            </div>
                            <div className="uhi-mean-label">Urban Core</div>
                        </div>
                        <div className="uhi-mean-divider" />
                        <div className="uhi-mean-card">
                            <div className="uhi-mean-value rural">
                                {result.rural_mean_celsius.toFixed(1)}°C
                            </div>
                            <div className="uhi-mean-label">Rural Ref.</div>
                        </div>
                    </div>

                    {/* SECAP compliance statement */}
                    <div className="uhi-secap">
                        <div className="uhi-secap-badge">SECAP</div>
                        <div className="uhi-secap-text">{result.secap_statement}</div>
                    </div>

                    {/* Recalculate */}
                    <button
                        className="uhi-recalc-btn"
                        onClick={() => { setResult(null); setError(null); }}
                    >
                        RECALCULATE
                    </button>
                </div>
            )}
        </div>
    );
}
