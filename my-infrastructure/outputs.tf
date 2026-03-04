output "resource_group_name" {
  value = data.azurerm_resource_group.this.name
}

output "resource_group_id" {
  value = data.azurerm_resource_group.this.id
}

output "resource_group_location" {
  value = data.azurerm_resource_group.this.location
}

output "key_vault_uri" {
  description = "URI of the Key Vault — use this to add secrets in the Azure Portal."
  value       = azurerm_key_vault.main.vault_uri
}

output "managed_identity_client_id" {
  description = "Client ID of the user-assigned managed identity."
  value       = azurerm_user_assigned_identity.app.client_id
}

output "frontend_url" {
  description = "Public HTTPS URL of the frontend Container App."
  value       = "https://${azurerm_container_app.frontend.latest_revision_fqdn}"
}

output "backend_internal_fqdn" {
  description = "Internal FQDN of the backend Container App (only reachable within the environment)."
  value       = azurerm_container_app.backend.latest_revision_fqdn
}
