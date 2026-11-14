import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../types';
import { formatPrice, formatArea } from '../utils/format';

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function PropertyCard({ property, onPress, isFavorite = false, onToggleFavorite }: PropertyCardProps) {
  const imageUrl = property.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        
        {/* Badge Transaction Type */}
        <View style={[styles.badge, property.transactionType === 'rent' ? styles.rentBadge : styles.saleBadge]}>
          <Text style={styles.badgeText}>
            {property.transactionType === 'rent' ? 'CHO THUÊ' : 'BÁN'}
          </Text>
        </View>

        {/* Favorite Heart Button */}
        {onToggleFavorite && (
          <TouchableOpacity activeOpacity={0.8} onPress={onToggleFavorite} style={styles.favoriteButton}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#ef4444' : '#ffffff'} />
          </TouchableOpacity>
        )}

        {/* Distance Badge if available */}
        {property.distanceKm !== undefined && (
          <View style={styles.distanceBadge}>
            <Ionicons name="navigate-outline" size={12} color="#ffffff" />
            <Text style={styles.distanceText}>Cách {property.distanceKm} km</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(property.price, property.transactionType)}</Text>
          <View style={styles.legalBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#059669" />
            <Text style={styles.legalText}>Sổ hồng</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {property.title}
        </Text>

        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={14} color="#64748b" />
          <Text style={styles.address} numberOfLines={1}>
            {property.district ? `${property.district}, ${property.city}` : property.address}
          </Text>
        </View>

        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Ionicons name="scan-outline" size={14} color="#059669" />
            <Text style={styles.specText}>{formatArea(property.area)}</Text>
          </View>

          {property.bedrooms ? (
            <View style={styles.specItem}>
              <Ionicons name="bed-outline" size={14} color="#0284c7" />
              <Text style={styles.specText}>{property.bedrooms} PN</Text>
            </View>
          ) : null}

          {property.bathrooms ? (
            <View style={styles.specItem}>
              <Ionicons name="water-outline" size={14} color="#8b5cf6" />
              <Text style={styles.specText}>{property.bathrooms} WC</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 190,
    backgroundColor: '#e2e8f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  saleBadge: {
    backgroundColor: 'rgba(5, 150, 105, 0.92)',
  },
  rentBadge: {
    backgroundColor: 'rgba(2, 132, 199, 0.92)',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  price: {
    fontSize: 19,
    fontWeight: '900',
    color: '#059669',
  },
  legalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  legalText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 21,
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  address: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
});
