# ──────────────────────────────────────────────────────────────────────────────
# Key Vault
# Secrets are created MANUALLY in the Azure Portal after this resource is built.
# Required secrets to add manually:
#   - ApiBaseUrl  → the URL of the backend API (e.g. https://backend.yourapp.com)
# ──────────────────────────────────────────────────────────────────────────────

resource "azurerm_key_vault" "main" {
  name                = "blake-team4-kv-${var.environment}"
  location            = data.azurerm_resource_group.this.location
  resource_group_name = data.azurerm_resource_group.this.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  # Use Azure RBAC for access control (recommended over access policies)
  enable_rbac_authorization = true

  # Soft-delete protection — prevents accidental permanent deletion
  soft_delete_retention_days = 7
  purge_protection_enabled   = false

  tags = var.tags
}

# Grant the deploying service principal (GitHub Actions) Key Vault Administrator
# so it can manage the vault via Terraform, and so you can add secrets in the portal.
resource "azurerm_role_assignment" "kv_admin_deployer" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Administrator"
  principal_id         = data.azurerm_client_config.current.object_id

  # Prevent Terraform from replacing this when credentials change (e.g. local vs CI SP).
  # The role assignment is intentionally stable — managed once at vault creation time.
  lifecycle {
    ignore_changes = [principal_id]
  }
}

# Grant the 2026-Tech-Academy Azure AD group Key Vault Administrator access
# so all team members can view and manage secrets in the portal.
resource "azurerm_role_assignment" "kv_admin_team" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Administrator"
  principal_id         = "f2ae751a-9536-4c46-9209-46720122ed4a"
}
