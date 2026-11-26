import React, { createContext, useContext, useEffect, useState } from 'react';
import { reverseGeocode, type Coordinates } from '@/utils/location';

interface LocationContextType {
  userLocation: Coordinates | null;
  userAddress: string | null;
  isLocating: boolean;
  locationError: string | null;
  refreshLocation: () => Promise<Coordinates | null>;
  setCustomLocation: (coords: Coordinates | null, address?: string | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_LAT = 'bds_user_lat';
const STORAGE_LNG = 'bds_user_lng';
const STORAGE_ADDR = 'bds_user_address';

const DEFAULT_COORDS: Coordinates = {
  lat: 10.7769,
  lng: 106.7009,
};
const DEFAULT_ADDR = 'TP. Hồ Chí Minh (Mặc định)';

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(() => {
    const lat = localStorage.getItem(STORAGE_LAT);
    const lng = localStorage.getItem(STORAGE_LNG);
    if (lat && lng) {
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    }
    return null;
  });

  const [userAddress, setUserAddress] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_ADDR) || null;
  });

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const detectLocation = async (): Promise<Coordinates | null> => {
    if (!navigator.geolocation) {
      setLocationError('Trình duyệt không hỗ trợ Geolocation GPS.');
      if (!userLocation) {
        setUserLocation(DEFAULT_COORDS);
        setUserAddress(DEFAULT_ADDR);
      }
      return null;
    }

    setIsLocating(true);
    setLocationError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(coords);
          localStorage.setItem(STORAGE_LAT, String(coords.lat));
          localStorage.setItem(STORAGE_LNG, String(coords.lng));

          // Tự động phân tích Reverse Geocoding thành địa chỉ đường / phường / quận tiếng Việt
          try {
            const addr = await reverseGeocode(coords.lat, coords.lng);
            setUserAddress(addr);
            localStorage.setItem(STORAGE_ADDR, addr);
          } catch {
            const fallbackAddr = `GPS (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
            setUserAddress(fallbackAddr);
          }

          setIsLocating(false);
          resolve(coords);
        },
        (error) => {
          console.warn('Tự động định vị:', error.message);
          setLocationError(error.message);
          setIsLocating(false);

          // Nếu chưa có vị trí lưu từ trước, dùng vị trí mặc định TP.HCM
          if (!userLocation) {
            setUserLocation(DEFAULT_COORDS);
            setUserAddress(DEFAULT_ADDR);
            resolve(DEFAULT_COORDS);
          } else {
            resolve(userLocation);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 300000, // 5 phút cache
        }
      );
    });
  };

  // Tự động định vị ngay khi vào website / ứng dụng (Auto Geolocation on Mount)
  useEffect(() => {
    detectLocation();
  }, []);

  const setCustomLocation = (coords: Coordinates | null, address?: string | null) => {
    setUserLocation(coords);
    if (coords) {
      localStorage.setItem(STORAGE_LAT, String(coords.lat));
      localStorage.setItem(STORAGE_LNG, String(coords.lng));
    }
    if (address !== undefined) {
      setUserAddress(address);
      if (address) {
        localStorage.setItem(STORAGE_ADDR, address);
      } else {
        localStorage.removeItem(STORAGE_ADDR);
      }
    }
  };

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        userAddress,
        isLocating,
        locationError,
        refreshLocation: detectLocation,
        setCustomLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useUserLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useUserLocation must be used within a LocationProvider');
  }
  return context;
};

