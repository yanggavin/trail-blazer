# AMap Integration Setup Guide

This guide walks you through integrating AMap (AutoNavi) support into the Trail Blazer React Native app.

## Prerequisites

Before starting, you'll need:
- AMap developer account (register at https://console.amap.com/)
- API keys for iOS, Android, and Web Services
- React Native development environment setup

## Step 1: Install Dependencies

Install the required packages:

```bash
npm install react-native-amap3d @react-native-community/geolocation react-native-permissions

# For iOS
cd ios && pod install && cd ..
```

## Step 2: Get AMap API Keys

1. Visit [AMap Developer Console](https://console.amap.com/)
2. Create a new application
3. Generate API keys for:
   - **Android**: Package name required (e.g., `com.trailblazer.app`)
   - **iOS**: Bundle ID required (e.g., `com.trailblazer.app`)
   - **Web Service**: For geocoding and other web APIs

## Step 3: Android Configuration

### Add Permissions to AndroidManifest.xml
Add these permissions in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_LOCATION_EXTRA_COMMANDS" />
```

### Add AMap API Key
In the `<application>` section of `AndroidManifest.xml`:

```xml
<application>
    <!-- Other configurations -->
    
    <meta-data
        android:name="com.amap.api.v2.apikey"
        android:value="YOUR_ANDROID_API_KEY_HERE" />
</application>
```

### Proguard Configuration (if using)
Add to `android/app/proguard-rules.pro`:

```
-keep class com.amap.api.** { *; }
-keep class com.autonavi.** { *; }
-keep class com.loc.** { *; }
```

## Step 4: iOS Configuration

### Add Permissions to Info.plist
Add these keys to `ios/TrailBlazer/Info.plist`:

```xml
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs location access to track your trail runs and show your position on the map.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to track your trail runs and show your position on the map.</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>This app needs location access to track your trail runs in the background.</string>
```

### Configure AMap in AppDelegate
In `ios/TrailBlazer/AppDelegate.mm` (or AppDelegate.m):

```objc
#import <AMapFoundationKit/AMapFoundationKit.h>

// In application:didFinishLaunchingWithOptions:
[AMapServices sharedServices].apiKey = @"YOUR_IOS_API_KEY_HERE";
```

## Step 5: Update Configuration Files

### Update your app's AMap configuration
In `TrackScreenWithAMap.tsx`, replace the placeholder API keys:

```typescript
const AMAP_CONFIG = {
  androidApiKey: 'YOUR_ACTUAL_ANDROID_API_KEY',
  iosApiKey: 'YOUR_ACTUAL_IOS_API_KEY',
  webServiceApiKey: 'YOUR_ACTUAL_WEB_SERVICE_API_KEY',
};
```

### Environment Variables (Recommended)
Create a `.env` file in your project root:

```env
AMAP_ANDROID_API_KEY=your_android_api_key_here
AMAP_IOS_API_KEY=your_ios_api_key_here  
AMAP_WEB_SERVICE_API_KEY=your_web_service_api_key_here
```

Then install `react-native-dotenv`:
```bash
npm install react-native-dotenv
```

And use in your code:
```typescript
import { AMAP_ANDROID_API_KEY, AMAP_IOS_API_KEY, AMAP_WEB_SERVICE_API_KEY } from '@env';

const AMAP_CONFIG = {
  androidApiKey: AMAP_ANDROID_API_KEY,
  iosApiKey: AMAP_IOS_API_KEY,
  webServiceApiKey: AMAP_WEB_SERVICE_API_KEY,
};
```

## Step 6: Navigation Setup

### Replace TrackScreen in your navigation
Update your navigation configuration to use `TrackScreenWithAMap`:

```typescript
// In your navigation file
import TrackScreenWithAMap from '../screens/TrackScreenWithAMap';

// Replace the existing TrackScreen reference with:
<Stack.Screen 
  name="Track" 
  component={TrackScreenWithAMap} 
  options={{ headerShown: false }} 
/>
```

## Step 7: Testing

1. **Build and test on device** (location services don't work in simulator)
2. **Check permissions** - ensure location permission is granted
3. **Verify map display** - map should load with AMap tiles
4. **Test location tracking** - current location should show on map
5. **Test trail recording** - path should draw as you move

## Troubleshooting

### Common Issues

**Map doesn't load:**
- Verify API keys are correct and active
- Check network connectivity
- Ensure package name/bundle ID matches API key registration

**Location not working:**
- Check device location services are enabled
- Verify app has location permissions
- Test on physical device (not simulator)

**Build errors:**
- Clean and rebuild project
- Check pod install was run for iOS
- Verify all dependencies are properly installed

**Permission issues:**
- Check AndroidManifest.xml has all required permissions
- Verify Info.plist has location usage descriptions
- Test permission prompts work correctly

### Debug Tips

Enable debug logging in your AMap service:
```typescript
// Add to AMapService constructor
console.log('AMap initialized with keys:', {
  android: this.config.androidApiKey.substring(0, 8) + '...',
  ios: this.config.iosApiKey.substring(0, 8) + '...',
  web: this.config.webServiceApiKey.substring(0, 8) + '...',
});
```

## Additional Features

Once basic AMap integration is working, you can enhance with:

- **Offline maps** for areas without internet
- **Route planning** using AMap's routing APIs  
- **Points of Interest** search near trails
- **Geocoding** to convert locations to addresses
- **Custom map styling** for better trail visibility
- **Heat maps** showing popular trail areas

## Security Notes

- **Never commit API keys** to version control
- **Use environment variables** or secure key storage
- **Restrict API key usage** by package name/bundle ID
- **Monitor API usage** to avoid unexpected charges
- **Rotate keys regularly** for security

## Performance Tips

- **Use appropriate zoom levels** to balance detail vs performance  
- **Limit polyline points** for long trails to avoid memory issues
- **Cache frequently accessed data** like POI information
- **Optimize location update frequency** based on user activity
- **Handle background/foreground transitions** properly

Your Trail Blazer app should now have full AMap integration with real location tracking and mapping capabilities!