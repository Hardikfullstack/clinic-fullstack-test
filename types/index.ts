export type ServiceCategory = 'checkup' | 'vaccination' | 'surgery';

export interface Service {
  id: string;
  name: string;
  basePrice: number;
  duration: number;
  category: ServiceCategory;
  available: boolean;
  slots: string[];
}

export interface ClinicServicesResponse {
  clinicId: string;
  clinicName: string;
  currency: string;
  services: Service[];
}

export interface AppointmentRequest {
  clinicId: string;
  serviceId: string;
  petName: string;
  ownerName: string;
  ownerPhone: string;
  slot: string;
  appointmentDate: string;
}

export interface AppointmentResponse {
  appointmentId: string;
  status: string;
}

export interface BookingFormData {
  petName: string;
  ownerName: string;
  ownerPhone: string;
  selectedSlot: string;
  appointmentDate: string;
}
