import { supabase, isSupabaseConfigured } from './supabaseClient';
import { 
  User, 
  PrivacyPreferences, 
  CycleData, 
  SymptomLog, 
  JournalEntry, 
  Goal, 
  Reminder,
  Appointment,
  HealthReport,
  AuditLog,
  IntegrationConnection,
  Subscription as SubscriptionType,
  Payment,
  UserContentProgress
} from '../types';

// Helper to convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = toCamelCase(obj[key]);
    return acc;
  }, {} as any);
};

// Helper to convert camelCase to snake_case
const toSnakeCase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    acc[snakeKey] = toSnakeCase(obj[key]);
    return acc;
  }, {} as any);
};

// =============================================
// USER SERVICE
// =============================================
export const userService = {
  async createUser(firebaseUid: string, email: string, firstName?: string, lastName?: string): Promise<User> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: firebaseUid,
        email,
        first_name: firstName || '',
        last_name: lastName || '',
        is_email_verified: true,
        is_onboarding_complete: false
      })
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  async getUser(userId: string): Promise<User | null> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return toCamelCase(data);
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const snakeCaseUpdates = toSnakeCase(updates);
    snakeCaseUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('users')
      .update(snakeCaseUpdates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  async getOrCreateUser(firebaseUid: string, email: string, firstName?: string, lastName?: string): Promise<User> {
    const existingUser = await this.getUser(firebaseUid);
    if (existingUser) return existingUser;
    return this.createUser(firebaseUid, email, firstName, lastName);
  }
};

// =============================================
// PRIVACY SERVICE
// =============================================
export const privacyService = {
  async getPreferences(userId: string): Promise<PrivacyPreferences | null> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('privacy_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return toCamelCase(data);
  },

  async updatePreferences(userId: string, prefs: Partial<PrivacyPreferences>): Promise<PrivacyPreferences> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const snakeCasePrefs = toSnakeCase(prefs);
    snakeCasePrefs.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('privacy_preferences')
      .upsert({ user_id: userId, ...snakeCasePrefs })
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  }
};

// =============================================
// CYCLE DATA SERVICE
// =============================================
export const cycleService = {
  async getCycle(userId: string): Promise<CycleData | null> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('cycle_data')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return toCamelCase(data);
  },

  async upsertCycle(userId: string, cycleData: Partial<CycleData>): Promise<CycleData> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const snakeCaseData = toSnakeCase(cycleData);
    snakeCaseData.user_id = userId;
    snakeCaseData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('cycle_data')
      .upsert(snakeCaseData, { onConflict: 'user_id' })
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  }
};

// =============================================
// SYMPTOM LOGS SERVICE
// =============================================
export const symptomLogsService = {
  async getLogs(userId: string): Promise<SymptomLog[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('symptom_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(toCamelCase);
  },

  async addLog(userId: string, log: Omit<SymptomLog, 'id'>): Promise<SymptomLog> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const snakeCaseLog = toSnakeCase(log);
    snakeCaseLog.user_id = userId;
    
    const { data, error } = await supabase
      .from('symptom_logs')
      .insert(snakeCaseLog)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  async updateLog(logId: string, updates: Partial<SymptomLog>): Promise<SymptomLog> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('symptom_logs')
      .update(toSnakeCase(updates))
      .eq('id', logId)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  async deleteLog(logId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('symptom_logs')
      .delete()
      .eq('id', logId);
    
    if (error) throw error;
  }
};

// =============================================
// JOURNAL SERVICE
// =============================================
export const journalService = {
  async getEntries(userId: string): Promise<JournalEntry[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(toCamelCase);
  },

  async addEntry(userId: string, entry: Omit<JournalEntry, 'id' | 'createdAt'>): Promise<JournalEntry> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const snakeCaseEntry = toSnakeCase(entry);
    snakeCaseEntry.user_id = userId;
    
    const { data, error } = await supabase
      .from('journal_entries')
      .insert(snakeCaseEntry)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  async updateEntry(entryId: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('journal_entries')
      .update(toSnakeCase(updates))
      .eq('id', entryId)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  async deleteEntry(entryId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId);
    
    if (error) throw error;
  }
};

// =============================================
// GOALS SERVICE
// =============================================
export const goalsService = {
  async getGoals(userId: string): Promise<Goal[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(toCamelCase);
  },

  async addGoal(userId: string, goal: Omit<Goal, 'id'>): Promise<Goal> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const snakeCaseGoal = toSnakeCase(goal);
    snakeCaseGoal.user_id = userId;
    
    const { data, error } = await supabase
      .from('goals')
      .insert(snakeCaseGoal)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('goals')
      .update(toSnakeCase(updates))
      .eq('id', goalId)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  async deleteGoal(goalId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);
    
    if (error) throw error;
  }
};

