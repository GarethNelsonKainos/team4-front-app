# Terraform Infrastructure for Front-End

This Terraform configuration deploys the front-end application as an Azure Container Instance, pulling images from the existing Azure Container Registry.

## 🏗️ Architecture

- **Infrastructure as Code**: Terraform manages all Azure resources
- **Remote State**: Azure Blob Storage with state locking
- **Environments**: Dev, Test, Prod with environment-specific configs
- **CI/CD Ready**: Automated via GitHub Actions (plan on PRs, apply on main)

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) >= 1.0
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed and authenticated
- Azure Service Principal or admin access for authentication

## 🚀 Quick Start (Local Development)

1. **Copy the example variables file:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Edit `terraform.tfvars` with your values:**
   - Set `acr_resource_group` to the resource group containing the ACR
   - Set `environment` to one of `dev`, `test`, or `prod`
   - Set a unique `dns_name_label` (globally unique across Azure)
   - Adjust other values as needed

3. **Login to Azure:**
   ```bash
   az login
   ```

4. **Initialize Terraform:**
   ```bash
   terraform init
   ```

5. **Plan and Apply:**
   ```bash
   terraform plan
   terraform apply
   ```

## 🤖 CI/CD Automation (GitHub Actions)

### Workflow Behavior

The Terraform workflow (`.github/workflows/terraform.yml`) automates infrastructure deployment:

| Event | Action | Result |
|-------|--------|--------|
| **Push to any branch** | `terraform plan` | Shows what would change |
| **Pull Request** | `terraform plan` + comment | Plan posted as PR comment |
| **Push to main** | `terraform plan` + `terraform apply` | Deploys to dev environment |

### Required GitHub Secrets

Add these Cameron-specific secrets in **Repository Settings → Secrets**:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `AZURE_CLIENT_ID_CAM` | Azure Service Principal App ID | `abc123...` |
| `AZURE_CLIENT_SECRET_CAM` | Service Principal Secret | `xyz789...` |
| `AZURE_TENANT_ID_CAM` | Azure AD Tenant ID | `4d914164...` |
| `AZURE_SUBSCRIPTION_ID_CAM` | Azure Subscription ID | `b69dedcd...` |

### How It Works

1. **On PR or branch push:**
   - Formats check
   - Initializes backend
   - Validates configuration
   - Runs plan (no apply)
   - Comments plan on PR

2. **On main branch push:**
   - Runs plan
   - Applies changes automatically
   - Deploys to `dev` environment
   - Comments deployment URL

### Environment Configuration

Environment-specific configs in `terraform/environments/`:
- `dev.tfvars` - Development (auto-deployed from main)
- `prod.tfvars.example` - Production template (manual deployment)

## Remote State (Azure Storage)

This project uses Azure Blob backend for shared state and locking.

### Backend resources

- Resource group: `team4-front-tfstate-rg`
- Storage account: `t4frontcamerontfstate`
- Blob container: `tfstate`
- State key: `front-app-dev.tfstate`

### Per-environment state keys (recommended)

Use a different backend key for each environment:

- `front-app-dev.tfstate`
- `front-app-test.tfstate`
- `front-app-prod.tfstate`

Initialize each environment with its own key:

```bash
terraform init -reconfigure -backend-config="key=front-app-dev.tfstate"
terraform init -reconfigure -backend-config="key=front-app-test.tfstate"
terraform init -reconfigure -backend-config="key=front-app-prod.tfstate"
```

Run only the command for the environment you are currently deploying.

### First-time migration (from local state)

Run from the `terraform/` directory:

```bash
terraform init -migrate-state
```

When prompted, answer `yes` to copy local state into Azure Storage.

### Verify remote state

```bash
terraform state pull
terraform plan
```

Expected outcome:
- State is stored in Azure Blob.
- Terraform acquires/releases backend lock automatically during operations.
- Team members can safely share one state file.

## Usage

### Local Development

**Plan changes:**
```bash
terraform plan
```

**Apply configuration:**
```bash
terraform apply
```

**Use environment-specific configs:**
```bash
terraform plan -var-file="environments/dev.tfvars"
terraform apply -var-file="environments/dev.tfvars"
```

**Destroy resources:**
```bash
terraform destroy
```

### CI/CD Pipeline

The pipeline automatically handles deployments:

