# Azure Container Registry Setup Guide

## Overview
This guide explains how to configure Azure Container Registry (ACR) authentication for GitHub Actions using either:
- **Admin Credentials** (simpler, no admin access required)
- **Service Principal** (more secure, requires Azure admin role assignment)

Both approaches are fully supported by the CI/CD workflow.

## Approach Comparison

| Aspect | Admin Credentials | Service Principal |
|--------|---|---|
| **Setup Complexity** | Very simple (1 step) | Moderate (2-3 steps) |
| **Permissions Required** | Terraform apply only | Terraform + Azure admin |
| **Security** | Basic (shared credentials) | Better (scoped RBAC) |
| **Production Ready** | ✅ Yes (development) | ✅ Yes (recommended) |
| **Credential Rotation** | Manual on ACR | Easy (Azure admin controls) |
| **Recommended For** | Dev/test environments | Production environments |

**Recommendation**: Start with **Admin Credentials** (faster setup), migrate to **Service Principal** for production.

---

## Step 1: Deploy ACR with Terraform

First, deploy the Azure Container Registry using Terraform:

```bash
cd my-infrastructure
terraform init
terraform plan
terraform apply
```

After successful deployment, note the ACR login server from the outputs:
```bash
terraform output acr_login_server
# Example output: acrteam4abc12345.azurecr.io
```

---

## Step 2: Create Azure Service Principal

### Option A: Using ACR Admin Credentials (Easier - No Admin Access Required) ✅ RECOMMENDED

This is the simpler approach that doesn't require role assignment permissions.

1. **Update Terraform configuration** (already done):
```bash
# The main.tf has been updated with admin_enabled = true
cd my-infrastructure
```

2. **Apply Terraform to enable admin credentials**:
```bash
terraform apply
```

3. **Get admin credentials from Terraform outputs**:
```bash
ACR_LOGIN_SERVER=$(terraform output -raw acr_login_server)
ACR_ADMIN_USERNAME=$(terraform output -raw acr_admin_username)
ACR_ADMIN_PASSWORD=$(terraform output -raw acr_admin_password)

echo "Login Server: $ACR_LOGIN_SERVER"
echo "Admin Username: $ACR_ADMIN_USERNAME"
echo "Admin Password: $ACR_ADMIN_PASSWORD"
```

4. **Save these credentials securely** - these will be your GitHub secrets

---

### Option B: Using Service Principal with RBAC (More Secure - Requires Admin)

This approach is more secure for production but requires Azure admin to assign roles.

1. **Get your ACR resource ID:**
```bash
ACR_NAME=$(terraform output -raw acr_name)
ACR_RESOURCE_GROUP=$(terraform output -raw resource_group_name)

ACR_ID=$(az acr show \
  --name $ACR_NAME \
  --resource-group $ACR_RESOURCE_GROUP \
  --query id \
  --output tsv)

echo "ACR ID: $ACR_ID"
```

2. **Create Service Principal:**
```bash
# Create service principal (without role assignment for now)
SP_OUTPUT=$(az ad sp create-for-rbac \
  --name "sp-team4-acr-github-actions" \
  --skip-assignment)

echo "$SP_OUTPUT"
```

3. **Extract credentials:**
```bash
# Parse the JSON output
SP_APP_ID=$(echo $SP_OUTPUT | jq -r '.appId')
SP_PASSWORD=$(echo $SP_OUTPUT | jq -r '.password')
SP_TENANT=$(echo $SP_OUTPUT | jq -r '.tenant')

echo "Service Principal App ID: $SP_APP_ID"
echo "Service Principal Password: $SP_PASSWORD (save securely!)"
echo "Tenant ID: $SP_TENANT"
```

4. **Assign AcrPush role to the Service Principal:**

**If you have permissions:**
```bash
az role assignment create \
  --assignee $SP_APP_ID \
  --role "AcrPush" \
  --scope $ACR_ID
```

