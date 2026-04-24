'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, RefreshCw, Zap } from 'lucide-react';
import SensorCard, { StatsSummary } from '@/components/SensorCard';
import AlertPanel from '@/components/AlertPanel';
import SensorChart from '@/components/SensorChart';
import InsightsPanel from '@/components/InsightsPanel';
import StatusBar from '@/components/StatusBar';
import { SensorReading, Alert, DashboardStats, ChartDataPoint, DEFAULT_THRESHOLDS } from '@/lib/types';

export default function Dashboard() {
  const [sensorData, setSensorData] = useState<SensorReading | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [insights, setInsights] = useState<{ message: string; type: string }[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = useCallback(async () => {
    if (!mounted) return;
    
    try {
      setLoading(true);
      
      const [statsRes, alertsRes, chartRes, insightsRes, readingsRes] = await Promise.all([
        fetch('/api/sensors?action=stats'),
        fetch('/api/sensors?action=unacknowledged'),
        fetch(`/api/sensors?action=chart&hours=${timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720}`),
        fetch('/api/sensors?action=insights'),
        fetch('/api/sensors?action=readings&hours=24'),
      ]);

      const [statsData, alertsData, chartData, insightsData, readingsData] = await Promise.all([
        statsRes.json(),
        alertsRes.json(),
        chartRes.json(),
        insightsRes.json(),
        readingsRes.json(),
      ]);

      if (statsData.stats) setStats(statsData.stats);
      if (statsData.stats?.currentTemp !== undefined) {
        setSensorData({
          id: 0,
          temperature: statsData.stats.currentTemp,
          humidity: statsData.stats.currentHumidity,
          gas_analog: statsData.stats.currentGas,
          gas_digital: false,
          is_alert: statsData.stats.alertCount > 0,
          created_at: new Date().toISOString(),
        });
      }
      if (alertsData.alerts) setAlerts(alertsData.alerts);
      if (chartData.chartData) setChartData(chartData.chartData);
      if (insightsData.insights) setInsights(insightsData.insights);
      
      const readings = readingsData.readings || [];
      
      if (readings.length > 0) {
        setConnected(true);
        setLastUpdate(new Date(readings[0]?.created_at).toLocaleTimeString());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange, mounted]);

  useEffect(() => {
    if (!mounted) return;
    fetchData();
    
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData, mounted]);

  const handleAcknowledge = async (alertId: number) => {
    try {
      await fetch(`/api/sensors?action=acknowledge&id=${alertId}`, { method: 'GET' });
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const simulateReading = async () => {
    const temperature = (20 + Math.random() * 15).toFixed(1);
    const humidity = (40 + Math.random() * 30).toFixed(1);
    const gasAnalog = Math.floor(100 + Math.random() * 250);
    const gasDigital = gasAnalog > 300;

    try {
      const res = await fetch('/api/sensors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperature, humidity, gasAnalog, gasDigital }),
      });
      
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error simulating reading:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Shield className="w-10 h-10 text-primary-500" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white">Worker Safety Monitor</h1>
                <p className="text-gray-400 text-sm">Real-time IoT Sensor Dashboard</p>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={simulateReading}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-white transition-colors"
              >
                <Zap className="w-4 h-4" />
                Simulate Reading
              </motion.button>
            </div>
          </div>
        </motion.header>

        <StatusBar 
          connected={connected} 
          lastUpdate={lastUpdate} 
          readingCount={stats?.readings24h || 0} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SensorCard
                title="Temperature"
                value={sensorData?.temperature ?? 0}
                unit="°C"
                icon="temperature"
                threshold={DEFAULT_THRESHOLDS.temperature}
                isAlert={!!(sensorData?.temperature && sensorData.temperature > DEFAULT_THRESHOLDS.temperature.max)}
                index={0}
              />
              <SensorCard
                title="Humidity"
                value={sensorData?.humidity ?? 0}
                unit="%"
                icon="humidity"
                threshold={DEFAULT_THRESHOLDS.humidity}
                isAlert={!!(
                  sensorData?.humidity && 
                  (sensorData.humidity < DEFAULT_THRESHOLDS.humidity.min || 
                   sensorData.humidity > DEFAULT_THRESHOLDS.humidity.max)
                )}
                index={1}
              />
              <SensorCard
                title="Gas Level (MQ2)"
                value={sensorData?.gas_analog ?? 0}
                unit=""
                icon="gas"
                threshold={DEFAULT_THRESHOLDS.gas_analog}
                isAlert={!!(sensorData?.gas_analog && sensorData.gas_analog > DEFAULT_THRESHOLDS.gas_analog.max)}
                index={2}
              />
            </div>

            {stats && <StatsSummary stats={stats} />}

            <SensorChart
              data={chartData}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          </div>

          <div className="space-y-6">
            <AlertPanel alerts={alerts} onAcknowledge={handleAcknowledge} />
            <InsightsPanel 
              insights={insights} 
              aiInsights={[]}
              aiAvailable={false}
            />
          </div>
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-gray-500 text-sm"
        >
          Worker Safety Monitor v1.0 | Data stored in PostgreSQL | Thresholds: Temp {'>'}40°C, Humidity &lt;20% or &gt;80%, Gas {'>'}300
        </motion.footer>
      </div>
    </div>
  );
}