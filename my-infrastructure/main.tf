# Call the resource-group module
module "resource_group" {
  source = "./modules/resource-group"

  resource_group_name = local.resource_group_name
  location            = var.location
  tags                = local.tags
}

resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# Azure Container Registry with environment-based naming
resource "azurerm_container_registry" "acr" {
  # Container registry names must be lowercase alphanumeric, 5-50 chars
  # Format: acrPROJECT[ENV]RANDOMSUFFIX (e.g., acrteam4dev12345678)
  name                = lower(format("acr%s%s%s", var.project, var.environment, random_string.suffix.result))
  resource_group_name = module.resource_group.resource_group_name
  location            = module.resource_group.resource_group_location
  sku                 = "Basic"
  admin_enabled       = true # Enable admin credentials for GitHub Actions

  tags = merge(local.tags, {
    service = "container-registry"
  })
}

# Azure Container Instance to deploy the application
resource "azurerm_container_group" "app" {
  name                = "${local.resource_prefix}-app-aci"
  location            = module.resource_group.resource_group_location
  resource_group_name = module.resource_group.resource_group_name
  os_type             = "Linux"
  dns_name_label      = "${local.resource_prefix}-app-${random_string.suffix.result}"
  ip_address_type     = "Public"

  image_registry_credential {
    server   = var.acr_login_server
    username = var.acr_admin_username
    password = var.acr_admin_password
  }

  container {
    name   = "app"
    image  = "${var.acr_login_server}/team4-front-app:${var.container_image_tag}"
    cpu    = "0.5"
    memory = "1.5"

    ports {
      port     = 3000
      protocol = "TCP"
    }

    environment_variables = {
      NODE_ENV = var.environment
    }
  }

  tags = merge(local.tags, {
    service = "container-instance"
  })
}
