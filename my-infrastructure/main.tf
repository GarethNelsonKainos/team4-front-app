# Call the resource-group module
module "resource_group" {
  source = "./modules/resource-group"

  resource_group_name = var.resource_group_name
  location            = var.location
  tags                = var.tags
}

resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# Azure Container Registry
resource "azurerm_container_registry" "acr" {
  name                = "acrteam4${random_string.suffix.result}"
  resource_group_name = module.resource_group.resource_group_name
  location            = module.resource_group.resource_group_location
  sku                 = "Basic"
  admin_enabled       = true # Enable admin credentials for GitHub Actions

  tags = merge(var.tags, {
    service = "container-registry"
  })
}
