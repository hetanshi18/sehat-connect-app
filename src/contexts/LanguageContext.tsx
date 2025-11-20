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
    }
  }
};
