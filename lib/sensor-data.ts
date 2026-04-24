import { query } from './db';
import { SensorReading, Alert, ThresholdConfig, DEFAULT_THRESHOLDS, ChartDataPoint, DashboardStats } from './types';

export async function createTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS sensor_readings (
      id SERIAL PRIMARY KEY,
      temperature DECIMAL(5,2),
      humidity DECIMAL(5,2),
      gas_analog INTEGER,
      gas_digital BOOLEAN,
      is_alert BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS alerts (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50),
      severity VARCHAR(20),
      message TEXT,
      sensor_reading_id INTEGER REFERENCES sensor_readings(id),
      acknowledged BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_readings_created_at ON sensor_readings(created_at DESC)
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC)
  `);
}

export async function insertReading(
  temperature: number,
  humidity: number,
  gasAnalog: number,
  gasDigital: boolean
): Promise<{ reading: SensorReading; alerts: Alert[] }> {
  const threshold: ThresholdConfig = DEFAULT_THRESHOLDS;
  
  const isAlert = 
    gasAnalog > threshold.gas_analog.max ||
    gasDigital ||
    temperature > threshold.temperature.max ||
    humidity < threshold.humidity.min ||
    humidity > threshold.humidity.max;

  const result = await query(
    `INSERT INTO sensor_readings (temperature, humidity, gas_analog, gas_digital, is_alert)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [temperature, humidity, gasAnalog, gasDigital, isAlert]
  );

  const reading = result.rows[0] as SensorReading;
  const alerts: Alert[] = [];

  if (gasDigital) {
    const alertResult = await query(
      `INSERT INTO alerts (type, severity, message, sensor_reading_id)
       VALUES ('gas', 'critical', 'Gas leak detected! Immediate evacuation required.', $1)
       RETURNING *`,
      [reading.id]
    );
    alerts.push(alertResult.rows[0] as Alert);
  } else if (gasAnalog > threshold.gas_analog.max) {
    const alertResult = await query(
      `INSERT INTO alerts (type, severity, message, sensor_reading_id)
       VALUES ('gas', 'high', $1, $2)
       RETURNING *`,
      [`High gas level detected: ${gasAnalog} (threshold: ${threshold.gas_analog.max})`, reading.id]
    );
    alerts.push(alertResult.rows[0] as Alert);
  }

  if (temperature > threshold.temperature.max) {
    const alertResult = await query(
      `INSERT INTO alerts (type, severity, message, sensor_reading_id)
       VALUES ('temperature', 'high', $1, $2)
       RETURNING *`,
      [`High temperature detected: ${temperature}°C (threshold: ${threshold.temperature.max}°C)`, reading.id]
    );
    alerts.push(alertResult.rows[0] as Alert);
  }

  if (humidity < threshold.humidity.min) {
    const alertResult = await query(
      `INSERT INTO alerts (type, severity, message, sensor_reading_id)
       VALUES ('humidity', 'medium', $1, $2)
       RETURNING *`,
      [`Low humidity detected: ${humidity}% (threshold: ${threshold.humidity.min}%)`, reading.id]
    );
    alerts.push(alertResult.rows[0] as Alert);
  } else if (humidity > threshold.humidity.max) {
    const alertResult = await query(
      `INSERT INTO alerts (type, severity, message, sensor_reading_id)
       VALUES ('humidity', 'medium', $1, $2)
       RETURNING *`,
      [`High humidity detected: ${humidity}% (threshold: ${threshold.humidity.max}%)`, reading.id]
    );
    alerts.push(alertResult.rows[0] as Alert);
  }

  return { reading, alerts };
}

export async function getRecentReadings(hours: number = 24): Promise<SensorReading[]> {
  const result = await query(
    `SELECT * FROM sensor_readings 
     WHERE created_at > NOW() - INTERVAL '${hours} hours'
     ORDER BY created_at DESC
     LIMIT 1000`
  );
  return result.rows as SensorReading[];
}

