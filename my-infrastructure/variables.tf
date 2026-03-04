variable "subscription_id" {
  type        = string
  default     = null
  description = "Azure subscription ID. If null, will use Azure CLI context or ARM_SUBSCRIPTION_ID env var"
  sensitive   = true
}

variable "resource_name_prefix" {
  type        = string
  description = "Prefix for resource names (e.g., 'team4-dev', 'team4-prod'). Automatically created from project and environment."
  default     = ""
}

variable "resource_group_name" {
  type        = string
  default     = ""
  description = "Name of the Azure resource group. If empty, will be generated from project and environment."

  validation {
    condition     = var.resource_group_name == "" || can(regex("^rg-[a-zA-Z0-9._-]+$", var.resource_group_name))
    error_message = "The resource group name must start with 'rg-' and can only contain alphanumeric characters, dots, underscores, and hyphens, or leave empty for auto-generation."
  }
}

variable "project" {
  type        = string
  default     = "team4"
  description = "Project name used for resource naming"
}

variable "environment" {
  type        = string
  default     = "dev"
  description = "Deployment environment (dev, test, or prod). Used for resource naming and tagging."

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "The environment must be one of 'dev', 'test', or 'prod'."
  }
}

variable "location" {
  type        = string
  default     = "UK South"
  description = "Azure region for resources"

  validation {
    condition     = contains(["UK South", "UK West", "North Europe", "West Europe"], var.location)
    error_message = "The location must be a valid Azure region"
  }
}

variable "tags" {
  type        = map(string)
  description = "Common tags to apply to all resources"
  default     = {}
}

variable "container_image_tag" {
  type        = string
  description = "Docker image tag to deploy (e.g., 'latest' or commit SHA)"
  default     = "latest"
}

variable "frontend_image_repository" {
  type        = string
  description = "Frontend image repository name in ACR"
  default     = "team4-front-app"
}

variable "backend_image_repository" {
  type        = string
  description = "Backend image repository name in ACR"
  default     = "team4-back-app"
}

variable "frontend_container_port" {
  type        = number
  description = "Port exposed by the frontend container"
  default     = 3000
}

variable "backend_container_port" {
  type        = number
  description = "Port exposed by the backend container"
  default     = 8080
}

variable "feature_admin_dashboard" {
  type        = bool
  description = "Feature flag for admin dashboard"
  default     = false
}

variable "feature_job_detail_view" {
  type        = bool
  description = "Feature flag for job detail view"
  default     = true
}

variable "feature_job_apply_view" {
  type        = bool
  description = "Feature flag for job apply view"
  default     = true
}

variable "backend_s3_bucket_name" {
  type        = string
  description = "S3 bucket name used by backend"
  default     = ""
}

variable "backend_s3_region" {
  type        = string
  description = "S3 region used by backend"
  default     = "eu-west-2"
}

variable "key_vault_name" {
  type        = string
  description = "Azure Key Vault name. If empty, one is generated."
  default     = ""
}

variable "key_vault_sku_name" {
  type        = string
  description = "SKU name for Key Vault"
  default     = "standard"

  validation {
    condition     = contains(["standard", "premium"], var.key_vault_sku_name)
    error_message = "The key_vault_sku_name must be either 'standard' or 'premium'."
  }
}

variable "key_vault_allowed_ip_cidrs" {
  type        = list(string)
  description = "Optional IP CIDR ranges allowed to access Key Vault data-plane (for portal/CLI secret management)."
  default     = []
}

# Local values for computed naming and tagging
locals {
  # Resource naming prefix (e.g., "team4-dev", "team4-prod")
  resource_prefix = "${var.project}-${var.environment}"

  # Auto-generate resource group name if not provided
  resource_group_name = var.resource_group_name != "" ? var.resource_group_name : "rg-${local.resource_prefix}"

  # Merge default tags with user-provided tags
  tags = merge(
    {
      project     = var.project
      environment = var.environment
      managed_by  = "terraform"
      created_on  = formatdate("YYYY-MM-DD", timestamp())
    },
    var.tags
  )
}