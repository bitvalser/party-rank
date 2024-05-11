import i18n, { Resource } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enJson from './en.json';
import ruJson from './ru.json';

const resources: Resource = {
  en: {
    main: enJson,
  },
  ru: {
    main: ruJson,
  },
};

const selectedLanguage = localStorage.getItem('settings:language');

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'main',
    ...(selectedLanguage ? { lng: selectedLanguage } : {}),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
