import { Doctor, Appointment, Symptom, HealthRecord } from '@/types';

export const mockDoctors: Doctor[] = [
  {
    id: 'doc1',
    email: 'dr.sharma@sehat.com',
    role: 'doctor',
    name: 'Dr. Priya Sharma',
    specialty: 'General Physician',
    experience: 12,
    qualification: 'MBBS, MD',
    clinicAddress: 'Sehat Clinic, Mumbai',
    about: 'Experienced general physician specializing in preventive care and chronic disease management.',
    achievements: ['Best Doctor Award 2022', '10+ years experience', '5000+ patients treated'],
    availableSlots: [
      { id: 's1', day: 'Monday', startTime: '09:00', endTime: '10:00', isBooked: false },
      { id: 's2', day: 'Monday', startTime: '14:00', endTime: '15:00', isBooked: false },
      { id: 's3', day: 'Wednesday', startTime: '10:00', endTime: '11:00', isBooked: false },
      { id: 's4', day: 'Friday', startTime: '15:00', endTime: '16:00', isBooked: false },
    ],
  },
  {
    id: 'doc2',
    email: 'dr.kumar@sehat.com',
    role: 'doctor',
    name: 'Dr. Rajesh Kumar',
    specialty: 'Cardiologist',
    experience: 15,
    qualification: 'MBBS, DM (Cardiology)',
    clinicAddress: 'Heart Care Center, Delhi',
    about: 'Expert in cardiovascular diseases with focus on non-invasive treatment approaches.',
    achievements: ['Top Cardiologist 2023', 'Published 20+ research papers', 'International fellowship'],
    availableSlots: [
      { id: 's5', day: 'Tuesday', startTime: '11:00', endTime: '12:00', isBooked: false },
      { id: 's6', day: 'Thursday', startTime: '16:00', endTime: '17:00', isBooked: false },
      { id: 's7', day: 'Saturday', startTime: '09:00', endTime: '10:00', isBooked: false },
    ],
  },
  {
    id: 'doc3',
    email: 'dr.singh@sehat.com',
    role: 'doctor',
    name: 'Dr. Anjali Singh',
    specialty: 'Dermatologist',
    experience: 8,
    qualification: 'MBBS, MD (Dermatology)',
    clinicAddress: 'Skin Care Clinic, Bangalore',
    about: 'Specializing in skin conditions, cosmetic procedures, and hair treatments.',
    achievements: ['Certified Dermatologist', 'Expert in laser treatments', '3000+ consultations'],
    availableSlots: [
      { id: 's8', day: 'Monday', startTime: '10:00', endTime: '11:00', isBooked: false },
      { id: 's9', day: 'Wednesday', startTime: '14:00', endTime: '15:00', isBooked: false },
      { id: 's10', day: 'Friday', startTime: '11:00', endTime: '12:00', isBooked: false },
    ],
  },
];

export const mockSymptoms: Symptom[] = [
  { id: 'sym1', name: 'Fever', category: 'General' },
  { id: 'sym2', name: 'Headache', category: 'General' },
  { id: 'sym3', name: 'Cough', category: 'Respiratory' },
  { id: 'sym4', name: 'Sore Throat', category: 'Respiratory' },
  { id: 'sym5', name: 'Body Ache', category: 'General' },
  { id: 'sym6', name: 'Nausea', category: 'Digestive' },
  { id: 'sym7', name: 'Fatigue', category: 'General' },
  { id: 'sym8', name: 'Shortness of Breath', category: 'Respiratory' },
  { id: 'sym9', name: 'Chest Pain', category: 'Cardiac' },
  { id: 'sym10', name: 'Skin Rash', category: 'Dermatological' },
];

export const mockAppointments: Appointment[] = [
  {
    id: 'apt1',
    patientId: 'pat1',
    doctorId: 'doc1',
    patientName: 'Rahul Verma',
    doctorName: 'Dr. Priya Sharma',
    date: '2024-10-20',
    time: '09:00',
    symptoms: ['Fever', 'Headache', 'Body Ache'],
    notes: 'Symptoms started 2 days ago',
    status: 'scheduled',
  },
  {
    id: 'apt2',
    patientId: 'pat1',
    doctorId: 'doc2',
    patientName: 'Rahul Verma',
    doctorName: 'Dr. Rajesh Kumar',
    date: '2024-10-15',
    time: '11:00',
    symptoms: ['Chest Pain'],
    status: 'completed',
  },
];

export const mockHealthRecords: HealthRecord[] = [
  {
    id: 'rec1',
    patientId: 'pat1',
    date: '2024-10-10',
    type: 'report',
    title: 'Blood Test Report',
    fileUrl: '#',
  },
  {
    id: 'rec2',
    patientId: 'pat1',
    date: '2024-10-15',
    type: 'prescription',
    title: 'Prescription - Dr. Rajesh Kumar',
    fileUrl: '#',
  },
  {
    id: 'rec3',
    patientId: 'pat1',
    date: '2024-09-20',
    type: 'report',
    title: 'ECG Report',
    fileUrl: '#',
  },
];

// Mock data for health trends
export const mockHealthTrends = {
  consultations: [
    { month: 'Apr', count: 2 },
    { month: 'May', count: 4 },
    { month: 'Jun', count: 3 },
    { month: 'Jul', count: 5 },
    { month: 'Aug', count: 6 },
    { month: 'Sep', count: 4 },
  ],
  symptoms: [
    { name: 'Fever', count: 8 },
    { name: 'Headache', count: 12 },
    { name: 'Cough', count: 6 },
    { name: 'Body Ache', count: 7 },
    { name: 'Fatigue', count: 10 },
  ],
};
