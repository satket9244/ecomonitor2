import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { WeatherTrendChart } from './weathertrendchart.jsx';

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
                    console.log('Új időjárás adat érkezett:', payload.new);
                    setCurrentWeather(payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (!currentWeather) return <div>Időjárás adatok betöltése...</div>;

    return (
        <div style={{ textAlign: 'left', width: '100%' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>☁ IDŐJÁRÁS</h2>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{currentWeather.temperature_c}°C</div>
            <div style={{ marginTop: '10px', opacity: 0.9 }}>
                Páratartalom: {currentWeather.humidity_pct}%<br />
                Szélsebesség: {currentWeather.wind_speed_ms} km/h
            </div>
            <WeatherTrendChart />
        </div>
    );
}
