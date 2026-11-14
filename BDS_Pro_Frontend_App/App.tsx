import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Property } from './src/types';
import { propertyService } from './src/services/property.service';
import { AuthProvider } from './src/context/AuthContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { GpsSearchScreen } from './src/screens/GpsSearchScreen';
import { DealsScreen } from './src/screens/DealsScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { PropertyDetailScreen } from './src/screens/PropertyDetailScreen';
import { BottomTabBar, TabType } from './src/components/BottomTabBar';

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [favorites, setFavorites] = useState<string[]>(['p1', 'p2']);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    const [propsData, favsData] = await Promise.all([
      propertyService.getProperties(),
      propertyService.getFavorites(),
    ]);
    setProperties(propsData);
    if (favsData && favsData.length > 0) {
      setFavorites(favsData);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleFavorite = async (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    await propertyService.toggleFavorite(id);
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
                onOpenProfile={() => setActiveTab('profile')}
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

            {activeTab === 'profile' && (
              <ProfileScreen
                onNavigateToDeals={() => setActiveTab('deals')}
                onNavigateToFavorites={() => setActiveTab('favorites')}
              />
            )}

            {/* Bottom Tab Navigation Bar (5 tabs) */}
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

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
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
