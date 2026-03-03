variable "resource_group_name" {
  type        = string
  description = "Name of the Azure resource group"

  validation {
    condition     = can(regex("^rg-[a-zA-Z0-9._-]+$", var.resource_group_name))
    error_message = "The resource group name must start with 'rg-' and can only contain alphanumeric characters, dots, underscores, and hyphens."
  }
}

variable "location" {
  type        = string
  description = "Azure region for the resource group"

  validation {
    condition     = contains(["UK South", "UK West", "North Europe", "West Europe"], var.location)
    error_message = "The location must be a valid Azure region"
  }
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to the resource group"
  default     = {}
}
