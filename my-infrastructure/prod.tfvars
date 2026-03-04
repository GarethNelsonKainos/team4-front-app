# Production Environment Configuration (EXAMPLE)
# Copy this file to prod.tfvars and update the values
# DO NOT commit prod.tfvars with real credentials

# Azure subscription ID (different from dev for enhanced security)
subscription_id = "test-id-123"

# Project and environment naming
project     = "team4"
environment = "prod"

# Azure location
location = "UK South"

# Custom resource group name (optional - will auto-generate as rg-team4-prod if not set)
# resource_group_name = "rg-team4-prod"

# Additional tags for production resources
tags = {
  owner       = "team4"
  cost_center = "prod"
  created_by  = "terraform"
  critical    = "true"
}

# Container Apps Configuration
frontend_image_repository = "team4-front-app"
backend_image_repository  = "team4-back-app"

# Feature Flags (more conservative defaults for production)
feature_admin_dashboard = true
feature_job_detail_view = true
feature_job_apply_view  = true

# Backend S3 Configuration (set after S3 bucket is created)
backend_s3_bucket_name = ""
backend_s3_region      = "eu-west-2"
