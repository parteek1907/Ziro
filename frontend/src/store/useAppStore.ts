import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id?: string;
  name: string;
  email: string;
  avatar: string;
  xp: number;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  status: string;
  category: string;
  currency: string;
}

export interface MentorMessage {
  id: string;
  sender: 'ai' | 'user' | 'system';
  text: string;
  timestamp: string;
  actionRequired?: boolean;
  isHiddenContext?: boolean;
  imageBase64?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: MentorMessage[];
  updatedAt: string;
}

export interface AppState {
  user: User;
  goals: Goal[];
  chats: ChatSession[];
  activeChatId: string | null;
  
  // Actions
  addGoal: (goal: { name: string; target: number; deadline: string; category: string; currency?: string }) => void;
  updateGoal: (id: string, amount: number) => void;
  addMessage: (chatId: string, message: Omit<MentorMessage, 'id' | 'timestamp'>) => void;
  removeMessage: (chatId: string, messageId: string) => void;
  createNewChat: (title?: string) => string;
  setActiveChat: (id: string) => void;
  updateChatTitle: (id: string, title: string) => void;
  deleteChat: (id: string) => void;
  updateUser: (data: Partial<User>) => void;
}

const INITIAL_USER: User = {
  name: 'Demo User',
  email: 'demo@example.com',
  avatar: '',
  xp: 0,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: INITIAL_USER,
      goals: [],
      chats: [],
      activeChatId: null,

      addGoal: (goalData) => set((state) => {
        const newGoal: Goal = {
          name: goalData.name,
          target: goalData.target,
          deadline: goalData.deadline,
          category: goalData.category,
          currency: goalData.currency || 'USD',
          id: `g${Date.now()}`,
          current: 0,
          status: 'Planning',
        };
        return { goals: [...state.goals, newGoal] };
      }),

      updateGoal: (id, amount) => set((state) => ({
        goals: state.goals.map(g => {
          if (g.id !== id) return g;
          return {
            ...g,
            current: Math.max(0, Math.min(g.target, g.current + amount)),
          };
        })
      })),

      addMessage: (chatId, message) => set((state) => ({
        chats: state.chats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              updatedAt: new Date().toISOString(),
              messages: [...chat.messages, { ...message, id: `m${Date.now()}`, timestamp: new Date().toISOString() }]
            };
          }
          return chat;
        })
      })),

      removeMessage: (chatId, messageId) => set((state) => ({
        chats: state.chats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: chat.messages.filter(m => m.id !== messageId)
            };
          }
          return chat;
        })
      })),

      createNewChat: (title = 'New Chat') => {
        const newChatId = `chat_${Date.now()}`;
        set((state) => ({
          chats: [
            {
              id: newChatId,
              title,
              messages: [],
              updatedAt: new Date().toISOString()
            },
            ...state.chats
          ],
          activeChatId: newChatId
        }));
        return newChatId;
      },

      setActiveChat: (id) => set({ activeChatId: id }),

      updateChatTitle: (id, title) => set((state) => ({
        chats: state.chats.map(chat => chat.id === id ? { ...chat, title } : chat)
      })),

      deleteChat: (id) => set((state) => {
        const remainingChats = state.chats.filter(c => c.id !== id);
        let nextActiveId = state.activeChatId;
        if (state.activeChatId === id) {
          nextActiveId = remainingChats.length > 0 ? remainingChats[0].id : null;
        }
        return {
          chats: remainingChats,
          activeChatId: nextActiveId
        };
      }),

      updateUser: (data) => {
        set((state) => ({
          user: { ...state.user, ...data }
        }));
      },
    }),
    {
      name: 'ziro-app-storage',
    }
  )
);
