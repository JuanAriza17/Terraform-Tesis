module "sql_injection" {
  source = "./course_template"

  ami_id        = "ami-0e86e20dae9224db8"
  instance_type = "t2.micro"
  server_name   = "sql_injection"
  enviroment    = "dev"
  curso         = "sql_injection_1"
}

module "default" {
  source = "./course_template"

  ami_id        = "ami-0e86e20dae9224db8"
  instance_type = "t2.micro"
  server_name   = "default"
  enviroment    = "dev"
}
output "sql_injection_ip" {
  description = "Dirección IP pública de la instancia EC2"
  value       = module.sql_injection.server_public_ip
}

output "sql_injection_dns" {
  description = "DNS público de la instancia EC2"
  value       = module.sql_injection.server_public_dns
}

output "default_ip" {
  description = "Dirección IP pública de la instancia EC2"
  value       = module.default.server_public_ip
}

output "default_dns" {
  description = "DNS público de la instancia EC2"
  value       = module.default.server_public_dns
}