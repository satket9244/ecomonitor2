import React from 'react';
import './dashboard.css';
import { WeatherPanel } from './weather.jsx';
import { GardonyDashboardMap } from './terkep.jsx';
import { WaterQualityPanel } from './waterquality.jsx';
import { AirQualityPanel } from './airquality.jsx';
import { LatestReportPanel } from './reports.jsx';

export function GardonyDashboard() {
    return (
        <div className="dashboard-container">

            {/* FEJLÉC */}
            <div className="dashboard-card header">
                <div className="card-title">⚙ GÁRDONY KÖRNYEZETI DASHBOARD - Dátum/Idő | Tó-Egészség Index: 85% | Levegő: Kiváló</div>
                <div className="card-subtitle">Fő KPI mutatók egy pillantásra</div>
            </div>

            {/* METEOROLÓGIA */}
            <div className="dashboard-card meteo">
                <WeatherPanel />
            </div>

            {/* TÉRKÉP */}
            <div className="dashboard-card map" style={{ padding: 0, overflow: 'hidden' }}>
                <GardonyDashboardMap />
            </div>

            {/* LEGUTOLSÓ BEJELENTÉS (Hulladék helyett ideiglenesen) */}
            <div className="dashboard-card hulladek">
                <div className="card-title" style={{ fontSize: '1rem', marginBottom: '15px' }}>🗣️ UTOLSÓ BEJELENTÉS</div>
                <LatestReportPanel />
            </div>

            {/* VÍZMINŐSÉG TRENDEK */}
            <div className="dashboard-card trendek">
                <WaterQualityPanel />
            </div>

            {/* LEVEGŐMINŐSÉG */}
            <div className="dashboard-card levego">
                <AirQualityPanel />
            </div>

            {/* AI RIASZTÁSOK */}
            <div className="dashboard-card ai">
                <div className="card-title">⚠️ AI RIASZTÁSOK & LOGOK</div>
                <div className="card-subtitle">Szöveges anomáliák:<br />Várható oxigénszint esés<br />(AI Anomália Detektor)</div>
            </div>

        </div>
    );
}