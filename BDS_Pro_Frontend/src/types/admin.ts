import type { LegalStatus, PropertyType, TransactionType } from '@/types'

export type RiskLevel = 'low' | 'medium' | 'high'

export type ValidationStatus = 'passed' | 'failed' | 'warning'

export interface ValidationCheck {
  id: string
  label: string
  status: ValidationStatus
  detail?: string
}

export interface ModerationQueueItem {
  id: string
  propertyId: string
  title: string
  thumbnail: string
  brokerName: string
  submittedAt: string
  riskScore: RiskLevel
  price: number
  transactionType: TransactionType
  type: PropertyType
  area: number
  address: string
  district: string
  city: string
  description: string
  legalStatus: LegalStatus
  bedrooms?: number
  bathrooms?: number
  amenities: string[]
  validationChecks: ValidationCheck[]
}

export interface AuditLogEntry {
  id: string
  actor: string
  actorRole: 'broker' | 'admin' | 'buyer' | 'system'
  action: string
  target?: string
  timestamp: string
}

export interface DailyListingPoint {
  day: string
  newListings: number
  approvedListings: number
}

export interface TransactionVolumePoint {
  day: string
  volume: number
  count: number
}

export const REJECTION_REASONS = [
  'Invalid legal document',
  'Misleading price',
  'Duplicate listing',
  'Incomplete property information',
  'Suspicious or stock images detected',
  'Policy violation — contact required',
] as const

export type RejectionReason = (typeof REJECTION_REASONS)[number]
