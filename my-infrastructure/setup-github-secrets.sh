#!/bin/bash
# Quick setup script to configure GitHub Actions secrets for Terraform
# Before running, ensure you have:
# 1. Created a service principal (az ad sp create-for-rbac)
# 2. Have the remote state storage account name from setup-remote-state.sh

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  GitHub Actions Terraform Setup Helper                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Get values from user
read -p "Enter ARM_CLIENT_ID (Service Principal App ID): " ARM_CLIENT_ID
read -sp "Enter ARM_CLIENT_SECRET (Service Principal Password): " ARM_CLIENT_SECRET
echo ""
read -p "Enter ARM_TENANT_ID (Azure Tenant ID): " ARM_TENANT_ID
read -p "Enter ARM_SUBSCRIPTION_ID (Azure Subscription ID): " ARM_SUBSCRIPTION_ID
read -p "Enter ARM_ACCESS_KEY (Storage Account Key from setup-remote-state.sh): " ARM_ACCESS_KEY
read -p "Enter TF_STATE_STORAGE_ACCOUNT (Storage account name, e.g., tfstate1234567890): " TF_STATE_STORAGE_ACCOUNT

echo ""
echo "Detected GitHub repository info:"
REPO_URL=$(git config --get remote.origin.url)
REPO_NAME=$(basename "$REPO_URL" .git)
REPO_OWNER=$(git config --get remote.origin.url | sed -E 's|.*[:/]([^/]*)/'$REPO_NAME'.*|\1|')

echo "Repository: $REPO_OWNER/$REPO_NAME"
echo ""
echo "The following secrets need to be added to GitHub:"
echo "  1. ARM_CLIENT_ID"
echo "  2. ARM_CLIENT_SECRET"
echo "  3. ARM_TENANT_ID"
echo "  4. ARM_SUBSCRIPTION_ID"
echo "  5. ARM_ACCESS_KEY"
echo "  6. TF_STATE_STORAGE_ACCOUNT"
echo ""

if command -v gh &> /dev/null; then
  read -p "Would you like to set these secrets using GitHub CLI? (y/n): " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Setting secrets via GitHub CLI..."
    gh secret set ARM_CLIENT_ID --body "$ARM_CLIENT_ID" -R "$REPO_OWNER/$REPO_NAME"
    gh secret set ARM_CLIENT_SECRET --body "$ARM_CLIENT_SECRET" -R "$REPO_OWNER/$REPO_NAME"
    gh secret set ARM_TENANT_ID --body "$ARM_TENANT_ID" -R "$REPO_OWNER/$REPO_NAME"
    gh secret set ARM_SUBSCRIPTION_ID --body "$ARM_SUBSCRIPTION_ID" -R "$REPO_OWNER/$REPO_NAME"
    gh secret set ARM_ACCESS_KEY --body "$ARM_ACCESS_KEY" -R "$REPO_OWNER/$REPO_NAME"
    gh secret set TF_STATE_STORAGE_ACCOUNT --body "$TF_STATE_STORAGE_ACCOUNT" -R "$REPO_OWNER/$REPO_NAME"
    echo "✅ All secrets configured successfully!"
  fi
else
  echo "GitHub CLI not found. Please add these secrets manually:"
  echo "  1. Go to: https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
  echo "  2. Click 'New repository secret' for each value above"
  echo ""
fi

echo ""
echo "Next steps:"
echo "  1. Create prod.tfvars from prod.tfvars.example"
echo "  2. Update prod.tfvars with production values"
echo "  3. Push a branch with infrastructure changes to trigger the pipeline"
echo "  4. Merge to main to apply changes"
