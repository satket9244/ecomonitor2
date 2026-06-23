import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aamdkhjfmrtyrpminbah.supabase.co';
const supabaseKey = 'sb_publishable_S4hByAurZQclluthyygTZA_p4vtgbHm';
const supabase = createClient(supabaseUrl, supabaseKey);

export function WeatherPanel() {
    const [currentWeather, setCurrentWeather] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            const { data } = await supabase
                .from('air_weather_data')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(1)
                .single();
            setCurrentWeather(data);
        };
        fetchInitialData();

        const channel = supabase
            .channel('weather-updates')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'air_weather_data' },
                (payload) => {
                    setCurrentWeather(payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (!currentWeather) {
        return <div className="loading-state">Loading weather data...</div>;
    }

    return (
        <div className="live-data-grid">
            <div className="live-data-card">
                <div className="live-data-value temp">{currentWeather.temperature_c}°</div>
                <div className="live-data-unit">Temperature °C</div>
            </div>
            <div className="live-data-card">
                <div className="live-data-value humidity">{currentWeather.humidity_pct}%</div>
                <div className="live-data-unit">Humidity</div>
            </div>
            <div className="live-data-card" style={{ gridColumn: '1 / -1' }}>
                <div className="live-data-value" style={{ fontSize: '16px', color: 'var(--tertiary-fixed-dim)' }}>
                    {currentWeather.wind_speed_ms} <span style={{ fontSize: '12px' }}>km/h</span>
                </div>
                <div className="live-data-unit">Wind Speed</div>
            </div>
        </div>
    );
}
