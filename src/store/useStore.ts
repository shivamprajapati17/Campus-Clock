// ─────────────────────────────────────────────────────────────
// Campus Clock – Global Zustand Store
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand';
import type { User, Notification } from '@/lib/types';

interface AppState {
  // ── Auth ─────────────────────────────────────────────────
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;

  // ── Notifications ────────────────────────────────────────
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markRead: (notificationId: string) => void;

  // ── UI ───────────────────────────────────────────────────
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // ── Context selectors ────────────────────────────────────
  currentDepartment: string | null;
  setCurrentDepartment: (id: string | null) => void;
  currentDivision: string | null;
  setCurrentDivision: (id: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  // ── Auth ─────────────────────────────────────────────────
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),

  // ── Notifications ────────────────────────────────────────
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  markRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    })),

  // ── UI ───────────────────────────────────────────────────
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // ── Context selectors ────────────────────────────────────
  currentDepartment: null,
  setCurrentDepartment: (id) => set({ currentDepartment: id }),
  currentDivision: null,
  setCurrentDivision: (id) => set({ currentDivision: id }),
}));
