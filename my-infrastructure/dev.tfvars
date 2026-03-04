# Development Environment Configuration
# This file contains values specific to the dev environment

# Azure subscription ID
subscription_id = "b69dedcd-cfb8-4ec6-ba75-987e53dd2fd2"

# Project and environment naming
project     = "team4"
environment = "dev"

# Azure location
location = "UK South"

# Custom resource group name (optional - will auto-generate as rg-team4-dev if not set)
# resource_group_name = "rg-team4-dev"

# Additional tags for all resources
tags = {
  owner       = "team4"
  cost_center = "dev"
  created_by  = "terraform"
}
