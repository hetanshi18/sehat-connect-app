import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const translations: Record<Language, any> = {
  en: {
    nav: {
      home: 'Home',
      features: 'Features',
      about: 'About',
      contact: 'Contact',
      login: 'Login',
      getStarted: 'Get Started'
    },
    hero: {
      title: 'Your Health, Our Priority',
      subtitle: 'Connect with qualified doctors instantly through our smart telemedicine platform',
      cta: 'Book Consultation'
    },
    features: {
      title: 'Complete Healthcare Solution',
      subtitle: 'Everything you need for quality healthcare at your fingertips',
      videoConsult: {
        title: 'Video Consultations',
        description: 'Connect face-to-face with doctors from anywhere'
      },
      symptomAnalysis: {
        title: 'Symptom Analysis',
        description: 'AI-powered preliminary symptom assessment'
      },
      easyScheduling: {
        title: 'Easy Scheduling',
        description: 'Book appointments with just a few clicks'
      },
      healthTracking: {
        title: 'Health Tracking',
        description: 'Monitor your health trends over time'
      }
    },
    stats: {
      doctors: 'Qualified Doctors',
      patients: 'Happy Patients',
      consultations: 'Consultations',
      rating: 'Average Rating'
    },
    cta: {
      title: 'Ready to Get Started?',
      subtitle: 'Join thousands of patients who trust Sehat Sathi for their healthcare needs',
      button: 'Start Your Journey'
    },
    auth: {
      title: 'Sehat Sathi',
      subtitle: 'Smart Telemedicine Kiosk',
      patient: 'Patient',
      doctor: 'Doctor',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      name: 'Name',
      loginButton: 'Login',
      signupButton: 'Create Account',
      errorFillFields: 'Please fill all fields',
      successWelcome: 'Welcome back!',
      successAccountCreated: 'Account created! Please check your email to verify your account.',
      error: 'Error',
      success: 'Success'
    },
    dashboard: {
      patientTitle: 'Patient Dashboard',
      doctorTitle: 'Doctor Dashboard',
      totalConsultations: 'Total Consultations',
      lifetimeAppointments: 'Lifetime appointments',
      nextAppointment: 'Next Appointment',
      noUpcoming: 'No upcoming appointments',
      recentActivity: 'Recent Activity',
      lastConsultation: 'Last consultation',
      quickActions: 'Quick Actions',
      myAppointments: 'My Appointments',
      viewScheduled: 'View your scheduled appointments',
      bookConsultation: 'Book Consultation',
      scheduleDoctor: 'Schedule a doctor appointment',
      recordSymptoms: 'Record Symptoms',
      logSymptoms: 'Log your current symptoms',
      healthTrends: 'Health Trends',
      viewAnalytics: 'View your health analytics',
      myProfile: 'My Profile',
      viewEditProfile: 'View and edit your profile',
      pendingRequests: 'Pending Requests',
      waitingApproval: 'waiting for approval',
      patientHistory: 'Patient History',
      viewRecords: 'View complete patient records',
      manageSlots: 'Manage Slots',
      setAvailability: 'Set your availability',
      awaitingApproval: 'Awaiting approval',
      totalPatients: 'Total Patients',
      uniquePatients: 'Unique patients',
      confirmedAppointments: 'Confirmed Appointments',
      scheduled: 'Scheduled',
      backToDashboard: 'Back to Dashboard'
    },
    appointments: {
      title: 'My Appointments',
      pending: 'Pending',
      confirmed: 'Confirmed',
      rejected: 'Rejected',
      noPending: 'No pending appointments',
      noConfirmed: 'No confirmed appointments',
      noRejected: 'No rejected appointments',
      awaitingApproval: 'Awaiting Doctor Approval',
      appointmentConfirmed: 'Appointment Confirmed',
      date: 'Date',
      time: 'Time',
      symptoms: 'Symptoms',
      notes: 'Notes',
      noNotes: 'No additional notes',
      joinCall: 'Join Video Call'
    },
    symptoms: {
      title: 'Record Symptoms',
      selectSymptoms: 'Select your symptoms',
      additionalNotes: 'Additional Notes',
      notesPlaceholder: 'Describe any additional symptoms or concerns...',
      analyzeButton: 'Analyze Symptoms',
      analyzing: 'Analyzing...',
      selectOne: 'Please select at least one symptom',
      analysisComplete: 'Analysis complete',
      reportTitle: 'Symptom Analysis Report',
      reportedSymptoms: 'Reported Symptoms',
      extractedSymptoms: 'Extracted Symptoms',
      possibleConditions: 'Possible Conditions',
      recommendedMedicines: 'Recommended Medicines (Consult Doctor)',
      preliminaryAdvice: 'Preliminary Advice',
      restHydrated: 'Rest and stay hydrated',
      monitorTemp: 'Monitor temperature if fever persists',
      consultDoctor: 'Consult a doctor if symptoms worsen',
      avoidSelfMed: 'Avoid self-medication without professional advice',
      disclaimer: 'This is a preliminary report. Please consult with a healthcare professional for proper diagnosis and treatment.',
      downloadReport: 'Download Report',
      backToSymptoms: 'Back to Symptoms',
      uploadDocuments: 'Upload Health Documents'
    },
    healthDocument: {
      upload: 'Upload Health Document',
      uploadDesc: 'Upload medical reports, prescriptions, or other health documents',
      title: 'Document Title',
      titlePlaceholder: 'e.g., Blood Test Report - Jan 2024',
      selectFile: 'Select File',
      uploadButton: 'Upload Document',
      uploading: 'Uploading...',
      success: 'Document uploaded successfully!',
      error: 'Please select a file and enter a title',
      noFile: 'No file chosen'
    },
    howItWorks: {
      title: 'How It Works',
      saveTimeTitle: 'Save Time',
      saveTimeDesc: 'No waiting rooms or travel time. Get consultations from anywhere.',
      secureTitle: 'Secure & Private',
      secureDesc: 'Your health data is encrypted and protected with industry-leading security.',
      expertDoctorsTitle: 'Expert Doctors',
      expertDoctorsDesc: 'Connect with qualified healthcare professionals anytime, anywhere.'
    },
    profile: {
      title: 'Patient Profile',
      personalInfo: 'Personal Information',
      profileDetails: 'Your basic health profile details',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      bloodGroup: 'Blood Group',
      address: 'Address',
      notProvided: 'Not provided',
      quickStats: 'Quick Stats',
      totalReports: 'Total Reports',
      prescriptions: 'Prescriptions',
      lastVisit: 'Last Visit',
      healthDocuments: 'Health Documents',
      uploadNew: 'Upload New Document',
      medicalReports: 'Medical Reports',
      noReports: 'No medical reports uploaded yet',
      noPrescriptions: 'No prescriptions available',
      editProfile: 'Edit Profile'
    },
    consult: {
      title: 'Book Consultation',
      findDoctor: 'Find Your Doctor',
      selectDoctor: 'Select a doctor to view available slots',
      specialty: 'Specialty',
      experience: 'Experience',
      years: 'years',
      qualification: 'Qualification',
      about: 'About',
      achievements: 'Achievements',
      viewSlots: 'View Available Slots',
      selectDate: 'Select Date',
      availableSlots: 'Available Slots',
      noSlotsAvailable: 'No slots available for this date',
      selectSlot: 'Please select a time slot',
      bookAppointment: 'Book Appointment',
      confirmBooking: 'Confirm Booking',
      confirmMessage: 'Are you sure you want to book this appointment?',
      doctor: 'Doctor',
      dateTime: 'Date & Time',
      booking: 'Booking...',
      bookingSuccess: 'Appointment booked successfully!',
      bookingError: 'Failed to book appointment'
    },
    common: {
      error: 'Error',
      success: 'Success',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      actions: 'Actions'
    }
  },
  hi: {
    nav: {
      home: 'होम',
      features: 'विशेषताएं',
      about: 'हमारे बारे में',
      contact: 'संपर्क करें',
      login: 'लॉगिन',
      getStarted: 'शुरू करें'
    },
    hero: {
      title: 'आपका स्वास्थ्य, हमारी प्राथमिकता',
      subtitle: 'हमारे स्मार्ट टेलीमेडिसिन प्लेटफॉर्म के माध्यम से तुरंत योग्य डॉक्टरों से जुड़ें',
      cta: 'परामर्श बुक करें'
    },
    features: {
      title: 'संपूर्ण स्वास्थ्य समाधान',
      subtitle: 'गुणवत्तापूर्ण स्वास्थ्य सेवा के लिए आपको जो कुछ भी चाहिए',
      videoConsult: {
        title: 'वीडियो परामर्श',
        description: 'कहीं से भी डॉक्टरों से आमने-सामने जुड़ें'
      },
      symptomAnalysis: {
        title: 'लक्षण विश्लेषण',
        description: 'AI-संचालित प्रारंभिक लक्षण मूल्यांकन'
      },
      easyScheduling: {
        title: 'आसान शेड्यूलिंग',
        description: 'कुछ ही क्लिक में अपॉइंटमेंट बुक करें'
      },
      healthTracking: {
        title: 'स्वास्थ्य ट्रैकिंग',
        description: 'समय के साथ अपने स्वास्थ्य के रुझानों की निगरानी करें'
      }
    },
    stats: {
      doctors: 'योग्य डॉक्टर',
      patients: 'खुश मरीज',
      consultations: 'परामर्श',
      rating: 'औसत रेटिंग'
    },
    cta: {
      title: 'शुरू करने के लिए तैयार हैं?',
      subtitle: 'हजारों मरीज जो अपनी स्वास्थ्य सेवा की जरूरतों के लिए सेहत साथी पर भरोसा करते हैं',
      button: 'अपनी यात्रा शुरू करें'
    },
    auth: {
      title: 'सेहत साथी',
      subtitle: 'स्मार्ट टेलीमेडिसिन कियोस्क',
      patient: 'मरीज',
      doctor: 'डॉक्टर',
      signIn: 'साइन इन',
      signUp: 'साइन अप',
      email: 'ईमेल',
      password: 'पासवर्ड',
      name: 'नाम',
      loginButton: 'लॉगिन करें',
      signupButton: 'खाता बनाएं',
      errorFillFields: 'कृपया सभी फ़ील्ड भरें',
      successWelcome: 'वापसी पर स्वागत है!',
      successAccountCreated: 'खाता बनाया गया! कृपया अपने खाते को सत्यापित करने के लिए अपना ईमेल जांचें।',
      error: 'त्रुटि',
      success: 'सफलता'
    },
    dashboard: {
      patientTitle: 'रोगी डैशबोर्ड',
      doctorTitle: 'डॉक्टर डैशबोर्ड',
      totalConsultations: 'कुल परामर्श',
      lifetimeAppointments: 'जीवनकाल नियुक्तियां',
      nextAppointment: 'अगली नियुक्ति',
      noUpcoming: 'कोई आगामी नियुक्ति नहीं',
      recentActivity: 'हाल की गतिविधि',
      lastConsultation: 'अंतिम परामर्श',
      quickActions: 'त्वरित क्रियाएं',
      myAppointments: 'मेरी नियुक्तियां',
      viewScheduled: 'अपनी निर्धारित नियुक्तियां देखें',
      bookConsultation: 'परामर्श बुक करें',
      scheduleDoctor: 'डॉक्टर की नियुक्ति निर्धारित करें',
      recordSymptoms: 'लक्षण रिकॉर्ड करें',
      logSymptoms: 'अपने वर्तमान लक्षण लॉग करें',
      healthTrends: 'स्वास्थ्य रुझान',
      viewAnalytics: 'अपने स्वास्थ्य विश्लेषण देखें',
      myProfile: 'मेरी प्रोफ़ाइल',
      viewEditProfile: 'अपनी प्रोफ़ाइल देखें और संपादित करें',
      pendingRequests: 'लंबित अनुरोध',
      waitingApproval: 'स्वीकृति की प्रतीक्षा में',
      patientHistory: 'रोगी इतिहास',
      viewRecords: 'संपूर्ण रोगी रिकॉर्ड देखें',
      manageSlots: 'स्लॉट प्रबंधित करें',
      setAvailability: 'अपनी उपलब्धता सेट करें',
      awaitingApproval: 'स्वीकृति की प्रतीक्षा',
      totalPatients: 'कुल मरीज',
      uniquePatients: 'अद्वितीय मरीज',
      confirmedAppointments: 'पुष्टि की गई नियुक्तियां',
      scheduled: 'निर्धारित',
      backToDashboard: 'डैशबोर्ड पर वापस जाएं'
    },
    appointments: {
      title: 'मेरी नियुक्तियां',
      pending: 'लंबित',
      confirmed: 'पुष्टि की गई',
      rejected: 'अस्वीकृत',
      noPending: 'कोई लंबित नियुक्तियां नहीं',
      noConfirmed: 'कोई पुष्टि की गई नियुक्तियां नहीं',
      noRejected: 'कोई अस्वीकृत नियुक्तियां नहीं',
      awaitingApproval: 'डॉक्टर की स्वीकृति की प्रतीक्षा',
      appointmentConfirmed: 'नियुक्ति की पुष्टि की गई',
      date: 'तारीख',
      time: 'समय',
      symptoms: 'लक्षण',
      notes: 'नोट्स',
      noNotes: 'कोई अतिरिक्त नोट नहीं',
      joinCall: 'वीडियो कॉल में शामिल हों'
    },
    symptoms: {
      title: 'लक्षण रिकॉर्ड करें',
      selectSymptoms: 'अपने लक्षण चुनें',
      additionalNotes: 'अतिरिक्त नोट्स',
      notesPlaceholder: 'किसी भी अतिरिक्त लक्षण या चिंताओं का वर्णन करें...',
      analyzeButton: 'लक्षणों का विश्लेषण करें',
      analyzing: 'विश्लेषण कर रहे हैं...',
      selectOne: 'कृपया कम से कम एक लक्षण चुनें',
      analysisComplete: 'विश्लेषण पूर्ण',
      reportTitle: 'लक्षण विश्लेषण रिपोर्ट',
      reportedSymptoms: 'रिपोर्ट किए गए लक्षण',
      extractedSymptoms: 'निकाले गए लक्षण',
      possibleConditions: 'संभावित स्थितियां',
      recommendedMedicines: 'अनुशंसित दवाएं (डॉक्टर से परामर्श करें)',
      preliminaryAdvice: 'प्रारंभिक सलाह',
      restHydrated: 'आराम करें और हाइड्रेटेड रहें',
      monitorTemp: 'बुखार बना रहने पर तापमान की निगरानी करें',
      consultDoctor: 'लक्षण बिगड़ने पर डॉक्टर से परामर्श करें',
      avoidSelfMed: 'पेशेवर सलाह के बिना स्व-दवा से बचें',
      disclaimer: 'यह एक प्रारंभिक रिपोर्ट है। कृपया उचित निदान और उपचार के लिए स्वास्थ्य पेशेवर से परामर्श करें।',
      downloadReport: 'रिपोर्ट डाउनलोड करें',
      backToSymptoms: 'लक्षणों पर वापस जाएं',
      uploadDocuments: 'स्वास्थ्य दस्तावेज़ अपलोड करें'
    },
    healthDocument: {
      upload: 'स्वास्थ्य दस्तावेज़ अपलोड करें',
      uploadDesc: 'चिकित्सा रिपोर्ट, नुस्खे, या अन्य स्वास्थ्य दस्तावेज़ अपलोड करें',
      title: 'दस्तावेज़ शीर्षक',
      titlePlaceholder: 'जैसे, रक्त परीक्षण रिपोर्ट - जनवरी 2024',
      selectFile: 'फ़ाइल चुनें',
      uploadButton: 'दस्तावेज़ अपलोड करें',
      uploading: 'अपलोड हो रहा है...',
      success: 'दस्तावेज़ सफलतापूर्वक अपलोड किया गया!',
      error: 'कृपया एक फ़ाइल चुनें और शीर्षक दर्ज करें',
      noFile: 'कोई फ़ाइल नहीं चुनी गई'
    },
    howItWorks: {
      title: 'यह कैसे काम करता है',
      saveTimeTitle: 'समय बचाएं',
      saveTimeDesc: 'कोई प्रतीक्षा कक्ष या यात्रा समय नहीं। कहीं से भी परामर्श प्राप्त करें।',
      secureTitle: 'सुरक्षित और निजी',
      secureDesc: 'आपका स्वास्थ्य डेटा उद्योग-अग्रणी सुरक्षा के साथ एन्क्रिप्टेड और संरक्षित है।',
      expertDoctorsTitle: 'विशेषज्ञ डॉक्टर',
      expertDoctorsDesc: 'कभी भी, कहीं भी योग्य स्वास्थ्य पेशेवरों से जुड़ें।'
    },
    profile: {
      title: 'रोगी प्रोफ़ाइल',
      personalInfo: 'व्यक्तिगत जानकारी',
      profileDetails: 'आपकी बुनियादी स्वास्थ्य प्रोफ़ाइल विवरण',
      name: 'नाम',
      email: 'ईमेल',
      phone: 'फ़ोन',
      bloodGroup: 'रक्त समूह',
      address: 'पता',
      notProvided: 'प्रदान नहीं किया गया',
      quickStats: 'त्वरित आंकड़े',
      totalReports: 'कुल रिपोर्ट',
      prescriptions: 'नुस्खे',
      lastVisit: 'अंतिम यात्रा',
      healthDocuments: 'स्वास्थ्य दस्तावेज़',
      uploadNew: 'नया दस्तावेज़ अपलोड करें',
      medicalReports: 'चिकित्सा रिपोर्ट',
      noReports: 'अभी तक कोई चिकित्सा रिपोर्ट अपलोड नहीं की गई',
      noPrescriptions: 'कोई नुस्खे उपलब्ध नहीं हैं',
      editProfile: 'प्रोफ़ाइल संपादित करें'
    },
    consult: {
      title: 'परामर्श बुक करें',
      findDoctor: 'अपना डॉक्टर खोजें',
      selectDoctor: 'उपलब्ध स्लॉट देखने के लिए एक डॉक्टर चुनें',
      specialty: 'विशेषज्ञता',
      experience: 'अनुभव',
      years: 'वर्ष',
      qualification: 'योग्यता',
      about: 'के बारे में',
      achievements: 'उपलब्धियां',
      viewSlots: 'उपलब्ध स्लॉट देखें',
      selectDate: 'तारीख चुनें',
      availableSlots: 'उपलब्ध स्लॉट',
      noSlotsAvailable: 'इस तारीख के लिए कोई स्लॉट उपलब्ध नहीं है',
      selectSlot: 'कृपया एक समय स्लॉट चुनें',
      bookAppointment: 'अपॉइंटमेंट बुक करें',
      confirmBooking: 'बुकिंग की पुष्टि करें',
      confirmMessage: 'क्या आप वाकई यह अपॉइंटमेंट बुक करना चाहते हैं?',
      doctor: 'डॉक्टर',
      dateTime: 'तारीख और समय',
      booking: 'बुकिंग हो रही है...',
      bookingSuccess: 'अपॉइंटमेंट सफलतापूर्वक बुक हो गया!',
      bookingError: 'अपॉइंटमेंट बुक करने में विफल'
    },
    common: {
      error: 'त्रुटि',
      success: 'सफलता',
      loading: 'लोड हो रहा है...',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      close: 'बंद करें',
      back: 'वापस',
      next: 'अगला',
      submit: 'जमा करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      view: 'देखें',
      search: 'खोजें',
      filter: 'फ़िल्टर',
      sort: 'क्रमबद्ध करें',
      actions: 'क्रियाएं'
    }
  },
  mr: {
    nav: {
      home: 'मुख्यपृष्ठ',
      features: 'वैशिष्ट्ये',
      about: 'आमच्याबद्दल',
      contact: 'संपर्क',
      login: 'लॉगिन',
      getStarted: 'सुरुवात करा'
    },
    hero: {
      title: 'तुमचे आरोग्य, आमची प्राथमिकता',
      subtitle: 'आमच्या स्मार्ट टेलीमेडिसिन प्लॅटफॉर्मद्वारे पात्र डॉक्टरांशी त्वरित संपर्क साधा',
      cta: 'सल्लामसलत बुक करा'
    },
    features: {
      title: 'संपूर्ण आरोग्य समाधान',
      subtitle: 'तुमच्या बोटांच्या टोकावर दर्जेदार आरोग्यसेवेसाठी आवश्यक असलेली प्रत्येक गोष्ट',
      videoConsult: {
        title: 'व्हिडिओ सल्लामसलत',
        description: 'कोठूनही डॉक्टरांशी समोरासमोर संपर्क साधा'
      },
      symptomAnalysis: {
        title: 'लक्षण विश्लेषण',
        description: 'AI-चालित प्राथमिक लक्षण मूल्यांकन'
      },
      easyScheduling: {
        title: 'सोपे शेड्यूलिंग',
        description: 'फक्त काही क्लिकमध्ये भेटी बुक करा'
      },
      healthTracking: {
        title: 'आरोग्य ट्रॅकिंग',
        description: 'कालांतराने तुमच्या आरोग्य ट्रेंडचे निरीक्षण करा'
      }
    },
    stats: {
      doctors: 'पात्र डॉक्टर',
      patients: 'समाधानी रुग्ण',
      consultations: 'सल्लामसलत',
      rating: 'सरासरी रेटिंग'
    },
    cta: {
      title: 'सुरुवात करण्यास तयार आहात?',
      subtitle: 'हजारो रुग्ण जे त्यांच्या आरोग्य सेवेच्या गरजांसाठी सेहत साथीवर विश्वास ठेवतात',
      button: 'तुमचा प्रवास सुरू करा'
    },
    auth: {
      title: 'सेहत साथी',
      subtitle: 'स्मार्ट टेलीमेडिसिन किओस्क',
      patient: 'रुग्ण',
      doctor: 'डॉक्टर',
      signIn: 'साइन इन',
      signUp: 'साइन अप',
      email: 'ईमेल',
      password: 'पासवर्ड',
      name: 'नाव',
      loginButton: 'लॉगिन करा',
      signupButton: 'खाते तयार करा',
      errorFillFields: 'कृपया सर्व फील्ड भरा',
      successWelcome: 'पुन्हा स्वागत आहे!',
      successAccountCreated: 'खाते तयार केले! कृपया तुमचे खाते सत्यापित करण्यासाठी तुमचा ईमेल तपासा.',
      error: 'त्रुटी',
      success: 'यश'
    },
    dashboard: {
      patientTitle: 'रुग्ण डॅशबोर्ड',
      doctorTitle: 'डॉक्टर डॅशबोर्ड',
      totalConsultations: 'एकूण सल्लामसलत',
      lifetimeAppointments: 'आजीवन भेटी',
      nextAppointment: 'पुढील भेट',
      noUpcoming: 'कोणत्याही आगामी भेटी नाहीत',
      recentActivity: 'अलीकडील क्रियाकलाप',
      lastConsultation: 'शेवटची सल्लामसलत',
      quickActions: 'जलद क्रिया',
      myAppointments: 'माझ्या भेटी',
      viewScheduled: 'तुमच्या नियोजित भेटी पहा',
      bookConsultation: 'सल्लामसलत बुक करा',
      scheduleDoctor: 'डॉक्टरची भेट निश्चित करा',
      recordSymptoms: 'लक्षणे रेकॉर्ड करा',
      logSymptoms: 'तुमची सध्याची लक्षणे लॉग करा',
      healthTrends: 'आरोग्य ट्रेंड',
      viewAnalytics: 'तुमचे आरोग्य विश्लेषण पहा',
      myProfile: 'माझे प्रोफाइल',
      viewEditProfile: 'तुमचे प्रोफाइल पहा आणि संपादित करा',
      pendingRequests: 'प्रलंबित विनंत्या',
      waitingApproval: 'मंजुरीची प्रतीक्षा',
      patientHistory: 'रुग्ण इतिहास',
      viewRecords: 'संपूर्ण रुग्ण रेकॉर्ड पहा',
      manageSlots: 'स्लॉट व्यवस्थापित करा',
      setAvailability: 'तुमची उपलब्धता सेट करा',
      awaitingApproval: 'मंजुरीची प्रतीक्षा',
      totalPatients: 'एकूण रुग्ण',
      uniquePatients: 'अद्वितीय रुग्ण',
      confirmedAppointments: 'पुष्टी केलेल्या भेटी',
      scheduled: 'निर्धारित',
      backToDashboard: 'डॅशबोर्डवर परत जा'
    },
    appointments: {
      title: 'माझ्या भेटी',
      pending: 'प्रलंबित',
      confirmed: 'पुष्टी केली',
      rejected: 'नाकारले',
      noPending: 'कोणत्याही प्रलंबित भेटी नाहीत',
      noConfirmed: 'कोणत्याही पुष्टी केलेल्या भेटी नाहीत',
      noRejected: 'कोणत्याही नाकारलेल्या भेटी नाहीत',
      awaitingApproval: 'डॉक्टरच्या मंजुरीची प्रतीक्षा',
      appointmentConfirmed: 'भेटीची पुष्टी केली',
      date: 'तारीख',
      time: 'वेळ',
      symptoms: 'लक्षणे',
      notes: 'नोट्स',
      noNotes: 'कोणत्याही अतिरिक्त नोट्स नाहीत',
      joinCall: 'व्हिडिओ कॉलमध्ये सामील व्हा'
    },
    symptoms: {
      title: 'लक्षणे रेकॉर्ड करा',
      selectSymptoms: 'तुमची लक्षणे निवडा',
      additionalNotes: 'अतिरिक्त नोट्स',
      notesPlaceholder: 'कोणत्याही अतिरिक्त लक्षणे किंवा चिंतांचे वर्णन करा...',
      analyzeButton: 'लक्षणांचे विश्लेषण करा',
      analyzing: 'विश्लेषण करत आहे...',
      selectOne: 'कृपया किमान एक लक्षण निवडा',
      analysisComplete: 'विश्लेषण पूर्ण',
      reportTitle: 'लक्षण विश्लेषण अहवाल',
      reportedSymptoms: 'अहवाल दिलेली लक्षणे',
      extractedSymptoms: 'काढलेली लक्षणे',
      possibleConditions: 'संभाव्य स्थिती',
      recommendedMedicines: 'शिफारस केलेली औषधे (डॉक्टरांचा सल्ला घ्या)',
      preliminaryAdvice: 'प्राथमिक सल्ला',
      restHydrated: 'विश्रांती घ्या आणि हायड्रेटेड राहा',
      monitorTemp: 'ताप कायम राहिल्यास तापमान तपासा',
      consultDoctor: 'लक्षणे बिघडल्यास डॉक्टरांचा सल्ला घ्या',
      avoidSelfMed: 'व्यावसायिक सल्ल्याशिवाय स्वयं-औषध टाळा',
      disclaimer: 'हा एक प्राथमिक अहवाल आहे. कृपया योग्य निदान आणि उपचारांसाठी आरोग्य व्यावसायिकांचा सल्ला घ्या.',
      downloadReport: 'अहवाल डाउनलोड करा',
      backToSymptoms: 'लक्षणांवर परत जा',
      uploadDocuments: 'आरोग्य दस्तऐवज अपलोड करा'
    },
    healthDocument: {
      upload: 'आरोग्य दस्तऐवज अपलोड करा',
      uploadDesc: 'वैद्यकीय अहवाल, प्रिस्क्रिप्शन किंवा इतर आरोग्य दस्तऐवज अपलोड करा',
      title: 'दस्तऐवज शीर्षक',
      titlePlaceholder: 'उदा., रक्त चाचणी अहवाल - जानेवारी 2024',
      selectFile: 'फाइल निवडा',
      uploadButton: 'दस्तऐवज अपलोड करा',
      uploading: 'अपलोड होत आहे...',
      success: 'दस्तऐवज यशस्वीरित्या अपलोड केले!',
      error: 'कृपया फाइल निवडा आणि शीर्षक प्रविष्ट करा',
      noFile: 'कोणतीही फाइल निवडली नाही'
    },
    howItWorks: {
      title: 'हे कसे कार्य करते',
      saveTimeTitle: 'वेळ वाचवा',
      saveTimeDesc: 'कोणतीही प्रतीक्षा खोली किंवा प्रवास वेळ नाही. कोठूनही सल्लामसलत मिळवा.',
      secureTitle: 'सुरक्षित आणि खाजगी',
      secureDesc: 'तुमचा आरोग्य डेटा उद्योग-अग्रणी सुरक्षिततेसह एन्क्रिप्ट केलेला आणि संरक्षित आहे.',
      expertDoctorsTitle: 'तज्ञ डॉक्टर',
      expertDoctorsDesc: 'कधीही, कोठूनही पात्र आरोग्य व्यावसायिकांशी संपर्क साधा.'
    },
    profile: {
      title: 'रुग्ण प्रोफाइल',
      personalInfo: 'वैयक्तिक माहिती',
      profileDetails: 'तुमचे मूलभूत आरोग्य प्रोफाइल तपशील',
      name: 'नाव',
      email: 'ईमेल',
      phone: 'फोन',
      bloodGroup: 'रक्त गट',
      address: 'पत्ता',
      notProvided: 'प्रदान केलेले नाही',
      quickStats: 'जलद आकडेवारी',
      totalReports: 'एकूण अहवाल',
      prescriptions: 'प्रिस्क्रिप्शन',
      lastVisit: 'शेवटची भेट',
      healthDocuments: 'आरोग्य दस्तऐवज',
      uploadNew: 'नवीन दस्तऐवज अपलोड करा',
      medicalReports: 'वैद्यकीय अहवाल',
      noReports: 'अद्याप कोणतेही वैद्यकीय अहवाल अपलोड केलेले नाहीत',
      noPrescriptions: 'कोणतेही प्रिस्क्रिप्शन उपलब्ध नाहीत',
      editProfile: 'प्रोफाइल संपादित करा'
    },
    consult: {
      title: 'सल्लामसलत बुक करा',
      findDoctor: 'तुमचे डॉक्टर शोधा',
      selectDoctor: 'उपलब्ध स्लॉट पाहण्यासाठी डॉक्टर निवडा',
      specialty: 'विशेषता',
      experience: 'अनुभव',
      years: 'वर्षे',
      qualification: 'पात्रता',
      about: 'बद्दल',
      achievements: 'उपलब्धी',
      viewSlots: 'उपलब्ध स्लॉट पहा',
      selectDate: 'तारीख निवडा',
      availableSlots: 'उपलब्ध स्लॉट',
      noSlotsAvailable: 'या तारखेसाठी कोणतेही स्लॉट उपलब्ध नाहीत',
      selectSlot: 'कृपया वेळ स्लॉट निवडा',
      bookAppointment: 'भेट बुक करा',
      confirmBooking: 'बुकिंगची पुष्टी करा',
      confirmMessage: 'तुम्हाला खात्री आहे की तुम्ही ही भेट बुक करू इच्छिता?',
      doctor: 'डॉक्टर',
      dateTime: 'तारीख आणि वेळ',
      booking: 'बुकिंग होत आहे...',
      bookingSuccess: 'भेट यशस्वीरित्या बुक झाली!',
      bookingError: 'भेट बुक करण्यात अयशस्वी'
    },
    common: {
      error: 'त्रुटी',
      success: 'यश',
      loading: 'लोड होत आहे...',
      save: 'जतन करा',
      cancel: 'रद्द करा',
      close: 'बंद करा',
      back: 'परत',
      next: 'पुढे',
      submit: 'सबमिट करा',
      delete: 'हटवा',
      edit: 'संपादित करा',
      view: 'पहा',
      search: 'शोधा',
      filter: 'फिल्टर',
      sort: 'क्रमवारी लावा',
      actions: 'क्रिया'
    }
  }
};
