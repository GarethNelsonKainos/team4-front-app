output "resource_group_name" {
  description = "The name of the Azure Resource Group."
  value       = module.rg.name
}

output "resource_group_id" {
  description = "The full Azure Resource Group ID."
  value       = module.rg.id
}

output "location" {
  description = "Azure region where the Resource Group is created."
  value       = module.rg.location
}