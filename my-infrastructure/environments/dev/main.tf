# Resource group is managed via the module in provider.tf
module "rg" {  
    source   = "./modules/resource-group"
    name     = var.resource_group_name
    location = var.location
    tags     = var.tags
}