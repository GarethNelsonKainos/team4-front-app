variable "subscription_id" {
  type        = string
  description = "Azure subscription ID"
  sensitive   = true
}

variable "resource_group_name" {
  type        = string
  default     = "josh-rg"
  description = "Name of the Azure resource group"

  validation {
    condition     = can(regex("^rg-[a-zA-Z0-9._-]+$", var.resource_group_name))
    error_message = "The resource group name must start with 'rg-' and can only contain alphanumeric characters, dots, underscores, and hyphens."
  }
}

variable "location" {
  type        = string
  default     = "UK South"
  description = "Azure region for the resource group"

  validation {
    condition     = contains(["UK South", "UK West", "North Europe", "West Europe"], var.location)
    error_message = "The location must be a valid Azure region"
  }
}

variable "environment" {
  type        = string
  default     = "dev"
  description = "Deployment environment (e.g., dev, test, prod)"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "The environment must be one of 'dev', 'test', or 'prod'."
  }
}

variable "tags" {
  type        = map(string)
  description = "Common tags to apply to all resources"
  default = {
    project    = "team4"
    managed_by = "terraform"
    created_on = "2026-03-03"
  }
}