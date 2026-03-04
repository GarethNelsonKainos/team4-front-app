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

# Container Apps Configuration
frontend_image_repository = "team4-front-app"
backend_image_repository  = "team4-back-app"

# Feature Flags
feature_admin_dashboard = false
feature_job_detail_view = true
feature_job_apply_view  = true

# Backend S3 Configuration (set after S3 bucket is created)
backend_s3_bucket_name = ""
backend_s3_region      = "eu-west-2"
