import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SupportTicket {
  id: string;
  issueType: string;
  subject: string;
  description: string;
  status: 'Open' | 'Pending' | 'Resolved';
  createdAt: string;
}

export interface HelpState {
  tickets: SupportTicket[];
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => string;
}

const generateId = () => {
  return `ZIRO-${Math.floor(10000 + Math.random() * 90000)}`;
};

export const useHelpStore = create<HelpState>()(
  persist(
    (set) => ({
      tickets: [],
      addTicket: (ticketData) => {
        const id = generateId();
        const newTicket: SupportTicket = {
          ...ticketData,
          id,
          status: 'Open',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          tickets: [newTicket, ...state.tickets],
        }));
        return id;
      },
    }),
    {
      name: 'ziro-help-storage',
    }
  )
);
