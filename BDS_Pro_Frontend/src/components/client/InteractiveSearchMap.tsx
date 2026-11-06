import type { Property } from '@/types';
import { RealMap } from '@/components/common/RealMap';

interface InteractiveSearchMapProps {
  properties: Property[];
  selectedId?: string;
  onSelect: (id: string) => void;
  radiusKm?: string;
  userLocation?: { lat: number; lng: number } | null;
  userLocationLabel?: string;
}

export function InteractiveSearchMap({
  properties,
  selectedId,
  onSelect,
  radiusKm,
  userLocation,
  userLocationLabel,
}: InteractiveSearchMapProps) {
  const selectedProperty = properties.find((p) => p.id === selectedId);
  const mapCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : selectedProperty
    ? [selectedProperty.latitude || 10.7769, selectedProperty.longitude || 106.7009]
    : properties.length > 0
    ? [properties[0].latitude || 10.7769, properties[0].longitude || 106.7009]
    : [10.7769, 106.7009];

  return (
    <div className="relative z-0 isolate h-full min-h-[400px] w-full">
      <RealMap
        mode="search"
        center={mapCenter}
        zoom={13}
        height="100%"
        properties={properties}
        selectedPropertyId={selectedId}
        onSelectProperty={(p) => onSelect(p.id)}
        radiusKm={radiusKm && radiusKm !== 'all' ? Number(radiusKm) : undefined}
        userLocation={userLocation}
        userLocationLabel={userLocationLabel}
      />
    </div>
  );
}
