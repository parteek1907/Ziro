import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProfileSettings {
  name: string;
  email: string;
  username: string;
  phone: string;
  location: string;
  country: string;
  avatar: string;
  archetype: string;
}

export interface AppearanceSettings {
  theme: 'Light' | 'Dark' | 'System';
  reduceAnimations: boolean;
  language: 'English' | string;
  performanceMode: boolean;
}

export interface SecuritySession {
  id: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'Public' | 'Private';
  transactionPrivacy: 'Public' | 'Private';
}

export interface NotificationSettings {
  paymentConfirmations: boolean;
  paymentSecurityAlerts: boolean;
  transferStatusUpdates: boolean;
  trustScoreUpdates: boolean;
  consultantNotifications: boolean;
  productUpdates: boolean;
}

export interface ZiroPaymentSettings {
  requireConfirmation: boolean;
  securityScreening: boolean;
}

export interface SettingsState {
  profile: ProfileSettings;
  appearance: AppearanceSettings;
  sessions: SecuritySession[];
  privacy: PrivacySettings;
  notifications: NotificationSettings;
  payments: ZiroPaymentSettings;

  // Actions
  updateProfile: (data: Partial<ProfileSettings>) => void;
  updateAppearance: (data: Partial<AppearanceSettings>) => void;
  updatePrivacy: (data: Partial<PrivacySettings>) => void;
  updateNotifications: (data: Partial<NotificationSettings>) => void;
  updatePayments: (data: Partial<ZiroPaymentSettings>) => void;
  terminateSession: (id: string) => void;
  terminateAllOtherSessions: () => void;
  resetAllSettings: () => void;
  setSessions: (sessions: SecuritySession[]) => void;
}

const DEFAULT_SESSIONS: SecuritySession[] = [
  {
    id: '1',
    device: 'Chrome · Windows',
    ip: '192.168.1.1',
    location: 'Current session',
    lastActive: 'Active now',
    isCurrent: true
  }
];

const DEFAULT_SETTINGS = {
  profile: {
    name: '',
    email: '',
    username: '',
    phone: '',
    location: '',
    country: '',
    avatar: '',
    archetype: 'The Guardian',
  },
  appearance: {
    theme: 'System' as const,
    reduceAnimations: false,
    language: 'English',
    performanceMode: false,
  },
  sessions: DEFAULT_SESSIONS,
  privacy: {
    profileVisibility: 'Private' as const,
    transactionPrivacy: 'Private' as const,
  },
  notifications: {
    paymentConfirmations: true,
    paymentSecurityAlerts: true,
    transferStatusUpdates: true,
    trustScoreUpdates: true,
    consultantNotifications: true,
    productUpdates: false,
  },
  payments: {
    requireConfirmation: true,
    securityScreening: true,
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateProfile: (data) =>
        set((state) => {
          const newProfile = { ...state.profile, ...data };
          // Sync with useAppStore
          try {
            import('./useAppStore').then(({ useAppStore }) => {
              useAppStore.getState().updateUser({
                name: newProfile.name,
                email: newProfile.email,
                avatar: newProfile.avatar,
              });
            });
          } catch (e) {
            console.error('Error syncing store user', e);
          }
          return { profile: newProfile };
        }),

      updateAppearance: (data) =>
        set((state) => ({
          appearance: { ...state.appearance, ...data },
        })),

      updatePrivacy: (data) =>
        set((state) => ({
          privacy: { ...state.privacy, ...data },
        })),

      updateNotifications: (data) =>
        set((state) => ({
          notifications: { ...state.notifications, ...data },
        })),

      updatePayments: (data) =>
        set((state) => ({
          payments: { ...state.payments, ...data },
        })),

      terminateSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id || s.isCurrent),
        })),

      terminateAllOtherSessions: () =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.isCurrent),
        })),

      setSessions: (sessions) => set({ sessions }),

      resetAllSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'ziro-settings-storage',
    }
  )
);
