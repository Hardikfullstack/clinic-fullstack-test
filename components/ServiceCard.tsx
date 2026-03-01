'use client';

import { Service } from '@/types';
import { formatPrice, formatDuration, getCategoryDisplayName } from '@/lib/utils';
import { Clock, Calendar, ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  currency: string;
  onBookNow: () => void;
}

export function ServiceCard({ service, currency, onBookNow }: ServiceCardProps) {
  // Memoize expensive calculations
  const displayedSlots = service.slots.slice(0, 4);
  const hasMoreSlots = service.slots.length > 4;
  const totalSlotsCount = service.slots.length;
  
  // Check availability - service must be available AND have slots
  const isAvailable = service.available && service.slots.length > 0;

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-1">
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-500 p-4 overflow-hidden">
        {/* Subtle SVG pattern for visual interest */}
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' 
        }} />
        <div className="relative z-10 flex items-start justify-between">
          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-white/20 text-white backdrop-blur-sm">
            {getCategoryDisplayName(service.category)}
          </span>
          <div className="text-right">
            <div className="text-xl font-bold text-white">
              {formatPrice(service.basePrice, currency)}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Service name */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
          {service.name}
        </h3>

        {/* Duration */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Clock className="w-4 h-4" />
          <span>{formatDuration(service.duration)}</span>
        </div>

        {/* Available slots section - maintains consistent card height */}
        <div className="mb-5">
          {service.available ? (
            <>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Available Slots</span>
                {service.slots.length > 4 && (
                  <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {service.slots.length} total
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {displayedSlots.length > 0 ? (
                  displayedSlots.map((slot) => (
                    <span
                      key={slot}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      {slot}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 italic flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    No slots available
                  </span>
                )}
                {hasMoreSlots && (
                  <span className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg border border-gray-200">
                    +{totalSlotsCount - 4} more
                  </span>
                )}
              </div>
            </>
          ) : (
            /* Placeholder to maintain card height when unavailable */
            <div className="h-[72px] flex items-center justify-center">
              <span className="text-sm text-gray-400 italic flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Not Available
              </span>
            </div>
          )}
        </div>

        {/* Book button */}
        <button
          onClick={onBookNow}
          disabled={!isAvailable}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            isAvailable
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg shadow-blue-200 transform hover:scale-[1.02]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isAvailable ? (
            <>
              Book Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          ) : (
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Not Available
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
