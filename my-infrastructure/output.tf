output "resource_group_id" {
  value       = module.resource_group.resource_group_id
  description = "This is the ID of the resource group."
}

output "resource_group_name" {
  value       = module.resource_group.resource_group_name
  description = "This is the name of the resource group."
}

output "resource_group_location" {
  value       = module.resource_group.resource_group_location
  description = "This is the location of the resource group."
}

# ACR Outputs
output "acr_login_server" {
  value       = azurerm_container_registry.acr.login_server
  description = "The URL that can be used to log into the container registry."
}

output "acr_name" {
  value       = azurerm_container_registry.acr.name
  description = "The name of the Container Registry."
}

output "acr_id" {
  value       = azurerm_container_registry.acr.id
  description = "The Container Registry ID."
}

output "acr_admin_username" {
  value       = azurerm_container_registry.acr.admin_username
  description = "The username associated with the ACR admin account."
  sensitive   = true
}

output "acr_admin_password" {
  value       = azurerm_container_registry.acr.admin_password
  description = "The password associated with the ACR admin account."
  sensitive   = true
}
# Container Instance Outputs
output "app_fqdn" {
  value       = azurerm_container_group.app.fqdn
  description = "The FQDN of the container group (public URL)."
}

output "app_ip_address" {
  value       = azurerm_container_group.app.ip_address
  description = "The IP address of the container group."
}

output "app_url" {
  value       = "http://${azurerm_container_group.app.fqdn}:3000"
  description = "The full URL to access the deployed application."
}
