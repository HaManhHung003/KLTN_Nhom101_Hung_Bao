/**
 * Toàn bộ enum nghiệp vụ, giữ nguyên giá trị (string literal) khớp 100%
 * với type ở frontend web (web/src/types/index.ts) để không phải map lại.
 */

export enum UserRole {
  BUYER = 'buyer',
  AGENT = 'agent',
  ADMIN = 'admin',
}

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  LAND = 'land',
  OFFICE = 'office',
  VILLA = 'villa',
}

export enum TransactionType {
  SALE = 'sale',
  RENT = 'rent',
}

export enum LegalStatus {
  SO_HONG = 'so_hong',
  SO_DO = 'so_do',
  HOP_DONG = 'hop_dong',
  CHO_SO = 'cho_so',
}

export enum ListingStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  SOLD = 'sold',
  EXPIRED = 'expired',
  REJECTED = 'rejected',
}

export type PropertyStatus = ListingStatus;
export const PropertyStatus = ListingStatus;

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum TourType {
  IN_PERSON = 'in_person',
  VIDEO = 'video',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
}

export enum PaymentMethod {
  VNPAY = 'vnpay',
  MOMO = 'momo',
  BANK = 'bank',
}

export enum DealStatus {
  DEPOSIT_PAID = 'deposit_paid',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
}

export enum ReportStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export enum PoiCategory {
  SCHOOL = 'school',
  HOSPITAL = 'hospital',
  SUPERMARKET = 'supermarket',
  TRANSPORT = 'transport',
  PARK = 'park',
  MALL = 'mall',
}

export enum BlogPostStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export type BlogStatus = BlogPostStatus;
export const BlogStatus = BlogPostStatus;

export enum ContactStatus {
  NEW = 'new',
  READ = 'read',
  REPLIED = 'replied',
  CLOSED = 'closed',
}
