import { NextRequest, NextResponse } from 'next/server';
import { createTables, insertReading, getLatestReading, getRecentReadings, getDashboardStats, getRecentAlerts, getChartData, getInsights, acknowledgeAlert, getUnacknowledgedAlerts } from '@/lib/sensor-data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { temperature, humidity, gasAnalog, gasDigital } = body;

    if (temperature === undefined || humidity === undefined || gasAnalog === undefined || gasDigital === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: temperature, humidity, gasAnalog, gasDigital' },
        { status: 400 }
      );
    }

    await createTables();
    
    const result = await insertReading(
      parseFloat(temperature),
      parseFloat(humidity),
      parseInt(gasAnalog),
      gasDigital === true || gasDigital === 'true' || gasDigital === 1
    );

    return NextResponse.json({
      success: true,
      reading: result.reading,
      alerts: result.alerts,
      hasAlerts: result.alerts.length > 0
    });
  } catch (error) {
    console.error('Error inserting reading:', error);
    return NextResponse.json(
      { error: 'Failed to insert reading' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'latest';

    await createTables();

    switch (action) {
      case 'latest':
        const latest = await getLatestReading();
        return NextResponse.json({ reading: latest });
      
      case 'readings':
        const hours = parseInt(searchParams.get('hours') || '24');
        const readings = await getRecentReadings(hours);
        return NextResponse.json({ readings });
      
      case 'stats':
        const stats = await getDashboardStats();
        return NextResponse.json({ stats });
      
      case 'alerts':
        const alertsHours = parseInt(searchParams.get('hours') || '24');
        const alerts = await getRecentAlerts(alertsHours);
        return NextResponse.json({ alerts });
      
      case 'unacknowledged':
        const unacked = await getUnacknowledgedAlerts();
        return NextResponse.json({ alerts: unacked });
      
      case 'acknowledge':
        const alertId = searchParams.get('id');
        if (alertId) {
          await acknowledgeAlert(parseInt(alertId));
          return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
      
      case 'chart':
        const chartHours = parseInt(searchParams.get('hours') || '24');
        const chartData = await getChartData(chartHours);
        return NextResponse.json({ chartData });
      
      case 'insights':
        const insights = await getInsights();
        return NextResponse.json({ insights });
      
      case 'init':
        return NextResponse.json({ success: true, message: 'Database initialized' });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
