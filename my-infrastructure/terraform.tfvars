resource_group_name = "blake-team4-rg"
location            = "UK South"
environment         = "dev"

tags = {
  owner   = "team4"
  project = "frontend"
}

# ── ACR ────────────────────────────────────────────────────────────────────────
# The ACR name is the same as your ACR username (ACR_USERNAME_BLAKE secret)
# The CI pipeline injects these automatically via TF_VAR_ env vars
acr_name         = "academyacrj3r5dv"
acr_login_server = "academyacrj3r5dv.azurecr.io"

# Image tags — the CI pipeline will override these with the short Git SHA
frontend_image_tag = "latest"
backend_image_tag  = "latest"

# ── Feature Flags ──────────────────────────────────────────────────────────────
feature_admin_dashboard = "false"
feature_job_detail_view = "false"
feature_job_apply_view  = "false"
