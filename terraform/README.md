# Terraform Infrastructure for Front-End

This Terraform configuration deploys the front-end application as an Azure Container Instance, pulling images from the existing Azure Container Registry.

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) >= 1.0
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed and authenticated
- Admin access enabled on ACR `academyacrj3r5dv`

## Setup

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

### Plan changes:
```bash
terraform plan
```

### Apply configuration:
```bash
terraform apply
```

### Destroy resources:
```bash
terraform destroy
```

## Outputs

After `terraform apply`, you'll see:
- `frontend_url` - URL to access your application
- `frontend_fqdn` - Fully qualified domain name
- `container_ip` - Public IP address

## Notes

- The container uses ACR admin credentials for authentication
- Ensure ACR admin user is enabled: `az acr update -n academyacrj3r5dv --admin-enabled true`
- DNS name must be globally unique across all of Azure
- Resource names and DNS label are automatically suffixed with the selected environment
- Resources are tagged with `environment=<dev|test|prod>` (plus any optional tags you provide)
- Default deployment uses 1 CPU core and 1.5 GB memory
