# Worker Safety Monitoring System

## Overview
Real-time IoT sensor monitoring dashboard for worker safety, tracking temperature, humidity, and gas levels from DHT11 and MQ2 sensors connected to Arduino.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TailwindCSS, Recharts, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL via Supabase
- **Real-time**: Supabase Realtime subscriptions

## Features
1. **Real-time Dashboard** - Live sensor data with animated gauges
2. **Historical Charts** - Time-series data visualization (24h, 7d, 30d)
3. **Alert System** - Threshold-based gas leak detection with notifications
4. **Safety Insights** - AI-powered analysis of sensor patterns
5. **Data Storage** - All readings stored with timestamps

## Sensor Thresholds
- **Temperature**: Alert > 40°C
- **Humidity**: Alert < 20% or > 80%
- **Gas (MQ2)**: Alert > 300 (analog), immediate alert on digital HIGH

## Database Schema
```sql
CREATE TABLE sensor_readings (
    id SERIAL PRIMARY KEY,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    gas_analog INTEGER,
    gas_digital BOOLEAN,
    is_alert BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50),
    severity VARCHAR(20),
    message TEXT,
    sensor_reading_id INTEGER REFERENCES sensor_readings(id),
    acknowledged BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## AI Integration
- Pattern recognition for anomaly detection
- Predictive maintenance alerts
- Natural language insights generation
- Recommendation engine for safety improvements