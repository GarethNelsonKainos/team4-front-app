# Call the resource-group module
module "resource_group" {
  source = "./modules/resource-group"

  resource_group_name = local.resource_group_name
  location            = var.location
  tags                = local.tags
}

resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

data "azurerm_client_config" "current" {}

# Azure Container Registry with environment-based naming
resource "azurerm_container_registry" "acr" {
  # Container registry names must be lowercase alphanumeric, 5-50 chars
  # Format: acrPROJECT[ENV]RANDOMSUFFIX (e.g., acrteam4dev12345678)
  name                = lower(format("acr%s%s%s", var.project, var.environment, random_string.suffix.result))
  resource_group_name = module.resource_group.resource_group_name
  location            = module.resource_group.resource_group_location
  sku                 = "Basic"
  admin_enabled       = true # Enable admin credentials for GitHub Actions

  tags = merge(local.tags, {
    service = "container-registry"
  })
}

# Azure Key Vault for application secrets (secrets are added manually in Azure Portal)
resource "azurerm_key_vault" "app" {
  name                = var.key_vault_name != "" ? var.key_vault_name : lower(substr("kv${var.project}${var.environment}${random_string.suffix.result}", 0, 24))
  location            = module.resource_group.resource_group_location
  resource_group_name = module.resource_group.resource_group_name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = var.key_vault_sku_name

  rbac_authorization_enabled      = true
  public_network_access_enabled   = true
  purge_protection_enabled        = false
  soft_delete_retention_days      = 7
  enabled_for_template_deployment = true

  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"
    ip_rules       = var.key_vault_allowed_ip_cidrs
  }

  tags = merge(local.tags, {
    service = "key-vault"
  })
}

# User-assigned managed identities for application workloads
resource "azurerm_user_assigned_identity" "frontend" {
  name                = "${local.resource_prefix}-frontend-identity"
  location            = module.resource_group.resource_group_location
  resource_group_name = module.resource_group.resource_group_name

  tags = merge(local.tags, {
    service = "managed-identity"
    app     = "frontend"
  })
}

resource "azurerm_user_assigned_identity" "backend" {
  name                = "${local.resource_prefix}-backend-identity"
  location            = module.resource_group.resource_group_location
  resource_group_name = module.resource_group.resource_group_name

  tags = merge(local.tags, {
    service = "managed-identity"
    app     = "backend"
  })
}

# RBAC assignments: pull images from ACR
resource "azurerm_role_assignment" "frontend_acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.frontend.principal_id

  depends_on = [
    azurerm_container_registry.acr,
    azurerm_user_assigned_identity.frontend
  ]
}

resource "azurerm_role_assignment" "backend_acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.backend.principal_id

  depends_on = [
    azurerm_container_registry.acr,
    azurerm_user_assigned_identity.backend
  ]
}

# RBAC assignments: read secrets from Key Vault
resource "azurerm_role_assignment" "frontend_key_vault_secrets_user" {
  scope                = azurerm_key_vault.app.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.frontend.principal_id

  depends_on = [
    azurerm_key_vault.app,
    azurerm_user_assigned_identity.frontend
  ]
}

resource "azurerm_role_assignment" "backend_key_vault_secrets_user" {
  scope                = azurerm_key_vault.app.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.backend.principal_id

  depends_on = [
    azurerm_key_vault.app,
    azurerm_user_assigned_identity.backend
  ]
}

# Log Analytics Workspace for Container Apps environment diagnostics
resource "azurerm_log_analytics_workspace" "container_apps" {
  name                = "${local.resource_prefix}-aca-law"
  location            = module.resource_group.resource_group_location
  resource_group_name = module.resource_group.resource_group_name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = merge(local.tags, {
    service = "log-analytics"
  })
}

# Azure Container Apps Environment (platform)
resource "azurerm_container_app_environment" "platform" {
  name                       = "${local.resource_prefix}-aca-env"
  location                   = module.resource_group.resource_group_location
  resource_group_name        = module.resource_group.resource_group_name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.container_apps.id

  tags = merge(local.tags, {
    service = "container-apps-environment"
  })
}

