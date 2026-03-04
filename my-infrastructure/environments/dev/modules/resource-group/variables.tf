variable "name" {
  description = "The name of the Azure Resource Group."
  type        = string

  validation {
    condition     = length(var.name) > 0
    error_message = "Resource group name cannot be empty."
  }
}

variable "environment" {

  description = "Environment name (dev, prod)"
  type        = string
  default    = "dev"
}

variable "location" {
  description = "Azure region for the Resource Group."
  type        = string
  # Optional sensible default—feel free to omit if you want to force callers to pass a value
  default     = "uksouth"

  validation {
    condition     = contains(["uksouth", "ukwest", "westeurope"], var.location)
    error_message = "Location must be one of: uksouth, ukwest, westeurope."
  }
}

# Optional: let callers add tags
variable "tags" {
  description = "Tags to apply to the Resource Group."
  type        = map(string)
  default     = {}
}