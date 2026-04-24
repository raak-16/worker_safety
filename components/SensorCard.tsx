'use client';

import { motion } from 'framer-motion';
import { Thermometer, Droplets, Wind, AlertTriangle } from 'lucide-react';
import { DashboardStats } from '@/lib/types';

interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  icon: 'temperature' | 'humidity' | 'gas';
  threshold?: { min?: number; max?: number };
  isAlert?: boolean;
  index: number;
}

export default function SensorCard({ title, value, unit, icon, threshold, isAlert, index }: SensorCardProps) {
  const safeValue = Number(value);
  const displayValue = Number.isFinite(safeValue) ? safeValue : 0;
  const icons = {
    temperature: Thermometer,
    humidity: Droplets,
    gas: Wind,
  };

  const Icon = icons[icon];
  const outOfRange = threshold && (
    (threshold.max !== undefined && displayValue > threshold.max) ||
    (threshold.min !== undefined && displayValue < threshold.min)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`
        relative overflow-hidden rounded-2xl p-6
        ${isAlert || outOfRange
          ? 'bg-danger-50 border-2 border-danger-500'
          : 'bg-white/10 backdrop-blur-sm border border-white/20'
        }
      `}
    >
      {isAlert && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute top-2 right-2"
        >
          <AlertTriangle className="w-6 h-6 text-danger-500" />
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-4">
        <span className={`text-sm font-medium ${isAlert ? 'text-danger-600' : 'text-gray-300'}`}>
          {title}
        </span>
        <motion.div
          animate={isAlert ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: isAlert ? Infinity : 0 }}
          className={`
            p-2 rounded-full
            ${isAlert ? 'bg-danger-500/20' : 'bg-primary-500/20'}
          `}
        >
          <Icon className={`w-5 h-5 ${isAlert ? 'text-danger-500' : 'text-primary-500'}`} />
        </motion.div>
      </div>

      <div className="flex items-baseline gap-2">
        <motion.span
          key={displayValue}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-3xl font-bold ${isAlert ? 'text-danger-600' : 'text-white'}`}
        >
          {displayValue.toFixed(1)}
        </motion.span>
        <span className={`text-sm ${isAlert ? 'text-danger-500' : 'text-gray-400'}`}>
          {unit}
        </span>
      </div>

      {threshold && (
        <div className="mt-3 text-xs text-gray-400">
          Range: {threshold.min || 0} - {threshold.max || '∞'} {unit}
        </div>
      )}
    </motion.div>
  );
}

interface StatsSummaryProps {
  stats: DashboardStats;
}

export function StatsSummary({ stats }: StatsSummaryProps) {
  const safe = (n: number) => (Number.isFinite(Number(n)) ? Number(n) : 0);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
    >
      <div className="bg-white/5 rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-white">{safe(stats.avgTemp24h).toFixed(1)}°C</div>
        <div className="text-xs text-gray-400">Avg Temp (24h)</div>
      </div>
      <div className="bg-white/5 rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-white">{safe(stats.avgHumidity24h).toFixed(1)}%</div>
        <div className="text-xs text-gray-400">Avg Humidity (24h)</div>
      </div>
      <div className="bg-white/5 rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-white">{safe(stats.avgGas24h).toFixed(0)}</div>
        <div className="text-xs text-gray-400">Avg Gas (24h)</div>
      </div>
      <div className="bg-white/5 rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-white">{stats.readings24h}</div>
        <div className="text-xs text-gray-400">Readings (24h)</div>
      </div>
    </motion.div>
  );
}
