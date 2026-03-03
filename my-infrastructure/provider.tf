terraform {
  required_version = ">= 1.5.0"
  backend "azurerm" {
    resource_group_name  = "tfstate-josh-rg"
    storage_account_name = "tfstate1772544818"
    container_name       = "terraform-state"
    key                  = "team4.tfstate"
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
  subscription_id = var.subscription_id
}