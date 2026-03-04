terraform {
  backend "azurerm" {
    resource_group_name  = "Blake-team4-rg"
    storage_account_name = "blaketeam4tfstate"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
    
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

module "team4_rg" {
  source   = "./modules/resource-group"   # path to the module
  name     = "blake-team4-rg"
  location = "UK South"
  tags = {
    owner       = "team4"
    project     = "frontend"
    environment = "dev"
  }
}

data "azurerm_resource_group" "this" {
  name = "Blake-team4-rg"
}

provider "azurerm" {
  features {}
}