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