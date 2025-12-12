
import { User, PrivacyPreferences, AuthResponse, JournalEntry, Goal, Reminder, Provider, Appointment, Article, UserContentProgress, IntegrationConnection, GenomicUpload, ExternalOrder, AuditLog, AccessPolicy, HealthReport, Plan, Subscription, Payment, Entitlement, CycleData, SymptomLog } from '../types';
import { cryptoService } from './cryptoService';

// Simulating database latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// LocalStorage keys - Versioned to reset data for fresh demo
// CHANGED TO V3 TO WIPE OLD DATA
const USERS_KEY = 'shethrive_users_v3';
const JOURNAL_KEY = 'shethrive_journal_v3';
const GOALS_KEY = 'shethrive_goals_v3';
const REMINDERS_KEY = 'shethrive_reminders_v3';
const APPOINTMENTS_KEY = 'shethrive_appointments_v3';
const INTEGRATIONS_KEY = 'shethrive_integrations_v3';
const AUDIT_KEY = 'shethrive_audit_logs_v3';
const CONTENT_PROGRESS_KEY = 'shethrive_content_progress_v3';
const HEALTH_REPORTS_KEY = 'shethrive_health_reports_v3';
const SUBSCRIPTIONS_KEY = 'shethrive_subscriptions_v3';
const PAYMENTS_KEY = 'shethrive_payments_v3';
const CYCLE_KEY = 'shethrive_cycle_data_v3';
const LOGS_KEY = 'shethrive_symptom_logs_v3';

