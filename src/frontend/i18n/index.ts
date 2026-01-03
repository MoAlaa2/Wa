import { en } from './en';
import { ar } from './ar';
import { Language } from '../types';

export const translations = {
  en,
  ar,
};

export const getTranslation = (lang: Language) => {
  return translations[lang];
};