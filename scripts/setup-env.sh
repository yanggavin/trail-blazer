#!/bin/bash

# setup-env.sh - Script to safely load environment variables for AMap API keys
# This script should be run before building the app

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Setting up AMap environment variables...${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found!${NC}"
    
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}📋 Creating .env from .env.example...${NC}"
        cp .env.example .env
        echo -e "${RED}❗ Please edit .env file with your actual AMap API keys before building!${NC}"
        echo -e "${YELLOW}💡 Get your keys from: https://console.amap.com/${NC}"
        exit 1
    else
        echo -e "${RED}❌ Neither .env nor .env.example found!${NC}"
        exit 1
    fi
fi

# Load environment variables
source .env

# Validate API keys are set
missing_keys=()

if [ -z "$AMAP_ANDROID_API_KEY" ] || [ "$AMAP_ANDROID_API_KEY" = "your_android_api_key_here" ]; then
    missing_keys+=("AMAP_ANDROID_API_KEY")
fi

if [ -z "$AMAP_IOS_API_KEY" ] || [ "$AMAP_IOS_API_KEY" = "your_ios_api_key_here" ]; then
    missing_keys+=("AMAP_IOS_API_KEY")
fi

if [ -z "$AMAP_WEB_SERVICE_API_KEY" ] || [ "$AMAP_WEB_SERVICE_API_KEY" = "your_web_service_api_key_here" ]; then
    missing_keys+=("AMAP_WEB_SERVICE_API_KEY")
fi

# Check if any keys are missing
if [ ${#missing_keys[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing or placeholder API keys:${NC}"
    for key in "${missing_keys[@]}"; do
        echo -e "${RED}   - $key${NC}"
    done
    echo -e "${YELLOW}💡 Please update your .env file with actual API keys from https://console.amap.com/${NC}"
    exit 1
fi

# Validate key format (basic check)
validate_key() {
    local key_name=$1
    local key_value=$2
    
    if [ ${#key_value} -lt 20 ]; then
        echo -e "${YELLOW}⚠️  Warning: $key_name seems too short (${#key_value} chars). Are you sure it's correct?${NC}"
    fi
}

validate_key "AMAP_ANDROID_API_KEY" "$AMAP_ANDROID_API_KEY"
validate_key "AMAP_IOS_API_KEY" "$AMAP_IOS_API_KEY"
validate_key "AMAP_WEB_SERVICE_API_KEY" "$AMAP_WEB_SERVICE_API_KEY"

# Export environment variables for the build process
export AMAP_ANDROID_API_KEY
export AMAP_IOS_API_KEY
export AMAP_WEB_SERVICE_API_KEY

echo -e "${GREEN}✅ Environment variables loaded successfully!${NC}"
echo -e "${GREEN}   Android Key: ${AMAP_ANDROID_API_KEY:0:8}...${NC}"
echo -e "${GREEN}   iOS Key: ${AMAP_IOS_API_KEY:0:8}...${NC}"
echo -e "${GREEN}   Web Service Key: ${AMAP_WEB_SERVICE_API_KEY:0:8}...${NC}"

# Optional: Update native configurations
update_android_config() {
    local manifest_file="android/app/src/main/AndroidManifest.xml"
    
    if [ -f "$manifest_file" ]; then
        echo -e "${GREEN}📱 Updating Android configuration...${NC}"
        
        # Create backup
        cp "$manifest_file" "$manifest_file.backup"
        
        # Update API key in AndroidManifest.xml
        sed -i.bak "s/YOUR_ANDROID_API_KEY_HERE/$AMAP_ANDROID_API_KEY/g" "$manifest_file"
        rm "$manifest_file.bak"
        
        echo -e "${GREEN}✅ Android configuration updated${NC}"
    fi
}

update_ios_config() {
    local appdelegate_file="ios/TrailBlazer/AppDelegate.mm"
    
    if [ -f "$appdelegate_file" ]; then
        echo -e "${GREEN}📱 Updating iOS configuration...${NC}"
        
        # Create backup
        cp "$appdelegate_file" "$appdelegate_file.backup"
        
        # Update API key in AppDelegate
        sed -i.bak "s/YOUR_IOS_API_KEY_HERE/$AMAP_IOS_API_KEY/g" "$appdelegate_file"
        rm "$appdelegate_file.bak"
        
        echo -e "${GREEN}✅ iOS configuration updated${NC}"
    fi
}

# Ask if user wants to update native configurations
echo -e "${YELLOW}🤔 Do you want to update native platform configurations? (y/n)${NC}"
read -r update_native

if [ "$update_native" = "y" ] || [ "$update_native" = "Y" ]; then
    update_android_config
    update_ios_config
fi

echo -e "${GREEN}🎉 Setup complete! You can now build your app.${NC}"