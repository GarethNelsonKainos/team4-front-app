output "frontend_fqdn" {
  description = "Fully qualified domain name of the frontend container"
  value       = azurerm_container_group.frontend.fqdn
}

output "frontend_url" {
  description = "URL to access the frontend"
  value       = "http://${azurerm_container_group.frontend.fqdn}:${var.container_port}"
}

output "container_ip" {
  description = "IP address of the container"
  value       = azurerm_container_group.frontend.ip_address
}

output "acr_login_server" {
  description = "Login server URL of the ACR"
  value       = data.azurerm_container_registry.acr.login_server
}
