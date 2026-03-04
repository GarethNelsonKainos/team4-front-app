terraform {
  required_version = ">= 1.5.0"

  # Remote state backend - configured via environment variables or -backend-config flags
  # This allows the same config to work across dev/prod without code changes
  backend "azurerm" {
    # These are set via:
    # - Environment variables: ARM_ACCESS_KEY, ARM_STORAGE_ACCOUNT_NAME
    # - Or: terraform init -backend-config="key=value"
    # See ../.github/workflows/terraform.yml for pipeline configuration
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}

  # Support service principal authentication for CI/CD pipelines
  # Uses environment variables when running in pipeline:
  # - ARM_CLIENT_ID
  # - ARM_CLIENT_SECRET  
  # - ARM_TENANT_ID
  # - ARM_SUBSCRIPTION_ID
  #
  # For local development, either:
  # - Set subscription_id variable, or
  # - Use 'az login' (interactive Azure CLI auth)

  subscription_id = var.subscription_id != null ? var.subscription_id : null
}