const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const portName = process.env.SERIAL_PORT || 'COM3';
const baudRate = Number(process.env.SERIAL_BAUD || 9600);
const apiBase = process.env.API_BASE_URL || 'http://localhost:3000';

const port = new SerialPort({ path: portName, baudRate });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

let pendingTemp = null;
let pendingHumidity = null;

console.log(`Listening on ${portName} @ ${baudRate}`);
console.log(`Posting to ${apiBase}/api/sensors`);

parser.on('data', async (line) => {
  const text = String(line).trim();
  if (!text) return;

  const postReading = async (temperature, humidity, gasAnalog, gasDigital) => {
    if (!Number.isFinite(temperature) || !Number.isFinite(humidity) || !Number.isFinite(gasAnalog)) {
      console.log(`Invalid numeric row: T=${temperature} H=${humidity} G=${gasAnalog}`);
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/sensors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperature, humidity, gasAnalog, gasDigital }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.log(`API error ${res.status}: ${body}`);
        return;
      }

      console.log(`Posted: T=${temperature} H=${humidity} G=${gasAnalog} D=${gasDigital ? 1 : 0}`);
    } catch (err) {
      console.error('Failed to post reading:', err.message);
    }
  };

  // CSV mode: temperature,humidity,gasAnalog,gasDigital
  const parts = text.split(',');
  if (parts.length === 4) {
    const temperature = Number(parts[0]);
    const humidity = Number(parts[1]);
    const gasAnalog = Number(parts[2]);
    const gasDigital = parts[3].trim() === '1';
    await postReading(temperature, humidity, gasAnalog, gasDigital);
    return;
  }

  // Verbose mode from your current Arduino code:
  // "Temp: 32 C  Humidity: 36 %"
  // "MQ2 Analog: 133  MQ2 Digital: 1"
  const tempHumMatch = text.match(/^Temp:\s*(-?\d+(?:\.\d+)?)\s*C\s+Humidity:\s*(-?\d+(?:\.\d+)?)\s*%$/i);
  if (tempHumMatch) {
    pendingTemp = Number(tempHumMatch[1]);
    pendingHumidity = Number(tempHumMatch[2]);
    return;
  }

  const gasMatch = text.match(/^MQ2\s+Analog:\s*(\d+)\s+MQ2\s+Digital:\s*([01])$/i);
  if (gasMatch && pendingTemp !== null && pendingHumidity !== null) {
    const gasAnalog = Number(gasMatch[1]);
    const gasDigital = gasMatch[2] === '1';
    await postReading(pendingTemp, pendingHumidity, gasAnalog, gasDigital);
    pendingTemp = null;
    pendingHumidity = null;
    return;
  }

  console.log(`Skipping unrecognized line: ${text}`);
});

port.on('error', (err) => {
  console.error('Serial error:', err.message);
});
