'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchClinicServices, createAppointment } from '@/lib/api-server';
import { formatPrice, formatDuration } from '@/lib/utils';
import { ClinicServicesResponse, Service, BookingFormData } from '@/types';
import { ArrowLeft, CheckCircle, Calendar, Clock, User, Phone, PawPrint, Loader2 } from 'lucide-react';

// Loading component for Suspense
function BookingPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading booking page...</p>
      </div>
    </div>
  );
}

// Main booking page content
function BookingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serviceId = searchParams.get('serviceId');
  const clinicId = searchParams.get('clinicId') || 'clinic_abc';

  const [clinicData, setClinicData] = useState<ClinicServicesResponse | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingFormData, setBookingFormData] = useState<BookingFormData>({
    petName: '',
    ownerName: '',
    ownerPhone: '',
    selectedSlot: '',
    appointmentDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [appointmentId, setAppointmentId] = useState('');

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchClinicServices(clinicId);
        const service = data.services.find((s: Service) => s.id === serviceId);
        if (!service) {
          setError('Service not found');
          return;
        }
        setSelectedService(service);
        setClinicData(data);
        setBookingFormData({
          petName: '',
          ownerName: '',
          ownerPhone: '',
          selectedSlot: service.slots[0] || '',
          appointmentDate: '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load service details');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [clinicId, serviceId]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setIsSubmitting(true);

    // Validate form fields
    if (!bookingFormData.petName || !bookingFormData.ownerName || !bookingFormData.ownerPhone || !bookingFormData.selectedSlot || !bookingFormData.appointmentDate) {
      setBookingError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    // Phone number validation
    const phoneRegex = /^[+]?[\d\s-]{10,}$/;
    if (!phoneRegex.test(bookingFormData.ownerPhone)) {
      setBookingError('Please enter a valid phone number (at least 10 digits)');
      setIsSubmitting(false);
      return;
    }

    // Check if selected slot is still available
    if (selectedService && !selectedService.slots.includes(bookingFormData.selectedSlot)) {
      setBookingError('Selected slot is no longer available. Please refresh and select a different time.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await createAppointment({
        clinicId,
        serviceId: selectedService!.id,
        petName: bookingFormData.petName,
        ownerName: bookingFormData.ownerName,
        ownerPhone: bookingFormData.ownerPhone,
        slot: bookingFormData.selectedSlot,
        appointmentDate: bookingFormData.appointmentDate,
      });

      setSuccessMessage(`Appointment booked successfully for ${bookingFormData.petName}!`);
      setAppointmentId(result.appointmentId);

      // Reset form
      setBookingFormData({
        petName: '',
        ownerName: '',
        ownerPhone: '',
        selectedSlot: '',
        appointmentDate: '',
      });

      // Redirect to services page after 3 seconds
      setTimeout(() => {
        router.push(`/?clinicId=${clinicId}`);
      }, 3000);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-semibold text-lg mb-2">Service Not Found</p>
          <p className="text-gray-600 mb-6">{error || 'Unable to load service details'}</p>
          <button
            onClick={() => router.push(`/?clinicId=${clinicId}`)}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{successMessage}</h3>
          {appointmentId && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Appointment ID</p>
              <p className="text-lg font-mono font-semibold text-gray-800">{appointmentId}</p>
            </div>
          )}
          <p className="text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirecting to services...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{clinicData?.clinicName}</h1>
                <p className="text-sm sm:text-base text-gray-600">Book your appointment</p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/?clinicId=${clinicId}`)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium border border-gray-200 rounded-xl px-4 py-2.5 text-sm hover:bg-blue-50 transition-all self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Services
            </button>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Service Summary */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <h3 className="font-semibold text-lg mb-2">{selectedService.name}</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-100">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{formatDuration(selectedService.duration)}</span>
              </div>
              <span className="text-2xl font-bold">{formatPrice(selectedService.basePrice, clinicData?.currency || 'USD')}</span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {bookingError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="font-medium">{bookingError}</p>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="petName" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <PawPrint className="w-4 h-4 text-blue-500" />
                    Pet Name *
                  </label>
                  <input
                    type="text"
                    id="petName"
                    name="petName"
                    value={bookingFormData.petName}
                    onChange={(e) => setBookingFormData(prev => ({ ...prev, petName: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base text-gray-900 placeholder-gray-400 focus:outline-none transition-all hover:border-gray-300"
                    placeholder="Enter pet's name"
                  />
                </div>

                <div>
                  <label htmlFor="ownerName" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 text-blue-500" />
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    id="ownerName"
                    name="ownerName"
                    value={bookingFormData.ownerName}
                    onChange={(e) => setBookingFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base text-gray-900 placeholder-gray-400 focus:outline-none transition-all hover:border-gray-300"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ownerPhone" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4 text-blue-500" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="ownerPhone"
                  name="ownerPhone"
                  value={bookingFormData.ownerPhone}
                  onChange={(e) => setBookingFormData(prev => ({ ...prev, ownerPhone: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base text-gray-900 placeholder-gray-400 focus:outline-none transition-all hover:border-gray-300"
                  placeholder="+1-9876543210"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="appointmentDate" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    id="appointmentDate"
                    name="appointmentDate"
                    value={bookingFormData.appointmentDate}
                    onChange={(e) => setBookingFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base text-gray-900 focus:outline-none transition-all hover:border-gray-300"
                  />
                </div>

                <div>
                  <label htmlFor="selectedSlot" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Select Time Slot *
                  </label>
                  <select
                    id="selectedSlot"
                    name="selectedSlot"
                    value={bookingFormData.selectedSlot}
                    onChange={(e) => setBookingFormData(prev => ({ ...prev, selectedSlot: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base text-gray-900 focus:outline-none transition-all hover:border-gray-300 bg-white"
                  >
                    {selectedService.slots.map(slot => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push(`/?clinicId=${clinicId}`)}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 text-base font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 text-base font-semibold shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


// Wrap with Suspense for static generation compatibility
export default function BookingPage() {
  return (
    <Suspense fallback={<BookingPageLoading />}>
      <BookingPageContent />
    </Suspense>
  );
}
