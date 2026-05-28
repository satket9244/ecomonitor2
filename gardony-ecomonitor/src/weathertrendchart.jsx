import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const supabaseUrl = 'https://aamdkhjfmrtyrpminbah.supabase.co';
const supabaseKey = 'sb_publishable_S4hByAurZQclluthyygTZA_p4vtgbHm';
const supabase = createClient(supabaseUrl, supabaseKey);

export function WeatherTrendChart() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      // Lekérjük az elmúlt napok időjárás és levegő adatait
      const { data, error } = await supabase
        .from('air_quality')
        .select('created_at, pm2_5, aqi') // Ha van külön hőmérséklet oszlop, ide tedd be: 'temp'
        .order('created_at', { ascending: false }) // Csökkenő sorrend a legfrissebbekért
        .limit(7);

      if (data && !error) {
        // Kronológiai sorrend visszaállítása (balról jobbra növekvő idő)
        const sortedData = data.reverse();
        
        const formattedData = sortedData.map(item => {
          const date = new Date(item.created_at);
          return {
            ...item,
            timeStr: `${date.toLocaleString('hu-HU', { month: 'short', day: 'numeric' })} ${date.getHours()}:00`,
            // Példa érték a hőmérsékletre (ha nincs még a táblában, akkor csinálunk egy dummy-t a teszthez)
            temp: item.temp || (12 + Math.random() * 5).toFixed(1) 
          };
        });
        setChartData(formattedData);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{ width: '100%', height: '300px', marginTop: '20px' }}>
      <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#333' }}>Elmúlt napok trendje:</h4>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          
          {/* X tengely: Dátum */}
          <XAxis dataKey="timeStr" tick={{ fill: '#333', fontSize: 11 }} />
          
          {/* Bal Y tengely: Hőmérséklet */}
          <YAxis yAxisId="left" tick={{ fill: '#333', fontSize: 11 }} />
          
          {/* Jobb Y tengely: Levegő minőség (PM2.5) */}
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#333', fontSize: 11 }} />
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', color: '#000' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#333' }} />
          
          {/* A Hőmérséklet vonala */}
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="temp" 
            name="Hőmérséklet (°C)" 
            stroke="#2c3e50" 
            strokeWidth={3} 
            dot={{ r: 4 }} 
          />
          
          {/* A Levegőminőség vonala */}
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="pm2_5" 
            name="Szálló por (PM2.5)" 
            stroke="#e74c3c" 
            strokeWidth={2} 
          />
          
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