// =============================================
// REMINDERS SERVICE
// =============================================
export const remindersService = {
  async getReminders(userId: string): Promise<Reminder[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('time', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(toCamelCase);
  },

  async addReminder(userId: string, reminder: Omit<Reminder, 'id'>): Promise<Reminder> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const snakeCaseReminder = toSnakeCase(reminder);
    snakeCaseReminder.user_id = userId;
    
    const { data, error } = await supabase
      .from('reminders')
      .insert(snakeCaseReminder)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  async updateReminder(reminderId: string, updates: Partial<Reminder>): Promise<Reminder> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('reminders')
      .update(toSnakeCase(updates))
      .eq('id', reminderId)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  async deleteReminder(reminderId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId);
    
    if (error) throw error;
  }
};

// =============================================
// APPOINTMENTS SERVICE
// =============================================
export const appointmentsService = {
  async getAppointments(userId: string): Promise<Appointment[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(toCamelCase);
  },

  async createAppointment(userId: string, appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const snakeCaseAppt = toSnakeCase(appointment);
    snakeCaseAppt.user_id = userId;
    
    const { data, error } = await supabase
      .from('appointments')
      .insert(snakeCaseAppt)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  async updateAppointment(appointmentId: string, updates: Partial<Appointment>): Promise<Appointment> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('appointments')
      .update(toSnakeCase(updates))
      .eq('id', appointmentId)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  }
};

// =============================================
// AUDIT LOGS SERVICE
// =============================================
export const auditService = {
  async getLogs(userId: string, limit = 50): Promise<AuditLog[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data || []).map(toCamelCase);
  },

  async addLog(userId: string, log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const snakeCaseLog = toSnakeCase(log);
    snakeCaseLog.user_id = userId;
    
    const { data, error } = await supabase
      .from('audit_logs')
      .insert(snakeCaseLog)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  }
};

// =============================================
// SUBSCRIPTIONS SERVICE
// =============================================
export const subscriptionService = {
  async getSubscription(userId: string): Promise<SubscriptionType | null> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return toCamelCase(data);
  },

  async createSubscription(userId: string, planId: string): Promise<SubscriptionType> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        start_date: startDate,
        end_date: endDate,
        auto_renew: true
      }, { onConflict: 'user_id' })
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  async cancelSubscription(userId: string): Promise<SubscriptionType> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled', auto_renew: false })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  }
};

// =============================================
// PAYMENTS SERVICE
// =============================================
export const paymentsService = {
  async getPayments(userId: string): Promise<Payment[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(toCamelCase);
  },

  async addPayment(userId: string, payment: Omit<Payment, 'id'>): Promise<Payment> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const snakeCasePayment = toSnakeCase(payment);
    snakeCasePayment.user_id = userId;
    
    const { data, error } = await supabase
      .from('payments')
      .insert(snakeCasePayment)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  }
};

// =============================================
// INTEGRATIONS SERVICE
// =============================================
export const integrationsService = {
  async getConnections(userId: string): Promise<IntegrationConnection[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return (data || []).map(toCamelCase);
  },

  async upsertConnection(userId: string, connection: Omit<IntegrationConnection, 'id'>): Promise<IntegrationConnection> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const snakeCaseConn = toSnakeCase(connection);
    snakeCaseConn.user_id = userId;
    
    const { data, error } = await supabase
      .from('integration_connections')
      .upsert(snakeCaseConn)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  }
};

// =============================================
// CONTENT PROGRESS SERVICE
// =============================================
export const contentProgressService = {
  async getProgress(userId: string): Promise<UserContentProgress[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('content_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return (data || []).map(toCamelCase);
  },

  async updateProgress(userId: string, contentId: string, progress: Partial<UserContentProgress>): Promise<UserContentProgress> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const snakeCaseProgress = toSnakeCase(progress);
    snakeCaseProgress.user_id = userId;
    snakeCaseProgress.content_id = contentId;
    snakeCaseProgress.last_accessed = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('content_progress')
      .upsert(snakeCaseProgress, { onConflict: 'user_id,content_id' })
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data);
  }
};

// Export all services
export const supabaseServices = {
  user: userService,
  privacy: privacyService,
  cycle: cycleService,
  logs: symptomLogsService,
  journal: journalService,
  goals: goalsService,
  reminders: remindersService,
  appointments: appointmentsService,
  audit: auditService,
  subscription: subscriptionService,
  payments: paymentsService,
  integrations: integrationsService,
  contentProgress: contentProgressService,
  isConfigured: isSupabaseConfigured
};
