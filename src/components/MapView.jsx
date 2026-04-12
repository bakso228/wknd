import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Category color palette for map markers
const CAT_COLORS = {
  sourced:  '#7c3aed', // violet — curated events
  outdoor:  '#16a34a', // green
  indoor:   '#2563eb', // blue
  theater:  '#9333ea', // purple
  food:     '#ea580c', // orange
  seasonal: '#d97706', // amber
  sticky:   '#db2777', // pink
};

function makeIcon(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="34" viewBox="0 0 24 34">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 22 12 22s12-13 12-22C24 5.373 18.627 0 12 0z"
      fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [24, 34],
    iconAnchor: [12, 34],
    popupAnchor: [0, -34],
  });
}

const iconCache = {};
function getIcon(cat) {
  const color = CAT_COLORS[cat] || CAT_COLORS.indoor;
  if (!iconCache[color]) iconCache[color] = makeIcon(color);
  return iconCache[color];
}

export default function MapView({ events }) {
  const mapped = events.filter(e => e.lat && e.lng);
  const noCoords = events.length - mapped.length;

  // De-duplicate pins at same location by offsetting slightly
  const seen = {};
  const positioned = mapped.map(e => {
    const key = `${e.lat.toFixed(4)},${e.lng.toFixed(4)}`;
    const count = seen[key] = (seen[key] || 0) + 1;
    const offset = (count - 1) * 0.0003;
    return { ...e, _lat: e.lat + offset, _lng: e.lng + offset };
  });

  return (
    <div className="relative">
      <MapContainer
        center={[48.137, 11.576]}
        zoom={12}
        style={{ height: '420px', borderRadius: '16px', border: '1px solid #e7e5e4' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {positioned.map(e => (
          <Marker
            key={e.id}
            position={[e._lat, e._lng]}
            icon={getIcon(e.eventType === 'sourced' ? 'sourced' : e.cat)}
          >
            <Popup maxWidth={220}>
              <div className="text-xs leading-relaxed">
                <div className="font-bold text-sm mb-0.5">{e.emoji} {e.name}</div>
                {e.venue && <div className="text-stone-500 mb-1">{e.venue}</div>}
                {e.dateShort && <div className="text-violet-600 font-semibold mb-1">{e.dateShort}</div>}
                {e.duration && <div className="text-stone-400">⏱ {e.duration}</div>}
                {e.url && (
                  <a href={e.url} target="_blank" rel="noopener noreferrer"
                    className="text-blue-500 underline mt-1 block">
                    Details →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-2 px-1">
        {Object.entries(CAT_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1 text-[10px] text-stone-500">
            <span style={{ background: color }} className="w-2.5 h-2.5 rounded-full flex-shrink-0" />
            <span className="capitalize">{cat === 'sourced' ? 'events' : cat}</span>
          </div>
        ))}
      </div>

      {noCoords > 0 && (
        <div className="mt-1 text-[10px] text-stone-400 px-1">
          {noCoords} item{noCoords > 1 ? 's' : ''} without location not shown on map
        </div>
      )}
    </div>
  );
}
