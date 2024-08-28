
variable "ami_id" {
  description = "ID de la AMI"
  default = "ami-0440d3b780d96b29d"
}

variable "instance_type" {
  description = "Tipo de instancia EC2"
  default = "t3.micro"
}

variable "server_name" {
  description = "Nombre del servidor web"
  default = "example"
}

variable "enviroment" {
  description = "Ambiente de la aplicación"
  default = "test"
}