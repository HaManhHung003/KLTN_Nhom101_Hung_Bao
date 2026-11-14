import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../types';
import { PropertyCard } from '../components/PropertyCard';

interface HomeScreenProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export function HomeScreen({
  properties,
  onSelectProperty,
  favorites,
  onToggleFavorite,
  onRefresh,
  refreshing,
}: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'sale' | 'rent'>('all');

  const filteredProperties = properties.filter((p) => {
    const matchType = selectedType === 'all' || p.transactionType === selectedType;
    const matchSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <View style={styles.container}>
      {/* Top Header GPS */}
      <View style={styles.header}>
        <View>
          <View style={styles.gpsRow}>
            <Ionicons name="location" size={16} color="#059669" />
            <Text style={styles.gpsCity}>TP. Thủ Đức, TP. Hồ Chí Minh</Text>
            <Ionicons name="chevron-down" size={14} color="#64748b" />
          </View>
          <Text style={styles.appTitle}>BDS Pro Mobile</Text>
        </View>

        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>VB</Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBarWrap}>
        <Ionicons name="search" size={18} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm dự án, căn hộ, khu vực..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Transaction Filter Pills */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.tabBtn, selectedType === 'all' && styles.tabBtnActive]}
          onPress={() => setSelectedType('all')}
        >
          <Text style={[styles.tabText, selectedType === 'all' && styles.tabTextActive]}>Tất cả</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, selectedType === 'sale' && styles.tabBtnActive]}
          onPress={() => setSelectedType('sale')}
        >
          <Text style={[styles.tabText, selectedType === 'sale' && styles.tabTextActive]}>Mua bán</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, selectedType === 'rent' && styles.tabBtnActive]}
          onPress={() => setSelectedType('rent')}
        >
          <Text style={[styles.tabText, selectedType === 'rent' && styles.tabTextActive]}>Cho thuê</Text>
        </TouchableOpacity>
      </View>

      {/* Main List */}
      <FlatList
        data={filteredProperties}
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Không tìm thấy bất động sản phù hợp</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gpsCity: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#ffffff',
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
});
