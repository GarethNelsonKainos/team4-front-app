#!/bin/bash

# Variables
RESOURCE_GROUP="rg-tf-state-dev-ben-new"
LOCATION="uksouth"
STORAGE_ACCOUNT="tfstatebenteam4new"
CONTAINER_NAME="tfstate"

# Create Resource Group
echo "Creating resource group..."
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Create Storage Account
echo "Creating storage account..."
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind StorageV2

# Create Blob Container
echo "Creating blob container..."
az storage container create \
  --name $CONTAINER_NAME \
  --account-name $STORAGE_ACCOUNT \
  --auth-mode login

echo "Done! Azure infrastructure is ready."
