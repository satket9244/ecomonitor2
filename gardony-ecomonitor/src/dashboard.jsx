import React, { useState } from 'react';
import './dashboard.css';
import { WeatherPanel } from './weather.jsx';
import { GardonyDashboardMap } from './terkep.jsx';
import { WaterQualityPanel } from './waterquality.jsx';
import { AirQualityPanel } from './airquality.jsx';
import { LatestReportPanel } from './reports.jsx';

// Spectral layer definitions with descriptions (shown only when ON)
const SPECTRAL_LAYERS = [
    {
        id: 'ndti',
        label: 'NDTI — Turbidity',
        description: 'Normalized Difference Turbidity Index. High values (red) indicate suspended sediments or algal matter reducing water clarity — a key early indicator of ecological stress.',
        defaultOn: true,
    },
    {
        id: 'ndci',
        label: 'NDCI — Chlorophyll',
        description: 'Normalized Difference Chlorophyll Index. Reveals algae bloom density. Elevated chlorophyll signals potential eutrophication and oxygen depletion risk for Lake Velence.',
        defaultOn: false,
    },
    {
        id: 'lst',
        label: 'LST — Surface Temp',
        description: 'Land Surface Temperature derived from thermal infrared. Hotspots above 32°C near the shoreline may indicate urban heat runoff or industrial discharge anomalies.',
        defaultOn: true,
    },
    {
        id: 'mndwi',
        label: 'MNDWI — Water Index',
        description: 'Modified Normalized Difference Water Index. Precisely delineates the water body boundary. Useful for tracking seasonal water level fluctuations and flood-risk zones.',
        defaultOn: false,
    },
    {
        id: 'ndmi',
        label: 'NDMI — Moisture',
        description: 'Normalized Difference Moisture Index. Maps vegetation water stress in surrounding agricultural and wetland zones. Low values indicate drought conditions or soil degradation.',
        defaultOn: false,
    },
];

// Nav items
const NAV_ITEMS = [
    { id: 'audit',     icon: 'fact_check',    label: 'Environmental Audit'  },
    { id: 'risk',      icon: 'gpp_maybe',     label: 'Risk Mitigation'      },
    { id: 'asset',     icon: 'satellite_alt', label: 'Asset Tracking'       },
    { id: 'reporting', icon: 'description',   label: 'Regulatory Reporting' },
];

// Bar chart data (historical variance visualization)
const BAR_DATA = [
    { height: 60, anomaly: false },
    { height: 55, anomaly: false },
    { height: 70, anomaly: false },
    { height: 85, anomaly: false },
    { height: 65, anomaly: false },
    { height: 90, anomaly: false },
    { height: 45, anomaly: false },
    { height: 75, anomaly: false },
    { height: 95, anomaly: true  },
    { height: 60, anomaly: false },
];

