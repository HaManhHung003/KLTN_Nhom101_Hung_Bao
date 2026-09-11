import type { Property } from '@/types';
import { RealMap } from '@/components/common/RealMap';

interface InteractiveSearchMapProps {
  properties: Property[];
  selectedId?: string;
  onSelect: (id: string) => void;
  radiusKm?: string;
}

export function InteractiveSearchMap({
  properties,
  selectedId,
  onSelect,
}: InteractiveSearchMapProps) {
  const selectedProperty = properties.find((p) => p.id === selectedId);
  const mapCenter: [number, number] = selectedProperty
    ? [selectedProperty.latitude || 10.7769, selectedProperty.longitude || 106.7009]
    : properties.length > 0
    ? [properties[0].latitude || 10.7769, properties[0].longitude || 106.7009]
    : [10.7769, 106.7009];

  return (
    <div className="relative h-full min-h-[400px] w-full">
      <RealMap
        mode="search"
        center={mapCenter}
        zoom={13}
        height="100%"
        properties={properties}
        selectedPropertyId={selectedId}
        onSelectProperty={(p) => onSelect(p.id)}
      />
    </div>
  );
}
