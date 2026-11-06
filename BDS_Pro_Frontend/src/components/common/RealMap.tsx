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
  radiusKm?: number;
  userLocation?: { lat: number; lng: number } | null;
  userLocationLabel?: string;
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
  radiusKm,
  userLocation,
  userLocationLabel = 'Vị trí của bạn',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const pickerMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

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

  // Update map view center if center prop changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center?.[0], center?.[1], zoom]);

  // User Location Marker (Pulsing Blue Pin)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const userCustomIcon = L.divIcon({
        className: 'custom-user-location-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer;">
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: #0284c7;
              border: 3px solid #ffffff;
              box-shadow: 0 0 0 6px rgba(2, 132, 199, 0.35), 0 4px 10px rgba(0,0,0,0.3);
            "></div>
            <div style="
              margin-top: 5px;
              background: #0f172a;
              color: #ffffff;
              font-size: 11px;
              font-weight: 700;
              padding: 3px 10px;
              border-radius: 999px;
              white-space: nowrap;
              box-shadow: 0 3px 8px rgba(0,0,0,0.25);
              border: 1px solid rgba(255,255,255,0.4);
            ">
              🎯 ${userLocationLabel}
            </div>
          </div>
        `,
        iconSize: [140, 50],
        iconAnchor: [70, 25],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userCustomIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      userMarker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; text-align: center;">
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #0284c7;">🎯 ${userLocationLabel}</h4>
          <p style="margin: 0; font-size: 11px; color: #64748b;">Tọa độ: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}</p>
        </div>
      `);

      userMarkerRef.current = userMarker;
      map.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1.2 });
    }

    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    };
  }, [userLocation?.lat, userLocation?.lng, userLocationLabel]);

  // Radius circle visualization (around userLocation if available, else center)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    const circleCenter: [number, number] | null = userLocation
      ? [userLocation.lat, userLocation.lng]
      : center
      ? center
      : null;

    if (radiusKm && radiusKm > 0 && circleCenter) {
      circleRef.current = L.circle(circleCenter, {
        radius: radiusKm * 1000,
        color: '#0284c7',
        fillColor: '#38bdf8',
        fillOpacity: 0.14,
        weight: 2,
        dashArray: '6, 6',
      }).addTo(map);
    }

    return () => {
      if (circleRef.current) {
        circleRef.current.remove();
        circleRef.current = null;
      }
    };
  }, [radiusKm, userLocation?.lat, userLocation?.lng, center?.[0], center?.[1]]);

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

    // If userLocation exists, include it in bounds
    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lng]);
    }

    properties.forEach((p) => {
      const lat = p.latitude || 10.7769;
      const lng = p.longitude || 106.7009;

      // Custom DivIcon with luxury Airbnb-style price pill
      const priceText = formatPrice(p.price, p.transactionType);
      const isSelected = p.id === selectedPropertyId;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            position: relative;
            background-color: ${isSelected ? '#059669' : '#ffffff'};
            color: ${isSelected ? '#ffffff' : '#0f172a'};
            font-weight: 800;
            font-size: 11px;
            letter-spacing: -0.2px;
            padding: 5px 11px;
            border-radius: 999px;
            white-space: nowrap;
            box-shadow: ${isSelected ? '0 8px 24px rgba(5,150,105,0.45)' : '0 4px 14px rgba(0,0,0,0.18)'};
            border: 2px solid ${isSelected ? '#ffffff' : '#e2e8f0'};
            transform: translate(-50%, -100%) ${isSelected ? 'scale(1.12)' : 'scale(1)'};
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          ">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${isSelected ? '#ffffff' : '#10b981'};"></span>
            <span>${priceText}</span>
          </div>
        `,
        iconSize: [84, 32],
        iconAnchor: [42, 32],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Popup Content with modern luxury card design
      const popupHtml = `
        <div style="width: 240px; font-family: system-ui, -apple-system, sans-serif; padding: 4px;">
          <div style="position: relative; border-radius: 12px; overflow: hidden; height: 130px; margin-bottom: 8px;">
            <img src="${p.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'}" 
                 style="width: 100%; height: 100%; object-fit: cover;" />
            <span style="position: absolute; top: 6px; left: 6px; background: rgba(15,23,42,0.85); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px; backdrop-filter: blur(4px);">
              ${p.transactionType === 'rent' ? 'Cho thuê' : 'Đang bán'}
            </span>
          </div>
          <p style="margin: 0; font-size: 15px; font-weight: 800; color: #059669; letter-spacing: -0.3px;">${priceText}</p>
          <h4 style="margin: 4px 0 6px 0; font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.35; max-height: 32px; overflow: hidden;">${p.title}</h4>
          <p style="margin: 0 0 10px 0; font-size: 11px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">📍 ${p.district || ''}, ${p.city || ''} · ${p.area || 0}m²</p>
          <a href="/client/property/${p.id}" style="display: block; text-align: center; background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff; text-decoration: none; padding: 8px 12px; border-radius: 10px; font-size: 12px; font-weight: 700; box-shadow: 0 4px 12px rgba(5,150,105,0.25);">
            Xem chi tiết BĐS →
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectProperty) onSelectProperty(p);
      });

      markersRef.current.push(marker);
      bounds.extend([lat, lng]);
    });

    // Only fitBounds if user hasn't explicitly focused on userLocation
    if (!userLocation && properties.length > 1 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [mode, properties, selectedPropertyId, onSelectProperty, userLocation]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%' }}
      className={`relative z-0 isolate rounded-2xl overflow-hidden shadow-sm border border-slate-200 ${className}`}
    />
  );
};
