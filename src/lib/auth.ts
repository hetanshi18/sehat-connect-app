import { User, Patient, Doctor } from '@/types';

const STORAGE_KEY = 'sehat_sathi_user';

export const saveUser = (user: User) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Mock login function
export const mockLogin = (email: string, password: string, role: 'patient' | 'doctor'): User => {
  // In a real app, this would validate credentials with a backend
  const baseUser = {
    id: role === 'patient' ? 'pat1' : 'doc1',
    email,
    role,
  };

  if (role === 'patient') {
    const patient: Patient = {
      ...baseUser,
      role: 'patient',
      name: 'Rahul Verma',
      age: 32,
      phone: '+91 98765 43210',
      bloodGroup: 'O+',
      address: 'Mumbai, Maharashtra',
    };
    return patient;
  } else {
    const doctor: Doctor = {
      ...baseUser,
      role: 'doctor',
      name: 'Dr. Priya Sharma',
      specialty: 'General Physician',
      experience: 12,
      qualification: 'MBBS, MD',
      clinicAddress: 'Sehat Clinic, Mumbai',
      about: 'Experienced general physician specializing in preventive care and chronic disease management.',
      achievements: ['Best Doctor Award 2022', '10+ years experience', '5000+ patients treated'],
    };
    return doctor;
  }
};

// Mock signup function
export const mockSignup = (email: string, password: string, name: string, role: 'patient' | 'doctor'): User => {
  const baseUser = {
    id: `${role}-${Date.now()}`,
    email,
    role,
  };

  if (role === 'patient') {
    const patient: Patient = {
      ...baseUser,
      role: 'patient',
      name,
    };
    return patient;
  } else {
    const doctor: Doctor = {
      ...baseUser,
      role: 'doctor',
      name,
      specialty: 'General Physician',
      experience: 0,
      qualification: 'MBBS',
    };
    return doctor;
  }
};
