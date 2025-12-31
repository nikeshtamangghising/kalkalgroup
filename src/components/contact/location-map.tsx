'use client'

import IframeMap from '@/components/ui/iframe-map'

export default function LocationMap() {
  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Location</h3>
        <p className="text-gray-600">
          Visit us at Kal Kal Group - your trusted partner for quality products and services.
        </p>
      </div>
      
      <IframeMap
        latitude={27.66888921315947}
        longitude={85.40701020803344}
        zoom={18}
        height="450px"
        className="shadow-lg"
      />
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Address</h4>
            <p className="text-gray-600">
              Kal Kal Group<br />
              Kathmandu, Nepal
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Coordinates</h4>
            <p className="text-gray-600 font-mono text-xs">
              {27.66888921315947}, {85.40701020803344}
            </p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <a
            href={`https://www.openstreetmap.org/?mlat=${27.66888921315947}&mlon=${85.40701020803344}&zoom=18`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View on OpenStreetMap
          </a>
        </div>
      </div>
    </div>
  )
}