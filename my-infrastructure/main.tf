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
