import { Platform } from 'react-native';

// Try to import from @env, fallback to process.env
let AMAP_ANDROID_API_KEY: string;
let AMAP_IOS_API_KEY: string; 
let AMAP_WEB_SERVICE_API_KEY: string;

try {
  // Try importing from @env (react-native-dotenv)
  const envModule = require('@env');
  AMAP_ANDROID_API_KEY = envModule.AMAP_ANDROID_API_KEY;
  AMAP_IOS_API_KEY = envModule.AMAP_IOS_API_KEY;
  AMAP_WEB_SERVICE_API_KEY = envModule.AMAP_WEB_SERVICE_API_KEY;
} catch (error) {
  // Fallback to process.env
  console.log('Using process.env for API keys');
  AMAP_ANDROID_API_KEY = process.env.AMAP_ANDROID_API_KEY || '';
  AMAP_IOS_API_KEY = process.env.AMAP_IOS_API_KEY || '';
  AMAP_WEB_SERVICE_API_KEY = process.env.AMAP_WEB_SERVICE_API_KEY || '';
}

// Environment variables loaded at build time via react-native-dotenv
const getEnvVar = (key: string, value?: string): string => {
  if (!value || value === 'undefined') {
    console.error(`Missing environment variable: ${key}`);
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
};

// Get API keys from environment variables loaded by react-native-dotenv
const getAMapAPIKey = (): string => {
  try {
    if (Platform.OS === 'ios') {
      return getEnvVar('AMAP_IOS_API_KEY', AMAP_IOS_API_KEY);
    } else {
      return getEnvVar('AMAP_ANDROID_API_KEY', AMAP_ANDROID_API_KEY);
    }
  } catch (error) {
    // Development fallback - remove this in production
    console.warn('Using development API keys. Set proper environment variables for production!');
    return Platform.OS === 'ios' ? 'DEV_IOS_KEY' : 'DEV_ANDROID_KEY';
  }
};

const getWebServiceAPIKey = (): string => {
  try {
    return getEnvVar('AMAP_WEB_SERVICE_API_KEY', AMAP_WEB_SERVICE_API_KEY);
  } catch (error) {
    console.warn('Using development web service key. Set AMAP_WEB_SERVICE_API_KEY for production!');
    return 'DEV_WEB_SERVICE_KEY';
  }
};

export interface AMapConfig {
  androidApiKey: string;
  iosApiKey: string;
  webServiceApiKey: string;
}

// Export configuration object
export const getAMapConfig = (): AMapConfig => {
  return {
    androidApiKey: Platform.OS === 'android' ? getAMapAPIKey() : getEnvVar('AMAP_ANDROID_API_KEY', AMAP_ANDROID_API_KEY),
    iosApiKey: Platform.OS === 'ios' ? getAMapAPIKey() : getEnvVar('AMAP_IOS_API_KEY', AMAP_IOS_API_KEY),
    webServiceApiKey: getWebServiceAPIKey(),
  };
};

// Validate configuration
export const validateAMapConfig = (config: AMapConfig): boolean => {
  const keys = [config.androidApiKey, config.iosApiKey, config.webServiceApiKey];
  const hasDevKeys = keys.some(key => key.startsWith('DEV_') || key.includes('your_') || key === 'undefined');
  
  if (hasDevKeys) {
    console.warn('⚠️  Warning: Using development or placeholder API keys. This will not work in production!');
    return false;
  }
  
  console.log('✅ AMap configuration validated successfully');
  return true;
};

// Debug helper (don't use in production)
export const debugConfig = (config: AMapConfig) => {
  if (__DEV__) {
    console.log('AMap Config Debug:', {
      android: config.androidApiKey ? `${config.androidApiKey.substring(0, 8)}...` : 'NOT SET',
      ios: config.iosApiKey ? `${config.iosApiKey.substring(0, 8)}...` : 'NOT SET',
      webService: config.webServiceApiKey ? `${config.webServiceApiKey.substring(0, 8)}...` : 'NOT SET',
    });
  }
};