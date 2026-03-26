import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import hi from './hi.json';
import ar from './ar.json';
import bn from './bn.json';
import sw from './sw.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    ar: { translation: ar },
    bn: { translation: bn },
    sw: { translation: sw },
  },
  lng: localStorage.getItem('edumesh-lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
