# Database Data Translation Guide

## Overview
Currently, the application has multilingual support for **UI elements** (buttons, labels, navigation, etc.) through the `LanguageContext`. However, **data fetched from the database** (like doctor names, specialties, clinic addresses, appointment notes, etc.) is not automatically translated.

## Current Situation
✅ **Translated**: All UI text, labels, buttons, navigation
❌ **Not Translated**: Database content (doctor info, appointments, health records, etc.)

## Options for Database Data Translation

### Option 1: Store Multiple Language Versions (Recommended for MVP)
Store content in multiple languages directly in your database.

**Example Schema Update:**
```sql
-- For doctors_info table
ALTER TABLE doctors_info 
ADD COLUMN specialty_hi TEXT,
ADD COLUMN specialty_mr TEXT,
ADD COLUMN about_hi TEXT,
ADD COLUMN about_mr TEXT;
```

**Usage in Frontend:**
```typescript
const { t, language } = useLanguage();

// Display specialty based on current language
const displaySpecialty = 
  language === 'hi' ? doctor.specialty_hi :
  language === 'mr' ? doctor.specialty_mr :
  doctor.specialty; // default English
```

**Pros:**
- Simple to implement
- Fast (no API calls)
- Works offline
- No additional costs

**Cons:**
- Larger database
- Doctors must provide content in multiple languages
- Manual data entry for each language

---

### Option 2: Translation API/Service
Use a translation service to translate content on-the-fly.

**Implementation:**
```typescript
import { useEffect, useState } from 'react';

const useTranslatedText = (text: string, targetLang: string) => {
  const [translated, setTranslated] = useState(text);
  
  useEffect(() => {
    if (targetLang === 'en') {
      setTranslated(text);
      return;
    }
    
    // Call translation API
    translateText(text, targetLang)
      .then(result => setTranslated(result))
      .catch(() => setTranslated(text)); // Fallback to original
  }, [text, targetLang]);
  
  return translated;
};
```

**Services to Consider:**
- Google Cloud Translation API
- AWS Translate
- Azure Translator
- LibreTranslate (free, open-source)

**Pros:**
- No database changes needed
- Automatic translation
- Support for many languages

**Cons:**
- API costs
- Network latency
- Requires internet connection
- Translation quality varies

---

### Option 3: Translation Keys in Database
Store translation keys in the database and translate on the frontend.

**Example:**
```sql
-- Store keys instead of actual text
INSERT INTO doctors_info (specialty) VALUES ('specialty.cardiology');
```

**Frontend:**
```typescript
// Add to LanguageContext
const specialties = {
  en: {
    'specialty.cardiology': 'Cardiology',
    'specialty.neurology': 'Neurology'
  },
  hi: {
    'specialty.cardiology': 'हृदय रोग विशेषज्ञ',
    'specialty.neurology': 'तंत्रिका विशेषज्ञ'
  }
};

// Usage
const displayText = t(doctor.specialty); // Returns translated text
```

**Pros:**
- Centralized translations
- Easy to update translations
- Consistent terminology

**Cons:**
- Limited to pre-defined keys
- Not suitable for free-text fields (like notes, descriptions)
- Requires restructuring data

---

## Recommended Approach

### For Your Telemedicine App:

1. **Static/Structured Data** (Specialties, Blood Groups, Symptoms):
   - Use **Option 3** (Translation Keys)
   - Add them to `LanguageContext`
   
2. **User-Generated Content** (Doctor profiles, notes, descriptions):
   - Use **Option 1** (Multiple Language Columns)
   - Doctors can optionally provide translations
   
3. **Dynamic Content** (Appointment times, dates):
   - Use locale formatting (already works with `date-fns`)

---

## Implementation Example

### 1. Add Structured Data Translations
```typescript
// In LanguageContext.tsx
const translations = {
  en: {
    specialties: {
      cardiology: 'Cardiology',
      neurology: 'Neurology',
      pediatrics: 'Pediatrics',
      general: 'General Medicine'
    },
    bloodGroups: {
      'A+': 'A Positive',
      'O-': 'O Negative',
      // ... etc
    }
  },
  hi: {
    specialties: {
      cardiology: 'हृदय रोग विशेषज्ञ',
      neurology: 'तंत्रिका विशेषज्ञ',
      pediatrics: 'बाल रोग विशेषज्ञ',
      general: 'सामान्य चिकित्सा'
    },
    bloodGroups: {
      'A+': 'ए पॉज़िटिव',
      'O-': 'ओ नेगेटिव'
    }
  }
};
```

### 2. Create a Helper Hook
```typescript
// hooks/useTranslatedData.ts
export const useTranslatedData = () => {
  const { t, language } = useLanguage();
  
  const translateSpecialty = (specialty: string) => {
    // Try to translate, fallback to original
    const key = `specialties.${specialty.toLowerCase().replace(' ', '')}`;
    const translated = t(key);
    return translated === key ? specialty : translated;
  };
  
  return { translateSpecialty };
};
```

### 3. Use in Components
```typescript
const DoctorCard = ({ doctor }) => {
  const { translateSpecialty } = useTranslatedData();
  
  return (
    <div>
      <h3>{doctor.name}</h3> {/* Names don't translate */}
      <p>{translateSpecialty(doctor.specialty)}</p>
    </div>
  );
};
```

---

## What to Translate vs What Not to Translate

### ✅ Translate:
- Field labels and headings
- Status messages
- Specialties/categories
- Symptom names
- Pre-defined conditions

### ❌ Don't Translate:
- Patient/Doctor names
- Email addresses
- Phone numbers
- Dates (format them with locale instead)
- Medical record IDs
- File names

---

## Future Enhancements

1. **Language-specific input forms**: Allow doctors to input information in multiple languages
2. **Auto-translation toggle**: Add a setting to enable/disable auto-translation
3. **Hybrid approach**: Use translation keys for common terms, store multiple versions for custom content

---

## Getting Started

1. Identify which database fields need translation
2. Choose the appropriate strategy for each type of content
3. Update database schema if needed
4. Add translations to `LanguageContext`
5. Create helper hooks/functions
6. Update components to use translated data

Remember: **Start simple** with Option 1 or 3, and add AI-powered translation (Option 2) later if needed!
