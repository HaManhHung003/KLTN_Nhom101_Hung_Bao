import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { AiChatbotModal } from '../components/AiChatbotModal';
import { PostPropertyModal } from '../components/PostPropertyModal';

interface HomeScreenProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  onOpenProfile?: () => void;
  onPropertyCreated?: (newProp: Property) => void;
}

export function HomeScreen({
  properties,
  onSelectProperty,
  favorites,
  onToggleFavorite,
  onRefresh,
  refreshing,
  onOpenProfile,
  onPropertyCreated,
}: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'sale' | 'rent'>('all');
  const [showAiModal, setShowAiModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

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

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.postBtnHeader}
            activeOpacity={0.8}
            onPress={() => setShowPostModal(true)}
          >
            <Ionicons name="add-circle" size={18} color="#059669" />
            <Text style={styles.postBtnText}>Đăng tin</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.avatarWrap} onPress={onOpenProfile}>
            <Text style={styles.avatarText}>VB</Text>
          </TouchableOpacity>
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

      {/* Floating AI Assistant Button */}
      <TouchableOpacity
        style={styles.floatingAiBtn}
        activeOpacity={0.88}
        onPress={() => setShowAiModal(true)}
      >
        <Ionicons name="sparkles" size={18} color="#ffffff" />
        <Text style={styles.floatingAiText}>Trợ lý AI</Text>
      </TouchableOpacity>

      {/* AI Chatbot Modal */}
      <AiChatbotModal
        visible={showAiModal}
        onClose={() => setShowAiModal(false)}
        properties={properties}
        onSelectProperty={onSelectProperty}
      />

      {/* Post Property Modal */}
      <PostPropertyModal
        visible={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSuccess={(newProp) => {
          if (onPropertyCreated) onPropertyCreated(newProp);
          onRefresh();
        }}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  postBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  postBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
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
  floatingAiBtn: {
    position: 'absolute',
    bottom: 80,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  floatingAiText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
