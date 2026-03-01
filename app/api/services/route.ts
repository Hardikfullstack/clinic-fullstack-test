import { NextRequest, NextResponse } from 'next/server';
import { getClinicServices } from '@/lib/api-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const category = searchParams.get('category') || undefined;

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinicId parameter is required' },
        { status: 400 }
      );
    }

    const services = await getClinicServices(clinicId, category);
    return NextResponse.json(services);
  } catch (error) {
    console.error('Services API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
