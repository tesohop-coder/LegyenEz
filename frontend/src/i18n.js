import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import de from './locales/de.json';
import hu from './locales/hu.json';
import en from './locales/en.json';
import pl from './locales/pl.json';
import nl from './locales/nl.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      hu: { translation: hu },
      en: { translation: en },
      pl: { translation: pl },
      nl: { translation: nl }
    },
    fallbackLng: 'de', // Default: German
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false // Disable suspense for instant language switching
    }
  });

export default i18n;
