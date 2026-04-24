# Worker Safety Monitor

Real-time IoT sensor monitoring dashboard for worker safety using DHT11 (temperature/humidity) and MQ2 (gas) sensors.

## Dashboard Preview

![Worker Safety Monitor Dashboard](./docs/worker-safety-dashboard.png)

## Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase)
- Arduino UNO (optional - for hardware)
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the project root:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.wkwbuaccioycnfoakglc.supabase.co:5432/postgres"
```

**To get your Supabase password:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > Database
4. Copy the "Connection string" (URI)

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Database Setup

The database tables are created automatically when you first access the API. Tables created:

- `sensor_readings` - Stores all sensor data
- `alerts` - Stores triggered alerts

### Manual Setup (Optional)

```bash
psql "postgresql://postgres:[PASSWORD]@db.wkwbuaccioycnfoakglc.supabase.co:5432/postgres" -f database/schema.sql
```

## Testing

### Simulate Sensor Data

The dashboard has a **"Simulate Reading"** button to test without hardware.

### Send Data via API

```bash
curl -X POST http://localhost:3000/api/sensors \
  -H "Content-Type: application/json" \
  -d '{"temperature": 25.5, "humidity": 65.2, "gasAnalog": 150, "gasDigital": false}'
```

### View Dashboard Stats

```bash
curl "http://localhost:3000/api/sensors?action=stats"
```

## Alert Thresholds

| Sensor | Condition | Alert Level |
|--------|-----------|-------------|
| Gas (MQ2) | Digital = HIGH | Critical |
| Gas (MQ2) | Analog > 300 | High |
| Temperature | > 40°C | High |
| Humidity | < 20% or > 80% | Medium |

## Hardware Setup (Optional)

### Arduino UNO Connections

| Sensor | Arduino UNO Pin |
|--------|------------------|
| DHT11 Data | D8 |
| MQ2 Analog (A0) | A0 |
| MQ2 Digital (D0) | D5 |

### UNO Firmware

Upload `arduino/worker_safety_uno.ino` to your Arduino UNO.

The UNO sends CSV over Serial in this format:

```text
temperature,humidity,gasAnalog,gasDigital
```

### Serial Bridge (UNO -> Next.js API)

Because UNO has no Wi-Fi, run the serial bridge on your PC:

```bash
$env:SERIAL_PORT="COM3"
$env:SERIAL_BAUD="9600"
$env:API_BASE_URL="http://localhost:3000"
npm run bridge
```

Then keep `npm run dev` running in another terminal.

## AI Integration (Optional)

To enable AI-powered insights:

1. Get an API key from [OpenAI](https://platform.openai.com)
2. Add to `.env.local`:
   ```env
   OPENAI_API_KEY="sk-..."
   ```

AI features include:
- Pattern recognition
- Predictive alerts
- Natural language safety recommendations

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linter
npm run bridge   # Read Arduino serial and post to API
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sensors` | POST | Submit sensor reading |
| `/api/sensors?action=stats` | GET | Dashboard statistics |
| `/api/sensors?action=readings&hours=24` | GET | Recent readings |
| `/api/sensors?action=chart&hours=24` | GET | Chart data |
| `/api/sensors?action=alerts` | GET | Recent alerts |
| `/api/sensors?action=insights` | GET | Safety insights |

## Troubleshooting

**Database connection error:**
- Verify your `DATABASE_URL` in `.env.local`
- Check Supabase password is correct
- Ensure database is accessible (check Supabase dashboard)

**Arduino data not coming in:**
- Verify `SERIAL_PORT` (Device Manager -> Ports)
- Confirm UNO sketch baud rate is `9600`
- Ensure `npm run bridge` is running

**No data showing:**
- Click "Simulate Reading" to test
- Check API responses in browser DevTools
- Verify database tables exist
