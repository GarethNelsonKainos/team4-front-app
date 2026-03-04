# My Infrastructure - Pipeline Ready Terraform

This folder contains Infrastructure-as-Code (Terraform) for the Team4 project, configured to work seamlessly in CI/CD pipelines.

## Quick Start

### Local Development

```bash
cd my-infrastructure

# Initialize Terraform with dev remote state
terraform init \
  -backend-config="resource_group_name=tfstate-rg" \
  -backend-config="storage_account_name=tfstate1772544818" \
  -backend-config="container_name=terraform-state" \
  -backend-config="key=dev/team4.tfstate"

# Plan changes for dev environment
terraform plan -var-file="dev.tfvars"

# Apply changes (interactive)
terraform apply -var-file="dev.tfvars"
```

### Pipeline Setup

For full CI/CD pipeline instructions, see [TERRAFORM_PIPELINE_SETUP.md](./TERRAFORM_PIPELINE_SETUP.md)

Quick checklist:
1. ✅ Run `./setup-remote-state.sh` (if not already done)
2. ✅ Create Azure service principal
3. ✅ Run `./setup-github-secrets.sh` to configure GitHub Actions
4. ✅ Create `prod.tfvars` from `prod.tfvars.example`
5. ✅ Push changes to trigger pipeline

## File Overview

| File | Purpose |
|------|---------|
| `provider.tf` | Azure provider config + remote state setup |
| `main.tf` | Resource definitions (App Service, Container Registry, etc.) |
| `variables.tf` | Input variables with local computed values for naming |
| `output.tf` | Output values (resource IDs, endpoints, credentials) |
| `dev.tfvars` | Development environment variables |
| `prod.tfvars.example` | Template for production (do not commit real values) |
| `backend-config.hcl.example` | Backend configuration template |
| `modules/resource-group/` | Reusable resource group module |

## Environment Configuration

### Development (`dev.tfvars`)
- Automatic provisioning in pipeline
- Used for branches and feature development
- Resource names: `rg-team4-dev`, `acrteam4dev...`

### Production (`prod.tfvars`)
- Requires careful review before applying
- Only applies on main branch merges
- Resource names: `rg-team4-prod`, `acrteam4prod...`
- Use separate subscription for security

**To add a new environment:**
1. Create `{environment}.tfvars`
2. Update `.github/workflows/terraform.yml` with environment logic
3. Configure GitHub secrets for that environment

## Resource Naming Convention

All resources use a consistent naming pattern:

```
rg-{project}-{environment}     # Resource group (rg-team4-dev)
acr{project}{environment}{8}   # Container registry (acrteam4dev12345678)
{resource}-{project}-{env}     # Other resources
```

This makes resources easily identifiable by:
- Project (`team4`)
- Environment (`dev`, `prod`)
- Ensures no naming conflicts between environments

## Variables & Locals

### Input Variables (`variables.tf`)
- `project` - Project name (default: "team4")
- `environment` - Deployment environment (default: "dev")
- `subscription_id` - Azure subscription (sensitive)
- `location` - Azure region (default: "UK South")
- `tags` - Custom tags to apply to all resources

### Computed Locals (`variables.tf`)
- `resource_prefix` - Auto: "{project}-{environment}" → "team4-dev"
- `resource_group_name` - Auto: "rg-{prefix}" → "rg-team4-dev"
- `tags` - Merged with defaults for managed_by, created_on, etc.

## Authentication

### Local Development
Two options:
1. **Azure CLI:** `az login` (interactive)
2. **Service Principal:** Set `ARM_*` environment variables (non-interactive)

### Pipeline (GitHub Actions)
Uses service principal authentication for secure, non-interactive CI/CD:
- `ARM_CLIENT_ID` - Service principal app ID
- `ARM_CLIENT_SECRET` - Service principal password
- `ARM_TENANT_ID` - Azure tenant ID
- `ARM_SUBSCRIPTION_ID` - Azure subscription ID
- `ARM_ACCESS_KEY` - Storage account key for remote state

## Pipeline Behavior

```
Development Branch
    ↓
Terraform Validate + Format Check
    ↓
Terraform Plan (dev environment)
    ↓
Plan artifact stored (24 hours)

Main Branch (Push)
    ↓
Terraform Validate + Format Check
    ↓
Terraform Plan (prod environment)
    ↓
Terraform Apply (prod environment) ← Automatic!
    ↓
Output captured in step summary
    ↓
Artifacts cleaned up

PR to Main
    ↓
Same as development branch
    ↓
Comment added to PR with plan summary
```

## Common Commands

### Check Status
```bash
cd my-infrastructure
terraform state list
terraform state show
```

### Apply Manually (Dev)
```bash
cd my-infrastructure
terraform apply -var-file="dev.tfvars"
```

### Destroy Infrastructure (Use Carefully!)
```bash
cd my-infrastructure
terraform destroy -var-file="dev.tfvars"
# or for prod:
terraform destroy -var-file="prod.tfvars"
```

### Format Code
```bash
cd my-infrastructure
terraform fmt -recursive
```

### Plan for Review
```bash
cd my-infrastructure
terraform plan -var-file="dev.tfvars" -out=tfplan
terraform show tfplan
```

## Remote State Management

Remote state is stored in Azure Storage for:
- ✅ Shared access across team
- ✅ Automatic locking during operations
- ✅ State file history and recovery
- ✅ Secure encryption at rest
- ✅ Audit logging

See [REMOTE_STATE_GUIDE.md](../REMOTE_STATE_GUIDE.md) for details.

## Troubleshooting

**Error: "User does not have access to key"**
- Check `ARM_ACCESS_KEY` environment variable or GitHub secret
- Verify storage account key hasn't been rotated

**Error: "Module not found"**
- Run `terraform init` to download modules

**Error: "State conflict"**
- Another pipeline might be running
- State is automatically locked during operations
- If stuck, check GitHub Actions logs

**Plan doesn't show changes**
- Run `terraform refresh` to sync state with actual resources
- Check your `tfvars` file values match intended configuration

## Best Practices

1. **Always review plan before apply**
   - Check GitHub PR comments or local `terraform plan` output
   - Look for unexpected deletions or changes

2. **Use environment variables, not hardcoded values**
   - Use `dev.tfvars` and `prod.tfvars` for configuration
   - Keep production values in GitHub secrets only

3. **Rotate service principal credentials**
   - Quarterly or when team membership changes
   - Use `az ad sp credential reset` to rotate

4. **Tag all resources appropriately**
   - Helps with cost tracking and organization
   - Auto-tagged with project, environment, created_on

5. **Keep `.example` files updated**
   - Document required variables
   - Help team members set up new environments

## References

- 📖 [Terraform Azure Provider Documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest)
- 📖 [Azure Storage Remote State](https://learn.microsoft.com/azure/developer/terraform/store-state-in-azure-storage)
- 📖 [GitHub Actions Setup Terraform](https://github.com/hashicorp/setup-terraform)
- 📖 [Azure Service Principals](https://learn.microsoft.com/azure/active-directory/develop/app-objects-and-service-principals)

## Questions or Issues?

1. Check [TERRAFORM_PIPELINE_SETUP.md](./TERRAFORM_PIPELINE_SETUP.md) for detailed setup
2. Review `.github/workflows/terraform.yml` for pipeline logic
3. Check GitHub Actions logs for pipeline errors
4. Verify all secrets are set in GitHub Settings → Secrets

