interface IframeMapProps {
  latitude: number
  longitude: number
  zoom?: number
  height?: string
  width?: string
  className?: string
}

export default function IframeMap({
  latitude,
  longitude,
  zoom = 18,
  height = '450px',
  width = '100%',
  className = ''
}: IframeMapProps) {
  // Create OpenStreetMap embed URL
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`
  
  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      <iframe
        src={mapUrl}
        style={{ height, width }}
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        title="OpenStreetMap"
        className="w-full"
      />
      <div className="p-2 bg-gray-50 text-xs text-gray-600 text-center">
        <a 
          href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=${zoom}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          View Larger Map on OpenStreetMap
        </a>
      </div>
    </div>
  )
}