export type PropertyType = 'apartment' | 'house' | 'land' | 'office' | 'villa';
export type TransactionType = 'sale' | 'rent';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  transactionType: TransactionType;
  price: number;
  area: number;
  address: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  description: string;
  legalStatus?: string;
  ownerName?: string;
  distanceKm?: number;
}

export interface Deal {
  id: string;
  propertyId: string;
  dealStatus: string;
  depositAmount: number;
  price: number;
  createdAt: string;
  property?: Property;
  receiptId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'agent' | 'admin';
  avatar: string;
}
