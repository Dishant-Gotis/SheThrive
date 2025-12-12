

export enum CyclePhase {
  MENSTRUAL = 'Menstrual',
  FOLLICULAR = 'Follicular',
  OVULATION = 'Ovulation',
  LUTEAL = 'Luteal',
}

export enum Mood {
  HAPPY = 'Happy',
  SAD = 'Sad',
  ANXIOUS = 'Anxious',
  ENERGETIC = 'Energetic',
  TIRED = 'Tired',
  IRRITABLE = 'Irritable',
}

export interface SymptomLog {
  id: string;
  userId?: string; // Added userId
  date: string;
  symptoms: string[];
  severity: number; // 1-10
  mood: Mood;
  notes?: string;
}

export interface CycleData {
  userId?: string; // Added userId
  startDate: string;
  length: number;
  periodLength: number;
}

export interface DailyInsight {
  title: string;
  description: string;
  category: 'nutrition' | 'fitness' | 'mental' | 'sleep';
}

// User Management Module Types

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  location?: string;
  isEmailVerified: boolean;
  isOnboardingComplete: boolean;
}

export interface UserProfile extends User {
  goal: string; // Kept for backward compatibility with existing components
  name?: string;
  age?: number;
}

export interface PrivacyPreferences {
  dataSharing: 'opt_in' | 'opt_out';
  marketingEmails: 'opt_in' | 'opt_out';
  locationTracking: 'enabled' | 'disabled';
  anonymizedAnalytics: 'enabled' | 'disabled';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Core Health Tracking Types

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string; // Ideally encrypted string in real backend
  entryDate: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate?: string;
  goalType: 'hydration' | 'activity' | 'sleep' | 'nutrition' | 'mindfulness' | 'other';
  status: 'active' | 'completed' | 'archived';
}

export interface Reminder {
  id: string;
  userId: string;
  name: string;
  dosage?: string;
  frequency: 'daily' | 'weekly' | 'specific_days';
  time: string; // HH:MM
  isActive: boolean;
  notes?: string;
}

// Telehealth Module Types
export interface Provider {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  rates: {
    amount: number; // in cents
    currency: string;
  };
  imageUrl?: string;
  availableSlots: string[]; // ISO timestamps of available slots
}

export interface Appointment {
  id: string;
  userId: string;
  providerId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: 'booked' | 'completed' | 'cancelled';
  fee: number;
  videoRoomId?: string;
  userNotes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// Module 3: AI Persistence
export interface HealthReport {
  id: string;
  userId: string;
  date: string;
  content: string; // Encrypted content
  type: 'daily_insight' | 'weekly_summary';
  generatedAt: string;
}

// Module 4: Privacy & Security Types
export interface AccessPolicy {
    id: string;
    userId: string;
    resource: string; // e.g., 'HEALTH_DATA'
    action: 'READ' | 'WRITE' | 'SHARE';
    targetEntity: string; // e.g., 'AI_ENGINE'
    status: 'ACTIVE' | 'INACTIVE';
}

export interface AuditLog {
    id: string;
    timestamp: string;
    actor: string; // e.g., 'AI_ENGINE', 'Dr. Smith'
    action: string; // e.g., 'READ_SYMPTOMS'
    resource: string;
    status: 'ALLOWED' | 'DENIED';
    details?: string;
}

export interface PrivacyKey {
    id: string;
    keyType: 'DATA_ENCRYPTION' | 'MASTER';
    status: 'ACTIVE' | 'ROTATED';
    createdAt: string;
}

// Module 5: Content & Education Types
export interface Category {
    id: string;
    name: string;
}

export interface Tag {
    id: string;
    name: string;
}

export interface Article {
    id: string;
    title: string;
    description: string;
    content: string; // HTML or Markdown
    author: string;
    categoryId: string;
    tags: string[];
    thumbnailUrl: string;
    publishedDate: string;
    readTimeMinutes: number;
}

export interface UserContentProgress {
    contentId: string;
    userId: string;
    status: 'not_started' | 'started' | 'completed';
    progressPercentage: number;
    lastAccessed: string;
}

// Module 6: Integrations Types
export interface IntegrationConnection {
    id: string;
    userId: string;
    sourceType: 'apple_health' | 'google_fit' | 'oura' | 'fitbit' | '23andme';
    status: 'connected' | 'disconnected' | 'error';
    lastSync: string | null;
    externalUserId?: string;
}

export interface GenomicUpload {
    id: string;
    userId: string;
    fileName: string;
    provider: '23andme' | 'ancestry' | 'direct';
    status: 'processing' | 'completed' | 'failed';
    uploadDate: string;
}

export interface ExternalOrder {
    id: string;
    userId: string;
    serviceType: 'pharmacy' | 'lab';
    providerName: string;
    details: string;
    status: 'pending' | 'shipped' | 'completed';
    date: string;
}

// Module 8: Subscription & Billing Types
export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  isFeatured?: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  date: string;
  description: string;
}

export interface Entitlement {
  feature: string;
  hasAccess: boolean;
}