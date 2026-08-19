// =========================================================================
// HOME Platform - Multilingual Voice AI & Speech Synthesis Engine
// =========================================================================

import { LanguageOption, SupportedLanguageCode } from '../types/intelligence';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', name: 'Mandarin Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪' },
];

export const UI_TRANSLATIONS: Record<SupportedLanguageCode, Record<string, string>> = {
  en: {
    heroTitle: 'The Next Era of Living & Investment',
    exploreDashboard: 'Explore Dashboard',
    launchScribble: 'Launch Scribble Map & Listings',
    soilBearing: 'Subsurface Soil',
    safetyIndex: 'Safety Index',
    passVerdict: 'ROI Verdict',
    earthEngine: 'Earth Engine Multispectral',
    geminiVision: 'Gemini Vision AI',
    voiceAssistant: 'Voice Assistant',
    resetFilters: 'Reset Filters',
    applyOnline: 'Apply Online',
  },
  es: {
    heroTitle: 'La Próxima Era de Vivienda e Inversión',
    exploreDashboard: 'Explorar Panel',
    launchScribble: 'Mapa de Trazo Libre y Listados',
    soilBearing: 'Suelo Subterráneo',
    safetyIndex: 'Índice de Seguridad',
    passVerdict: 'Veredicto de Retorno',
    earthEngine: 'Multiespectral Earth Engine',
    geminiVision: 'Visión Gemini AI',
    voiceAssistant: 'Asistente de Voz',
    resetFilters: 'Restablecer Filtros',
    applyOnline: 'Solicitar en Línea',
  },
  hi: {
    heroTitle: 'आवास और संस्थागत निवेश का नया युग',
    exploreDashboard: 'डैशबोर्ड देखें',
    launchScribble: 'मानचित्र और संपत्तियां',
    soilBearing: 'भूगर्भ मिट्टी क्षमता',
    safetyIndex: 'सुरक्षा सूचकांक',
    passVerdict: 'निवेश परिणाम',
    earthEngine: 'अर्थ इंजन स्पेक्ट्रल',
    geminiVision: 'जेमिनी विज़न AI',
    voiceAssistant: 'ध्वनि सहायक',
    resetFilters: 'फ़िल्टर रीसेट',
    applyOnline: 'ऑनलाइन आवेदन',
  },
  zh: {
    heroTitle: '居住与机构投资的新纪元',
    exploreDashboard: '探索数据看板',
    launchScribble: '圈选地图与房源',
    soilBearing: '地下土壤承载力',
    safetyIndex: '安全指数',
    passVerdict: '投资回报判定',
    earthEngine: '地球引擎多光谱卫星',
    geminiVision: 'Gemini 视觉 AI',
    voiceAssistant: '语音智能助手',
    resetFilters: '重置筛选',
    applyOnline: '在线申请',
  },
  ru: {
    heroTitle: 'Новая эра недвижимости и инвестиций',
    exploreDashboard: 'Открыть панель',
    launchScribble: 'Карта и объекты',
    soilBearing: 'Несущая способность грунта',
    safetyIndex: 'Индекс безопасности',
    passVerdict: 'Вердикт ROI',
    earthEngine: 'Спектральный Earth Engine',
    geminiVision: 'Gemini Vision AI',
    voiceAssistant: 'Голосовой помощник',
    resetFilters: 'Сбросить фильтры',
    applyOnline: 'Подать заявку',
  },
  pt: {
    heroTitle: 'A Próxima Era de Moradia e Investimento',
    exploreDashboard: 'Explorar Painel',
    launchScribble: 'Mapa Livre e Imóveis',
    soilBearing: 'Solo Subterrâneo',
    safetyIndex: 'Índice de Segurança',
    passVerdict: 'Veredito ROI',
    earthEngine: 'Multiespectral Earth Engine',
    geminiVision: 'Gemini Vision AI',
    voiceAssistant: 'Assistente de Voz',
    resetFilters: 'Redefinir Filtros',
    applyOnline: 'Candidatar Online',
  },
  ar: {
    heroTitle: 'العصر القادم للمعيشة والاستثمار العقاري',
    exploreDashboard: 'استكشاف لوحة التحكم',
    launchScribble: 'الخريطة والعقارات',
    soilBearing: 'قدرة تحمل التربة',
    safetyIndex: 'مؤشر الأمان',
    passVerdict: 'عائد الاستثمار',
    earthEngine: 'محرك الأرض متعدد الأطياف',
    geminiVision: 'رؤية Gemini AI',
    voiceAssistant: 'المساعد الصوتي',
    resetFilters: 'إعادة ضبط الفلاتر',
    applyOnline: 'تقديم طلب عبر الإنترنت',
  },
};

export function speakText(text: string, langCode: SupportedLanguageCode = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this device/browser');
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang.startsWith(langCode));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}
