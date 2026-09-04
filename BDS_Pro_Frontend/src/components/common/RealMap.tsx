import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Property } from '@/types';
import { formatPrice } from '@/utils/format';

// Fix default Leaflet icon assets in Vite build
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RealMapProps {
  mode?: 'picker' | 'search' | 'display';
  center?: [number, number]; // [lat, lng] default [10.7769, 106.7009] (TP.HCM)
  zoom?: number;
  height?: string;
  hasPinned?: boolean;
  properties?: Property[];
  selectedPropertyId?: string;
  onSelectProperty?: (property: Property) => void;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  className?: string;
}

export const RealMap: React.FC<RealMapProps> = ({
  mode = 'display',
  center = [10.7769, 106.7009],
  zoom = 13,
  height = '400px',
  hasPinned = false,
  properties = [],
  selectedPropertyId,
  onSelectProperty,
  onLocationSelect,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapInstanceRef.current) return; // Only init once

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map view center if prop changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center?.[0], center?.[1], zoom]);

  // Handle Mode = 'picker' (Way 1: Address Search & Way 2: Click / Hold / Drag Pin on Map)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || mode !== 'picker') return;

    // Render / update pin if hasPinned is true
    if (hasPinned) {
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng(center);
      } else {
        const marker = L.marker(center, { draggable: true }).addTo(map);
        pickerMarkerRef.current = marker;

        marker.on('dragend', () => {
          const latLng = marker.getLatLng();
          if (onLocationSelect) {
            onLocationSelect({ lat: latLng.lat, lng: latLng.lng });
          }
        });
      }
    } else if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }

    // Always enable clicking on the map to place/move the pin (Way 2: Nhấp / Nhấn giữ ghim)
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng(e.latlng);
      } else {
        const marker = L.marker(e.latlng, { draggable: true }).addTo(map);
        pickerMarkerRef.current = marker;

        marker.on('dragend', () => {
          const latLng = marker.getLatLng();
          if (onLocationSelect) {
            onLocationSelect({ lat: latLng.lat, lng: latLng.lng });
          }
        });
      }

      if (onLocationSelect) {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    };

    map.off('click');
    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [mode, center, hasPinned, onLocationSelect]);

  // Handle Mode = 'search' or 'display' (Render property markers)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || mode === 'picker') return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!properties || properties.length === 0) return;

    const bounds = L.latLngBounds([]);

    properties.forEach((p) => {
      const lat = p.latitude || 10.7769;
      const lng = p.longitude || 106.7009;

      // Custom DivIcon with price tag styling
      const priceText = formatPrice(p.price, p.transactionType);
      const isSelected = p.id === selectedPropertyId;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background-color: ${isSelected ? '#059669' : '#1e293b'};
            color: #ffffff;
            font-weight: 700;
            font-size: 11px;
            padding: 4px 8px;
            border-radius: 999px;
            white-space: nowrap;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
            transform: translate(-50%, -100%);
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span>🏠 ${priceText}</span>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 30],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="width: 220px; font-family: system-ui, sans-serif; padding: 2px;">
          <img src="${p.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'}" 
               style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;" />
          <h4 style="margin: 8px 0 4px 0; font-size: 13px; font-weight: 700; color: #0f172a; line-clamp: 2;">${p.title}</h4>
          <p style="margin: 0; font-size: 12px; font-weight: 700; color: #059669;">${priceText}</p>
          <p style="margin: 4px 0 8px 0; font-size: 11px; color: #64748b;">📍 ${p.district || ''}, ${p.city || ''}</p>
          <a href="/client/property/${p.id}" style="display: block; text-align: center; background: #059669; color: #fff; text-decoration: none; padding: 6px; border-radius: 6px; font-size: 12px; font-weight: 600;">Xem chi tiết →</a>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectProperty) onSelectProperty(p);
      });

      markersRef.current.push(marker);
      bounds.extend([lat, lng]);
    });

    if (properties.length > 1 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [mode, properties, selectedPropertyId, onSelectProperty]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%' }}
      className={`relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 ${className}`}
    />
  );
};
