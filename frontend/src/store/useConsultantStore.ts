import { create } from 'zustand';

export interface Consultant {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  specialties: string[];
  bio: string;
  languages: string[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  consultationCount: number;
  availability: 'Available now' | 'Today' | 'This week';
  status: 'active' | 'offline';
  pricing: {
    duration: number; // in minutes
    price: number;
  }[];
}

export interface Consultation {
  id: string;
  userId: string;
  consultantId: string;
  topic: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  consultantPrice: number;
  platformFee: number;
  totalAmount: number;
  status: 'Upcoming' | 'In session' | 'Completed' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending';
  createdAt: string;
}

interface ConsultantState {
  consultants: Consultant[];
  consultations: Consultation[];
  bookConsultation: (consultation: Omit<Consultation, 'id' | 'status' | 'paymentStatus' | 'createdAt'>) => void;
  updateConsultationStatus: (id: string, status: Consultation['status']) => void;
}

const MOCK_CONSULTANTS: Consultant[] = [
  {
    id: "c-1",
    name: "Maya Sharma",
    avatar: "https://i.pravatar.cc/150?u=maya",
    verified: true,
    specialties: ["International Transfers", "Remittances", "Payment Troubleshooting", "Exchange Rates"],
    bio: "A concise professional biography. Maya specializes in cross-border payments and resolving complex remittance failures.",
    languages: ["English", "Hindi", "Punjabi"],
    experienceYears: 6,
    rating: 4.9,
    reviewCount: 142,
    consultationCount: 328,
    availability: 'Available now',
    status: 'active',
    pricing: [
      { duration: 15, price: 10 },
      { duration: 30, price: 18 },
      { duration: 60, price: 32 },
    ]
  },
  {
    id: "c-2",
    name: "Arjun Mehta",
    avatar: "https://i.pravatar.cc/150?u=arjun",
    verified: true,
    specialties: ["TrustScore", "Account & Security", "Financial Guidance"],
    bio: "Former risk analyst helping users build their Ziro TrustScore and secure their accounts.",
    languages: ["English", "Gujarati"],
    experienceYears: 8,
    rating: 4.8,
    reviewCount: 95,
    consultationCount: 210,
    availability: 'Today',
    status: 'active',
    pricing: [
      { duration: 15, price: 12 },
      { duration: 30, price: 22 },
      { duration: 60, price: 40 },
    ]
  },
  {
    id: "c-3",
    name: "Elena Rodriguez",
    avatar: "https://i.pravatar.cc/150?u=elena",
    verified: true,
    specialties: ["Payment Troubleshooting", "General Payment Guidance", "Financial Documents"],
    bio: "Expert in payment routing and compliance. Helps with stuck transactions and document verification.",
    languages: ["English", "Spanish"],
    experienceYears: 4,
    rating: 4.7,
    reviewCount: 64,
    consultationCount: 180,
    availability: 'This week',
    status: 'active',
    pricing: [
      { duration: 15, price: 8 },
      { duration: 30, price: 15 },
      { duration: 60, price: 28 },
    ]
  }
];

export const useConsultantStore = create<ConsultantState>((set) => ({
  consultants: MOCK_CONSULTANTS,
  consultations: [],
  bookConsultation: (consultation) => set((state) => ({
    consultations: [
      {
        ...consultation,
        id: `ZIRO-CNS-${Math.floor(10000 + Math.random() * 90000)}`,
        status: 'Upcoming',
        paymentStatus: 'Paid',
        createdAt: new Date().toISOString(),
      },
      ...state.consultations
    ]
  })),
  updateConsultationStatus: (id, status) => set((state) => ({
    consultations: state.consultations.map(c => 
      c.id === id ? { ...c, status } : c
    )
  })),
}));
