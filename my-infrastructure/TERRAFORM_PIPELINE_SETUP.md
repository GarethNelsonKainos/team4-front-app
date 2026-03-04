# Terraform Pipeline Setup Guide

This guide explains how to set up pipeline-ready Terraform with dev/prod environments using Azure service principals.

## Overview

The Terraform configuration is now structured for CI/CD pipelines:

- **Dev environment**: Plan on every push to branches, apply manually
- **Prod environment**: Plan on PR, apply only on main branch after merge
- **Remote state**: Stored in Azure Storage with remote locking
- **Authentication**: Service principal (non-interactive for pipelines)
- **Easy to extend**: Add more environments by creating new `.tfvars` files

## File Structure

```
my-infrastructure/
├── provider.tf                 # Azure provider config (env-var ready)
├── main.tf                     # Resource definitions (uses locals for naming)
├── variables.tf                # Input variables with local computed values
├── output.tf                   # Output values
├── dev.tfvars                  # Dev environment variables
├── prod.tfvars.example         # Template for production (do NOT commit real prod.tfvars)
├── backend-config.hcl.example  # Template for backend config
└── modules/
    └── resource-group/         # Resource group module

.github/workflows/
└── terraform.yml               # New CI/CD pipeline for Terraform
```

## Prerequisites

### 1. Azure Storage for Remote State

Set up remote state storage (if not already done):

```bash
cd my-infrastructure
chmod +x setup-remote-state.sh
./setup-remote-state.sh
```

This creates:
- Resource group: `tfstate-rg`
- Storage account: `tfstate<timestamp>`
- Container: `terraform-state`
- Note the storage account name for step 3

### 2. Create an Azure Service Principal

For pipeline authentication, create a service principal:

```bash
az ad sp create-for-rbac \
  --name "github-actions-terraform-team4" \
  --role "Contributor" \
  --scopes "/subscriptions/YOUR_SUBSCRIPTION_ID"
```

This outputs:
```json
{
  "appId": "...",
  "displayName": "github-actions-terraform-team4",
  "password": "...",
  "tenant": "..."
}
```

Save these values - you'll need them in step 3.

### 3. Add GitHub Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Value | From |
|---|---|---|
| `ARM_CLIENT_ID` | appId | Service principal |
| `ARM_CLIENT_SECRET` | password | Service principal |
| `ARM_TENANT_ID` | tenant | Service principal |
| `ARM_SUBSCRIPTION_ID` | subscription-id | Your Azure subscription |
| `ARM_ACCESS_KEY` | storage-account-key | From `setup-remote-state.sh` or Azure portal |
| `TF_STATE_STORAGE_ACCOUNT` | tfstate<timestamp> | From `setup-remote-state.sh` |

**Why service principal?**
- Secure, non-interactive authentication
- No user credentials stored
- Can rotate credentials independently
- Better for teams

### 4. Local Development Setup (Optional)

To run Terraform locally, you have two options:

#### Option A: Use Azure CLI (Interactive)
```bash
az login
cd my-infrastructure
terraform init
terraform plan -var-file="dev.tfvars"
```

#### Option B: Use Service Principal (Non-Interactive)
```bash
export ARM_CLIENT_ID="<appId>"
export ARM_CLIENT_SECRET="<password>"
export ARM_TENANT_ID="<tenant>"
export ARM_SUBSCRIPTION_ID="<subscription-id>"
export ARM_ACCESS_KEY="<storage-account-key>"

cd my-infrastructure
terraform init \
  -backend-config="resource_group_name=tfstate-rg" \
  -backend-config="storage_account_name=TFSTATE_STORAGE_ACCOUNT" \
  -backend-config="container_name=terraform-state" \
  -backend-config="key=dev/team4.tfstate"

terraform plan -var-file="dev.tfvars"
```

## Environments

### Development (Dev)

Used for feature branches and active development.

**When it runs:**
- `terraform plan` on every branch push
- Manual apply (requires `terraform apply` locally or PR merge workflow)

**State file:** `dev/team4.tfstate` in remote storage

**Configure at:** `my-infrastructure/dev.tfvars`

```hcl
project     = "team4"
environment = "dev"
subscription_id = "b69dedcd-cfb8-4ec6-ba75-987e53dd2fd2"
```

### Production (Prod)

Used for main branch only. Requires careful review.

**When it runs:**
- `terraform plan` on PR and main push
- Automatic `terraform apply` only on main branch push