export async function getLatestReading(): Promise<SensorReading | null> {
  const result = await query(
    `SELECT * FROM sensor_readings ORDER BY created_at DESC LIMIT 1`
  );
  return result.rows[0] as SensorReading | null;
}

export async function getRecentAlerts(hours: number = 24): Promise<Alert[]> {
  const result = await query(
    `SELECT * FROM alerts 
     WHERE created_at > NOW() - INTERVAL '${hours} hours'
     ORDER BY created_at DESC
     LIMIT 100`
  );
  return result.rows as Alert[];
}

export async function getUnacknowledgedAlerts(): Promise<Alert[]> {
  const result = await query(
    `SELECT * FROM alerts 
     WHERE acknowledged = false
     ORDER BY created_at DESC
     LIMIT 50`
  );
  return result.rows as Alert[];
}

export async function acknowledgeAlert(alertId: number): Promise<void> {
  await query(
    `UPDATE alerts SET acknowledged = true WHERE id = $1`,
    [alertId]
  );
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const latest = await getLatestReading();
  
  const stats24h = await query(`
    SELECT 
      AVG(temperature)::DECIMAL(5,2) as avg_temp,
      AVG(humidity)::DECIMAL(5,2) as avg_humidity,
      AVG(gas_analog)::DECIMAL as avg_gas,
      COUNT(*) as count
    FROM sensor_readings
    WHERE created_at > NOW() - INTERVAL '24 hours'
  `);

  const alertCount = await query(`
    SELECT COUNT(*) as count FROM alerts
    WHERE acknowledged = false
    AND created_at > NOW() - INTERVAL '24 hours'
  `);

  return {
    currentTemp: latest?.temperature ?? 0,
    currentHumidity: latest?.humidity ?? 0,
    currentGas: latest?.gas_analog ?? 0,
    alertCount: parseInt(alertCount.rows[0]?.count ?? 0),
    avgTemp24h: parseFloat(stats24h.rows[0]?.avg_temp ?? 0),
    avgHumidity24h: parseFloat(stats24h.rows[0]?.avg_humidity ?? 0),
    avgGas24h: parseFloat(stats24h.rows[0]?.avg_gas ?? 0),
    readings24h: parseInt(stats24h.rows[0]?.count ?? 0),
  };
}

export async function getChartData(hours: number = 24): Promise<ChartDataPoint[]> {
  const result = await query(`
    SELECT 
      date_trunc('minute', created_at) as timestamp,
      AVG(temperature)::DECIMAL(5,2) as temperature,
      AVG(humidity)::DECIMAL(5,2) as humidity,
      AVG(gas_analog)::DECIMAL as gas_analog
    FROM sensor_readings
    WHERE created_at > NOW() - INTERVAL '${hours} hours'
    GROUP BY date_trunc('minute', created_at)
    ORDER BY timestamp ASC
  `);
  return result.rows as ChartDataPoint[];
}

export async function getInsights(): Promise<{ message: string; type: string }[]> {
  const insights: { message: string; type: string }[] = [];

  const stats = await getDashboardStats();

  if (stats.currentGas > 250) {
    insights.push({
      message: `Gas levels are elevated at ${stats.currentGas}. Consider inspecting the area.`,
      type: 'warning'
    });
  }

  if (stats.currentTemp > 35) {
    insights.push({
      message: `Temperature is above comfortable levels at ${stats.currentTemp}°C. Ensure proper ventilation.`,
      type: 'warning'
    });
  }

  if (stats.avgGas24h > stats.currentGas * 1.2) {
    insights.push({
      message: 'Gas levels have been decreasing over the past 24 hours. Good trend!',
      type: 'success'
    });
  }

  if (stats.readings24h > 100) {
    insights.push({
      message: `Monitoring system is active with ${stats.readings24h} readings in the last 24 hours.`,
      type: 'info'
    });
  }

  if (stats.avgHumidity24h < 30) {
    insights.push({
      message: 'Air humidity has been consistently low. Consider humidification for worker comfort.',
      type: 'recommendation'
    });
  }

  return insights;
}