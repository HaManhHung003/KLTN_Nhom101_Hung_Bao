import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Property } from './src/types';
import { propertyService } from './src/services/property.service';
import { HomeScreen } from './src/screens/HomeScreen';
import { GpsSearchScreen } from './src/screens/GpsSearchScreen';
import { DealsScreen } from './src/screens/DealsScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { PropertyDetailScreen } from './src/screens/PropertyDetailScreen';
import { BottomTabBar, TabType } from './src/components/BottomTabBar';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [favorites, setFavorites] = useState<string[]>(['p1', 'p2']);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    const data = await propertyService.getProperties();
    setProperties(data);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {selectedProperty ? (
          <PropertyDetailScreen
            property={selectedProperty}
            onBack={() => setSelectedProperty(null)}
            isFavorite={favorites.includes(selectedProperty.id)}
            onToggleFavorite={() => handleToggleFavorite(selectedProperty.id)}
            onDepositSuccess={() => {
              setActiveTab('deals');
            }}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeScreen
                properties={properties}
                onSelectProperty={setSelectedProperty}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onRefresh={loadData}
                refreshing={refreshing}
              />
            )}

            {activeTab === 'gps' && (
              <GpsSearchScreen
                properties={properties}
                onSelectProperty={setSelectedProperty}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {activeTab === 'deals' && (
              <DealsScreen
                onSelectPropertyId={(id) => {
                  const target = properties.find((p) => p.id === id);
                  if (target) setSelectedProperty(target);
                }}
              />
            )}

            {activeTab === 'favorites' && (
              <FavoritesScreen
                properties={properties}
                favorites={favorites}
                onSelectProperty={setSelectedProperty}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {/* Bottom Tab Navigation Bar */}
            <BottomTabBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              favoritesCount={favorites.length}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});