# Backend Container App (internal only)
resource "azurerm_container_app" "backend" {
  name                         = "${local.resource_prefix}-backend"
  resource_group_name          = module.resource_group.resource_group_name
  container_app_environment_id = azurerm_container_app_environment.platform.id
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.backend.id]
  }

  registry {
    server   = azurerm_container_registry.acr.login_server
    identity = azurerm_user_assigned_identity.backend.id
  }

  secret {
    name                = "postgres-connection-string"
    key_vault_secret_id = "${azurerm_key_vault.app.vault_uri}secrets/PostgresConnectionString"
    identity            = azurerm_user_assigned_identity.backend.id
  }

  secret {
    name                = "s3-access-key-id"
    key_vault_secret_id = "${azurerm_key_vault.app.vault_uri}secrets/S3AccessKeyId"
    identity            = azurerm_user_assigned_identity.backend.id
  }

  secret {
    name                = "s3-secret-access-key"
    key_vault_secret_id = "${azurerm_key_vault.app.vault_uri}secrets/S3SecretAccessKey"
    identity            = azurerm_user_assigned_identity.backend.id
  }

  ingress {
    external_enabled = false
    target_port      = var.backend_container_port

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = 1
    max_replicas = 1

    container {
      name   = "backend"
      image  = "${azurerm_container_registry.acr.login_server}/${var.backend_image_repository}:${var.container_image_tag}"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "NODE_ENV"
        value = var.environment
      }

      env {
        name  = "PORT"
        value = tostring(var.backend_container_port)
      }

      env {
        name        = "POSTGRES_CONNECTION_STRING"
        secret_name = "postgres-connection-string"
      }

      env {
        name        = "S3_ACCESS_KEY_ID"
        secret_name = "s3-access-key-id"
      }

      env {
        name        = "S3_SECRET_ACCESS_KEY"
        secret_name = "s3-secret-access-key"
      }

      env {
        name  = "S3_BUCKET_NAME"
        value = var.backend_s3_bucket_name
      }

      env {
        name  = "S3_REGION"
        value = var.backend_s3_region
      }
    }
  }

  tags = merge(local.tags, {
    service = "container-app"
    app     = "backend"
  })

  depends_on = [
    azurerm_role_assignment.backend_acr_pull,
    azurerm_role_assignment.backend_key_vault_secrets_user
  ]
}

# Frontend Container App (public)
resource "azurerm_container_app" "frontend" {
  name                         = "${local.resource_prefix}-frontend"
  resource_group_name          = module.resource_group.resource_group_name
  container_app_environment_id = azurerm_container_app_environment.platform.id
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.frontend.id]
  }

  registry {
    server   = azurerm_container_registry.acr.login_server
    identity = azurerm_user_assigned_identity.frontend.id
  }

  ingress {
    external_enabled = true
    target_port      = var.frontend_container_port

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = 1
    max_replicas = 1

    container {
      name   = "frontend"
      image  = "${azurerm_container_registry.acr.login_server}/${var.frontend_image_repository}:${var.container_image_tag}"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "NODE_ENV"
        value = var.environment
      }

      env {
        name  = "PORT"
        value = tostring(var.frontend_container_port)
      }

      env {
        name  = "API_BASE_URL"
        value = "https://${azurerm_container_app.backend.latest_revision_fqdn}"
      }

      env {
        name  = "FEATURE_ADMIN_DASHBOARD"
        value = var.feature_admin_dashboard ? "true" : "false"
      }

      env {
        name  = "FEATURE_JOB_DETAIL_VIEW"
        value = var.feature_job_detail_view ? "true" : "false"
      }

      env {
        name  = "FEATURE_JOB_APPLY_VIEW"
        value = var.feature_job_apply_view ? "true" : "false"
      }
    }
  }

  tags = merge(local.tags, {
    service = "container-app"
    app     = "frontend"
  })

  depends_on = [
    azurerm_role_assignment.frontend_acr_pull,
    azurerm_role_assignment.frontend_key_vault_secrets_user,
    azurerm_container_app.backend
  ]
}
