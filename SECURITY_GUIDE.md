# 🔐 API Key Security Guide

This guide explains how to securely manage AMap API keys in your Trail Blazer app without exposing them in your source code.

## 🚨 Security Issues with Hardcoded Keys

**Never do this:**
```typescript
// ❌ BAD - Keys are visible in source code and git history
const AMAP_CONFIG = {
  androidApiKey: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  iosApiKey: 'z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4',
  webServiceApiKey: 'f1e2d3c4b5a6978654321098765432109',
};
```

**Problems:**
- API keys are visible to anyone who can see your code
- Keys are stored in git history forever
- Keys can be extracted from compiled apps
- Risk of unauthorized usage and billing

## ✅ Secure Solutions Implemented

### 1. Environment Variables (.env)

**Setup:**
```bash
# Copy example file
cp .env.example .env

# Edit with your actual keys (never commit this file)
vim .env
```

**Usage in code:**
```typescript
// ✅ GOOD - Keys loaded from environment
import { getAMapConfig } from '../config/amapConfig';

const config = getAMapConfig();
```

### 2. Git Ignore Protection

The `.gitignore` file now excludes:
```gitignore
# Environment variables - DO NOT COMMIT
.env
.env.local
.env.production
.env.development

# API Keys and Secrets
config/secrets.json
secrets/
```

### 3. Build-time Validation

The `setup-env.sh` script:
- Validates API keys are set
- Checks for placeholder values
- Updates native configurations safely
- Provides clear error messages

## 🛠️ How to Use

### Development Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Add your actual API keys to `.env`:**
   ```env
   AMAP_ANDROID_API_KEY=your_actual_android_key_here
   AMAP_IOS_API_KEY=your_actual_ios_key_here
   AMAP_WEB_SERVICE_API_KEY=your_actual_web_service_key_here
   ```

3. **Validate setup:**
   ```bash
   ./scripts/setup-env.sh
   ```

4. **Run your app:**
   ```bash
   # Environment is automatically loaded
   npm run android
   npm run ios
   ```

### Production/CI Setup

For production builds, set environment variables in your CI/CD system:

**GitHub Actions:**
```yaml
env:
  AMAP_ANDROID_API_KEY: ${{ secrets.AMAP_ANDROID_API_KEY }}
  AMAP_IOS_API_KEY: ${{ secrets.AMAP_IOS_API_KEY }}
  AMAP_WEB_SERVICE_API_KEY: ${{ secrets.AMAP_WEB_SERVICE_API_KEY }}
```

**Bitrise/AppCenter:**
- Add environment variables in build configuration
- Mark them as sensitive/protected

## 🔍 Security Layers

### Layer 1: Source Code Protection
- No hardcoded keys in source files
- Environment variables loaded at build time
- Clear separation between code and secrets

### Layer 2: Git Protection  
- `.env` files in `.gitignore`
- No secrets in git history
- Template files for easy setup

### Layer 3: Runtime Protection
- Development vs production key validation
- Warning messages for placeholder keys
- Graceful fallbacks for missing configuration

### Layer 4: Native Platform Protection
- Keys injected into native configs during build
- No keys stored in JavaScript bundle
- Platform-specific key restrictions

## 🚀 Advanced Security (Optional)

### Option 1: Key Rotation
```bash
# Rotate keys regularly
./scripts/rotate-keys.sh --platform android --new-key NEW_KEY
```

### Option 2: Key Server
```typescript
// Fetch keys from secure server at runtime
const getKeysFromServer = async () => {
  const response = await fetch('https://your-secure-server/api/keys', {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  return response.json();
};
```

### Option 3: Hardware Security
```typescript
// Use iOS Keychain/Android Keystore
import { SecureStore } from 'expo-secure-store';

const storeKey = async (key: string, value: string) => {
  await SecureStore.setItemAsync(key, value);
};
```

## 📱 Platform-Specific Security

### Android
- Keys stored in `strings.xml` (not in APK manifest)
- ProGuard obfuscation enabled
- Package signature verification

### iOS  
- Keys in iOS Keychain or app-specific storage
- Code signing with restricted certificates
- App Transport Security enabled

## 🔧 Troubleshooting

### "Missing environment variable" error
1. Check `.env` file exists and has correct format
2. Verify no typos in variable names
3. Run `./scripts/setup-env.sh` to validate

### "Using development keys" warning  
1. Replace placeholder values in `.env`
2. Ensure keys are from AMap console
3. Validate key format (usually 32+ characters)

### Keys not working
1. Verify keys are active in AMap console
2. Check package name/bundle ID matches registration
3. Ensure sufficient API quotas/credits

## 📋 Security Checklist

Before deploying:

- [ ] No API keys in source code
- [ ] `.env` file in `.gitignore`
- [ ] Environment variables set in CI/CD
- [ ] Keys validated and working
- [ ] Placeholder values removed
- [ ] Native configurations updated
- [ ] Build scripts include environment setup
- [ ] Team members know security procedures

## 🆘 Emergency Response

If API keys are accidentally exposed:

1. **Immediately revoke** exposed keys in AMap console
2. **Generate new keys** with restricted permissions  
3. **Update** all deployment environments
4. **Clean git history** if keys were committed:
   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch .env' \
   --prune-empty --tag-name-filter cat -- --all
   ```
5. **Force push** cleaned history (coordinate with team)
6. **Monitor usage** for any unauthorized access

Remember: Security is everyone's responsibility! 🛡️