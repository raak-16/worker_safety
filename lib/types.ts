export interface SensorReading {
  id: number;
  temperature: number;
  humidity: number;
  gas_analog: number;
  gas_digital: boolean;
  is_alert: boolean;
  created_at: string;
}

export interface Alert {
  id: number;
  type: 'gas' | 'temperature' | 'humidity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  sensor_reading_id?: number;
  acknowledged: boolean;
  created_at: string;
}

export interface SafetyInsight {
  id: string;
  type: 'warning' | 'info' | 'recommendation';
  title: string;
  description: string;
  timestamp: string;
}

export interface ThresholdConfig {
  temperature: { min: number; max: number };
  humidity: { min: number; max: number };
  gas_analog: { max: number };
}

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  temperature: { min: 15, max: 40 },
  humidity: { min: 20, max: 80 },
  gas_analog: { max: 300 },
};

export interface ChartDataPoint {
  timestamp: string;
  temperature: number;
  humidity: number;
  gas_analog: number;
}

export interface DashboardStats {
  currentTemp: number;
  currentHumidity: number;
  currentGas: number;
  alertCount: number;
  avgTemp24h: number;
  avgHumidity24h: number;
  avgGas24h: number;
  readings24h: number;
}

export interface AIInsight {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  recommendation: string;
}