module "nginx_server_dev" {
  source = "./nginx_server_module"

  ami_id        = "ami-0440d3b780d96b29d"
  instance_type = "t3.medium"
  server_name   = "nginx-server-dev"
  enviroment    = "dev"
}

module "nginx_server_test" {
  source = "./nginx_server_module"

  ami_id        = "ami-0440d3b780d96b29d"
  instance_type = "t3.micro"
  server_name   = "nginx-server-test"
  enviroment    = "test"
}

output "nginx_dev_ip" {
  description = "Dirección IP pública de la instancia EC2"
  value       = module.nginx_server_dev.server_public_ip
}

output "nginx_dev_dns" {
  description = "DNS público de la instancia EC2"
  value       = module.nginx_server_dev.server_public_dns
}

output "nginx_test_ip" {
  description = "Dirección IP pública de la instancia EC2"
  value       = module.nginx_server_test.server_public_ip
}

output "nginx_test_dns" {
  description = "DNS público de la instancia EC2"
  value       = module.nginx_server_test.server_public_dns
}