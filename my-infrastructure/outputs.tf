output "resource_group_name" {
  value = data.azurerm_resource_group.this.name
}

output "resource_group_id" {
  value = data.azurerm_resource_group.this.id
}

output "resource_group_location" {
  value = data.azurerm_resource_group.this.location
}