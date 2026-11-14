import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type TabType = 'home' | 'gps' | 'deals' | 'favorites';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  favoritesCount?: number;
}

export function BottomTabBar({ activeTab, onTabChange, favoritesCount = 0 }: BottomTabBarProps) {
  const tabs = [
    { id: 'home' as TabType, label: 'Khám phá', icon: 'home', iconOutline: 'home-outline' },
    { id: 'gps' as TabType, label: 'Quanh đây', icon: 'navigate', iconOutline: 'navigate-outline' },
    { id: 'deals' as TabType, label: 'Ký quỹ', icon: 'shield-checkmark', iconOutline: 'shield-checkmark-outline' },
    { id: 'favorites' as TabType, label: 'Đã lưu', icon: 'heart', iconOutline: 'heart-outline', badge: favoritesCount },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.8}
            onPress={() => onTabChange(tab.id)}
            style={styles.tabItem}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name={(isActive ? tab.icon : tab.iconOutline) as any}
                size={22}
                color={isActive ? '#059669' : '#64748b'}
              />
              {!!tab.badge && tab.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 84 : 64,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    flex: 1,
  },
  iconWrap: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#059669',
    fontWeight: '900',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
});
