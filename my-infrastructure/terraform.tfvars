resource_group_name = "blake-team4-rg"
location            = "UK South"
environment         = "dev"

tags = {
  owner   = "team4"
  project = "frontend"
}

# ── ACR ────────────────────────────────────────────────────────────────────────
# Replace these with your actual ACR values
acr_name         = "YOUR_ACR_NAME"
acr_login_server = "YOUR_ACR_NAME.azurecr.io"

# Image tags — the CI pipeline will override these with the short Git SHA
frontend_image_tag = "latest"
backend_image_tag  = "latest"

# ── Feature Flags ──────────────────────────────────────────────────────────────
feature_admin_dashboard = "false"
feature_job_detail_view = "false"
feature_job_apply_view  = "false"
