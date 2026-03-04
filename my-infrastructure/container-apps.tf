# ──────────────────────────────────────────────────────────────────────────────
# Container App Environment
# The shared platform that hosts all Container Apps.
# Closed to the internet by default — ingress is configured per-app.
# ──────────────────────────────────────────────────────────────────────────────

resource "azurerm_container_app_environment" "main" {
  name                = "blake-team4-env-${var.environment}"
  location            = data.azurerm_resource_group.this.location
  resource_group_name = data.azurerm_resource_group.this.name

  tags = var.tags
}

# ──────────────────────────────────────────────────────────────────────────────
# Frontend Container App — PUBLIC
# Accessible from the internet via HTTPS on port 3000.
# ──────────────────────────────────────────────────────────────────────────────

resource "azurerm_container_app" "frontend" {
  name                         = "blake-team4-frontend-${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = data.azurerm_resource_group.this.name
  revision_mode                = "Single"

  # Use the managed identity for ACR pulls and Key Vault access
  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.app.id]
  }

  # Authenticate with ACR using the managed identity (no stored credentials)
  registry {
    server   = var.acr_login_server
    identity = azurerm_user_assigned_identity.app.id
  }

  # Public HTTPS ingress on port 3000
  ingress {
    external_enabled = true
    target_port      = 3000

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = 1
    max_replicas = 3

    container {
      name   = "frontend"
      image  = "${var.acr_login_server}/team4-frontend:${var.frontend_image_tag}"
      cpu    = 0.25
      memory = "0.5Gi"

      # ── Plain env vars (feature flags + runtime config) ──────────────────────
      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "PORT"
        value = "3000"
      }

      env {
        name  = "FEATURE_ADMIN_DASHBOARD"
        value = var.feature_admin_dashboard
      }

      env {
        name  = "FEATURE_JOB_DETAIL_VIEW"
        value = var.feature_job_detail_view
      }

      env {
        name  = "FEATURE_JOB_APPLY_VIEW"
        value = var.feature_job_apply_view
      }

      # ── Secret-backed env vars (value comes from Key Vault) ──────────────────
      env {
        name        = "API_BASE_URL"
        secret_name = "api-base-url-ref"
      }
    }
  }

  # Key Vault secret references — the managed identity reads the secret at runtime
  secret {
    name                = "api-base-url-ref"
    key_vault_secret_id = "${azurerm_key_vault.main.vault_uri}secrets/ApiBaseUrl"
    identity            = azurerm_user_assigned_identity.app.id
  }

  tags = var.tags

  depends_on = [
    azurerm_role_assignment.acr_pull,
    azurerm_role_assignment.kv_secrets_user,
  ]
}

# ──────────────────────────────────────────────────────────────────────────────
# Backend Container App — INTERNAL ONLY
# Only reachable from within the Container App Environment (not the public internet).
# ──────────────────────────────────────────────────────────────────────────────

resource "azurerm_container_app" "backend" {
  name                         = "blake-team4-backend-${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = data.azurerm_resource_group.this.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.app.id]
  }

  registry {
    server   = var.acr_login_server
    identity = azurerm_user_assigned_identity.app.id
  }

  # Internal-only ingress — closed to the internet, accessible within the environment
  ingress {
    external_enabled = false
    target_port      = 8080

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = 1
    max_replicas = 3

    container {
      name   = "backend"
      image  = "${var.acr_login_server}/team4-backend:${var.backend_image_tag}"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "PORT"
        value = "8080"
      }
    }
  }

  tags = var.tags

  depends_on = [
    azurerm_role_assignment.acr_pull,
  ]
}