```bash
# Push to feature branch → Plan only
git push origin feature/my-change

# Create PR → Plan + comment
gh pr create

# Merge to main → Plan + Apply (deploys to dev)
git checkout main && git merge feature/my-change && git push
```

## Authentication Methods

### Service Principal (Recommended for CI/CD)

Set environment variables:
```bash
export ARM_CLIENT_ID="your-service-principal-app-id"
export ARM_CLIENT_SECRET="your-service-principal-password"
export ARM_TENANT_ID="your-azure-tenant-id"
export ARM_SUBSCRIPTION_ID="your-azure-subscription-id"
```

### Azure CLI (Local Development)

```bash
az login
# Terraform will use your current Azure CLI session
```

### ACR Authentication

Terraform supports two methods for ACR credentials:

1. **Variables (CI/CD)**: Pass credentials via `-var` flags
2. **Data Source (Local)**: Auto-fetches from ACR admin user

## 📋 Environment Variables

Pass these to override defaults:

```bash
terraform apply \
  -var="environment=dev" \
  -var="image_tag=sha-abc1234" \
  -var="acr_username=$ACR_USER" \
  -var="acr_password=$ACR_PASS"
```

## Outputs

After `terraform apply`, you'll see:
- `frontend_url` - URL to access your application  
- `frontend_fqdn` - Fully qualified domain name
- `container_ip` - Public IP address
- `acr_login_server` - ACR server URL

## 🔧 Advanced Usage

### Deploy to Multiple Environments

```bash
# Dev
terraform workspace select dev || terraform workspace new dev
terraform apply -var-file="environments/dev.tfvars"

# Prod (manual approval recommended)
terraform workspace select prod || terraform workspace new prod
terraform apply -var-file="environments/prod.tfvars.example"
```

### Override Image Tag

Deploy specific image version:
```bash
terraform apply -var="image_tag=sha-abc1234"
```

### View Current State

```bash
terraform show
terraform state list
terraform output
```

## 📝 Notes

- **Authentication**: Uses service principal in CI/CD, falls back to ACR admin locally
- **State Locking**: Automatic via Azure Storage backend
- **Environment Isolation**: Resources auto-suffixed with environment name
- **DNS Uniqueness**: DNS labels must be globally unique across Azure
- **Resource Tags**: All resources tagged with `environment`, `managed_by`, etc.
- **Default Resources**: 1 CPU core, 1.5 GB memory (configurable per environment)
- **Image Tags**: Use `latest` for dev, specific tags (`sha-XXXXXXX`) for prod

## 🚨 Troubleshooting

### Plan fails with "context access might be invalid"

Clear Terraform cache:
```bash
rm -rf .terraform .terraform.lock.hcl
terraform init
```

### Backend initialization fails

Verify you have access to the backend storage account:
```bash
az storage account show --name t4frontcamerontfstate --resource-group team4-front-tfstate-rg
```

### ACR authentication fails

Check service principal has `AcrPull` or `AcrPush` role:
```bash
az role assignment list --assignee $ARM_CLIENT_ID --scope /subscriptions/$ARM_SUBSCRIPTION_ID/resourceGroups/rg-academy-acr/providers/Microsoft.ContainerRegistry/registries/academyacrj3r5dv
```

## 🔗 Related Workflows

- **Docker Build & Push**: `.github/workflows/ci.yml` 
- **Terraform Automation**: `.github/workflows/terraform.yml`

Together these workflows provide full CI/CD:

1. **Code Push** → Build & test app → Build Docker image
2. **Merge to main** → Push image to ACR with tags
3. **Terraform detects change** → Plan → Apply → Deploy container
4. **Result** → New version running in Azure Container Instance

## 🎯 Production Deployment Strategy

For production deployments:

1. **Create prod tfvars**: Copy `environments/prod.tfvars.example` to `prod.tfvars`
2. **Use manual workflow**: Run Terraform locally or via manual workflow approval
3. **Use specific tags**: Deploy versioned images, not `latest`
4. **Blue-green ready**: Infrastructure supports multiple environments

Example prod deployment:
```bash
terraform apply \
  -var-file="environments/prod.tfvars" \
  -var="image_tag=sha-abc1234" \
  -var="environment=prod"
```

---

**Need help?** Check the [main project README](../README.md) or review workflow runs in GitHub Actions.
