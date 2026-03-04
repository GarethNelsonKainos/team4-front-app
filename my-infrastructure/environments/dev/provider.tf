terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }


  # Backend block
  backend "azurerm" {
    resource_group_name  = "rg-tf-state-dev-ben-new"
    storage_account_name = "tfstatebenteam4new"
    container_name       = "tfstate"
    key                  = "dev.terraform.tfstate"
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}