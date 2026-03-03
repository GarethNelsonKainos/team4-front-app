terraform {
  required_version = ">= 1.0"
  backend "azurerm" {
    resource_group_name  = "team4-front-tfstate-rg"
    storage_account_name = "t4frontcamerontfstate"
    container_name       = "tfstate"
    key                  = "front-app-dev.tfstate"
  }
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

locals {
  environment = lower(var.environment)
}

# Data source for existing ACR
data "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = var.acr_resource_group
}

# Resource group module for the front-end app
module "resource_group" {
  source   = "./modules/resource-group"
  name     = "${var.resource_group_name}-${local.environment}"
  location = var.location
  tags = merge(var.tags, {
    environment = local.environment
  })
}

# Azure Container Instance for the front-end
resource "azurerm_container_group" "frontend" {
  name                = "${var.container_name}-${local.environment}"
  location            = var.location
  resource_group_name = module.resource_group.name
  os_type             = "Linux"
  dns_name_label      = "${var.dns_name_label}-${local.environment}"
  restart_policy      = "Always"

  tags = merge(var.tags, {
    environment = local.environment
  })

  image_registry_credential {
    server   = data.azurerm_container_registry.acr.login_server
    username = data.azurerm_container_registry.acr.admin_username
    password = data.azurerm_container_registry.acr.admin_password
  }

  container {
    name   = "frontend"
    image  = "${data.azurerm_container_registry.acr.login_server}/${var.image_name}:${var.image_tag}"
    cpu    = var.cpu_cores
    memory = var.memory_gb

    ports {
      port     = var.container_port
      protocol = "TCP"
    }

    environment_variables = var.environment_variables
  }
}
