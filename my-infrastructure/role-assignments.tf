# ──────────────────────────────────────────────────────────────────────────────
# Role Assignments
# Grant the managed identity the minimum permissions it needs.
# These must be applied BEFORE the Container Apps are created.
# ──────────────────────────────────────────────────────────────────────────────

# Allow the managed identity to pull images from ACR
resource "azurerm_role_assignment" "acr_pull" {
  scope                = data.azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.app.principal_id

  depends_on = [azurerm_user_assigned_identity.app]
}

# Allow the managed identity to read secrets from Key Vault
resource "azurerm_role_assignment" "kv_secrets_user" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.app.principal_id

  depends_on = [
    azurerm_user_assigned_identity.app,
    azurerm_key_vault.main,
  ]
}
