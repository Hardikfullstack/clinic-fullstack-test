import { NextRequest, NextResponse } from 'next/server';
import { bookAppointment } from '@/lib/api-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['clinicId', 'serviceId', 'petName', 'ownerName', 'ownerPhone', 'slot', 'appointmentDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const appointment = await bookAppointment(body);
    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Appointments API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to book appointment' },
      { status: 500 }
    );
  }
}
