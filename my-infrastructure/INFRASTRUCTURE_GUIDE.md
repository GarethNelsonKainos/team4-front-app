# Infrastructure Guide for Beginners

This guide explains how the Terraform infrastructure is organized and how remote state works in Azure.

## 🎯 The Big Picture

You're using **Terraform** (a tool that creates cloud infrastructure using code) to set up resources in Azure. Your setup has two main parts:

1. **Where to store your records** (Remote State)
2. **How to organize your building blocks** (Modules)

---

## 📦 Part 1: Modules (Reusable Building Blocks)

### What's a Module?

Think of a module like a recipe card. Instead of writing out "how to make a resource group" every time you need one, you create a recipe once and reuse it.

### Your Module Structure

```
modules/resource-group/     ← The recipe folder
  ├── main.tf              ← What to create (the actual resource group)
  ├── variables.tf         ← Ingredients needed (name, location, tags)
  └── outputs.tf           ← What to tell others after it's made (ID, name, location)
```

### How You Use It

In `main.tf`:
```terraform
module "resource_group" {
  source = "./modules/resource-group"  ← Where the recipe is
  
  resource_group_name = var.resource_group_name  ← Pass in the name
  location            = var.location              ← Pass in the location
  tags                = var.tags                  ← Pass in the tags
}
```

It's like saying: "Hey module, use this recipe and make me a resource group with these specific details."

### Why Use Modules?

**Benefits:**
- ✅ **Reusability**: Write once, use many times
- ✅ **Consistency**: Everyone creates resources the same way
- ✅ **Organization**: Keep code tidy and logical
- ✅ **Built-in validation**: Your module checks that names follow Azure naming rules

**Example**: If you need to create 5 resource groups later, you just call the module 5 times with different names instead of copying/pasting code.

---

## 💾 Part 2: Remote State (The Shared Filing Cabinet)

### What's "State" and Why Store it Remotely?

When Terraform creates resources in Azure, it needs to remember what it built. This memory is called **state**. 

**The Problem:** By default, this state file lives on YOUR computer. If your teammate tries to make changes, they won't know what you already created - chaos ensues!

**The Solution:** Store the state file in Azure Storage (a shared cloud location) so everyone on your team sees the same information.

### The Setup Script Explained

The `setup-remote-state.sh` script creates this shared filing cabinet:

**Step 1:** Creates a special resource group called `tfstate-rg`
- This is like creating a filing room specifically for storing records

**Step 2:** Creates a storage account with a unique name
- This is the actual filing cabinet (uses timestamp to make it unique)
- Example: `tfstate1772544818`

**Step 3:** Creates a container called `terraform-state`
- This is a drawer inside the filing cabinet where the state file lives

**Step 4:** Gets the access key
- This is the key to lock/unlock the filing cabinet
- Stored in the `ARM_ACCESS_KEY` environment variable

### How It Connects: The Backend Configuration

In `provider.tf`, you tell Terraform where to find this filing cabinet:

```terraform
backend "azurerm" {
  resource_group_name  = "tfstate-josh-rg"     ← The filing room
  storage_account_name = "tfstate1772544818"    ← The filing cabinet
  container_name       = "terraform-state"      ← The drawer
  key                  = "team4.tfstate"        ← The specific file
}
```

This means: "Terraform, don't save state on my computer. Save it in this specific drawer in Azure."

### Why Remote State?

**Benefits:**
- ✅ **Team collaboration**: Everyone sees the same infrastructure state
- ✅ **State locking**: Prevents two people from making conflicting changes
- ✅ **Backup**: State is safely stored in the cloud, not just on your laptop
- ✅ **Security**: Encrypted storage keeps sensitive data safe

---

## 🔄 How Everything Works Together

1. **You run the setup script** → Creates the Azure storage for state files
2. **Terraform reads provider.tf** → Knows to use remote storage
3. **Terraform reads main.tf** → Sees you want to create a resource group using the module
4. **The module receives variables** → Gets the name, location, tags from `variables.tf`
5. **Module creates the resource** → Actually builds it in Azure
6. **Terraform saves state remotely** → Records what was created in Azure Storage
7. **Anyone else on your team** → Can see what's been created by accessing the same remote state

---

## 📁 File Reference

### Main Infrastructure Files

- **`main.tf`** - The main configuration that calls modules and defines resources
- **`provider.tf`** - Configures Terraform providers and backend (remote state)
- **`variables.tf`** - Defines input variables with default values and validation
- **`terraform.tfvars`** - Contains actual values for variables (sensitive, not tracked in git)
- **`output.tf`** - Defines what information to display after Terraform runs
- **`setup-remote-state.sh`** - Script to create Azure storage for remote state

### Module Files

- **`modules/resource-group/main.tf`** - Creates the actual Azure resource group
- **`modules/resource-group/variables.tf`** - Defines what inputs the module needs
- **`modules/resource-group/outputs.tf`** - Defines what information the module returns

---

## 🚀 Quick Start Commands

### Initial Setup
```bash
# Run this once to create remote state storage
./setup-remote-state.sh

# Initialize Terraform (downloads providers, configures backend)
terraform init

# See what Terraform will create
terraform plan

# Create the resources
terraform apply
```

### Daily Usage
```bash
# See planned changes
terraform plan

# Apply changes
terraform apply

# Destroy everything (be careful!)
terraform destroy
```

---

## 🔍 Understanding Your Current Setup

Based on your terminal history, you've:

1. **Imported an existing resource group** into Terraform state
   ```bash
   terraform import module.resource_group.azurerm_resource_group.this \
     /subscriptions/b69dedcd-cfb8-4ec6-ba75-987e53dd2fd2/resourceGroups/rg-josh-dev
   ```
   - This tells Terraform: "This resource group already exists in Azure, start tracking it"

2. **Ran a plan** to see what changes Terraform would make
   ```bash
   terraform plan
   ```
   - This shows you what will happen before you actually do it

---

## 💡 Key Concepts for Beginners

### What is Infrastructure as Code (IaC)?
Instead of clicking buttons in Azure Portal to create resources, you write code (Terraform files) that describes what you want. Benefits:
- Version control (track changes in git)
- Reproducibility (create identical environments)
- Documentation (code shows what exists)

### What is a Resource Group?
In Azure, a resource group is a container that holds related resources. Think of it as a folder that organizes your cloud resources (virtual machines, databases, storage accounts, etc.).

### What are Variables?
Variables let you reuse code with different values. Instead of hardcoding "UK South" everywhere, you define it once as a variable and reference it. This makes it easy to change later.

### What are Outputs?
Outputs display information after Terraform creates resources. For example, after creating a resource group, the module outputs its ID, name, and location so other parts of your code can use them.

---

## 📚 Further Learning

- [Terraform Official Docs](https://www.terraform.io/docs)
- [Azure Provider for Terraform](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Microsoft: Store Terraform State in Azure Storage](https://learn.microsoft.com/azure/developer/terraform/store-state-in-azure-storage)

---

## ❓ Common Questions

**Q: Why do I need modules for just one resource group?**  
A: It's practice for scaling. As your infrastructure grows, you'll add more modules (for networking, databases, etc.) and this pattern becomes very valuable.

**Q: What if I lose the remote state file?**  
A: That's why it's in Azure Storage - it's backed up and replicated. But you should also enable versioning on the storage container for extra safety.

**Q: Can I work on this without internet?**  
A: No, because Terraform needs to communicate with Azure to create resources and access the remote state.

**Q: What happens if two people run `terraform apply` at the same time?**  
A: Azure Storage provides state locking - the first person locks the state, and the second person has to wait until the lock is released.

---

*Last Updated: March 3, 2026*
