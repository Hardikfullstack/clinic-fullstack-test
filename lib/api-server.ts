import { ClinicServicesResponse, AppointmentRequest, AppointmentResponse, Service } from '@/types';

// Mock data for multiple clinics
const mockClinicsData: Record<string, ClinicServicesResponse> = {
  'clinic_abc': {
    clinicId: 'clinic_abc',
    clinicName: 'PawCare Clinic',
    currency: 'USD',
    services: [
      {
        id: 'svc_1',
        name: 'General Checkup',
        basePrice: 500,
        duration: 30,
        category: 'checkup',
        available: true,
        slots: ['09:00', '10:30', '14:00', '16:00'],
      },
      {
        id: 'svc_2',
        name: 'Vaccination - Rabies',
        basePrice: 350,
        duration: 15,
        category: 'vaccination',
        available: true,
        slots: ['09:30', '11:00', '15:00'],
      },
      {
        id: 'svc_3',
        name: 'Dental Surgery',
        basePrice: 2500,
        duration: 120,
        category: 'surgery',
        available: true,
        slots: ['08:00', '12:00'],
      },
      {
        id: 'svc_4',
        name: 'Emergency Care',
        basePrice: 800,
        duration: 45,
        category: 'checkup',
        available: false,
        slots: ['00:00', '06:00', '18:00', '23:00'],
      },
      {
        id: 'svc_5',
        name: 'Vaccination - DHPP',
        basePrice: 450,
        duration: 20,
        category: 'vaccination',
        available: true,
        slots: ['10:00', '13:00', '16:30'],
      },
      {
        id: 'svc_6',
        name: 'Spay/Neuter Surgery',
        basePrice: 1800,
        duration: 90,
        category: 'surgery',
        available: true,
        slots: ['09:00', '13:00'],
      },
    ],
  },
  'clinic_xyz': {
    clinicId: 'clinic_xyz',
    clinicName: 'Happy Pets Veterinary',
    currency: 'EUR',
    services: [
      {
        id: 'svc_1',
        name: 'General Checkup',
        basePrice: 450,
        duration: 30,
        category: 'checkup',
        available: true,
        slots: ['08:30', '10:00', '13:30', '15:30'],
      },
      {
        id: 'svc_2',
        name: 'Vaccination - Rabies',
        basePrice: 320,
        duration: 15,
        category: 'vaccination',
        available: false,
        slots: ['09:00', '11:30', '14:30'],
      },
      {
        id: 'svc_3',
        name: 'Dental Surgery',
        basePrice: 2200,
        duration: 120,
        category: 'surgery',
        available: true,
        slots: ['07:00', '11:00'],
      },
      {
        id: 'svc_4',
        name: 'Emergency Care',
        basePrice: 750,
        duration: 45,
        category: 'checkup',
        available: true,
        slots: ['01:00', '07:00', '19:00', '22:00'],
      },
      {
        id: 'svc_5',
        name: 'Vaccination - DHPP',
        basePrice: 400,
        duration: 20,
        category: 'vaccination',
        available: true,
        slots: ['09:30', '12:30', '15:00'],
      },
      {
        id: 'svc_6',
        name: 'Spay/Neuter Surgery',
        basePrice: 1600,
        duration: 90,
        category: 'surgery',
        available: true,
        slots: ['08:00', '12:00'],
      },
    ],
  },
};

// In-memory store for booked appointments (server-side)
const bookedAppointments = new Map<string, Set<string>>();

// Server-side API functions
export async function getClinicServices(
  clinicId: string,
  category?: string
): Promise<ClinicServicesResponse> {
  // No artificial delay for production performance
  const clinicData = mockClinicsData[clinicId];
  if (!clinicData) {
    throw new Error(`Clinic '${clinicId}' not found. Available clinics: ${Object.keys(mockClinicsData).join(', ')}`);
  }
  
  let services = clinicData.services;
  
  // Filter by category if provided
  if (category && category !== 'all') {
    services = services.filter(service => service.category === category);
  }
  
  // Remove already booked slots from available slots
  const updatedServices = services.map((service: Service) => {
    const bookedSlots = bookedAppointments.get(service.id) || new Set();
    return {
      ...service,
      slots: service.slots.filter((slot: string) => !bookedSlots.has(slot))
    };
  });
  
  return {
    ...clinicData,
    services: updatedServices
  };
}

export async function bookAppointment(
  appointmentData: AppointmentRequest
): Promise<AppointmentResponse> {
  // No artificial delay for production performance
  
  // Check if slot is already booked
  const serviceBookings = bookedAppointments.get(appointmentData.serviceId) || new Set();
  if (serviceBookings.has(appointmentData.slot)) {
    throw new Error('Slot already booked. Please select a different time.');
  }
  
  // Simulate random failure (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('Failed to book appointment. Please try again.');
  }
  
  // Store the booked appointment
  serviceBookings.add(appointmentData.slot);
  bookedAppointments.set(appointmentData.serviceId, serviceBookings);
  
  return {
    appointmentId: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'confirmed'
  };
}

// Client-side API functions (call server-side API)
export async function fetchClinicServices(
  clinicId: string,
  category?: string
): Promise<ClinicServicesResponse> {
  const params = new URLSearchParams({ clinicId });
  if (category && category !== 'all') {
    params.append('category', category);
  }
  
  const response = await fetch(`/api/services?${params}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch services');
  }
  
  return response.json();
}

export async function createAppointment(
  appointmentData: AppointmentRequest
): Promise<AppointmentResponse> {
  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(appointmentData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to book appointment');
  }
  
  return response.json();
}
