output "resource_group_id" {
  value       = module.resource_group.resource_group_id
  description = "This is the ID of the resource group."
}

output "resource_group_name" {
  value       = module.resource_group.resource_group_name
  description = "This is the name of the resource group."
}

output "resource_group_location" {
  value       = module.resource_group.resource_group_location
  description = "This is the location of the resource group."
}