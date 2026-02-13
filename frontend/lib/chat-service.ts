// frontend/lib/chat-service.ts
// Service for handling chat operations with security and validation

import { CHAT_CONFIG } from './chat-config';
import { isTokenValid, getUserIdFromToken, isAuthenticated, getCurrentUser } from './auth-validation';
import LanguageDetector from './language-detector';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  userId: string;
}

interface ChatRequest {
  userId: string;
  message: string;
  conversationId?: string;
}

interface ChatResponse {
  success: boolean;
  message?: string;
  conversationId?: string;
  data?: any;
}

class ChatService {
  private validateDomain(): boolean {
    if (typeof window === 'undefined') return true; // Server-side rendering

    const currentOrigin = window.location.origin;
    const isValidDomain = CHAT_CONFIG.allowedDomains.some(domain =>
      currentOrigin.includes(domain) || currentOrigin.includes(`localhost`) || currentOrigin.includes(`127.0.0.1`)
    );

    return isValidDomain;
  }

  private validateMessage(message: string): { isValid: boolean; error?: string } {
    if (!message || message.trim().length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }

    if (message.length > CHAT_CONFIG.maxMessageLength) {
      return { isValid: false, error: `Message exceeds maximum length of ${CHAT_CONFIG.maxMessageLength} characters` };
    }

    // Basic XSS prevention - sanitize input
    const sanitized = this.sanitizeInput(message);
    if (sanitized !== message) {
      return { isValid: false, error: 'Message contains invalid characters' };
    }

    return { isValid: true };
  }

