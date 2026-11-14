import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../types';
import { PropertyCard } from '../components/PropertyCard';

interface FavoritesScreenProps {
  properties: Property[];
  favorites: string[];
  onSelectProperty: (property: Property) => void;
  onToggleFavorite: (id: string) => void;
}

export function FavoritesScreen({
  properties,
  favorites,
  onSelectProperty,
  onToggleFavorite,
}: FavoritesScreenProps) {
  const favoriteProperties = properties.filter((p) => favorites.includes(p.id));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="heart" size={24} color="#ef4444" />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.headerTitle}>Bất động sản Đã lưu</Text>
          <Text style={styles.headerSub}>Danh sách ({favoriteProperties.length}) căn bạn quan tâm</Text>
        </View>
      </View>

      <FlatList
        data={favoriteProperties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => onSelectProperty(item)}
            isFavorite={true}
            onToggleFavorite={() => onToggleFavorite(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="heart-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Bạn chưa lưu bất động sản nào</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  listContent: {
    padding: 16,
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
});
