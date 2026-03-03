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