  private sanitizeInput(input: string): string {
    // Remove potentially dangerous characters/sequences
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  private isTokenValid(token: string): boolean {
    try {
      // Remove 'Bearer ' prefix if present
      const rawToken = token.startsWith('Bearer ') ? token.substring(7) : token;

      // Split the token to get the payload (middle part)
      const tokenParts = rawToken.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format');
        return false;
      }

      const base64Url = tokenParts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      // Properly decode base64 string to handle UTF-8 characters in JWT payload
      // First, pad the base64 string if needed
      const padding = '='.repeat((4 - base64.length % 4) % 4);
      const base64Padded = base64 + padding;

      // Decode base64 to bytes
      const binaryString = atob(base64Padded);

      // Convert binary string to proper UTF-8 string
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const jsonPayload = new TextDecoder().decode(bytes);

      const decodedToken = JSON.parse(jsonPayload);

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.log('Token has expired');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  // Method to refresh token if expired
  private async refreshToken(): Promise<string | null> {
    try {
      // Get refresh token from storage
      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

      if (!refreshToken) {
        console.error('No refresh token available');
        return null;
      }

      // Call backend refresh endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();

        // Update tokens in storage
        sessionStorage.setItem('authToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);

        return data.access_token;
      } else {
        console.error('Token refresh failed');
        return null;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }


  // Check if we're online
  private isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
  }

  // Enhanced authentication validation
  private validateAuthentication(): { isValid: boolean; token?: string; userId?: string; error?: string } {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      return {
        isValid: false,
        error: 'User not authenticated. Please log in to use the AI chatbot.'
      };
    }

    // Get token from sessionStorage (try both possible keys)
    let token = sessionStorage.getItem('authToken');
    if (!token) {
      token = sessionStorage.getItem('auth-token');  // Alternative key name
    }

    if (!token) {
      // Also check localStorage as fallback
      token = localStorage.getItem('authToken') || localStorage.getItem('auth-token');
    }

    if (!token) {
      return {
        isValid: false,
        error: 'Authentication token not found. Please log in again.'
      };
    }

    // Validate token - ensure it's in the right format for validation
    let tokenToValidate = token;
    if (!token.startsWith('Bearer ')) {
      tokenToValidate = `Bearer ${token}`;
    }

    if (!this.isTokenValid(tokenToValidate)) {
      return {
        isValid: false,
        error: 'Authentication token has expired. Please log in again.'
      };
    }

    // Get user ID from token using the imported function
    const userId = getUserIdFromToken(tokenToValidate);
    if (!userId) {
      return {
        isValid: false,
        error: 'Could not extract user ID from token. Please log in again.'
      };
    }

    return { isValid: true, token: tokenToValidate, userId };
  }

  async sendMessage(request: ChatRequest, token?: string): Promise<ChatResponse> {
    // Validate domain
    if (!this.validateDomain()) {
      return {
        success: false,
        message: 'Unauthorized domain access to chat service'
      };
    }

    // Validate authentication - use provided token if available, otherwise get from storage
    let authResult;
    let currentToken = token;

    if (currentToken) {
      // Use the provided token directly
      if (!this.isTokenValid(currentToken)) {
        // Try to refresh the token
        const refreshedToken = await this.refreshToken();
        if (refreshedToken) {
          currentToken = refreshedToken;
        } else {
          // If refresh failed, get token from storage as fallback
          const storageToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
          if (storageToken) {
            currentToken = storageToken.startsWith('Bearer ') ? storageToken : `Bearer ${storageToken}`;
            if (!this.isTokenValid(currentToken)) {
              return {
                success: false,
                message: 'Authentication token has expired. Please log in again.'
              };
            }
          } else {
            return {
              success: false,
              message: 'Authentication token has expired. Please log in again.'
            };
          }
        }
      }

      const userId = getUserIdFromToken(currentToken);
      if (!userId) {
        return {
          success: false,
          message: 'Could not extract user ID from token. Please log in again.'
        };
      }

      authResult = { isValid: true, token: currentToken, userId };
    } else {
      // Fall back to getting token from storage (for backward compatibility)
      authResult = this.validateAuthentication();

      // If token is not valid, try to refresh it
      if (!authResult.isValid && authResult.error?.includes('expired')) {
        const refreshedToken = await this.refreshToken();
        if (refreshedToken) {
          const refreshedUserId = getUserIdFromToken(refreshedToken);
          if (refreshedUserId) {
            authResult = { isValid: true, token: refreshedToken, userId: refreshedUserId };
          }
        }
      }
    }

    if (!authResult.isValid) {
      return {
        success: false,
        message: authResult.error || 'Authentication validation failed'
      };
    }

    // Use validated token and userId from auth validation
    const { token: authToken, userId } = authResult;

    // Override request.userId with validated userId to ensure consistency
    const validatedRequest = {
      ...request,
      userId: userId!
    };

    // Validate message
    const validation = this.validateMessage(validatedRequest.message);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.error
      };
    }

    // Detect user's language from message
    const languageDetection = LanguageDetector.detectWithConfidence(validatedRequest.message);
    const languageCode = LanguageDetector.getLanguageCode(validatedRequest.message);
    const systemPrompt = LanguageDetector.formatSystemPrompt(languageDetection.language);

    // Check if we're online
    if (this.isOnline()) {
      // Online mode - send to server
      try {
        // Construct the endpoint with the validated user ID
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000/api';
        const endpoint = `${baseUrl}/${validatedRequest.userId}/chat`;

        // Ensure the token has the correct format for the Authorization header
        const formattedAuthToken = authToken && authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken || ''}`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': formattedAuthToken,
            'Accept-Language': languageCode,
          },
          body: JSON.stringify({
            message: validatedRequest.message,
            conversationId: validatedRequest.conversationId,
            language: languageDetection.language,
            languageCode: languageCode,
            systemPrompt: systemPrompt
          }),
          signal: AbortSignal.timeout(CHAT_CONFIG.timeoutMs)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('HTTP error response:', response.status, errorText);

          // If it's a 401 error, it might be due to token expiration
          if (response.status === 401) {
            // Try to refresh the token and retry the request
            const refreshedToken = await this.refreshToken();
            if (refreshedToken) {
              // Ensure the refreshed token has the correct format for the Authorization header
              const formattedRefreshedToken = refreshedToken.startsWith('Bearer ') ? refreshedToken : `Bearer ${refreshedToken}`;

              // Retry the request with the new token
              const retryResponse = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': formattedRefreshedToken,
                  'Accept-Language': languageCode,
                },
                body: JSON.stringify({
                  message: validatedRequest.message,
                  conversationId: validatedRequest.conversationId,
                  language: languageDetection.language,
                  languageCode: languageCode,
                  systemPrompt: systemPrompt
                }),
                signal: AbortSignal.timeout(CHAT_CONFIG.timeoutMs)
              });

              if (retryResponse.ok) {
                const data = await retryResponse.json();
                return {
                  success: true,
                  data,
                  conversationId: data.conversationId
                };
              }
            }

            return {
              success: false,
              message: 'Authentication expired. Please log in again to continue using the AI chatbot.'
            };
          }

          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        return {
          success: true,
          data,
          conversationId: data.conversationId
        };
      } catch (error: any) {
        console.error('Error sending message to server:', error);
        // Even though we got an error, save to offline storage for later sync
        this.saveMessageOffline(validatedRequest, 'failed');
        return {
          success: false,
          message: error.message || 'Failed to send message to server'
        };
      }
    } else {
      // Offline mode - save to local storage
      this.saveMessageOffline(validatedRequest, 'pending');
      return {
        success: true,
        message: 'Message saved offline. Will sync when connection is restored.',
        data: { response: 'You are currently offline. Your message has been saved and will be processed when you reconnect to the internet.' }
      };
    }
  }

  private saveMessageOffline(request: ChatRequest, status: 'pending' | 'failed' | 'synced'): void {
    try {
      const offlineMessage = {
        ...request,
        id: request.conversationId || Date.now().toString(), // Use conversationId or timestamp as ID
        timestamp: new Date().toISOString(),
        status,
        synced: status === 'synced'
      };

      // Get user ID to create user-specific storage
      const token = sessionStorage.getItem('authToken');
      let userId = 'unknown';
      if (token) {
        userId = getUserIdFromToken(token) || 'unknown';
      }

      // Load existing offline messages for this user
      const storageKey = `offline_messages_${userId}`;
      const existingMessages = JSON.parse(localStorage.getItem(storageKey) || '[]');
      existingMessages.push(offlineMessage);

      // Save back to local storage
      localStorage.setItem(storageKey, JSON.stringify(existingMessages));
    } catch (error) {
      console.error('Error saving message to offline storage:', error);
    }
  }

  // Method to get offline messages that need to be synced
  getPendingSyncMessages(userId?: string): any[] {
    try {
      // If no userId provided, try to get from current token
      let targetUserId = userId;
      if (!targetUserId) {
        const token = sessionStorage.getItem('authToken');
        if (token) {
          targetUserId = getUserIdFromToken(token) || undefined;
        }
      }

      if (!targetUserId) {
        targetUserId = 'unknown';
      }

      const storageKey = `offline_messages_${targetUserId}`;
      const messages = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return messages.filter((msg: any) => msg.status === 'pending' || msg.status === 'failed');
    } catch (error) {
      console.error('Error getting pending sync messages:', error);
      return [];
    }
  }

  // Method to remove synced messages from offline storage
  removeSyncedMessage(messageId: string, userId?: string): void {
    try {
      // If no userId provided, try to get from current token
      let targetUserId = userId;
      if (!targetUserId) {
        const token = sessionStorage.getItem('authToken');
        if (token) {
          targetUserId = getUserIdFromToken(token) || undefined;
        }
      }

      if (!targetUserId) {
        targetUserId = 'unknown';
      }

      const storageKey = `offline_messages_${targetUserId}`;
      const existingMessages = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedMessages = existingMessages.filter((msg: any) => msg.id !== messageId);
      localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Error removing synced message:', error);
    }
  }

  async getConversationHistory(userId: string, conversationId: string, token?: string): Promise<ChatResponse> {
    if (!this.validateDomain()) {
      return {
        success: false,
        message: 'Unauthorized domain access to chat service'
      };
    }

    try {
      // Construct the endpoint with the user ID
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000/api';
      const endpoint = `${baseUrl}/${userId}/chat/${conversationId}`;

      // Use provided token if available, otherwise fall back to storage
      let currentToken = token;
      if (!currentToken) {
        // Get the token from the same place as other API calls
        // The token is stored in sessionStorage as authToken by the auth context
        currentToken = sessionStorage.getItem('authToken') || localStorage.getItem('auth-token') || '';
      }

      // Validate token if available
      if (currentToken && !this.isTokenValid(currentToken)) {
        // Try to refresh the token
        const refreshedToken = await this.refreshToken();
        if (refreshedToken) {
          currentToken = refreshedToken;
        } else {
          return {
            success: false,
            message: 'Authentication token has expired. Please log in again.'
          };
        }
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
        signal: AbortSignal.timeout(CHAT_CONFIG.timeoutMs)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP error fetching conversation:', response.status, errorText);

        // Check for 401 Unauthorized
        if (response.status === 401) {
          // Try to refresh the token and retry the request
          const refreshedToken = await this.refreshToken();
          if (refreshedToken) {
            // Retry the request with the new token
            const retryResponse = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${refreshedToken}`,
              },
              signal: AbortSignal.timeout(CHAT_CONFIG.timeoutMs)
            });

            if (retryResponse.ok) {
              const data = await retryResponse.json();
              return {
                success: true,
                data
              };
            }
          }

          return {
            success: false,
            message: 'Authentication expired. Please log in again to continue using the AI chatbot.'
          };
        }

        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Error fetching conversation:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch conversation'
      };
    }
  }
}

export const chatService = new ChatService();