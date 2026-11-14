import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../types';
import { propertyService } from '../services/property.service';
import { PropertyCard } from '../components/PropertyCard';

interface GpsSearchScreenProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export function GpsSearchScreen({
  properties,
  onSelectProperty,
  favorites,
  onToggleFavorite,
}: GpsSearchScreenProps) {
  // Tọa độ GPS giả định: TP. Thủ Đức (10.8231, 106.7718)
  const userLat = 10.8231;
  const userLng = 106.7718;

  const [selectedRadius, setSelectedRadius] = useState<number>(5); // 5km

  // Tính khoảng cách tới từng BĐS và sắp xếp gần nhất
  const propertiesWithDistance = properties
    .map((p) => {
      const dist = propertyService.calculateDistance(userLat, userLng, p.latitude, p.longitude);
      return { ...p, distanceKm: dist };
    })
    .filter((p) => selectedRadius === 0 || p.distanceKm <= selectedRadius)
    .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  return (
    <View style={styles.container}>
      {/* Radar Info Header */}
      <View style={styles.radarHeader}>
        <View style={styles.beaconWrap}>
          <View style={styles.beaconOuter} />
          <View style={styles.beaconCore}>
            <Ionicons name="navigate" size={16} color="#ffffff" />
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.radarTitle}>Tìm kiếm theo Bán kính GPS</Text>
          <Text style={styles.radarSub}>
            Đang quét BĐS quanh vị trí của bạn (TP. Thủ Đức, TP.HCM)
          </Text>
        </View>
      </View>

      {/* Radius Filters */}
      <View style={styles.radiusTabs}>
        {[
          { label: '1 km', value: 1 },
          { label: '3 km', value: 3 },
          { label: '5 km', value: 5 },
          { label: '10 km', value: 10 },
          { label: 'Tất cả', value: 0 },
        ].map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[styles.radiusBtn, selectedRadius === item.value && styles.radiusBtnActive]}
            onPress={() => setSelectedRadius(item.value)}
          >
            <Text
              style={[styles.radiusBtnText, selectedRadius === item.value && styles.radiusBtnTextActive]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Result Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          Tìm thấy <Text style={{ color: '#059669', fontWeight: '800' }}>{propertiesWithDistance.length}</Text> bất động sản gần bạn
        </Text>
      </View>

      {/* Property List with Distance */}
      <FlatList
        data={propertiesWithDistance}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => onSelectProperty(item)}
            isFavorite={favorites.includes(item.id)}
            onToggleFavorite={() => onToggleFavorite(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="navigate-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>
              Không có BĐS nào trong bán kính {selectedRadius} km
            </Text>
            <TouchableOpacity style={styles.expandBtn} onPress={() => setSelectedRadius(10)}>
              <Text style={styles.expandBtnText}>Mở rộng bán kính lên 10 km</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  radarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#a7f3d0',
  },
  beaconWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beaconOuter: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(5, 150, 105, 0.25)',
  },
  beaconCore: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#065f46',
  },
  radarSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  radiusTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  radiusBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  radiusBtnActive: {
    backgroundColor: '#059669',
  },
  radiusBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  radiusBtnTextActive: {
    color: '#ffffff',
  },
  countRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 12,
    color: '#64748b',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
  },
  expandBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  expandBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
