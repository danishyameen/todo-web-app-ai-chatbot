// Language detection utility
// Detects user's language from browser and message content

export type SupportedLanguage = 'en' | 'ur' | 'hi' | 'ar' | 'auto';

export interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: number;
  browserLanguage: string;
}

class LanguageDetector {
  private static readonly URDU_PATTERNS = /[\u0600-\u06FF]/; // Urdu/Arabic script
  private static readonly HINDI_PATTERNS = /[\u0900-\u097F]/; // Devanagari script
  private static readonly ROMAN_URDU_KEYWORDS = /\b(aap|hai|hain|ka|ke|ki|ko|se|mein|mai|kya|yeh|wo|kaise|kab|kahan|kyun|acha|theek|shukriya|meherbani)\b/i;

  /**
   * Detect language from text content
   */
  static detectFromText(text: string): SupportedLanguage {
    if (!text || text.trim().length === 0) {
      return 'auto';
    }

    // Check for Urdu/Arabic script
    if (this.URDU_PATTERNS.test(text)) {
      return 'ur';
    }

    // Check for Hindi/Devanagari script
    if (this.HINDI_PATTERNS.test(text)) {
      return 'hi';
    }

    // Check for Roman Urdu keywords
    if (this.ROMAN_URDU_KEYWORDS.test(text.toLowerCase())) {
      return 'ur';
    }

    // Default to English if no patterns match
    return 'en';
  }

  /**
   * Get browser's preferred language
   */
  static getBrowserLanguage(): string {
    if (typeof window === 'undefined') {
      return 'en-US';
    }

    return navigator.language || 'en-US';
  }

  /**
   * Detect language with confidence score
   */
  static detectWithConfidence(text: string): LanguageDetectionResult {
    const browserLang = this.getBrowserLanguage();
    const detectedLang = this.detectFromText(text);
    
    // Calculate confidence based on pattern matches
    let confidence = 0.5; // Base confidence

    if (this.URDU_PATTERNS.test(text)) {
      confidence = 0.95;
    } else if (this.HINDI_PATTERNS.test(text)) {
      confidence = 0.95;
    } else if (this.ROMAN_URDU_KEYWORDS.test(text)) {
      confidence = 0.75;
    } else {
      confidence = 0.6; // English default
    }

    return {
      language: detectedLang,
      confidence,
      browserLanguage: browserLang
    };
  }

  /**
   * Get language code for API request
   */
  static getLanguageCode(text: string): string {
    const detected = this.detectFromText(text);
    
    const languageMap: Record<SupportedLanguage, string> = {
      'en': 'en-US',
      'ur': 'ur-PK',
      'hi': 'hi-IN',
      'ar': 'ar-SA',
      'auto': 'auto'
    };

    return languageMap[detected] || 'en-US';
  }

  /**
   * Format system prompt with language instruction
   */
  static formatSystemPrompt(userLanguage: SupportedLanguage): string {
    const prompts: Record<SupportedLanguage, string> = {
      'en': 'You are a helpful AI assistant for a task management app. Respond in English.',
      'ur': 'You are a helpful AI assistant for a task management app. User is speaking in Urdu/Roman Urdu. Please respond in the same language they are using (Roman Urdu if they use Roman script, or Urdu script if they use Urdu script). Be natural and conversational.',
      'hi': 'You are a helpful AI assistant for a task management app. User is speaking in Hindi. Please respond in Hindi (Devanagari script). Be natural and conversational.',
      'ar': 'You are a helpful AI assistant for a task management app. User is speaking in Arabic. Please respond in Arabic. Be natural and conversational.',
      'auto': 'You are a helpful AI assistant for a task management app. Detect the user\'s language and respond in the same language they are using.'
    };

    return prompts[userLanguage] || prompts['en'];
  }

  /**
   * Check if text is in Roman/Latin script
   */
  static isRomanScript(text: string): boolean {
    // Check if text primarily contains Latin characters
    const latinChars = text.match(/[a-zA-Z]/g)?.length || 0;
    const totalChars = text.replace(/\s/g, '').length;
    
    return totalChars > 0 && (latinChars / totalChars) > 0.5;
  }
}

export default LanguageDetector;
