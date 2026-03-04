#!/bin/bash
# Quick setup script for GitHub secrets after role assignment is complete

set -e

echo "🔐 GitHub Secrets Setup for ACR"
echo "================================="
echo ""

# Optional inputs via environment variables:
#   ACR_LOGIN_SERVER
#   ACR_ADMIN_USERNAME
#   ACR_ADMIN_PASSWORD
#   ACR_SERVICE_PRINCIPAL_ID
#   ACR_SERVICE_PRINCIPAL_PASSWORD

# Get ACR login server from Terraform if not supplied
if [ -z "$ACR_LOGIN_SERVER" ]; then
    cd my-infrastructure
    ACR_LOGIN_SERVER=$(terraform output -raw acr_login_server)
    cd ..
fi

echo "Choose authentication method:"
echo "1) ACR Admin credentials"
echo "2) Service Principal"
read -p "Enter choice (1 or 2): " AUTH_MODE

if [[ "$AUTH_MODE" == "1" ]]; then
    if [ -z "$ACR_ADMIN_USERNAME" ]; then
        read -p "ACR admin username: " ACR_ADMIN_USERNAME
    fi
    if [ -z "$ACR_ADMIN_PASSWORD" ]; then
        read -s -p "ACR admin password: " ACR_ADMIN_PASSWORD
        echo ""
    fi
elif [[ "$AUTH_MODE" == "2" ]]; then
    if [ -z "$ACR_SERVICE_PRINCIPAL_ID" ]; then
        read -p "Service Principal App ID: " ACR_SERVICE_PRINCIPAL_ID
    fi
    if [ -z "$ACR_SERVICE_PRINCIPAL_PASSWORD" ]; then
        read -s -p "Service Principal Password: " ACR_SERVICE_PRINCIPAL_PASSWORD
        echo ""
    fi
else
    echo "❌ Invalid choice. Exiting."
    exit 1
fi

echo "📋 Secrets to be configured:"
echo ""
echo "ACR_LOGIN_SERVER: $ACR_LOGIN_SERVER"
if [[ "$AUTH_MODE" == "1" ]]; then
    echo "ACR_ADMIN_USERNAME: $ACR_ADMIN_USERNAME"
    echo "ACR_ADMIN_PASSWORD: ******** (hidden)"
else
    echo "ACR_SERVICE_PRINCIPAL_ID: $ACR_SERVICE_PRINCIPAL_ID"
    echo "ACR_SERVICE_PRINCIPAL_PASSWORD: ******** (hidden)"
fi
echo ""

# Check if gh CLI is available
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI detected"
    echo ""
    read -p "Would you like to set these secrets now using gh CLI? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Setting GitHub secrets..."
        
        gh secret set ACR_LOGIN_SERVER --body "$ACR_LOGIN_SERVER"
        echo "✅ ACR_LOGIN_SERVER set"

        if [[ "$AUTH_MODE" == "1" ]]; then
            gh secret set ACR_ADMIN_USERNAME --body "$ACR_ADMIN_USERNAME"
            echo "✅ ACR_ADMIN_USERNAME set"

            gh secret set ACR_ADMIN_PASSWORD --body "$ACR_ADMIN_PASSWORD"
            echo "✅ ACR_ADMIN_PASSWORD set"
        else
            gh secret set ACR_SERVICE_PRINCIPAL_ID --body "$ACR_SERVICE_PRINCIPAL_ID"
            echo "✅ ACR_SERVICE_PRINCIPAL_ID set"

            gh secret set ACR_SERVICE_PRINCIPAL_PASSWORD --body "$ACR_SERVICE_PRINCIPAL_PASSWORD"
            echo "✅ ACR_SERVICE_PRINCIPAL_PASSWORD set"
        fi
        
        echo ""
        echo "🎉 All secrets configured successfully!"
        echo ""
        echo "Next steps:"
        echo "1. Verify role assignment is complete (check with your admin)"
        echo "2. Push to main branch to test ACR integration"
        echo "3. Check GitHub Actions for successful image push"
    fi
else
    echo "ℹ️  GitHub CLI not found. Manual setup required:"
    echo ""
    echo "1. Go to: https://github.com/<your-org>/team4-front-app/settings/secrets/actions"
    echo "2. Click 'New repository secret' for each:"
    echo ""
    echo "   Name: ACR_LOGIN_SERVER"
    echo "   Value: $ACR_LOGIN_SERVER"
    echo ""
    if [[ "$AUTH_MODE" == "1" ]]; then
        echo "   Name: ACR_ADMIN_USERNAME"
        echo "   Value: $ACR_ADMIN_USERNAME"
        echo ""
        echo "   Name: ACR_ADMIN_PASSWORD"
        echo "   Value: (hidden)"
    else
        echo "   Name: ACR_SERVICE_PRINCIPAL_ID"
        echo "   Value: $ACR_SERVICE_PRINCIPAL_ID"
        echo ""
        echo "   Name: ACR_SERVICE_PRINCIPAL_PASSWORD"
        echo "   Value: (hidden)"
    fi
    echo ""
fi

echo ""
echo "📚 For more details, see: ACR_SETUP_GUIDE.md"
