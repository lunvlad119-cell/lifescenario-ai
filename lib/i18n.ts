import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '@/locales/en.json';
import ru from '@/locales/ru.json';

const resources = {
  en: { translation: en },
  ru: { translation: ru },
};

const LANGUAGE_KEY = 'app_language';

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Load saved language on app start
export async function initializeLanguage() {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage && resources[savedLanguage as keyof typeof resources]) {
      await i18n.changeLanguage(savedLanguage);
      return savedLanguage;
    }

    // Use device language if available
    const deviceLanguage = Localization.getLocales()[0]?.languageCode;
    if (deviceLanguage && resources[deviceLanguage as keyof typeof resources]) {
      await i18n.changeLanguage(deviceLanguage);
      return deviceLanguage;
    }

    // Default to English
    await i18n.changeLanguage('en');
    return 'en';
  } catch (error) {
    console.error('Failed to initialize language:', error);
    await i18n.changeLanguage('en');
    return 'en';
  }
}

// Save language preference
export async function setLanguage(language: string) {
  try {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.error('Failed to set language:', error);
  }
}

// Get current language
export function getCurrentLanguage() {
  return i18n.language;
}

// Get available languages
export function getAvailableLanguages() {
  return Object.keys(resources);
}

export default i18n;
