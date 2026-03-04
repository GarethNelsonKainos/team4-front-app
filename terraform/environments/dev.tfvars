# Development Environment Configuration
# Used by CI/CD pipeline for dev deployments

environment         = "dev"
acr_resource_group  = "rg-academy-acr"
resource_group_name = "team4-frontend-cameron-rg"
location            = "uksouth"
dns_name_label      = "team4-frontend-cameron-dev"
image_name          = "team4-front-app-cameron"
image_tag           = "latest"

# Container resources
cpu_cores = 1
memory_gb = 1.5

# Environment variables for the container
environment_variables = {
  NODE_ENV     = "development"
  API_BASE_URL = "http://localhost:8080"
  LOG_LEVEL    = "debug"
}

# Resource tags
tags = {
  project     = "team4-front-app"
  owner       = "cameron"
  managed_by  = "terraform"
  cost_center = "engineering"
}
