variable "acr_name" {
  description = "Name of the existing Azure Container Registry"
  type        = string
  default     = "academyacrj3r5dv"
}

variable "acr_resource_group" {
  description = "Resource group containing the ACR"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group for the front-end app"
  type        = string
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "uksouth"
}

variable "environment" {
  description = "Deployment environment (dev/test/prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "Environment must be one of: dev, test, prod."
  }
}

variable "container_name" {
  description = "Name of the container instance"
  type        = string
  default     = "team4-frontend-cameron"
}

variable "dns_name_label" {
  description = "DNS name label for the container (must be globally unique)"
  type        = string
}

variable "image_name" {
  description = "Name of the image in ACR"
  type        = string
  default     = "team4-front-app-cameron"
}

variable "image_tag" {
  description = "Tag of the image to deploy"
  type        = string
  default     = "latest"
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
  default     = 3000
}

variable "cpu_cores" {
  description = "Number of CPU cores"
  type        = number
  default     = 1
}

variable "memory_gb" {
  description = "Memory in GB"
  type        = number
  default     = 1.5
}

variable "environment_variables" {
  description = "Environment variables for the container"
  type        = map(string)
  default     = {}
}

variable "tags" {
  description = "Optional tags applied to resources"
  type        = map(string)
  default     = {}
}