**State file:** `prod/team4.tfstate` in remote storage

**Setup:**

1. Create `my-infrastructure/prod.tfvars` (copy from `prod.tfvars.example`)
2. Update with production values:

```hcl
project     = "team4"
environment = "prod"
subscription_id = "YOUR_PROD_SUBSCRIPTION_ID"  # Different for prod
tags = {
  environment = "prod"
  critical    = "true"
}
```

3. **DO NOT commit** `prod.tfvars` if it contains real credentials
4. Push to repository
5. Merge PR to main to trigger apply

## How the Pipeline Works

### On Pull Request
```
PR opened → Validate → Plan (dev) → Comment on PR with plan
```

### On Push to Main
```
Push → Validate → Plan (prod) → Apply (prod) → Output results → Cleanup artifacts
```

### On Push to Other Branches
```
Push → Validate → Plan (dev)
```

## Adding a New Environment (e.g., Staging)

1. Create `my-infrastructure/staging.tfvars`:
```hcl
project     = "team4"
environment = "staging"
subscription_id = "..."
location = "UK South"
```

2. Update `.github/workflows/terraform.yml` to add staging conditions:
```yaml
env:
  TF_ENVIRONMENT: |
    ${{ github.ref == 'refs/heads/main' && 'prod' || 
        github.ref == 'refs/heads/staging' && 'staging' || 
        github.ref == 'refs/heads/dev' && 'dev' ||
        'dev' }}
```

3. Add conditional steps for staging plan/apply similar to dev/prod

## Resource Naming Convention

Resources are automatically named based on project and environment:

- **Resource Group:** `rg-team4-dev` (dev), `rg-team4-prod` (prod)
- **Container Registry:** `acrteam4dev<RANDOM>` (dev), `acrteam4prod<RANDOM>` (prod)
- **State File:** `dev/team4.tfstate` (dev), `prod/team4.tfstate` (prod)

This naming makes it easy to identify resources by environment and prevents naming conflicts.

## Common Tasks

### View Resource Group
```bash
az group show --name rg-team4-dev
```

### View Container Registry
```bash
az acr list --resource-group rg-team4-dev --output table
```

### View Remote State
```bash
cd my-infrastructure
terraform state list
terraform state show
```

### Force Refresh State (if manually changed resources)
```bash
cd my-infrastructure
terraform refresh -var-file="dev.tfvars"
```

### Destroy Infrastructure (Use Cautiously!)
```bash
cd my-infrastructure
terraform destroy -var-file="dev.tfvars"
```

## Security Best Practices

1. **Never commit `.tfvars` with real credentials**
   - Use `.example` files for templates
   - Use GitHub secrets for sensitive values

2. **Rotate service principal credentials regularly**
   ```bash
   az ad sp credential reset --name "<appId>"
   ```

3. **Use state file encryption**
   - Already enabled in Azure Storage with encryption at rest
   - Consider adding application-level encryption

4. **Limit service principal scope**
   - Current role: `Contributor` (broad)
   - Best practice: Custom role with only needed permissions

5. **Enable audit logging**
   - Azure Storage: Enable logging in diagnostics settings
   - GitHub: Review Actions logs in Pull Requests

## Troubleshooting

### Error: "No Azure credential found"
Make sure all `ARM_*` environment variables are set in GitHub secrets

### Error: "User does not have access to key"
Check `ARM_ACCESS_KEY` is correct in GitHub secrets

### Error: "Conflict: Resource already exists"
State might be out of sync. Run `terraform refresh` to sync state

### State Lock Timeout
If someone's plan is taking too long, you can force unlock:
```bash
cd my-infrastructure
terraform force-unlock <LOCK_ID>
```

## Resources

- [Terraform Azure Provider Docs](https://registry.terraform.io/providers/hashicorp/azurerm/latest)
- [Store Terraform state in Azure Storage](https://learn.microsoft.com/azure/developer/terraform/store-state-in-azure-storage)
- [GitHub Actions for Terraform](https://github.com/hashicorp/setup-terraform)
- [Azure Service Principals](https://learn.microsoft.com/azure/active-directory/develop/app-objects-and-service-principals)

## Next Steps

1. ✅ Create service principal (section 2 above)
2. ✅ Add GitHub secrets (section 3 above)
3. ✅ Test pipeline with PR to any branch
4. ✅ Verify plan output in PR comments
5. ✅ Create production configuration
6. ✅ Test full pipeline: PR → Merge to main → Apply

