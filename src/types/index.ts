export type UserRole = 'patient' | 'doctor' | 'admin' | 'pharmacist';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface Patient extends User {
  role: 'patient';
  age?: number;
  phone?: string;
  address?: string;
  bloodGroup?: string;
}

export interface Doctor extends User {
  role: 'doctor';
  specialty: string;
  experience: number;
  qualification: string;
  clinicAddress?: string;
  about?: string;
  achievements?: string[];
  availableSlots?: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  patientId?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  symptoms?: string[];
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Symptom {
  id: string;
  name: string;
  category: string;
}

export interface HealthRecord {
  id: string;
  patientId: string;
  date: string;
  type: 'report' | 'prescription';
  title: string;
  fileUrl?: string;
}