**If you get authorization errors:**
- See [ADMIN_ROLE_ASSIGNMENT_REQUEST.md](ADMIN_ROLE_ASSIGNMENT_REQUEST.md) for instructions to send to your admin

5. **Verify role assignment:**
```bash
az role assignment list \
  --assignee $SP_APP_ID \
  --scope $ACR_ID \
  --output table
```

Expected output should show `AcrPush` role assigned.

### Option B: Using Azure Portal

1. Navigate to **Azure Active Directory** → **App registrations** → **New registration**
2. Name: `sp-team4-acr-github-actions`
3. Click **Register**
4. Under **Certificates & secrets** → **New client secret**
5. Copy the secret value immediately (it won't be shown again)
6. Navigate to your ACR → **Access control (IAM)** → **Add role assignment**
7. Role: **AcrPush**
8. Assign access to: **User, group, or service principal**
9. Select your newly created app registration

---

## Step 3: Configure GitHub Secrets

Add the following secrets to your GitHub repository:

### Navigate to Repository Settings
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Option A: Using ACR Admin Credentials

| Secret Name | Value | How to Get |
|------------|-------|------------|
| `ACR_LOGIN_SERVER` | `acrteam4abc12345.azurecr.io` | Run: `terraform output -raw acr_login_server` |
| `ACR_ADMIN_USERNAME` | `admin` (usually, or custom) | Run: `terraform output -raw acr_admin_username` |
| `ACR_ADMIN_PASSWORD` | The password value | Run: `terraform output -raw acr_admin_password` |

### Option B: Using Service Principal Credentials

| Secret Name | Value | How to Get |
|------------|-------|------------|
| `ACR_LOGIN_SERVER` | `acrteam4abc12345.azurecr.io` | Run: `terraform output acr_login_server` |
| `ACR_SERVICE_PRINCIPAL_ID` | The appId value | From service principal creation output |
| `ACR_SERVICE_PRINCIPAL_PASSWORD` | The password value | From service principal creation output |

### Adding Secrets via GitHub CLI

```bash
# Get values from Terraform (admin credentials approach)
ACR_LOGIN_SERVER=$(terraform output -raw acr_login_server)
ACR_ADMIN_USERNAME=$(terraform output -raw acr_admin_username)
ACR_ADMIN_PASSWORD=$(terraform output -raw acr_admin_password)

# Set secrets (requires gh CLI authenticated)
gh secret set ACR_LOGIN_SERVER --body "$ACR_LOGIN_SERVER"
gh secret set ACR_ADMIN_USERNAME --body "$ACR_ADMIN_USERNAME"
gh secret set ACR_ADMIN_PASSWORD --body "$ACR_ADMIN_PASSWORD"
```

---

## Step 4: Verify GitHub Actions Configuration

The CI workflow (`.github/workflows/ci.yml`) is configured to:

### Build Behavior
- **Pull Requests**: Build image locally, run tests, no push to ACR
- **Main Branch**: Build, test, AND push to ACR

### Image Tagging Strategy

All images pushed to ACR receive three tags:

1. **Commit SHA** (short): `<commit-sha>` 
   - Example: `a1b2c3d`
   - Purpose: Precise version tracking, rollback capability

2. **Timestamp**: `YYYYMMDD-HHMMSS`
   - Example: `20260303-143022`
   - Purpose: Chronological ordering

3. **Latest**: `latest`
   - Purpose: Always points to most recent main branch build

### Example Image Names
```
acrteam4abc12345.azurecr.io/team4-front-app:a1b2c3d
acrteam4abc12345.azurecr.io/team4-front-app:20260303-143022
acrteam4abc12345.azurecr.io/team4-front-app:latest
```

---

## Step 5: Test the Integration

### Test 1: Pull Request Build
```bash
git checkout -b test-acr-integration
git commit --allow-empty -m "test: verify ACR workflow"
git push origin test-acr-integration
# Create PR on GitHub - should build but NOT push to ACR
```

### Test 2: Main Branch Push
```bash
git checkout main
git merge test-acr-integration
git push origin main
# Should build AND push to ACR
```

### Verify Push to ACR
```bash
# List images in ACR
az acr repository list --name $ACR_NAME --output table

# Show tags for team4-front-app repository
az acr repository show-tags \
  --name $ACR_NAME \
  --repository team4-front-app \
  --output table \
  --orderby time_desc
```

---

## Troubleshooting

### Issue: "AuthorizationFailed" when assigning service principal role
**Error**: `The client does not have authorization to perform action 'Microsoft.Authorization/roleAssignments/write'`

**Solution**: Use the simpler admin credentials approach instead:
1. Admin credentials don't require role assignment
2. They're enabled directly on the ACR resource
3. No Azure admin access needed
4. See [Option A above](#option-a-using-acr-admin-credentials-easier--no-admin-access-required)

### Issue: "unauthorized: authentication required" in GitHub Actions
**Solution**: 
1. Verify secrets are set correctly in GitHub
2. Check you're using the right secret names (admin vs service principal)
3. Ensure ACR login server URL is correct: `terraform output acr_login_server`
4. For admin credentials: use `ACR_ADMIN_USERNAME` and `ACR_ADMIN_PASSWORD`
5. For service principal: use `ACR_SERVICE_PRINCIPAL_ID` and `ACR_SERVICE_PRINCIPAL_PASSWORD`

### Issue: "requested access to the resource is denied"
**Solution:** Ensure service principal has `AcrPush` role:
```bash
az role assignment list \
  --assignee $SP_APP_ID \
  --scope $ACR_ID \
  --output table
```

### Issue: Images not appearing in ACR
**Solution:** 
1. Check workflow runs on GitHub Actions tab
2. Verify push only happens on main branch
3. Check conditional logic: `github.ref == 'refs/heads/main'`

### Issue: "Cannot connect to ACR"
**Solution:** Verify ACR login server URL is correct:
```bash
terraform output acr_login_server
# Should match ACR_LOGIN_SERVER secret
```

---

## Security Best Practices

### For Admin Credentials Approach
1. **Store in GitHub Secrets** - never commit to code
2. **Limit secret visibility** - only expose to necessary workflows
3. **Rotate regularly** - regenerate in Terraform every 90 days
4. **Monitor access** - review ACR activity logs in Azure Portal
5. **Disable when not needed** - set `admin_enabled = false` in Terraform when done

### For Service Principal Approach
1. **Use least privilege** - AcrPush role only (not Contributor)
2. **Scope to resource** - assign to specific ACR, not subscription
3. **Store in GitHub Secrets** - never commit credentials
4. **Rotate regularly** - Azure admin manages secret rotation
5. **Monitor access** - review Azure audit logs for role assignments

---

## Image Naming Conventions

### Format
```
<acr-login-server>/<repository-name>:<tag>
```

### Repository Name
- Use lowercase and hyphens: `team4-front-app`
- Be descriptive and consistent
- Match project/service name

### Tag Strategies
- **Git SHA**: Immutable, traceable to exact code version
- **Timestamp**: Useful for chronological sorting
- **Latest**: Convenience tag for development
- **Version tags** (future): `v1.2.3` for releases

### Anti-patterns to Avoid
- ❌ Don't use only `latest` in production
- ❌ Don't reuse tags (breaks immutability)
- ❌ Don't use dates without time (multiple deployments per day)

---

## Next Steps

1. ✅ Deploy ACR with Terraform
2. ✅ Create Service Principal
3. ✅ Add GitHub Secrets
4. ✅ Test on main branch
5. 🔄 Set up environment-specific tagging (dev/staging/prod)
6. 🔄 Implement image scanning and vulnerability checks
7. 🔄 Configure ACR geo-replication for production

---

## Additional Resources

- [Azure Container Registry Documentation](https://learn.microsoft.com/en-us/azure/container-registry/)
- [Service Principal Authentication](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-auth-service-principal)
- [GitHub Actions Docker Build & Push](https://github.com/docker/build-push-action)
- [ACR Best Practices](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-best-practices)
