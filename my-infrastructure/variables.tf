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