export function GardonyDashboard() {
    const [activeNav, setActiveNav] = useState('audit');
    const [toggles, setToggles] = useState(
        SPECTRAL_LAYERS.reduce((acc, l) => ({ ...acc, [l.id]: l.defaultOn }), {})
    );

    const handleToggle = (id) => {
        setToggles(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="metropol-shell">

            {/* ══ LEFT SIDEBAR ══════════════════════════════════════════════ */}
            <aside className="sidebar-left">

                {/* Brand only — search removed */}
                <div className="sidebar-header" style={{ paddingBottom: '20px' }}>
                    <div className="brand-logo">
                        <span className="material-symbols-outlined">shield_with_heart</span>
                        <span className="brand-name">METROPOL-IX</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <div className="nav-section">
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                className={`nav-btn${activeNav === item.id ? ' active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Spectral Layer Toggles — control the map */}
                    <div className="spectral-section">
                        <div className="spectral-section-title">Map Layers</div>
                        <div className="spectral-toggle-list">
                            {SPECTRAL_LAYERS.map(layer => {
                                const isOn = toggles[layer.id];
                                return (
                                    <div className="spectral-toggle-item" key={layer.id}>
                                        <div className="spectral-toggle-row">
                                            <span className={`spectral-toggle-label${isOn ? ' active' : ''}`}>
                                                {layer.label}
                                            </span>
                                            <div
                                                className={`toggle-switch${isOn ? ' on' : ''}`}
                                                onClick={() => handleToggle(layer.id)}
                                                role="switch"
                                                aria-checked={isOn}
                                                aria-label={layer.label}
                                            >
                                                <div className="toggle-knob" />
                                            </div>
                                        </div>
                                        {/* Description — only visible when toggle is ON */}
                                        {isOn && (
                                            <div className="spectral-toggle-desc">
                                                {layer.description}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                {/* Footer — Export only, no user info */}
                <div className="sidebar-footer">
                    <button className="export-btn">EXPORT PDF AUDIT</button>
                </div>
            </aside>

            {/* ══ MAP WORKSPACE ════════════════════════════════════════════ */}
            <main className="map-workspace">

                {/* Map — activeLayers prop controls which WMS layers render */}
                <div className="map-container">
                    <GardonyDashboardMap activeLayers={toggles} />
                </div>

                {/* Visual overlays */}
                <div className="scanline-overlay" aria-hidden="true">
                    <div className="scanline" />
                </div>
                <div className="vignette-frame" aria-hidden="true" />

                {/* Legends — only shown if corresponding layer is ON */}
                <div className="map-legends">
                    {toggles.ndci && (
                        <div className="legend-card">
                            <div className="legend-title algae">NDCI Index (Algae)</div>
                            <div className="legend-bar-algae" />
                            <div className="legend-range">
                                <span>Low (0.1)</span>
                                <span>High (0.8)</span>
                            </div>
                        </div>
                    )}
                    {toggles.lst && (
                        <div className="legend-card">
                            <div className="legend-title thermal">LST (Thermal)</div>
                            <div className="legend-bar-thermal" />
                            <div className="legend-range">
                                <span>14°C</span>
                                <span>38°C</span>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ══ RIGHT ANALYTICS SIDEBAR ══════════════════════════════════ */}
            <aside className="sidebar-right">

                {/* Header */}
                <div className="analytics-header">
                    <div className="analytics-title">Risk Analytics</div>
                    <div className="analytics-subtitle">Real-time Anomaly Detection</div>
                </div>

                <div className="analytics-body">

                    {/* Historical Variance Chart */}
                    <div className="variance-section">
                        <div className="variance-header">
                            <span className="variance-label">Historical Variance</span>
                            <span className="variance-delta">+12.4% vs AUG</span>
                        </div>
                        <div className="bar-chart-container" role="img" aria-label="Historical variance bar chart">
                            {BAR_DATA.map((bar, i) => (
                                <div
                                    key={i}
                                    className={`bar-item${bar.anomaly ? ' anomaly' : ''}`}
                                    style={{ height: `${bar.height}%` }}
                                >
                                    {bar.anomaly && <span className="bar-anomaly-label">ANOMALY</span>}
                                </div>
                            ))}
                        </div>
                        <div className="bar-chart-axis">
                            <span>Jan 23</span>
                            <span>Current</span>
                        </div>
                    </div>

                    {/* Early Warning System */}
                    <div className="warning-section">
                        <div className="warning-header">
                            <span className="material-symbols-outlined">radar</span>
                            <span className="warning-title">Early Warning System</span>
                        </div>
                        <div className="alert-list">
                            <div className="alert-item critical">
                                <div className="alert-row">
                                    <span className="alert-code critical">CRITICAL_THERMAL_SPIKE</span>
                                    <span className="alert-time">14:42</span>
                                </div>
                                <p className="alert-desc">Detected 4.2°C surface temperature anomaly in Sector-B Coastal region.</p>
                            </div>
                            <div className="alert-item warning">
                                <div className="alert-row">
                                    <span className="alert-code warning">ALGAE_CONCENTRATION_INCREASE</span>
                                    <span className="alert-time">11:05</span>
                                </div>
                                <p className="alert-desc">NDCI index trending upward (+0.15) near Gárdony pier facilities.</p>
                            </div>
                            <div className="alert-item info">
                                <div className="alert-row">
                                    <span className="alert-code info">SYSTEM_CALIBRATION</span>
                                    <span className="alert-time">09:21</span>
                                </div>
                                <p className="alert-desc">Sentinel-2B orbital drift correction completed successfully.</p>
                            </div>
                        </div>
                    </div>

                    {/* Live Sensor Data */}
                    <div className="live-data-section">
                        <div className="live-data-title">Live Sensor Feeds</div>
                        <WeatherPanel />
                    </div>

                    {/* Water + Air Quality */}
                    <div style={{ padding: '0 20px 16px', borderTop: '1px solid rgba(59,73,75,0.2)', paddingTop: '14px' }}>
                        <WaterQualityPanel />
                    </div>
                    <div style={{ padding: '0 20px 16px', borderTop: '1px solid rgba(59,73,75,0.2)', paddingTop: '14px' }}>
                        <AirQualityPanel />
                    </div>

                    {/* Latest Citizen Report */}
                    <div className="latest-report">
                        <div className="latest-report-title">Latest Citizen Report</div>
                        <LatestReportPanel />
                    </div>
                </div>

                {/* Field Protocols */}
                <div className="field-protocols">
                    <div className="field-protocols-title">Field Protocols</div>
                    <div className="protocol-btns">
                        <button className="protocol-btn primary-action" id="btn-dispatch-team">DISPATCH TEAM</button>
                        <button className="protocol-btn secondary-action" id="btn-publish-notice">PUBLISH NOTICE</button>
                    </div>
                    <div className="status-row">
                        <div className="status-indicator">
                            <div className="status-dot" />
                            <span className="status-text">SYS_STABLE // NO_LEGAL_RISK</span>
                        </div>
                        <span className="version-text">V4.2.0</span>
                    </div>
                </div>
            </aside>

            {/* ══ COORDINATE HUD ════════════════════════════════════════════ */}
            <div className="coord-hud" aria-label="Current coordinates">
                <span className="coord-item primary">COORD: 47.2183° N, 18.6276° E</span>
                <div className="coord-sep" />
                <span className="coord-item secondary">ALT: 104.2m</span>
                <div className="coord-sep" />
                <span className="coord-item secondary">ELEV: 7.2m</span>
            </div>

        </div>
    );
}