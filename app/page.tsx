"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchClinicServices } from "@/lib/api-server";
import { ServiceCard } from "@/components/ServiceCard";
import { HeadTags } from "./HeadTags";
import { ClinicServicesResponse, Service } from '@/types';
import { Search, Stethoscope } from "lucide-react";

function SchedulingDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clinicId = searchParams.get("clinicId") || "clinic_abc";

  const [clinicData, setClinicData] = useState<ClinicServicesResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Available clinics for switching
  const availableClinics = [
    { id: 'clinic_abc', name: 'PawCare Clinic', currency: 'USD' },
    { id: 'clinic_xyz', name: 'Happy Pets Veterinary', currency: 'EUR' }
  ];

  const categories: { value: string; label: string }[] = [
    { value: "all", label: "All Services" },
    { value: "checkup", label: "Checkup" },
    { value: "vaccination", label: "Vaccination" },
    { value: "surgery", label: "Surgery" },
  ];

  const handleClinicSwitch = (newClinicId: string) => {
    router.push(`/?clinicId=${newClinicId}`);
  };

  useEffect(() => {
    // Redirect to include clinicId if not present
    if (!searchParams.get('clinicId')) {
      router.replace(`/?clinicId=clinic_abc`);
      return;
    }

    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchClinicServices(
          clinicId,
          selectedCategory === "all" ? undefined : selectedCategory,
        );
        setClinicData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load services",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [clinicId, selectedCategory, searchParams, router]);

  const filteredServices = (selectedCategory === "all"
    ? clinicData?.services
    : clinicData?.services.filter(
        (service) => service.category === selectedCategory
      ))?.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()),
  ) || [];

  const handleBookNow = (service: Service) => {
    router.push(`/book?serviceId=${service.id}&clinicId=${clinicId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Show header immediately while loading */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Stethoscope className="w-5 h-5 text-white" style={{ width: '20px', height: '20px' }} />
              </div>
              <div>
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded mt-1 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Skeleton content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="h-10 w-full bg-gray-200 rounded-xl mb-4 animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 h-64 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-red-600 font-semibold text-lg mb-2">Oops!</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <HeadTags />
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <Stethoscope className="w-5 h-5 text-white" style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {clinicData?.clinicName}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">{`Schedule your pet's appointment`}</p>
                </div>
              </div>
              
              {/* Clinic Switcher */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Switch Clinic:</label>
                <select
                  value={clinicId}
                  onChange={(e) => handleClinicSwitch(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  {availableClinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name} ({clinic.currency})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {clinicData?.currency && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 ml-13">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>Prices in {clinicData.currency}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 focus:outline-none transition-all hover:border-gray-300"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm whitespace-nowrap flex-1 min-w-[80px] max-w-[120px] shadow-sm ${
                    selectedCategory === category.value
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-600 text-lg font-medium mb-2">
              No services found
            </p>
            <p className="text-gray-400 text-sm">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => (
              <div
                key={service.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ServiceCard
                  service={service}
                  currency={clinicData?.currency || "USD"}
                  onBookNow={() => handleBookNow(service)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// Wrapper for Suspense
function DashboardWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <SchedulingDashboard />
    </Suspense>
  );
}

export default DashboardWrapper;
