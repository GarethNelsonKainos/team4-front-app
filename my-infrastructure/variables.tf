variable "resource_group_name" {
  description = "The name of the Azure Resource Group to create."
  type        = string

  validation {
    condition     = length(var.resource_group_name) > 2
    error_message = "Resource group name must be at least 3 characters long."
  }
}

variable "location" {
  description = "The Azure region where resources will be deployed."
  type        = string
  default     = "UK South"

  validation {
    condition     = can(regex("^[A-Za-z ]+$", var.location))
    error_message = "Location must only contain letters and spaces."
  }
}

variable "environment" {
  description = "Deployment environment (dev, test, prod)."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "Environment must be one of: dev, test, prod."
  }
}

variable "tags" {
  description = "A map of tags to apply to resources."
  type        = map(string)
  default = {
    project = "team4-front-app"
  }
}

# ── ACR ────────────────────────────────────────────────────────────────────────

variable "acr_name" {
  description = "The name of the Azure Container Registry (just the name, not the login server)."
  type        = string
}

variable "acr_login_server" {
  description = "The login server URL of the ACR, e.g. myregistry.azurecr.io"
  type        = string
}

variable "frontend_image_tag" {
  description = "Tag of the frontend Docker image to deploy."
  type        = string
  default     = "latest"
}

variable "backend_image_tag" {
  description = "Tag of the backend Docker image to deploy."
  type        = string
  default     = "latest"
}

# ── Feature Flags ──────────────────────────────────────────────────────────────

variable "feature_admin_dashboard" {
  description = "Toggle the admin dashboard feature."
  type        = string
  default     = "false"
}

variable "feature_job_detail_view" {
  description = "Toggle the job detail view feature."
  type        = string
  default     = "false"
}

variable "feature_job_apply_view" {
  description = "Toggle the job apply view feature."
  type        = string
  default     = "false"
}