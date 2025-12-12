
import { CyclePhase, Mood, SymptomLog, CycleData, UserProfile } from "./types";

export const MOCK_PROFILE: UserProfile = {
  id: 'mock-user-1',
  email: 'sarah@example.com',
  firstName: 'Sarah',
  lastName: 'Doe',
  isEmailVerified: true,
  isOnboardingComplete: false, // Reset to false
  name: "Sarah",
  age: 28,
  goal: "Manage stress and track fertility",
};

export const MOCK_CYCLE: CycleData = {
  startDate: new Date().toISOString().split('T')[0], // Reset to today
  length: 28,
  periodLength: 5,
};

// Empty logs for clean slate
export const MOCK_LOGS: SymptomLog[] = [];

export const SYMPTOM_OPTIONS = [
  "Cramps", "Headache", "Bloating", "Acne", "Backache", "Fatigue", "Cravings", "Insomnia"
];

export const APP_COLORS = {
  primary: "rose-500",
  secondary: "purple-600",
  background: "slate-50",
  card: "white",
};
