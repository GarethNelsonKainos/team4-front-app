# Resource Group Name

variable "resource_group_name" {
  description = "The name of the Azure Resource Group."
  type        = string
  default     = "rg-team4-dev"

  validation {
    condition     = length(var.resource_group_name) > 0
    error_message = "Resource group name cannot be empty."
  }
}

# Location

variable "location" {
  description = "The Azure region where resources will be deployed."
  type        = string
  default     = "uksouth"

  validation {
    condition     = contains(["uksouth"], var.location)
    error_message = "Location must be one of: uksouth."
  }
}


# Environment (dev/test/prod)

variable "environment" {
  description = "Deployment environment (dev, test, prod)."
  type        = string

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "Environment must be dev, test, or prod."
  }
}


# Tags

variable "tags" {
  description = "A map of tags to assign to resources."
  type        = map(string)
  default = {
    created_by = "Terraform"
  }
}
