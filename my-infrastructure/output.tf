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

# Key Vault Outputs
output "key_vault_name" {
  value       = azurerm_key_vault.app.name
  description = "The name of the Azure Key Vault used for app secrets."
}

output "key_vault_id" {
  value       = azurerm_key_vault.app.id
  description = "The resource ID of the Azure Key Vault."
}

output "key_vault_uri" {
  value       = azurerm_key_vault.app.vault_uri
  description = "The URI of the Azure Key Vault used for secret references."
}

# Managed Identity Outputs
output "frontend_identity_id" {
  value       = azurerm_user_assigned_identity.frontend.id
  description = "The resource ID for the frontend user-assigned managed identity."
}

output "frontend_identity_client_id" {
  value       = azurerm_user_assigned_identity.frontend.client_id
  description = "The client ID for the frontend user-assigned managed identity."
}

output "frontend_identity_principal_id" {
  value       = azurerm_user_assigned_identity.frontend.principal_id
  description = "The principal ID for the frontend user-assigned managed identity."
}

output "backend_identity_id" {
  value       = azurerm_user_assigned_identity.backend.id
  description = "The resource ID for the backend user-assigned managed identity."
}

output "backend_identity_client_id" {
  value       = azurerm_user_assigned_identity.backend.client_id
  description = "The client ID for the backend user-assigned managed identity."
}

output "backend_identity_principal_id" {
  value       = azurerm_user_assigned_identity.backend.principal_id
  description = "The principal ID for the backend user-assigned managed identity."
}

# Container Apps Outputs
output "container_apps_environment_id" {
  value       = azurerm_container_app_environment.platform.id
  description = "The resource ID of the Azure Container Apps environment."
}

output "frontend_app_fqdn" {
  value       = azurerm_container_app.frontend.latest_revision_fqdn
  description = "The public FQDN for the frontend container app."
}

output "frontend_app_url" {
  value       = "https://${azurerm_container_app.frontend.latest_revision_fqdn}"
  description = "The public URL for the frontend container app."
}

output "backend_app_fqdn" {
  value       = azurerm_container_app.backend.latest_revision_fqdn
  description = "The internal FQDN for the backend container app."
}

# Compatibility outputs
output "app_fqdn" {
  value       = azurerm_container_app.frontend.latest_revision_fqdn
  description = "Compatibility output mapped to frontend app FQDN."
}

output "app_url" {
  value       = "https://${azurerm_container_app.frontend.latest_revision_fqdn}"
  description = "Compatibility output mapped to frontend app URL."
}