// Mock DB helpers
const getDbUsers = (): User[] => {
  let users: User[] = [];
  try {
    const usersJson = localStorage.getItem(USERS_KEY);
    if (usersJson) {
      users = JSON.parse(usersJson);
    }
  } catch (e) {
    console.error("Error parsing users from local storage", e);
    users = [];
  }

  // Ensure default user ALWAYS exists for demo purposes
  const defaultEmail = 'sarah@example.com';
  if (!users.find(u => u.email === defaultEmail)) {
    const defaultUser: User = {
      id: 'mock-user-1',
      email: defaultEmail,
      firstName: 'Sarah',
      lastName: 'Doe',
      isEmailVerified: true,
      isOnboardingComplete: false, // Reset to false to trigger onboarding flow
      dateOfBirth: '', // Reset to trigger profiling
      gender: '',
      location: ''
    };
    users.push(defaultUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Also ensure privacy prefs exist for the default user
    if (!localStorage.getItem(`privacy_${defaultUser.id}`)) {
        localStorage.setItem(`privacy_${defaultUser.id}`, JSON.stringify({
            dataSharing: 'opt_out',
            marketingEmails: 'opt_out',
            locationTracking: 'disabled',
            anonymizedAnalytics: 'enabled'
        }));
    }
  }
  
  return users;
};

const saveDbUser = (user: User) => {
  const users = getDbUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Generic helper for other entities
const getEntities = <T>(key: string): T[] => {
    try {
        const json = localStorage.getItem(key);
        return json ? JSON.parse(json) : [];
    } catch {
        return [];
    }
}

const saveEntities = <T>(key: string, entities: T[]) => {
    localStorage.setItem(key, JSON.stringify(entities));
}

// Mock Content Data
const MOCK_ARTICLES: Article[] = [
    {
        id: 'art-1',
        title: 'Understanding the Four Phases of Your Cycle',
        description: 'A deep dive into how hormones shift throughout the month and affect your energy.',
        content: '<p>The menstrual cycle is more than just your period. It consists of four distinct phases: Menstrual, Follicular, Ovulatory, and Luteal...</p>',
        author: 'Dr. Emily Chen',
        categoryId: 'cat-1',
        tags: ['Education', 'Hormones'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=400',
        publishedDate: '2023-10-01T10:00:00Z',
        readTimeMinutes: 5
    },
    {
        id: 'art-2',
        title: 'Nutrition for the Luteal Phase',
        description: 'What to eat to combat cravings and stabilize mood before your period.',
        content: '<p>During the luteal phase, progesterone rises. This can lead to cravings for carbohydrates...</p>',
        author: 'Sarah Johnson, Nutritionist',
        categoryId: 'cat-2',
        tags: ['Nutrition', 'PMS'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400',
        publishedDate: '2023-10-15T10:00:00Z',
        readTimeMinutes: 8
    },
    {
        id: 'art-3',
        title: 'Sleep Hygiene 101',
        description: 'Simple tips to improve your sleep quality tonight.',
        content: '<p>Sleep is foundational to health. Start by setting a consistent bedtime...</p>',
        author: 'Dr. Alisha Patel',
        categoryId: 'cat-3',
        tags: ['Sleep', 'Wellness'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1541781777621-af13b299e569?auto=format&fit=crop&q=80&w=400',
        publishedDate: '2023-10-20T10:00:00Z',
        readTimeMinutes: 4
    }
];

// Mock Providers Data
const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'prov-1',
    name: 'Dr. Emily Chen',
    specialty: 'Gynecology & Fertility',
    bio: 'Specialist in holistic fertility treatments and menstrual health with 10+ years of experience.',
    rates: { amount: 12000, currency: 'USD' }, // $120.00
    availableSlots: [
      new Date(Date.now() + 86400000 * 1).toISOString(), // Tomorrow
      new Date(Date.now() + 86400000 * 2).toISOString(),
    ],
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'prov-2',
    name: 'Dr. Sarah Johnson',
    specialty: 'Nutritionist',
    bio: 'Certified nutritionist focusing on hormonal balance through diet and lifestyle changes.',
    rates: { amount: 8000, currency: 'USD' }, // $80.00
    availableSlots: [
      new Date(Date.now() + 86400000 * 1.5).toISOString(),
      new Date(Date.now() + 86400000 * 3).toISOString(),
    ],
    imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'prov-3',
    name: 'Dr. Alisha Patel',
    specialty: 'Mental Health Counselor',
    bio: 'Therapist specializing in anxiety and stress management for women.',
    rates: { amount: 10000, currency: 'USD' }, // $100.00
    availableSlots: [
      new Date(Date.now() + 86400000 * 0.5).toISOString(),
    ],
    imageUrl: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

// Mock Plans
const MOCK_PLANS: Plan[] = [
  {
    id: 'plan_free',
    name: 'Basic',
    description: 'Essential tracking and logging.',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: ['Cycle Tracking', 'Symptom Logging', 'Basic Education']
  },
  {
    id: 'plan_premium',
    name: 'Premium',
    description: 'Advanced insights and personalization.',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    features: ['AI Health Insights', 'Trend Analysis', 'Secure Journal', 'Unlimited Reminders'],
    isFeatured: true
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    description: 'Full access to telehealth and genomics.',
    price: 19.99,
    currency: 'USD',
    interval: 'month',
    features: ['All Premium Features', 'Discounted Telehealth', 'Genomic Integration', 'Priority Support']
  }
];

export const mockBackend = {
  auth: {
    async register(email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> {
      await delay(800);
      const users = getDbUsers();
      if (users.find(u => u.email === email)) {
        throw new Error('Email already registered');
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        firstName,
        lastName,
        isEmailVerified: false, 
        isOnboardingComplete: false,
      };

      saveDbUser(newUser);

      // Create default privacy settings
      localStorage.setItem(`privacy_${newUser.id}`, JSON.stringify({
        dataSharing: 'opt_out',
        marketingEmails: 'opt_out',
        locationTracking: 'disabled',
        anonymizedAnalytics: 'enabled'
      }));

      return {
        user: newUser,
        accessToken: `mock_access_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`
      };
    },

    async login(email: string, password: string): Promise<AuthResponse> {
      await delay(600);
      const users = getDbUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      return {
        user,
        accessToken: `mock_access_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`
      };
    },

    async logout() {
      await delay(200);
      return true;
    }
  },

  user: {
    async getProfile(userId: string): Promise<User> {
      await delay(300);
      const users = getDbUsers();
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      return user;
    },

    async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
      await delay(500);
      const users = getDbUsers();
      const index = users.findIndex(u => u.id === userId);
      if (index === -1) throw new Error('User not found');

      const updatedUser = { ...users[index], ...updates };
      saveDbUser(updatedUser);
      return updatedUser;
    },

    async getPrivacyPreferences(userId: string): Promise<PrivacyPreferences> {
      await delay(300);
      const prefs = localStorage.getItem(`privacy_${userId}`);
      return prefs ? JSON.parse(prefs) : {
        dataSharing: 'opt_out',
        marketingEmails: 'opt_out',
        locationTracking: 'disabled',
        anonymizedAnalytics: 'enabled'
      };
    },

    async updatePrivacyPreferences(userId: string, prefs: PrivacyPreferences): Promise<PrivacyPreferences> {
      await delay(400);
      localStorage.setItem(`privacy_${userId}`, JSON.stringify(prefs));
      
      // Log this change in Audit Logs
      const logs = getEntities<AuditLog>(AUDIT_KEY);
      logs.push({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          actor: 'User',
          action: 'UPDATE_PRIVACY',
          resource: 'Privacy Preferences',
          status: 'ALLOWED',
          details: 'User updated data sharing settings.'
      });
      saveEntities(AUDIT_KEY, logs);

      return prefs;
    }
  },

  cycle: {
      async getCycle(userId: string): Promise<CycleData> {
          await delay(300);
          const allCycles = getEntities<CycleData>(CYCLE_KEY);
          const userCycle = allCycles.find(c => c.userId === userId);
          
          if (userCycle) return userCycle;
          
          // Return default if none found (e.g. legacy users or error)
          // Default to null-ish or generic that forces user to set it up if flow permits, 
          // but for dashboard safety we return a fallback.
          return {
              userId,
              startDate: new Date().toISOString().split('T')[0],
              length: 28,
              periodLength: 5
          };
      },

      async saveCycle(cycle: CycleData): Promise<CycleData> {
          await delay(400);
          const allCycles = getEntities<CycleData>(CYCLE_KEY);
          const index = allCycles.findIndex(c => c.userId === cycle.userId);
          
          if (index >= 0) {
              allCycles[index] = cycle;
          } else {
              allCycles.push(cycle);
          }
          saveEntities(CYCLE_KEY, allCycles);
          return cycle;
      }
  },

  logs: {
      async getLogs(userId: string): Promise<SymptomLog[]> {
          await delay(300);
          const allLogs = getEntities<SymptomLog>(LOGS_KEY);
          return allLogs.filter(l => l.userId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      
      async createLog(userId: string, log: Omit<SymptomLog, 'id' | 'userId'>): Promise<SymptomLog> {
          await delay(300);
          const allLogs = getEntities<SymptomLog>(LOGS_KEY);
          const newLog: SymptomLog = {
              ...log,
              id: crypto.randomUUID(),
              userId
          };
          allLogs.push(newLog);
          saveEntities(LOGS_KEY, allLogs);
          return newLog;
      }
  },

  journal: {
      async getEntries(userId: string): Promise<JournalEntry[]> {
          await delay(300);
          const allEntries = getEntities<JournalEntry>(JOURNAL_KEY);
          
          // Decrypt entries before returning
          const userEntries = allEntries.filter(e => e.userId === userId);
          const decryptedEntries = await Promise.all(userEntries.map(async (entry) => ({
            ...entry,
            content: await cryptoService.decrypt(entry.content, userId)
          })));

          return decryptedEntries.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
      },
      async createEntry(userId: string, entry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt'>): Promise<JournalEntry> {
          await delay(400);
          
          // Encrypt content before saving
          const encryptedContent = await cryptoService.encrypt(entry.content, userId);
          
          const allEntries = getEntities<JournalEntry>(JOURNAL_KEY);
          const newEntry: JournalEntry = {
              ...entry,
              id: crypto.randomUUID(),
              userId,
              content: encryptedContent, // Store encrypted
              createdAt: new Date().toISOString()
          };
          allEntries.push(newEntry);
          saveEntities(JOURNAL_KEY, allEntries);
          
          // Return decrypted version to UI
          return { ...newEntry, content: entry.content };
      },
      async deleteEntry(entryId: string) {
          await delay(300);
          const allEntries = getEntities<JournalEntry>(JOURNAL_KEY);
          const filtered = allEntries.filter(e => e.id !== entryId);
          saveEntities(JOURNAL_KEY, filtered);
      }
  },

  goals: {
      async getGoals(userId: string): Promise<Goal[]> {
          await delay(300);
          const allGoals = getEntities<Goal>(GOALS_KEY);
          return allGoals.filter(g => g.userId === userId);
      },
      async createGoal(userId: string, goal: Omit<Goal, 'id' | 'userId' | 'currentValue' | 'status'>): Promise<Goal> {
          await delay(400);
          const allGoals = getEntities<Goal>(GOALS_KEY);
          const newGoal: Goal = {
              ...goal,
              id: crypto.randomUUID(),
              userId,
              currentValue: 0,
              status: 'active'
          };
          allGoals.push(newGoal);
          saveEntities(GOALS_KEY, allGoals);
          return newGoal;
      },
      async updateProgress(goalId: string, value: number) {
          await delay(300);
          const allGoals = getEntities<Goal>(GOALS_KEY);
          const goalIndex = allGoals.findIndex(g => g.id === goalId);
          if (goalIndex >= 0) {
              allGoals[goalIndex].currentValue = value;
              saveEntities(GOALS_KEY, allGoals);
          }
      },
      async deleteGoal(goalId: string) {
          await delay(300);
          const allGoals = getEntities<Goal>(GOALS_KEY);
          saveEntities(GOALS_KEY, allGoals.filter(g => g.id !== goalId));
      }
  },

  reminders: {
      async getReminders(userId: string): Promise<Reminder[]> {
          await delay(300);
          const all = getEntities<Reminder>(REMINDERS_KEY);
          return all.filter(r => r.userId === userId);
      },
      async createReminder(userId: string, reminder: Omit<Reminder, 'id' | 'userId'>): Promise<Reminder> {
          await delay(400);
          const all = getEntities<Reminder>(REMINDERS_KEY);
          const newReminder: Reminder = {
              ...reminder,
              id: crypto.randomUUID(),
              userId
          };
          all.push(newReminder);
          saveEntities(REMINDERS_KEY, all);
          return newReminder;
      },
      async toggleActive(reminderId: string) {
          await delay(200);
          const all = getEntities<Reminder>(REMINDERS_KEY);
          const index = all.findIndex(r => r.id === reminderId);
          if (index >= 0) {
              all[index].isActive = !all[index].isActive;
              saveEntities(REMINDERS_KEY, all);
          }
      },
      async deleteReminder(reminderId: string) {
          await delay(300);
          const all = getEntities<Reminder>(REMINDERS_KEY);
          saveEntities(REMINDERS_KEY, all.filter(r => r.id !== reminderId));
      }
  },

  telehealth: {
    async getProviders(): Promise<Provider[]> {
      await delay(500);
      return MOCK_PROVIDERS;
    },
    
    async getAppointments(userId: string): Promise<Appointment[]> {
      await delay(300);
      const all = getEntities<Appointment>(APPOINTMENTS_KEY);
      return all.filter(a => a.userId === userId);
    },

    async bookAppointment(userId: string, providerId: string, slot: string, notes: string): Promise<Appointment> {
      await delay(1500); // Simulate payment processing time
      const provider = MOCK_PROVIDERS.find(p => p.id === providerId);
      if (!provider) throw new Error("Provider not found");

      const all = getEntities<Appointment>(APPOINTMENTS_KEY);
      const newAppt: Appointment = {
        id: crypto.randomUUID(),
        userId,
        providerId,
        startTime: slot,
        endTime: new Date(new Date(slot).getTime() + 30 * 60000).toISOString(), // 30 min slots
        status: 'booked',
        fee: provider.rates.amount,
        userNotes: notes,
        videoRoomId: `room_${crypto.randomUUID()}`
      };
      
      all.push(newAppt);
      saveEntities(APPOINTMENTS_KEY, all);
      
      // Log Audit
      const logs = getEntities<AuditLog>(AUDIT_KEY);
      logs.push({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          actor: 'User',
          action: 'BOOK_APPOINTMENT',
          resource: 'Telehealth',
          status: 'ALLOWED',
          details: `Booked appt with ${provider.name}`
      });
      saveEntities(AUDIT_KEY, logs);

      return newAppt;
    },

    async cancelAppointment(appointmentId: string) {
      await delay(800);
      const all = getEntities<Appointment>(APPOINTMENTS_KEY);
      const index = all.findIndex(a => a.id === appointmentId);
      if (index >= 0) {
        all[index].status = 'cancelled';
        saveEntities(APPOINTMENTS_KEY, all);
      }
    },

    async joinVideoCall(appointmentId: string): Promise<string> {
      await delay(1000);
      // In a real app, this would fetch a Twilio Token
      return `mock-twilio-token-for-${appointmentId}`;
    }
  },

  // Module 3: AI Persistence
  ai: {
      async getReports(userId: string): Promise<HealthReport[]> {
          await delay(300);
          const allReports = getEntities<HealthReport>(HEALTH_REPORTS_KEY);
          const userReports = allReports.filter(r => r.userId === userId);
          
          // Decrypt
          return Promise.all(userReports.map(async r => ({
              ...r,
              content: await cryptoService.decrypt(r.content, userId)
          })));
      },
      async saveReport(userId: string, content: string, type: 'daily_insight'): Promise<HealthReport> {
          await delay(400);
          const allReports = getEntities<HealthReport>(HEALTH_REPORTS_KEY);
          
          // Encrypt
          const encryptedContent = await cryptoService.encrypt(content, userId);
          
          const newReport: HealthReport = {
              id: crypto.randomUUID(),
              userId,
              date: new Date().toISOString().split('T')[0],
              content: encryptedContent,
              type,
              generatedAt: new Date().toISOString()
          };
          
          allReports.push(newReport);
          saveEntities(HEALTH_REPORTS_KEY, allReports);
          
          return { ...newReport, content }; // Return decrypted for immediate UI use
      }
  },
  
  // Module 5: Content
  content: {
      async getArticles(): Promise<Article[]> {
          await delay(300);
          return MOCK_ARTICLES;
      },
      
      async getUserProgress(userId: string): Promise<UserContentProgress[]> {
          await delay(200);
          const all = getEntities<UserContentProgress>(CONTENT_PROGRESS_KEY);
          return all.filter(p => p.userId === userId);
      },

      async updateProgress(userId: string, contentId: string, status: 'started' | 'completed') {
          await delay(200);
          const all = getEntities<UserContentProgress>(CONTENT_PROGRESS_KEY);
          const index = all.findIndex(p => p.userId === userId && p.contentId === contentId);
          
          if (index >= 0) {
              all[index].status = status;
              all[index].lastAccessed = new Date().toISOString();
              if (status === 'completed') all[index].progressPercentage = 100;
          } else {
              all.push({
                  userId,
                  contentId,
                  status,
                  progressPercentage: status === 'completed' ? 100 : 10,
                  lastAccessed: new Date().toISOString()
              });
          }
          saveEntities(CONTENT_PROGRESS_KEY, all);
      }
  },

  // Module 6: Integrations
  integrations: {
      async getConnections(userId: string): Promise<IntegrationConnection[]> {
          await delay(300);
          const all = getEntities<IntegrationConnection>(INTEGRATIONS_KEY);
          return all.filter(c => c.userId === userId);
      },

      async connectDevice(userId: string, sourceType: IntegrationConnection['sourceType']): Promise<IntegrationConnection> {
          await delay(1200); // Simulate OAuth flow
          const all = getEntities<IntegrationConnection>(INTEGRATIONS_KEY);
          
          // Check if already connected
          const existing = all.find(c => c.userId === userId && c.sourceType === sourceType);
          if (existing) {
              existing.status = 'connected';
              existing.lastSync = new Date().toISOString();
              saveEntities(INTEGRATIONS_KEY, all);
              return existing;
          }

          const newConn: IntegrationConnection = {
              id: crypto.randomUUID(),
              userId,
              sourceType,
              status: 'connected',
              lastSync: new Date().toISOString(),
              externalUserId: `ext_user_${crypto.randomUUID().substr(0,8)}`
          };
          all.push(newConn);
          saveEntities(INTEGRATIONS_KEY, all);
          
          // Log Audit
          const logs = getEntities<AuditLog>(AUDIT_KEY);
          logs.push({
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              actor: 'User',
              action: 'CONNECT_INTEGRATION',
              resource: 'Integrations',
              status: 'ALLOWED',
              details: `Connected ${sourceType}`
          });
          saveEntities(AUDIT_KEY, logs);

          return newConn;
      },

      async disconnectDevice(id: string) {
          await delay(500);
          const all = getEntities<IntegrationConnection>(INTEGRATIONS_KEY);
          saveEntities(INTEGRATIONS_KEY, all.filter(c => c.id !== id));
      },

      async getGenomicUploads(userId: string): Promise<GenomicUpload[]> {
          await delay(200);
          // Return some mock uploads if any, logic similar to others
          return [];
      },
      
      async uploadGenomicData(userId: string, provider: '23andme' | 'ancestry' | 'direct', fileName: string) {
          await delay(2000); // Upload simulation
          // Log Audit
          const logs = getEntities<AuditLog>(AUDIT_KEY);
          logs.push({
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              actor: 'User',
              action: 'UPLOAD_GENOMICS',
              resource: 'Privacy Vault',
              status: 'ALLOWED',
              details: `Uploaded ${fileName} from ${provider}`
          });
          saveEntities(AUDIT_KEY, logs);
          return true;
      }
  },

  // Module 4: Audit Logs
  audit: {
      async getLogs(userId: string): Promise<AuditLog[]> {
          await delay(300);
          const all = getEntities<AuditLog>(AUDIT_KEY);
          return all.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
  },

  // Module 8: Subscription & Billing
  billing: {
    async getPlans(): Promise<Plan[]> {
      await delay(200);
      return MOCK_PLANS;
    },

    async getSubscription(userId: string): Promise<Subscription | null> {
      await delay(300);
      const all = getEntities<Subscription>(SUBSCRIPTIONS_KEY);
      const sub = all.find(s => s.userId === userId && s.status === 'active');
      return sub || null;
    },

    async createSubscription(userId: string, planId: string): Promise<Subscription> {
      await delay(1500); // Simulate Stripe processing
      const allSubs = getEntities<Subscription>(SUBSCRIPTIONS_KEY);
      
      // Cancel existing active subscription if any
      const existingIndex = allSubs.findIndex(s => s.userId === userId && s.status === 'active');
      if (existingIndex >= 0) {
        allSubs[existingIndex].status = 'cancelled';
      }

      const plan = MOCK_PLANS.find(p => p.id === planId);
      if (!plan) throw new Error("Plan not found");

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const newSub: Subscription = {
        id: crypto.randomUUID(),
        userId,
        planId,
        status: 'active',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        autoRenew: true
      };

      allSubs.push(newSub);
      saveEntities(SUBSCRIPTIONS_KEY, allSubs);

      // Create Payment Record
      const allPayments = getEntities<Payment>(PAYMENTS_KEY);
      allPayments.push({
        id: crypto.randomUUID(),
        userId,
        amount: plan.price,
        currency: plan.currency,
        status: 'succeeded',
        date: new Date().toISOString(),
        description: `Subscription to ${plan.name}`
      });
      saveEntities(PAYMENTS_KEY, allPayments);

      return newSub;
    },

    async getPayments(userId: string): Promise<Payment[]> {
      await delay(300);
      const all = getEntities<Payment>(PAYMENTS_KEY);
      return all.filter(p => p.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    async checkEntitlement(userId: string, feature: string): Promise<boolean> {
      const sub = await this.getSubscription(userId);
      if (!sub || sub.status !== 'active') return false;
      const plan = MOCK_PLANS.find(p => p.id === sub.planId);
      return plan?.features.includes(feature) || false;
    }
  }
};
