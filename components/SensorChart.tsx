'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartDataPoint } from '@/lib/types';

interface SensorChartProps {
  data: ChartDataPoint[];
  timeRange: '24h' | '7d' | '30d';
  onTimeRangeChange: (range: '24h' | '7d' | '30d') => void;
}

export default function SensorChart({ data, timeRange, onTimeRangeChange }: SensorChartProps) {
  const formattedData = data.map((point) => ({
    ...point,
    time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date(point.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
  }));

  const timeRanges = [
    { key: '24h', label: '24 Hours' },
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Sensor History</h3>
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <button
              key={range.key}
              onClick={() => onTimeRangeChange(range.key)}
              className={`
                px-3 py-1 rounded-lg text-sm font-medium transition-all
                ${timeRange === range.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }
              `}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey={timeRange === '24h' ? 'time' : 'date'}
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend wrapperStyle={{ color: '#fff' }} />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="Temperature (°C)"
              animationDuration={1000}
            />
            <Line
              type="monotone"
              dataKey="humidity"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Humidity (%)"
              animationDuration={1000}
            />
            <Line
              type="monotone"
              dataKey="gas_analog"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              name="Gas Level"
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}