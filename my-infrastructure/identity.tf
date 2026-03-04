# ──────────────────────────────────────────────────────────────────────────────
# User Assigned Managed Identity
# Used by Container Apps to:
#   - Pull images from Azure Container Registry (ACR)
#   - Read secrets from Azure Key Vault
# ──────────────────────────────────────────────────────────────────────────────

resource "azurerm_user_assigned_identity" "app" {
  name                = "blake-team4-identity-${var.environment}"
  location            = data.azurerm_resource_group.this.location
  resource_group_name = data.azurerm_resource_group.this.name

  tags = var.tags
}
