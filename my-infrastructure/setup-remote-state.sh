#!/bin/bash

# ------------------------------------------------------------------
# Setup Remote Terraform State in Azure Storage
# Based on Microsoft Learn documentation:
# https://learn.microsoft.com/azure/developer/terraform/store-state-in-azure-storage
# ------------------------------------------------------------------

set -e  # Exit on error

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Terraform Remote State Setup ===${NC}\n"

# Define variables
RESOURCE_GROUP_NAME="tfstate-rg"
STORAGE_ACCOUNT_NAME="tfstate$(date +%s)"
CONTAINER_NAME="terraform-state"
LOCATION="UK South"

echo -e "${YELLOW}Variables:${NC}"
echo "Resource Group: $RESOURCE_GROUP_NAME"
echo "Storage Account: $STORAGE_ACCOUNT_NAME"
echo "Container: $CONTAINER_NAME"
echo "Location: $LOCATION"
echo ""

# Step 1: Create resource group
echo -e "${YELLOW}Step 1: Creating resource group...${NC}"
az group create \
  --name $RESOURCE_GROUP_NAME \
  --location "$LOCATION"
echo -e "${GREEN}✓ Resource group created${NC}\n"

# Step 2: Create storage account
echo -e "${YELLOW}Step 2: Creating storage account with encryption...${NC}"
az storage account create \
  --resource-group $RESOURCE_GROUP_NAME \
  --name $STORAGE_ACCOUNT_NAME \
  --location "$LOCATION" \
  --sku Standard_LRS \
  --encryption-services blob
echo -e "${GREEN}✓ Storage account created: $STORAGE_ACCOUNT_NAME${NC}\n"

# Step 3: Create blob container
echo -e "${YELLOW}Step 3: Creating blob container...${NC}"
az storage container create \
  --name $CONTAINER_NAME \
  --account-name $STORAGE_ACCOUNT_NAME
echo -e "${GREEN}✓ Container created: $CONTAINER_NAME${NC}\n"

# Step 4: Get access key
echo -e "${YELLOW}Step 4: Retrieving storage account key...${NC}"
ACCOUNT_KEY=$(az storage account keys list \
  --resource-group $RESOURCE_GROUP_NAME \
  --account-name $STORAGE_ACCOUNT_NAME \
  --query '[0].value' -o tsv)

export ARM_ACCESS_KEY=$ACCOUNT_KEY
echo -e "${GREEN}✓ Access key set to ARM_ACCESS_KEY environment variable${NC}\n"

# Step 5: Show next steps
echo -e "${GREEN}=== Setup Complete ===${NC}\n"
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update main.tf backend configuration:"
echo "   Replace '<REPLACE_WITH_ACTUAL_NAME>' in main.tf with: $STORAGE_ACCOUNT_NAME"
echo ""
echo "2. Run Terraform init with backend config:"
echo "   terraform init"
echo ""
echo "3. The ARM_ACCESS_KEY environment variable is already set for this session"
echo ""
echo -e "${YELLOW}To persist the access key in future sessions, add to ~/.zshrc or ~/.bashrc:${NC}"
echo "   export ARM_ACCESS_KEY='$ACCOUNT_KEY'"
echo ""
echo -e "${YELLOW}Infrastructure Details:${NC}"
echo "Resource Group ID: $(az group show --name $RESOURCE_GROUP_NAME --query id -o tsv)"
echo "Storage Account ID: $(az storage account show --resource-group $RESOURCE_GROUP_NAME --name $STORAGE_ACCOUNT_NAME --query id -o tsv)"
