provider "aws" {
  region = "us-east-1"
}

variable "courses" {
  description = "Lista de cursos"
  type        = list(string)
  default     = ["default", "sql_injection_1"]
}

variable "flags" {
  description = "Lista de flags"
  type        = list(string)
  default     = ["flagDefault", "flagDefault2"]
}

variable "instance_count" {
  description = "Número de instancias a crear"
  type        = number
  default     = 1
}

module "default" {
  source = "./course_template"

  ami_id         = "ami-0e86e20dae9224db8"
  instance_type  = "t2.micro"
  server_name    = "default"
  enviroment     = "dev"
  instance_count = var.instance_count
  courses        = var.courses
  flags          = var.flags
}

output "default_ip" {
  description = "Dirección IP pública de la instancia EC2"
  value       = module.default.server_public_ip
}